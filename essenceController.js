// SOUBOR: essenceController.js

// Globální proměnná pro tooltip element (bude inicializována v uiController.js)
// let essenceTooltipElement;

/**
 * Otevře modální okno Kovárny Esencí a vykreslí její obsah.
 */
function openEssenceForgeModalUI() {
    if (essenceForgeModal && modalEchoShardsEssence) {
        modalEchoShardsEssence.textContent = formatNumber(gameState.echoShards);
        renderEssenceForgeUI();
        openModal(essenceForgeModal);
    } else {
        console.error("Essence Forge modal elements not found for openEssenceForgeModalUI");
    }
}

/**
 * Zavře modální okno Kovárny Esencí.
 */
function closeEssenceForgeModalUI() {
    if (essenceForgeModal) {
        closeModal(essenceForgeModal);
    } else {
        console.error("Essence Forge modal element not found for closeEssenceForgeModalUI");
    }
}


/**
 * Pomocná funkce pro získání efektivních statistik s dočasně změněnou úrovní esence.
 * @param {string} essenceIdToMod - ID esence, jejíž úroveň se má dočasně změnit.
 * @param {number} tempLevel - Dočasná úroveň esence pro výpočet.
 * @returns {object} - Objekt s náhledovými statistikami.
 */
function getEffectiveStatsWithTempEssenceLevel(essenceIdToMod, tempLevel) {
    const originalLevel = (gameState.playerEssences[essenceIdToMod] && gameState.playerEssences[essenceIdToMod].level) ? gameState.playerEssences[essenceIdToMod].level : 0;

    if (!gameState.playerEssences[essenceIdToMod]) {
        gameState.playerEssences[essenceIdToMod] = { level: 0 };
    }
    gameState.playerEssences[essenceIdToMod].level = tempLevel;

    if (typeof calculateEffectiveStats === 'function') {
        calculateEffectiveStats();
    }

    const previewStats = {
        clickDamage: gameState.effectiveClickDamage,
        critChance: gameState.effectiveCritChance,
        totalPassivePercent: typeof calculateTotalEffectivePassivePercentForPreview === 'function' ? calculateTotalEffectivePassivePercentForPreview() : 0,
    };

    gameState.playerEssences[essenceIdToMod].level = originalLevel;
    if (originalLevel === 0 && tempLevel > 0 && gameState.playerEssences[essenceIdToMod].level === 0) { // Pokud byla esence vytvořena jen pro náhled
         delete gameState.playerEssences[essenceIdToMod];
    }


    if (typeof calculateEffectiveStats === 'function') {
        calculateEffectiveStats();
    }

    return previewStats;
}


/**
 * Generuje texty pro náhled efektu esence v tooltipu.
 * @param {string} essenceId - ID esence.
 * @returns {object} - Objekt s texty pro tooltip.
 */
function getEssenceEffectPreviewText(essenceId) {
    const essence = allEssences[essenceId];
    if (!essence) {
        console.error(`getEssenceEffectPreviewText: Essence definition not found for ID: ${essenceId}`);
        return { name: "Neznámá esence", currentLevelText: "", currentEffectText: "Chyba: Definice nenalezena", nextEffectText: "", costText: "" };
    }

    const currentProgress = gameState.playerEssences[essenceId] || { level: 0 };
    const currentLevel = currentProgress.level;
    let currentEffectText = ""; // Toto bude pro "Nyní" v tooltipu (celkový efekt)
    let nextEffectText = "";    // Toto bude pro "Další úr." v tooltipu (celkový efekt)
    let previewStatsNextLevel;

    if (currentLevel < essence.maxLevel) {
        previewStatsNextLevel = getEffectiveStatsWithTempEssenceLevel(essenceId, currentLevel + 1);
    }

    // Texty pro tooltip (celkové statistiky)
    switch (essence.effectType) {
        case 'essence_click_damage_multiplier_percent':
            currentEffectText = `Nyní celkem: ${formatNumber(gameState.effectiveClickDamage, 0)} Poškození klikem`;
            if (previewStatsNextLevel) {
                nextEffectText = `Další úr. celkem: ${formatNumber(previewStatsNextLevel.clickDamage, 0)} Poškození klikem`;
            }
            break;
        case 'essence_crit_chance_additive_percent':
            currentEffectText = `Nyní celkem: ${formatNumber(gameState.effectiveCritChance * 100, 1)}% Šance na krit`;
            if (previewStatsNextLevel) {
                nextEffectText = `Další úr. celkem: ${formatNumber(previewStatsNextLevel.critChance * 100, 1)}% Šance na krit`;
            }
            break;
        case 'essence_passive_dps_multiplier_percent':
            let currentPassivePreview = 0;
            if (typeof calculateTotalEffectivePassivePercentForPreview === 'function') {
                currentPassivePreview = calculateTotalEffectivePassivePercentForPreview();
            }
            currentEffectText = `Nyní celkem: ${formatNumber(currentPassivePreview * 100, 2)}% Max HP/s`;
            if (previewStatsNextLevel) {
                nextEffectText = `Další úr. celkem: ${formatNumber(previewStatsNextLevel.totalPassivePercent * 100, 2)}% Max HP/s`;
            }
            break;
        case 'essence_gold_multiplier_all_percent':
            // Pro zlato a EÚ zobrazujeme přímý příspěvek esence v tooltipu, protože nemáme jednoduchou "celkovou" stat.
            currentEffectText = `Efekt esence: +${formatNumber(currentLevel * essence.effectValuePerLevel * 100, 0)}% k zisku zlata`;
            if (currentLevel < essence.maxLevel) {
                nextEffectText = `Další úr. efekt: +${formatNumber((currentLevel + 1) * essence.effectValuePerLevel * 100, 0)}%`;
            }
            break;
        case 'essence_echo_shard_multiplier_percent':
            currentEffectText = `Efekt esence: +${formatNumber(currentLevel * essence.effectValuePerLevel * 100, 0)}% k zisku EÚ`;
            if (currentLevel < essence.maxLevel) {
                nextEffectText = `Další úr. efekt: +${formatNumber((currentLevel + 1) * essence.effectValuePerLevel * 100, 0)}%`;
            }
            break;
        default:
            let genericCurrentBonus = currentLevel * (essence.effectValuePerLevel || 0);
            currentEffectText = `Přímý efekt: ${formatNumber(genericCurrentBonus, 2)}`;
            if (currentLevel < essence.maxLevel) {
                let genericNextBonus = (currentLevel + 1) * (essence.effectValuePerLevel || 0);
                nextEffectText = `Další úr. přímý efekt: ${formatNumber(genericNextBonus, 2)}`;
            }
    }

    if (currentLevel >= essence.maxLevel) {
        nextEffectText = "Maximální úroveň";
    }

    return {
        name: essence.name,
        // description: essence.description, // Popis se již nezobrazuje v tooltipu
        currentLevelText: `Úroveň: ${currentLevel}/${essence.maxLevel}`,
        currentEffectText, // Toto je pro "Nyní" v tooltipu
        nextEffectText,    // Toto je pro "Další úr." v tooltipu
        costText: currentLevel < essence.maxLevel ? `Cena další úrovně: ${formatNumber(essence.cost(currentLevel))} EÚ` : ""
    };
}

/**
 * Zobrazí tooltip s informacemi o esenci.
 * @param {string} essenceId - ID esence.
 * @param {MouseEvent} event - Událost myši pro pozicování.
 */
function showEssenceTooltip(essenceId, event) {
    if (!essenceTooltipElement) {
        return;
    }

    const preview = getEssenceEffectPreviewText(essenceId);
    let tooltipHTML = `
        <strong class="essence-tooltip-name">${preview.name}</strong>
        <p class="essence-tooltip-level">${preview.currentLevelText}</p>
        <hr class="essence-tooltip-hr">
        <p class="essence-tooltip-effect">${preview.currentEffectText}</p>`;
    if (preview.nextEffectText) {
        tooltipHTML += `<p class="essence-tooltip-effect-next">${preview.nextEffectText}</p>`;
    }

    essenceTooltipElement.innerHTML = tooltipHTML;
    essenceTooltipElement.classList.remove('hidden');
    updateEssenceTooltipPosition(event);
}

/**
 * Skryje tooltip esence.
 */
function hideEssenceTooltip() {
    if (essenceTooltipElement) {
        essenceTooltipElement.classList.add('hidden');
    }
}

/**
 * Aktualizuje pozici tooltipu esence.
 * @param {MouseEvent} event - Událost myši.
 */
function updateEssenceTooltipPosition(event) {
    if (!essenceTooltipElement || essenceTooltipElement.classList.contains('hidden')) return;
    const tooltipWidth = essenceTooltipElement.offsetWidth;
    const tooltipHeight = essenceTooltipElement.offsetHeight;
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
    essenceTooltipElement.style.left = `${x}px`;
    essenceTooltipElement.style.top = `${y}px`;
}


/**
 * Vykreslí všechny dostupné Esence v modálním okně Kovárny.
 */
function renderEssenceForgeUI() {
    if (!essenceContainer || !modalEchoShardsEssence) {
        console.error("Essence Forge UI elements not found for rendering.");
        return;
    }
    essenceContainer.innerHTML = '';
    modalEchoShardsEssence.textContent = formatNumber(gameState.echoShards);

    for (const id in allEssences) {
        if (allEssences.hasOwnProperty(id)) {
            const essence = allEssences[id];
            const essenceProgress = gameState.playerEssences[essence.id] || { level: 0 };
            const currentLevel = essenceProgress.level;

            const essenceDiv = document.createElement('div');
            essenceDiv.classList.add('essence-item');

            essenceDiv.addEventListener('mouseenter', (event) => showEssenceTooltip(id, event));
            essenceDiv.addEventListener('mouseleave', hideEssenceTooltip);
            essenceDiv.addEventListener('mousemove', updateEssenceTooltipPosition);

            const nameP = document.createElement('p');
            nameP.classList.add('essence-name');
            nameP.textContent = `${essence.icon} ${essence.name} (Úr. ${currentLevel}/${essence.maxLevel})`;
            essenceDiv.appendChild(nameP);

            // Přímé zobrazení popisu esence a jejího aktuálního přímého bonusu
            const descP = document.createElement('p');
            descP.classList.add('essence-description'); // Použijeme stejnou třídu jako u talentů pro konzistenci
            let directBonusValue = currentLevel * essence.effectValuePerLevel;
            let directBonusTextForDisplay;

            if (essence.effectType.includes('percent') || essence.effectType === 'essence_crit_chance_additive_percent') { // Pro crit chance chceme více desetinných míst
                directBonusTextForDisplay = formatNumber(directBonusValue * 100, (essence.effectType === 'essence_crit_chance_additive_percent' ? 3 : 2));
            } else {
                directBonusTextForDisplay = formatNumber(directBonusValue, 0);
            }
            descP.textContent = essence.description.replace('{bonusValue}', directBonusTextForDisplay);
            essenceDiv.appendChild(descP);


            const costP = document.createElement('p');
            costP.classList.add('essence-level-cost');

            if (currentLevel < essence.maxLevel) {
                const currentCost = essence.cost(currentLevel);
                costP.textContent = `Cena další úrovně: ${formatNumber(currentCost)} EÚ`;
                const upgradeButton = document.createElement('button');
                upgradeButton.classList.add('essence-upgrade-button');
                upgradeButton.textContent = 'Vytvořit/Vylepšit';
                upgradeButton.disabled = gameState.echoShards < currentCost;
                upgradeButton.onclick = () => craftOrUpgradeEssence(essence.id);
                essenceDiv.appendChild(upgradeButton);
            } else {
                costP.textContent = 'Maximální úroveň esence';
            }
            essenceDiv.appendChild(costP);
            essenceContainer.appendChild(essenceDiv);
        }
    }
}

/**
 * Zpracuje nákup nebo vylepšení Esence.
 * @param {string} essenceId - ID Esence.
 */
function craftOrUpgradeEssence(essenceId) {
    const essence = allEssences[essenceId];
    const essenceProgress = gameState.playerEssences[essenceId] || { level: 0 };

    if (!essence) {
        console.error(`Esence s ID ${essenceId} nebyla nalezena.`);
        return;
    }

    if (essenceProgress.level >= essence.maxLevel) {
        if(typeof showMessageBox === 'function') showMessageBox("Tato esence je již na maximální úrovni!", true);
        return;
    }

    const cost = essence.cost(essenceProgress.level);
    if (gameState.echoShards >= cost) {
        gameState.echoShards -= cost;
        essenceProgress.level++;
        gameState.playerEssences[essenceId] = essenceProgress;

        if(typeof showMessageBox === 'function') showMessageBox(`Esence "${essence.name}" vylepšena na úroveň ${essenceProgress.level}!`, false);
        if (typeof soundManager !== 'undefined') {
            soundManager.playSound('upgrade', 'A#4', '8n');
        }

        if (typeof calculateEffectiveStats === 'function') calculateEffectiveStats();
        if (typeof updateUI === 'function') updateUI();

        renderEssenceForgeUI(); // Překreslí UI kovárny, aby se aktualizoval i tooltip (pokud je zobrazen)
    } else {
        if(typeof showMessageBox === 'function') showMessageBox("Nedostatek Echo Úlomků pro tuto esenci!", true);
    }
}

/**
 * Získá celkový bonus z aktivních Esencí daného typu.
 * @param {string} bonusType - Typ bonusu (např. 'essence_click_damage_multiplier_percent').
 * @returns {number} - Celková hodnota bonusu.
 */
function getEssenceBonus(bonusType) {
    let totalBonus = 0;
    for (const essenceId in gameState.playerEssences) {
        if (gameState.playerEssences.hasOwnProperty(essenceId)) {
            const essenceDef = allEssences[essenceId];
            const currentProgress = gameState.playerEssences[essenceId];
            if (essenceDef && essenceDef.effectType === bonusType && currentProgress.level > 0) {
                totalBonus += (currentProgress.level * essenceDef.effectValuePerLevel);
            }
        }
    }
    return totalBonus;
}
