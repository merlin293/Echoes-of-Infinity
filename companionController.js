// SOUBOR: companionController.js

/**
 * Vypočítá pasivní poškození (%HP/s) daného společníka na základě jeho úrovně a dovedností.
 * @param {string} companionId - ID společníka.
 * @returns {number} - Pasivní poškození v procentech (např. 0.0002 pro 0.02%).
 */
function calculateCompanionPassivePercent(companionId) {
    const companionDef = allCompanions[companionId]; // Z config.js
    const companionInstance = gameState.ownedCompanions[companionId]; // Z gameState.js
    
    if (companionDef && companionInstance && companionInstance.level > 0) {
        let currentBasePassivePercent = companionDef.basePassivePercent;

        // Aplikace bonusu z dovednosti, která zvyšuje základní pasivní poškození
        if (typeof getCompanionSkillBonus === 'function') { // getCompanionSkillBonus z companionSkillController.js
            const baseDamageIncreaseBonus = getCompanionSkillBonus(companionId, 'companion_base_damage_increase_percent');
            currentBasePassivePercent *= (1 + baseDamageIncreaseBonus);
        }

        let finalPassivePercent = currentBasePassivePercent + (companionInstance.level - 1) * companionDef.passivePercentPerLevel;

        // Aplikace multiplikativního bonusu z dovednosti na celkové poškození společníka
        if (typeof getCompanionSkillBonus === 'function') {
            const damageMultiplierBonus = getCompanionSkillBonus(companionId, 'companion_damage_multiplier_percent');
            finalPassivePercent *= (1 + damageMultiplierBonus);
        }
        
        return finalPassivePercent;
    }
    return 0;
}

/**
 * Vypočítá celkové pasivní poškození (%HP/s) od všech vlastněných společníků.
 * @returns {number} - Celkové pasivní poškození v procentech.
 */
function calculateTotalCompanionPassivePercent() {
    let totalPercent = 0;
    for (const id in gameState.ownedCompanions) { // gameState.ownedCompanions z gameState.js
        if (gameState.ownedCompanions.hasOwnProperty(id)) {
            totalPercent += calculateCompanionPassivePercent(id);
        }
    }
    return totalPercent;
}

/**
 * Aktualizuje globální proměnnou totalCompanionPassivePercent v gameState.js.
 * Tato funkce by měla být volána po každé změně úrovně, odemčení společníka nebo vylepšení jeho dovednosti.
 */
function updateTotalCompanionPassivePercentOnGameState() {
    gameState.totalCompanionPassivePercent = calculateTotalCompanionPassivePercent(); // gameState.totalCompanionPassivePercent z gameState.js
}

/**
 * Vykreslí společníky v jejich panelu v UI.
 */
function renderCompanionsUI() {
    // companionsContainer je DOM element z uiController.js
    if (!companionsContainer) { 
        console.error("Companions container not found for rendering.");
        return;
    }
    companionsContainer.innerHTML = ''; // Vyčistí předchozí obsah

    // allCompanions je z config.js
    for (const id in allCompanions) { 
        if (allCompanions.hasOwnProperty(id)) {
            const companionDef = allCompanions[id];
            const companionInstance = gameState.ownedCompanions[id]; // Z gameState.js
            
            const companionDiv = document.createElement('div');
            companionDiv.classList.add('companion-item'); 
            
            let companionHTML = `
                <span class="companion-icon">${companionDef.icon}</span>
                <div class="companion-info"> 
                    <span class="companion-name">${companionDef.name}</span>
                    <span class="text-xs text-gray-400">${companionDef.description}</span>`;

            if (companionInstance) {
                const currentPassivePerc = calculateCompanionPassivePercent(id);
                companionHTML += `
                    <span class="companion-level">Úroveň: ${companionInstance.level} / ${companionDef.maxLevel}</span>
                    <span class="companion-dps">%HP/s: ${formatNumber(currentPassivePerc * 100, 3)}%</span> 
                </div>
                <div class="companion-upgrade-options">`; // formatNumber z utils.js
                
                if (companionInstance.level < companionDef.maxLevel) {
                    const upgradeCost = Math.ceil(companionDef.upgradeBaseCost * Math.pow(companionDef.upgradeCostMultiplier, companionInstance.level -1));
                    companionHTML += `<button data-id="${id}" class="companion-button upgrade-companion">Vylepšit <span class="cost-text">(${formatNumber(upgradeCost)} Z)</span></button>`;
                } else {
                    companionHTML += `<button class="companion-button" disabled>Max. úroveň</button>`;
                }
                // Přidání tlačítka pro otevření stromu dovedností, pokud společník nějaký má
                if (companionDef.skillTree && Object.keys(companionDef.skillTree).length > 0) {
                    companionHTML += `<button data-id="${id}" class="companion-button open-skills-companion">Dovednosti</button>`;
                } else {
                     companionHTML += `<button class="companion-button" disabled>Žádné dovednosti</button>`;
                }

                companionHTML += `</div>`;
            } else {
                 companionHTML += `
                </div> 
                <div class="companion-upgrade-options">
                    <button data-id="${id}" class="companion-button unlock">Odemknout <span class="cost-text">(${formatNumber(companionDef.unlockCost)} Z)</span></button>
                    <button class="companion-button" disabled>Dovednosti</button> </div>`;
            }
            companionDiv.innerHTML = companionHTML; 
            companionsContainer.appendChild(companionDiv);
        }
    }
    // updateCompanionButtonStates z uiController.js (nebo přímo zde, pokud je jednodušší)
    if (typeof updateCompanionButtonStates === 'function') updateCompanionButtonStates(); 
}


/**
 * Odemkne společníka, pokud má hráč dostatek zlata.
 * @param {string} companionId - ID společníka k odemčení.
 */
function unlockCompanion(companionId) {
    const companionDef = allCompanions[companionId]; // Z config.js
    // gameState.gold a gameState.ownedCompanions z gameState.js
    if (companionDef && !gameState.ownedCompanions[companionId] && gameState.gold >= companionDef.unlockCost) { 
        gameState.gold -= companionDef.unlockCost; 
        gameState.ownedCompanions[companionId] = { level: 1 };
        // Inicializace úrovní dovedností pro nově odemčeného společníka
        if (companionDef.skillTree && typeof gameState.companionSkillLevels !== 'undefined') {
            if (!gameState.companionSkillLevels[companionId]) {
                gameState.companionSkillLevels[companionId] = {};
            }
            for (const skillId in companionDef.skillTree) {
                if (companionDef.skillTree.hasOwnProperty(skillId) && typeof gameState.companionSkillLevels[companionId][skillId] === 'undefined') {
                    gameState.companionSkillLevels[companionId][skillId] = 0; // Výchozí úroveň 0
                }
            }
        }
        
        // showMessageBox z uiController.js, soundManager z utils.js
        if (typeof showMessageBox === 'function') showMessageBox(`Společník ${companionDef.name} odemčen!`, false); 
        if (typeof soundManager !== 'undefined') soundManager.playSound('upgrade', 'D5', '8n');
        
        updateTotalCompanionPassivePercentOnGameState(); 
        renderCompanionsUI(); 
        if (typeof updateUI === 'function') updateUI(); // updateUI z uiController.js
        if (typeof checkMilestones === 'function') checkMilestones(); // checkMilestones z milestoneController.js
    } else if (companionDef && gameState.gold < companionDef.unlockCost) {
        if (typeof showMessageBox === 'function') showMessageBox("Nedostatek zlata!", true);
    } else if (gameState.ownedCompanions[companionId]){
        if (typeof showMessageBox === 'function') showMessageBox("Tento společník je již odemčen.", true);
    } else {
        console.error(`Společník s ID ${companionId} nebyl nalezen v konfiguraci.`);
    }
}

/**
 * Vylepší společníka o jednu úroveň, pokud má hráč dostatek zlata.
 * @param {string} companionId - ID společníka k vylepšení.
 */
function upgradeCompanion(companionId) {
    const companionDef = allCompanions[companionId]; // Z config.js
    const companionInstance = gameState.ownedCompanions[companionId]; // Z gameState.js

    if (companionDef && companionInstance && companionInstance.level < companionDef.maxLevel) {
        const upgradeCost = Math.ceil(companionDef.upgradeBaseCost * Math.pow(companionDef.upgradeCostMultiplier, companionInstance.level -1));
        if (gameState.gold >= upgradeCost) { // gameState.gold z gameState.js
            gameState.gold -= upgradeCost; 
            companionInstance.level++;
            
            if (typeof showMessageBox === 'function') showMessageBox(`${companionDef.name} vylepšen na úroveň ${companionInstance.level}!`, false);
            if (typeof soundManager !== 'undefined') soundManager.playSound('upgrade', 'D#5', '16n');
            
            updateTotalCompanionPassivePercentOnGameState();
            renderCompanionsUI(); // Překreslí UI společníků, aby se aktualizovaly i tlačítka
            if (typeof updateUI === 'function') updateUI();
        } else {
            if (typeof showMessageBox === 'function') showMessageBox("Nedostatek zlata!", true);
        }
    } else if (companionDef && companionInstance && companionInstance.level >= companionDef.maxLevel) {
        if (typeof showMessageBox === 'function') showMessageBox("Tento společník je již na maximální úrovni!", true);
    } else {
        console.error(`Společník s ID ${companionId} nebyl nalezen nebo není vlastněn.`);
    }
}

/**
 * Aktualizuje stav (disabled/enabled) tlačítek pro odemčení/vylepšení společníků a otevření dovedností.
 * Volá se po renderCompanionsUI a po změně množství zlata/esencí.
 */
function updateCompanionButtonStates() {
    // companionsContainer je DOM element z uiController.js
    if (!companionsContainer) return; 
    const companionButtons = companionsContainer.querySelectorAll('.companion-button');
    companionButtons.forEach(button => {
        const id = button.dataset.id;
        const companionDef = allCompanions[id]; // Z config.js
        const companionInstance = gameState.ownedCompanions[id]; // Z gameState.js
        if (!companionDef) return;

        const costSpan = button.querySelector('.cost-text');

        if (button.classList.contains('unlock')) {
            button.disabled = gameState.gold < companionDef.unlockCost || !!companionInstance;
            if (costSpan) costSpan.textContent = `(${formatNumber(companionDef.unlockCost)} Z)`;
        } else if (button.classList.contains('upgrade-companion')) {
            if (companionInstance && companionInstance.level < companionDef.maxLevel) {
                const upgradeCost = Math.ceil(companionDef.upgradeBaseCost * Math.pow(companionDef.upgradeCostMultiplier, companionInstance.level -1));
                button.disabled = gameState.gold < upgradeCost;
                if (costSpan) costSpan.textContent = `(${formatNumber(upgradeCost)} Z)`;
            } else {
                button.disabled = true; // Max úroveň nebo není vlastněn
                if (costSpan && companionInstance && companionInstance.level >= companionDef.maxLevel) costSpan.textContent = '(MAX)';
                else if (costSpan) costSpan.textContent = ''; 
            }
        } else if (button.classList.contains('open-skills-companion')) {
            // Tlačítko dovedností je aktivní, pokud je společník vlastněn a má definovaný skillTree
            button.disabled = !companionInstance || !companionDef.skillTree || Object.keys(companionDef.skillTree).length === 0;
        }
    });
}