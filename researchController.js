// SOUBOR: researchController.js

// Globální proměnná pro tooltip element (bude inicializována v uiController.js)
// let researchTooltipElement;

/**
 * Otevře modální okno výzkumné laboratoře a vykreslí její obsah.
 */
function openResearchLabModalUI() {
    if (researchModal && modalEchoShardsResearch) {
        modalEchoShardsResearch.textContent = formatNumber(gameState.echoShards);
        renderResearchUI();
        openModal(researchModal); // Použije globální openModal z uiController
    } else {
        console.error("Research modal elements not found for openResearchLabModalUI");
    }
}

/**
 * Zavře modální okno výzkumné laboratoře.
 */
function closeResearchLabModalUI() {
    if (researchModal) {
        closeModal(researchModal); // Použije globální closeModal z uiController
    } else {
        console.error("Research modal element not found for closeResearchLabModalUI");
    }
}

/**
 * Pomocná funkce pro získání efektivních statistik s dočasně změněnou úrovní výzkumu.
 * @param {string} researchIdToMod - ID výzkumu, jehož úroveň se má dočasně změnit.
 * @param {number} tempLevel - Dočasná úroveň výzkumu pro výpočet.
 * @returns {object} - Objekt s náhledovými statistikami (primárně clickDamage).
 */
function getEffectiveStatsWithTempResearchLevel(researchIdToMod, tempLevel) {
    const originalLevel = (gameState.playerResearchProgress[researchIdToMod] && gameState.playerResearchProgress[researchIdToMod].level)
                          ? gameState.playerResearchProgress[researchIdToMod].level
                          : 0;

    // Dočasně nastavíme úroveň výzkumu
    if (!gameState.playerResearchProgress[researchIdToMod]) {
        gameState.playerResearchProgress[researchIdToMod] = { level: 0 };
    }
    gameState.playerResearchProgress[researchIdToMod].level = tempLevel;

    // Přepočítáme statistiky - calculateEffectiveStats by mělo zahrnout getResearchBonus
    if (typeof calculateEffectiveStats === 'function') {
        calculateEffectiveStats();
    }
     // Pro náhled pasivního poškození společníků, pokud by výzkum ovlivňoval i to
    let tempTotalPassivePercent = 0;
    if (typeof calculateTotalEffectivePassivePercentForPreview === 'function') { // Předpokládáme existenci této funkce
        tempTotalPassivePercent = calculateTotalEffectivePassivePercentForPreview();
    }


    const previewStats = {
        clickDamage: gameState.effectiveClickDamage,
        // Další statistiky, pokud jsou relevantní pro výzkum a mají globální gameState proměnnou
        // Např. pokud by výzkum ovlivňoval critChance přímo v gameState.effectiveCritChance
        totalPassivePercent: tempTotalPassivePercent, // Pokud by výzkum ovlivňoval pasivní DPS
    };

    // Obnovení původního stavu
    gameState.playerResearchProgress[researchIdToMod].level = originalLevel;
     if (originalLevel === 0 && tempLevel > 0 && gameState.playerResearchProgress[researchIdToMod].level === 0) {
        delete gameState.playerResearchProgress[researchIdToMod];
    }


    if (typeof calculateEffectiveStats === 'function') {
        calculateEffectiveStats(); // Vrátíme globální statistiky na původní hodnoty
    }
    // Pokud by se měnily i jiné závislé statistiky (např. tier bonusy), je třeba je také obnovit/přepočítat
    // if (typeof updateCurrentTierBonuses === 'function') updateCurrentTierBonuses();
    // if (typeof updateTotalCompanionPassivePercentOnGameState === 'function') updateTotalCompanionPassivePercentOnGameState();


    return previewStats;
}


/**
 * Generuje texty pro náhled efektu výzkumu v tooltipu.
 * @param {string} researchId - ID výzkumu.
 * @returns {object} - Objekt s texty pro tooltip.
 */
function getResearchEffectPreviewText(researchId) {
    const project = allResearchProjects[researchId]; // Z config.js
    if (!project) {
        console.error(`getResearchEffectPreviewText: Research project definition not found for ID: ${researchId}`);
        return { name: "Neznámý výzkum", description: "", currentLevelText: "", currentEffectText: "Chyba: Definice nenalezena", nextEffectText: "", costText: "" };
    }

    const researchProgress = gameState.playerResearchProgress[project.id] || { level: 0 };
    const currentLevel = researchProgress.level;
    let currentEffectText = ""; // Pro "Nyní" v tooltipu
    let nextEffectText = "";    // Pro "Další úr." v tooltipu
    let previewStatsNextLevel;

    if (currentLevel < project.maxLevel) {
        previewStatsNextLevel = getEffectiveStatsWithTempResearchLevel(researchId, currentLevel + 1);
    }

    // Texty pro tooltip
    switch (project.effectType) {
        case 'research_click_damage_multiplier_percent':
            currentEffectText = `Nyní celkem: ${formatNumber(gameState.effectiveClickDamage, 0)} Poškození klikem`;
            if (previewStatsNextLevel) {
                nextEffectText = `Další úr. celkem: ${formatNumber(previewStatsNextLevel.clickDamage, 0)} Poškození klikem`;
            }
            break;
        case 'research_echo_shard_multiplier_percent':
            currentEffectText = `Efekt výzkumu: +${formatNumber(currentLevel * project.effectValuePerLevel * 100, 0)}% k zisku EÚ`;
            if (currentLevel < project.maxLevel) {
                nextEffectText = `Další úr. efekt: +${formatNumber((currentLevel + 1) * project.effectValuePerLevel * 100, 0)}%`;
            }
            break;
        case 'research_gold_multiplier_all_percent':
            currentEffectText = `Efekt výzkumu: +${formatNumber(currentLevel * project.effectValuePerLevel * 100, 0)}% k zisku zlata`;
            if (currentLevel < project.maxLevel) {
                nextEffectText = `Další úr. efekt: +${formatNumber((currentLevel + 1) * project.effectValuePerLevel * 100, 0)}%`;
            }
            break;
        case 'research_companion_damage_multiplier_percent':
            // Zde by bylo ideální ukázat celkové pasivní poškození společníků, ale pro jednoduchost
            // zobrazíme přímý příspěvek tohoto výzkumu.
            currentEffectText = `Efekt výzkumu: +${formatNumber(currentLevel * project.effectValuePerLevel * 100, 0)}% k poškození společníků`;
            if (currentLevel < project.maxLevel) {
                nextEffectText = `Další úr. efekt: +${formatNumber((currentLevel + 1) * project.effectValuePerLevel * 100, 0)}%`;
            }
            // Alternativně, pokud by getEffectiveStatsWithTempResearchLevel vracelo i totalPassivePercent:
            // currentEffectText = `Nyní celkem pasivně (spol.): ${formatNumber(previewStatsNextLevel.totalPassivePercent * 100, 2)}% HP/s`;
            // if (previewStatsNextLevel) {
            //     nextEffectText = `Další úr. celkem pasivně (spol.): ${formatNumber(previewStatsNextLevel.totalPassivePercent * 100, 2)}% HP/s`;
            // }
            break;
        case 'research_artifact_drop_chance_additive_percent':
            currentEffectText = `Efekt výzkumu: +${formatNumber(currentLevel * project.effectValuePerLevel * 100, 3)}% šance na artefakt`;
            if (currentLevel < project.maxLevel) {
                nextEffectText = `Další úr. efekt: +${formatNumber((currentLevel + 1) * project.effectValuePerLevel * 100, 3)}%`;
            }
            break;
        default:
            let genericCurrentBonus = currentLevel * (project.effectValuePerLevel || 0);
            currentEffectText = `Přímý efekt: ${formatNumber(genericCurrentBonus, 2)}`;
            if (currentLevel < project.maxLevel) {
                let genericNextBonus = (currentLevel + 1) * (project.effectValuePerLevel || 0);
                nextEffectText = `Další úr. přímý efekt: ${formatNumber(genericNextBonus, 2)}`;
            }
    }

    if (currentLevel >= project.maxLevel) {
        nextEffectText = "Maximální úroveň";
    }

    return {
        name: project.name,
        // description: project.description, // Popis se již nezobrazuje v tooltipu
        currentLevelText: `Úroveň: ${currentLevel}/${project.maxLevel}`,
        currentEffectText,
        nextEffectText,
        costText: currentLevel < project.maxLevel ? `Cena další úrovně: ${formatNumber(project.cost(currentLevel))} EÚ` : ""
    };
}

/**
 * Zobrazí tooltip s informacemi o výzkumu.
 * @param {string} researchId - ID výzkumu.
 * @param {MouseEvent} event - Událost myši pro pozicování.
 */
function showResearchTooltip(researchId, event) {
    if (!researchTooltipElement) { // researchTooltipElement z uiController.js
        // console.warn("Research tooltip element not found in showResearchTooltip");
        return;
    }

    const preview = getResearchEffectPreviewText(researchId);
    let tooltipHTML = `
        <strong class="research-tooltip-name">${preview.name}</strong>
        <p class="research-tooltip-level">${preview.currentLevelText}</p>
        <hr class="research-tooltip-hr">
        <p class="research-tooltip-effect">${preview.currentEffectText}</p>`;
    if (preview.nextEffectText) {
        tooltipHTML += `<p class="research-tooltip-effect-next">${preview.nextEffectText}</p>`;
    }

    researchTooltipElement.innerHTML = tooltipHTML;
    researchTooltipElement.classList.remove('hidden');
    updateResearchTooltipPosition(event);
}

/**
 * Skryje tooltip výzkumu.
 */
function hideResearchTooltip() {
    if (researchTooltipElement) {
        researchTooltipElement.classList.add('hidden');
    }
}

/**
 * Aktualizuje pozici tooltipu výzkumu.
 * @param {MouseEvent} event - Událost myši.
 */
function updateResearchTooltipPosition(event) {
    if (!researchTooltipElement || researchTooltipElement.classList.contains('hidden')) return;
    const tooltipWidth = researchTooltipElement.offsetWidth;
    const tooltipHeight = researchTooltipElement.offsetHeight;
    let x = event.clientX + 15;
    let y = event.clientY + 15;
    const viewportRight = window.innerWidth;
    const viewportBottom = window.innerHeight;
    if (x + tooltipWidth > viewportRight - 10) {
        x = event.clientX - tooltipWidth - 15;
    }
    if (y + tooltipHeight > viewportBottom - 10) {
        y = event.clientY - tooltipHeight - 15;
    }
    x = Math.max(10, x);
    y = Math.max(10, y);
    researchTooltipElement.style.left = `${x}px`;
    researchTooltipElement.style.top = `${y}px`;
}

/**
 * Vykreslí všechny dostupné výzkumné projekty v modálním okně.
 */
function renderResearchUI() {
    if (!researchContainer || !modalEchoShardsResearch) {
        console.error("Research UI elements not found for rendering.");
        return;
    }
    researchContainer.innerHTML = '';
    modalEchoShardsResearch.textContent = formatNumber(gameState.echoShards);

    const researchCategories = {};
    for (const id in allResearchProjects) {
        if (allResearchProjects.hasOwnProperty(id)) {
            const project = allResearchProjects[id];
            if (!researchCategories[project.category]) {
                researchCategories[project.category] = [];
            }
            researchCategories[project.category].push({ ...project, id });
        }
    }

    for (const categoryName in researchCategories) {
        const categoryTitle = document.createElement('h4');
        categoryTitle.classList.add('research-category-title');
        categoryTitle.textContent = categoryName;
        researchContainer.appendChild(categoryTitle);

        researchCategories[categoryName].forEach(project => {
            const researchProgress = gameState.playerResearchProgress[project.id] || { level: 0 };
            const currentLevel = researchProgress.level;

            const researchDiv = document.createElement('div');
            researchDiv.classList.add('research-item');

            researchDiv.addEventListener('mouseenter', (event) => showResearchTooltip(project.id, event));
            researchDiv.addEventListener('mouseleave', hideResearchTooltip);
            researchDiv.addEventListener('mousemove', updateResearchTooltipPosition);

            const nameP = document.createElement('p');
            nameP.classList.add('research-name');
            nameP.textContent = `${project.icon} ${project.name} (Úr. ${currentLevel}/${project.maxLevel})`;
            researchDiv.appendChild(nameP);

            // Přímé zobrazení popisu výzkumu a jeho aktuálního přímého bonusu
            const descP = document.createElement('p');
            descP.classList.add('research-description');
            let directBonusValue = currentLevel * project.effectValuePerLevel;
            let directBonusTextForDisplay;

            if (project.effectType.includes('percent')) {
                 directBonusTextForDisplay = formatNumber(directBonusValue * 100, (project.effectType === 'research_artifact_drop_chance_additive_percent' ? 3 : 2));
            } else {
                 directBonusTextForDisplay = formatNumber(directBonusValue, 0);
            }
            descP.textContent = project.description.replace('{bonusValue}', directBonusTextForDisplay);
            researchDiv.appendChild(descP);


            const costP = document.createElement('p');
            costP.classList.add('research-level-cost');

            let prerequisiteMet = true;
            if (project.requires) {
                const requiredResearchProgress = gameState.playerResearchProgress[project.requires];
                const requiredResearchDef = allResearchProjects[project.requires];
                if (!requiredResearchProgress || requiredResearchProgress.level < requiredResearchDef.maxLevel) {
                   prerequisiteMet = false;
                   // Text o předpokladu se zobrazí pod cenou, pokud není splněn
                }
            }

            if (currentLevel < project.maxLevel) {
                const currentCost = project.cost(currentLevel);
                costP.textContent = `Cena další úrovně: ${formatNumber(currentCost)} EÚ`;
                if (!prerequisiteMet) {
                    const requiredResearchDef = allResearchProjects[project.requires];
                    costP.innerHTML += `<br><span class="text-xs text-red-400">Vyžaduje: ${requiredResearchDef.name} (Max. Úr.)</span>`;
                }

                const upgradeButton = document.createElement('button');
                upgradeButton.classList.add('research-upgrade-button');
                upgradeButton.textContent = 'Vyzkoumat';
                upgradeButton.disabled = gameState.echoShards < currentCost || !prerequisiteMet;
                upgradeButton.onclick = () => purchaseResearch(project.id);
                researchDiv.appendChild(upgradeButton);
            } else {
                costP.textContent = 'Maximální úroveň výzkumu';
            }
            researchDiv.appendChild(costP);
            researchContainer.appendChild(researchDiv);
        });
    }
}

/**
 * Zpracuje nákup nebo vylepšení výzkumného projektu.
 * @param {string} researchId - ID výzkumného projektu.
 */
function purchaseResearch(researchId) {
    const project = allResearchProjects[researchId];
    const researchProgress = gameState.playerResearchProgress[researchId] || { level: 0 };

    if (!project) {
        console.error(`Výzkum s ID ${researchId} nebyl nalezen.`);
        return;
    }

    if (researchProgress.level >= project.maxLevel) {
        if(typeof showMessageBox === 'function') showMessageBox("Tento výzkum je již na maximální úrovni!", true);
        return;
    }

    let prerequisiteMet = true;
    if (project.requires) {
        const requiredResearchProgress = gameState.playerResearchProgress[project.requires];
        const requiredResearchDef = allResearchProjects[project.requires];
         if (!requiredResearchProgress || requiredResearchProgress.level < requiredResearchDef.maxLevel) {
           prerequisiteMet = false;
        }
    }
    if (!prerequisiteMet) {
         if(typeof showMessageBox === 'function') showMessageBox("Nejprve dokončete požadovaný výzkum!", true);
        return;
    }

    const cost = project.cost(researchProgress.level);
    if (gameState.echoShards >= cost) {
        gameState.echoShards -= cost;
        researchProgress.level++;
        gameState.playerResearchProgress[project.id] = researchProgress;

        if(typeof showMessageBox === 'function') showMessageBox(`Výzkum "${project.name}" vylepšen na úroveň ${researchProgress.level}!`, false);
        if (typeof soundManager !== 'undefined') {
            soundManager.playSound('upgrade', 'B4', '8n');
        }

        if (typeof calculateEffectiveStats === 'function') calculateEffectiveStats();
        if (typeof updateUI === 'function') updateUI();

        renderResearchUI();
    } else {
        if(typeof showMessageBox === 'function') showMessageBox("Nedostatek Echo Úlomků pro tento výzkum!", true);
    }
}

/**
 * Získá celkový bonus z dokončených výzkumů daného typu.
 * @param {string} bonusType - Typ bonusu (např. 'research_click_damage_multiplier_percent').
 * @returns {number} - Celková hodnota bonusu.
 */
function getResearchBonus(bonusType) {
    let totalBonus = 0;
    for (const researchId in gameState.playerResearchProgress) {
        if (gameState.playerResearchProgress.hasOwnProperty(researchId)) {
            const researchDef = allResearchProjects[researchId];
            const currentProgress = gameState.playerResearchProgress[researchId];
            if (researchDef && researchDef.effectType === bonusType && currentProgress.level > 0) {
                totalBonus += (currentProgress.level * researchDef.effectValuePerLevel);
            }
        }
    }
    return totalBonus;
}
