// SOUBOR: companionSkillController.js

// DOM elementy pro modální okno budou definovány a inicializovány v uiController.js
// např. companionSkillModal, companionSkillModalTitle, modalCompanionEssenceDisplay,
// companionSkillsContainer, closeCompanionSkillModalButton;

// Globální proměnná pro tooltip element (bude inicializována v uiController.js)
// let companionSkillTooltipElement;

/**
 * Přidá hráči Esence Společníků.
 * @param {number} amount - Množství Esencí Společníků k přidání.
 */
function gainCompanionEssence(amount) {
    if (!gameState) return;
    gameState.companionEssence = (gameState.companionEssence || 0) + amount;
    gameState.lifetimeStats.companionEssenceCollectedTotal = (gameState.lifetimeStats.companionEssenceCollectedTotal || 0) + amount;

    if (typeof showMessageBox === 'function') {
        showMessageBox(`Získal jsi ${amount} Esencí Společníků!`, false, 2000);
    }
    if (typeof updateDailyQuestProgress === 'function') {
        updateDailyQuestProgress('companionEssenceCollected', amount);
    }
    if (typeof updateUI === 'function') updateUI();
    if (typeof companionSkillModal !== 'undefined' && companionSkillModal && !companionSkillModal.classList.contains('hidden') && typeof modalCompanionEssenceDisplay !== 'undefined' && modalCompanionEssenceDisplay) {
        modalCompanionEssenceDisplay.textContent = formatNumber(gameState.companionEssence);
    }
}

/**
 * Otevře modální okno se stromem dovedností pro daného společníka.
 * @param {string} companionId - ID společníka.
 */
function openCompanionSkillTreeModalUI(companionId) {
    const companion = allCompanions[companionId];
    if (!companion) {
        console.error(`Společník s ID ${companionId} nebyl nalezen pro zobrazení stromu dovedností.`);
        return;
    }

    if (companionSkillModal && companionSkillModalTitle && modalCompanionEssenceDisplay && companionSkillsContainer) {
        companionSkillModalTitle.textContent = `Dovednosti: ${companion.icon} ${companion.name}`;
        modalCompanionEssenceDisplay.textContent = formatNumber(gameState.companionEssence);
        renderCompanionSkillTreeUI(companionId, companionSkillsContainer);

        companionSkillModal.dataset.companionId = companionId;

        openModal(companionSkillModal);
    } else {
        console.error("DOM elementy pro modální okno dovedností společníka nebyly nalezeny/inicializovány v uiController.");
    }
}


/**
 * Generuje texty pro náhled efektu dovednosti společníka.
 * @param {string} companionId - ID společníka.
 * @param {string} skillId - ID dovednosti.
 * @returns {object} - Objekt s texty pro tooltip.
 */
function getCompanionSkillEffectPreviewText(companionId, skillId) {
    const companionDef = allCompanions[companionId];
    if (!companionDef || !companionDef.skillTree || !companionDef.skillTree[skillId]) {
        return { name: "Neznámá dovednost", currentLevelText: "", currentEffectText: "Chyba: Definice nenalezena", nextEffectText: "", costText: "" };
    }
    const skillDef = companionDef.skillTree[skillId];
    const currentSkillLevel = (gameState.companionSkillLevels[companionId] && gameState.companionSkillLevels[companionId][skillId]) ? gameState.companionSkillLevels[companionId][skillId] : 0;

    let currentEffectText = "";
    let nextEffectText = "";

    // Funkce pro formátování bonusu (podobná té v renderCompanionSkillTreeUI)
    const formatBonus = (level) => {
        if (level === 0 && skillDef.effectType !== 'global_player_damage_percent_if_active' && skillDef.effectType !== 'global_player_gold_multiplier_percent_if_active' && skillDef.effectType !== 'global_companion_passive_percent_flat_boost' && skillDef.effectType !== 'global_companion_essence_drop_chance_additive_percent') { // Pro některé globální bonusy chceme ukázat 0% i na levelu 0
             if (skillDef.effectType !== 'companion_gold_on_hit_chance') { // Šance na zlato se zobrazí i na 0
                return "Neaktivní";
             }
        }
        let bonusVal = level * skillDef.effectValuePerLevel;
        if (skillDef.effectType.includes('percent') || skillDef.effectType === 'companion_gold_on_hit_chance' || skillDef.effectType === 'global_companion_essence_drop_chance_additive_percent') {
            return `+${formatNumber(bonusVal * 100, 2)}%`;
        } else if (skillDef.effectType === 'global_companion_passive_percent_flat_boost') {
             return `+${formatNumber(bonusVal * 100, 4)}%`; // Pro velmi malé hodnoty
        }
        return `+${formatNumber(bonusVal, 2)}`;
    };

    currentEffectText = `Nyní: ${skillDef.description.replace('{bonusValue}', formatBonus(currentSkillLevel).replace('+',''))}`;


    if (currentSkillLevel < skillDef.maxLevel) {
        nextEffectText = `Další úr.: ${skillDef.description.replace('{bonusValue}', formatBonus(currentSkillLevel + 1).replace('+',''))}`;
    } else {
        nextEffectText = "Maximální úroveň";
    }
     // Zjednodušení, aby se nezobrazovalo "Nyní: popis +0%" ale spíše "Nyní: popis efektu"
    if (currentSkillLevel === 0 && (skillDef.effectType !== 'companion_gold_on_hit_chance' && skillDef.effectType !== 'global_companion_essence_drop_chance_additive_percent')) { // Pro některé typy chceme zobrazit i "0%"
        currentEffectText = "Efekt: Neaktivní";
    }


    return {
        name: `${skillDef.icon || '🔧'} ${skillDef.name}`,
        currentLevelText: `Úroveň: ${currentSkillLevel}/${skillDef.maxLevel}`,
        currentEffectText,
        nextEffectText,
        costText: currentSkillLevel < skillDef.maxLevel ? `Cena další úrovně: ${formatNumber(skillDef.cost(currentSkillLevel))} Esencí Spol.` : ""
    };
}

/**
 * Zobrazí tooltip s informacemi o dovednosti společníka.
 * @param {string} companionId - ID společníka.
 * @param {string} skillId - ID dovednosti.
 * @param {MouseEvent} event - Událost myši pro pozicování.
 */
function showCompanionSkillTooltip(companionId, skillId, event) {
    if (!companionSkillTooltipElement) { // companionSkillTooltipElement z uiController.js
        return;
    }
    const preview = getCompanionSkillEffectPreviewText(companionId, skillId);
    let tooltipHTML = `
        <strong class="companionskill-tooltip-name">${preview.name}</strong>
        <p class="companionskill-tooltip-level">${preview.currentLevelText}</p>
        <hr class="companionskill-tooltip-hr">
        <p class="companionskill-tooltip-effect">${preview.currentEffectText}</p>`;
    if (preview.nextEffectText) {
        tooltipHTML += `<p class="companionskill-tooltip-effect-next">${preview.nextEffectText}</p>`;
    }
    if (preview.costText) {
         tooltipHTML += `<p class="companionskill-tooltip-cost">${preview.costText}</p>`;
    }

    companionSkillTooltipElement.innerHTML = tooltipHTML;
    companionSkillTooltipElement.classList.remove('hidden');
    updateCompanionSkillTooltipPosition(event);
}

/**
 * Skryje tooltip dovednosti společníka.
 */
function hideCompanionSkillTooltip() {
    if (companionSkillTooltipElement) {
        companionSkillTooltipElement.classList.add('hidden');
    }
}

/**
 * Aktualizuje pozici tooltipu dovednosti společníka.
 * @param {MouseEvent} event - Událost myši.
 */
function updateCompanionSkillTooltipPosition(event) {
    if (!companionSkillTooltipElement || companionSkillTooltipElement.classList.contains('hidden')) return;
    const tooltipWidth = companionSkillTooltipElement.offsetWidth;
    const tooltipHeight = companionSkillTooltipElement.offsetHeight;
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
    companionSkillTooltipElement.style.left = `${x}px`;
    companionSkillTooltipElement.style.top = `${y}px`;
}


/**
 * Vykreslí strom dovedností pro daného společníka do poskytnutého kontejneru.
 * @param {string} companionId - ID společníka.
 * @param {HTMLElement} container - HTML element, do kterého se mají dovednosti vykreslit.
 */
function renderCompanionSkillTreeUI(companionId, container) {
    if (!container) {
        console.error("Kontejner pro vykreslení dovedností společníka nebyl poskytnut.");
        return;
    }
    container.innerHTML = '';

    const companionDef = allCompanions[companionId];
    const companionInstance = gameState.ownedCompanions[companionId];

    if (!companionDef || !companionInstance) {
        container.innerHTML = '<p class="text-xs text-gray-400 text-center">Společník není vlastněn nebo nebyl nalezen.</p>';
        return;
    }
    if (!companionDef.skillTree || Object.keys(companionDef.skillTree).length === 0) {
        container.innerHTML = '<p class="text-xs text-gray-400 text-center">Tento společník nemá žádné dovednosti.</p>';
        return;
    }

    for (const skillId in companionDef.skillTree) {
        if (companionDef.skillTree.hasOwnProperty(skillId)) {
            const skillDef = companionDef.skillTree[skillId];
            const currentSkillLevel = (gameState.companionSkillLevels[companionId] && gameState.companionSkillLevels[companionId][skillId]) ? gameState.companionSkillLevels[companionId][skillId] : 0;

            const skillDiv = document.createElement('div');
            skillDiv.classList.add('talent-item'); // Použijeme stejný styl jako pro talenty pro konzistenci

            // Přidání event listenerů pro tooltip
            skillDiv.addEventListener('mouseenter', (event) => showCompanionSkillTooltip(companionId, skillId, event));
            skillDiv.addEventListener('mouseleave', hideCompanionSkillTooltip);
            skillDiv.addEventListener('mousemove', updateCompanionSkillTooltipPosition);


            let bonusValue = currentSkillLevel * skillDef.effectValuePerLevel;
            if (isNaN(bonusValue)) {
                bonusValue = 0;
            }
            let bonusTextForDisplay; // Pro přímý popis v UI

            if (skillDef.effectType.includes('percent') || skillDef.effectType === 'companion_gold_on_hit_chance' || skillDef.effectType === 'global_companion_essence_drop_chance_additive_percent') {
                bonusTextForDisplay = formatNumber(bonusValue * 100, 2);
            } else if (skillDef.effectType === 'global_companion_passive_percent_flat_boost') {
                bonusTextForDisplay = formatNumber(bonusValue * 100, 4);
            }
            else {
                bonusTextForDisplay = formatNumber(bonusValue, (Math.abs(bonusValue) < 1 && bonusValue !== 0) ? 4 : 2);
            }

            const nameP = document.createElement('p');
            nameP.classList.add('talent-name'); // Použijeme .talent-name
            nameP.textContent = `${skillDef.icon || '🔧'} ${skillDef.name} (Úr. ${currentSkillLevel}/${skillDef.maxLevel})`;
            skillDiv.appendChild(nameP);

            const descP = document.createElement('p');
            descP.classList.add('talent-description'); // Použijeme .talent-description
            descP.textContent = skillDef.description.replace('{bonusValue}', bonusTextForDisplay);
            skillDiv.appendChild(descP);

            const costP = document.createElement('p');
            costP.classList.add('talent-level-cost'); // Použijeme .talent-level-cost
            costP.id = `skill-cost-${companionId}-${skillId}`;
            skillDiv.appendChild(costP); // CostP se naplní v updateCompanionSkillButtonState

            if (currentSkillLevel < skillDef.maxLevel) {
                const upgradeButton = document.createElement('button');
                upgradeButton.classList.add('talent-upgrade-button'); // Použijeme .talent-upgrade-button
                upgradeButton.textContent = 'Vylepšit Dovednost';
                upgradeButton.dataset.companionId = companionId;
                upgradeButton.dataset.skillId = skillId;
                upgradeButton.onclick = () => upgradeCompanionSkill(companionId, skillId);
                skillDiv.appendChild(upgradeButton);
                updateCompanionSkillButtonState(upgradeButton, companionId, skillId, skillDef, currentSkillLevel, costP);
            } else {
                costP.textContent = "Maximální úroveň dovednosti";
            }
            container.appendChild(skillDiv);
        }
    }
}

/**
 * Aktualizuje stav tlačítka pro vylepšení dovednosti společníka (cenu a zda je aktivní).
 * @param {HTMLButtonElement} button - Tlačítko pro vylepšení.
 * @param {string} companionId - ID společníka.
 * @param {string} skillId - ID dovednosti.
 * @param {object} skillDef - Definice dovednosti z config.js.
 * @param {number} currentSkillLevel - Aktuální úroveň dovednosti.
 * @param {HTMLElement} costTextPElement - HTML element <p> pro zobrazení ceny.
 */
function updateCompanionSkillButtonState(button, companionId, skillId, skillDef, currentSkillLevel, costTextPElement) {
    if (!button || !costTextPElement) {
        if(costTextPElement) costTextPElement.textContent = "Chyba načítání ceny.";
        return;
    }

    if (currentSkillLevel >= skillDef.maxLevel) {
        button.disabled = true;
        button.textContent = 'Max. Úroveň';
        costTextPElement.textContent = 'Maximální úroveň dovednosti';
        return;
    }

    const cost = skillDef.cost(currentSkillLevel);

    let prerequisiteMet = true;
    let prerequisiteText = "";
    if (skillDef.requires) {
        const reqSkillId = skillDef.requires.skill;
        const reqSkillLevel = skillDef.requires.level;
        const currentReqSkillLevel = (gameState.companionSkillLevels && gameState.companionSkillLevels[companionId] && gameState.companionSkillLevels[companionId][reqSkillId])
                                     ? gameState.companionSkillLevels[companionId][reqSkillId]
                                     : 0;
        if (currentReqSkillLevel < reqSkillLevel) {
            prerequisiteMet = false;
            const requiredSkillDef = (allCompanions && allCompanions[companionId] && allCompanions[companionId].skillTree && allCompanions[companionId].skillTree[reqSkillId])
                                     ? allCompanions[companionId].skillTree[reqSkillId]
                                     : { name: "Neznámá dovednost" };
            prerequisiteText = `<br><span class="text-xs text-red-400">Vyžaduje: ${requiredSkillDef.name} (Úr. ${reqSkillLevel})</span>`;
        }
    }
    costTextPElement.innerHTML = `Cena: ${formatNumber(cost)} Esencí Spol.` + prerequisiteText;

    button.disabled = gameState.companionEssence < cost || !prerequisiteMet;
    button.textContent = 'Vylepšit Dovednost';
}


/**
 * Zpracuje nákup nebo vylepšení dovednosti společníka.
 * @param {string} companionId - ID společníka.
 * @param {string} skillId - ID dovednosti.
 */
function upgradeCompanionSkill(companionId, skillId) {
    const companionDef = allCompanions[companionId];
    if (!companionDef || !companionDef.skillTree || !companionDef.skillTree[skillId]) {
        console.error(`Dovednost ${skillId} pro společníka ${companionId} nebyla nalezena.`);
        return;
    }
    const skillDef = companionDef.skillTree[skillId];
    const currentSkillLevel = (gameState.companionSkillLevels[companionId] && gameState.companionSkillLevels[companionId][skillId]) ? gameState.companionSkillLevels[companionId][skillId] : 0;

    if (currentSkillLevel >= skillDef.maxLevel) {
        if (typeof showMessageBox === 'function') showMessageBox("Tato dovednost je již na maximální úrovni!", true);
        return;
    }

    if (skillDef.requires) {
        const reqSkillId = skillDef.requires.skill;
        const reqSkillLevel = skillDef.requires.level;
        const currentReqSkillLevel = (gameState.companionSkillLevels[companionId] && gameState.companionSkillLevels[companionId][reqSkillId]) ? gameState.companionSkillLevels[companionId][reqSkillId] : 0;
        if (currentReqSkillLevel < reqSkillLevel) {
            if (typeof showMessageBox === 'function') showMessageBox("Nejprve vylepšete požadovanou dovednost!", true);
            return;
        }
    }

    const cost = skillDef.cost(currentSkillLevel);
    if (gameState.companionEssence >= cost) {
        gameState.companionEssence -= cost;
        if (!gameState.companionSkillLevels[companionId]) {
            gameState.companionSkillLevels[companionId] = {};
        }
        gameState.companionSkillLevels[companionId][skillId] = currentSkillLevel + 1;

        if (typeof showMessageBox === 'function') showMessageBox(`Dovednost "${skillDef.name}" společníka ${companionDef.name} vylepšena na úroveň ${currentSkillLevel + 1}!`, false);
        if (typeof soundManager !== 'undefined') soundManager.playSound('upgrade', 'A#4', '16n');

        if (typeof updateTotalCompanionPassivePercentOnGameState === 'function') {
            updateTotalCompanionPassivePercentOnGameState();
        }
        if (typeof calculateEffectiveStats === 'function') calculateEffectiveStats();
        if (typeof updateUI === 'function') updateUI();

        if (typeof companionSkillsContainer !== 'undefined' && companionSkillsContainer && companionSkillModal && !companionSkillModal.classList.contains('hidden')) {
             renderCompanionSkillTreeUI(companionId, companionSkillsContainer);
             if(typeof modalCompanionEssenceDisplay !== 'undefined' && modalCompanionEssenceDisplay) {
                modalCompanionEssenceDisplay.textContent = formatNumber(gameState.companionEssence);
             }
        }
    } else {
        if (typeof showMessageBox === 'function') showMessageBox("Nedostatek Esencí Společníků!", true);
    }
}

/**
 * Získá bonus z aktivní dovednosti společníka.
 * @param {string} companionId - ID společníka.
 * @param {string} effectType - Typ efektu, který hledáme.
 * @returns {number} - Celková hodnota bonusu z daného typu efektu pro společníka.
 */
function getCompanionSkillBonus(companionId, effectType) {
    let totalBonus = 0;
    if (!gameState.companionSkillLevels || !gameState.companionSkillLevels[companionId] || !allCompanions[companionId] || !allCompanions[companionId].skillTree) {
        return 0;
    }

    const skills = gameState.companionSkillLevels[companionId];
    const skillTreeDef = allCompanions[companionId].skillTree;

    for (const skillId in skills) {
        if (skills.hasOwnProperty(skillId) && skillTreeDef[skillId] && skillTreeDef[skillId].effectType === effectType) {
            const skillLevel = skills[skillId];
            if (skillLevel > 0) {
                totalBonus += skillLevel * skillTreeDef[skillId].effectValuePerLevel;
            }
        }
    }
    return totalBonus;
}
