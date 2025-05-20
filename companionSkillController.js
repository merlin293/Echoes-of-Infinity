// SOUBOR: companionSkillController.js

// DOM elementy pro modální okno budou definovány a inicializovány v uiController.js
// např. companionSkillModal, companionSkillModalTitle, modalCompanionEssenceDisplay, 
// companionSkillsContainer, closeCompanionSkillModalButton;

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
    // Aktualizujeme zobrazení esencí v modálu, pokud je otevřený
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
    
    // Předpokládáme, že tyto DOM elementy jsou již definovány globálně v uiController.js a inicializovány
    if (companionSkillModal && companionSkillModalTitle && modalCompanionEssenceDisplay && companionSkillsContainer) {
        companionSkillModalTitle.textContent = `Strom Dovedností: ${companion.name}`;
        modalCompanionEssenceDisplay.textContent = formatNumber(gameState.companionEssence); 
        renderCompanionSkillTreeUI(companionId, companionSkillsContainer); 
        
        companionSkillModal.dataset.companionId = companionId;

        openModal(companionSkillModal); 
    } else {
        console.error("DOM elementy pro modální okno dovedností společníka nebyly nalezeny/inicializovány v uiController.");
    }
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
            skillDiv.classList.add('talent-item'); 

            let bonusValue = currentSkillLevel * skillDef.effectValuePerLevel;
            if (isNaN(bonusValue)) {
                bonusValue = 0;
            }
            let bonusTextForDisplay;

            if (skillDef.effectType.includes('percent') || skillDef.effectType === 'companion_gold_on_hit_chance') { 
                bonusTextForDisplay = formatNumber(bonusValue * 100, 2); 
            } else {
                bonusTextForDisplay = formatNumber(bonusValue, (Math.abs(bonusValue) < 1 && bonusValue !== 0) ? 4 : 2); 
            }
            
            // Vytvoření elementů namísto innerHTML pro lepší manipulaci
            const nameP = document.createElement('p');
            nameP.classList.add('talent-name');
            nameP.textContent = `${skillDef.icon || '🔧'} ${skillDef.name} (Úr. ${currentSkillLevel}/${skillDef.maxLevel})`;
            skillDiv.appendChild(nameP);

            const descP = document.createElement('p');
            descP.classList.add('talent-description');
            descP.textContent = skillDef.description.replace('{bonusValue}', bonusTextForDisplay);
            skillDiv.appendChild(descP);

            const costP = document.createElement('p');
            costP.classList.add('talent-level-cost');
            costP.id = `skill-cost-${companionId}-${skillId}`; // ID zůstává pro případné reference
            costP.textContent = "Cena: Načítání..."; // Počáteční text
            skillDiv.appendChild(costP);


            if (currentSkillLevel < skillDef.maxLevel) {
                const upgradeButton = document.createElement('button');
                upgradeButton.classList.add('talent-upgrade-button'); 
                upgradeButton.textContent = 'Vylepšit Dovednost';
                upgradeButton.dataset.companionId = companionId;
                upgradeButton.dataset.skillId = skillId;
                upgradeButton.onclick = () => upgradeCompanionSkill(companionId, skillId);
                skillDiv.appendChild(upgradeButton);
                // Předáme costP přímo do funkce pro aktualizaci
                updateCompanionSkillButtonState(upgradeButton, companionId, skillId, skillDef, currentSkillLevel, costP);
            } else {
                costP.textContent = "Maximální úroveň dovednosti"; // Aktualizujeme text ceny pro max úroveň
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
        console.warn(`Tlačítko nebo element ceny nenalezen pro ${companionId}-${skillId}`);
        if(costTextPElement) costTextPElement.textContent = "Chyba načítání ceny."; // Informace pro uživatele
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