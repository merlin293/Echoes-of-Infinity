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
    if (!gameState.ownedCompanions) return 0; // Pojistka
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
    if (!companionsContainer) {
        console.error("renderCompanionsUI ERROR: Companions container (companionsContainer) not found for rendering.");
        return;
    }
    // console.log("renderCompanionsUI: companionsContainer found.");

    try {
        // console.log("renderCompanionsUI: allCompanions:", JSON.stringify(allCompanions || {}));
    } catch (e) {
        // console.error("renderCompanionsUI: Error stringifying allCompanions", e, allCompanions);
    }
    try {
        // console.log("renderCompanionsUI: gameState.ownedCompanions:", JSON.stringify(gameState.ownedCompanions || {}));
    } catch (e) {
        // console.error("renderCompanionsUI: Error stringifying gameState.ownedCompanions", e, gameState.ownedCompanions);
    }


    companionsContainer.innerHTML = '';

    if (typeof allCompanions !== 'object' || allCompanions === null || Object.keys(allCompanions).length === 0) {
        console.warn("renderCompanionsUI: allCompanions is not a populated object or is empty. Panel will show 'no companions defined'.");
        companionsContainer.innerHTML = '<p class="text-xs text-gray-400 text-center">Žádní společníci nejsou definováni v konfiguraci.</p>';
        return;
    }

    let appendedCount = 0;
    for (const id in allCompanions) {
        if (allCompanions.hasOwnProperty(id)) {
            const companionDef = allCompanions[id];
            const companionInstance = gameState.ownedCompanions ? gameState.ownedCompanions[id] : undefined;

            if (!companionDef) {
                console.warn(`renderCompanionsUI: companionDef for id '${id}' is undefined. Skipping.`);
                continue;
            }

            const companionDiv = document.createElement('div');
            companionDiv.classList.add('companion-item');

            let companionHTML = `
                <span class="companion-icon">${companionDef.icon || '❓'}</span>
                <div class="companion-info">
                    <span class="companion-name">${companionDef.name || 'Neznámý Společník'}</span>
                    <span class="text-xs text-gray-400">${companionDef.description || 'Popis chybí.'}</span>`;

            if (companionInstance) {
                const currentPassivePerc = calculateCompanionPassivePercent(id);
                companionHTML += `
                    <span class="companion-level">Úroveň: ${companionInstance.level} / ${companionDef.maxLevel || 'N/A'}</span>
                    <span class="companion-dps">%HP/s: ${formatNumber(currentPassivePerc * 100, 3)}%</span>
                </div>
                <div class="companion-upgrade-options">`;

                if (companionInstance.level < (companionDef.maxLevel || Infinity)) {
                    const upgradeCost = Math.ceil((companionDef.upgradeBaseCost || 0) * Math.pow(companionDef.upgradeCostMultiplier || 1, companionInstance.level -1));
                    companionHTML += `<button data-id="${id}" class="companion-button upgrade-companion">Vylepšit <span class="cost-text">(${formatNumber(upgradeCost)} Z)</span></button>`;
                } else {
                    companionHTML += `<button class="companion-button" disabled>Max. úroveň</button>`;
                }
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
                    <button data-id="${id}" class="companion-button unlock">Odemknout <span class="cost-text">(${formatNumber(companionDef.unlockCost || 0)} Z)</span></button>
                    <button class="companion-button" disabled>Dovednosti</button> </div>`;
            }
            companionDiv.innerHTML = companionHTML;
            companionsContainer.appendChild(companionDiv);
            appendedCount++;
        }
    }
    // console.log(`renderCompanionsUI: Appended ${appendedCount} companion items to companionsContainer.`);

    if (appendedCount === 0 && Object.keys(allCompanions).length > 0) {
        console.warn("renderCompanionsUI: allCompanions has items, but nothing was appended. Check for data issues in allCompanions definitions or HTML construction errors.");
        companionsContainer.innerHTML = '<p class="text-xs text-gray-400 text-center">Společníci jsou definováni, ale nepodařilo se je zobrazit.</p>';
    }

    if (typeof updateCompanionButtonStates === 'function') updateCompanionButtonStates();
}


/**
 * Odemkne společníka, pokud má hráč dostatek zlata.
 * @param {string} companionId - ID společníka k odemčení.
 */
function unlockCompanion(companionId) {
    console.log(`UNLOCK_COMPANION: Attempting to unlock companion '${companionId}'. Current gold: ${gameState.gold}`);
    const companionDef = allCompanions[companionId];

    if (!companionDef) {
        console.error(`UNLOCK_COMPANION ERROR: Companion definition for ID '${companionId}' not found in allCompanions.`);
        return;
    }

    const isAlreadyOwned = gameState.ownedCompanions && gameState.ownedCompanions[companionId];
    const canAfford = gameState.gold >= (companionDef.unlockCost || 0);

    console.log(`UNLOCK_COMPANION: companionDef.name: ${companionDef.name}, unlockCost: ${companionDef.unlockCost}, isAlreadyOwned: ${isAlreadyOwned}, canAfford: ${canAfford}`);

    if (!isAlreadyOwned && canAfford) {
        gameState.gold -= (companionDef.unlockCost || 0);
        if (!gameState.ownedCompanions) { // Pojistka, pokud by ownedCompanions nebylo inicializováno
            gameState.ownedCompanions = {};
            console.log("UNLOCK_COMPANION: gameState.ownedCompanions was undefined, initialized to {}.");
        }
        gameState.ownedCompanions[companionId] = { level: 1 };
        console.log(`UNLOCK_COMPANION: Companion '${companionId}' unlocked. gameState.ownedCompanions NOW:`, JSON.stringify(gameState.ownedCompanions)); // KLÍČOVÝ LOG

        if (companionDef.skillTree && typeof gameState.companionSkillLevels !== 'undefined') {
            if (!gameState.companionSkillLevels[companionId]) {
                gameState.companionSkillLevels[companionId] = {};
            }
            for (const skillId in companionDef.skillTree) {
                if (companionDef.skillTree.hasOwnProperty(skillId) && typeof gameState.companionSkillLevels[companionId][skillId] === 'undefined') {
                    gameState.companionSkillLevels[companionId][skillId] = 0;
                }
            }
        }

        if (typeof showMessageBox === 'function') showMessageBox(`Společník ${companionDef.name} odemčen!`, false);
        if (typeof soundManager !== 'undefined') soundManager.playSound('upgrade', 'D5', '8n');

        updateTotalCompanionPassivePercentOnGameState();
        console.log("UNLOCK_COMPANION: Calling renderCompanionsUI after unlock.");
        renderCompanionsUI();
        if (typeof updateUI === 'function') updateUI();
        if (typeof checkMilestones === 'function') checkMilestones();
    } else if (isAlreadyOwned) {
        if (typeof showMessageBox === 'function') showMessageBox("Tento společník je již odemčen.", true);
        console.log(`UNLOCK_COMPANION: Companion '${companionId}' is already owned.`);
    } else if (!canAfford) {
        if (typeof showMessageBox === 'function') showMessageBox("Nedostatek zlata!", true);
        console.log(`UNLOCK_COMPANION: Not enough gold to unlock '${companionId}'. Needed: ${companionDef.unlockCost}, Has: ${gameState.gold}`);
    }
}

/**
 * Vylepší společníka o jednu úroveň, pokud má hráč dostatek zlata.
 * @param {string} companionId - ID společníka k vylepšení.
 */
function upgradeCompanion(companionId) {
    const companionDef = allCompanions[companionId];
    const companionInstance = gameState.ownedCompanions ? gameState.ownedCompanions[companionId] : undefined;

    if (companionDef && companionInstance && companionInstance.level < (companionDef.maxLevel || Infinity)) {
        const upgradeCost = Math.ceil((companionDef.upgradeBaseCost || 0) * Math.pow(companionDef.upgradeCostMultiplier || 1, companionInstance.level -1));
        if (gameState.gold >= upgradeCost) {
            gameState.gold -= upgradeCost;
            companionInstance.level++;

            if (typeof showMessageBox === 'function') showMessageBox(`${companionDef.name} vylepšen na úroveň ${companionInstance.level}!`, false);
            if (typeof soundManager !== 'undefined') soundManager.playSound('upgrade', 'D#5', '16n');

            updateTotalCompanionPassivePercentOnGameState();
            renderCompanionsUI();
            if (typeof updateUI === 'function') updateUI();
        } else {
            if (typeof showMessageBox === 'function') showMessageBox("Nedostatek zlata!", true);
        }
    } else if (companionDef && companionInstance && companionInstance.level >= (companionDef.maxLevel || Infinity)) {
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
    if (!companionsContainer) return;
    const companionButtons = companionsContainer.querySelectorAll('.companion-button');
    companionButtons.forEach(button => {
        const id = button.dataset.id;
        const companionDef = allCompanions[id];
        const companionInstance = gameState.ownedCompanions ? gameState.ownedCompanions[id] : undefined;
        if (!companionDef) return;

        const costSpan = button.querySelector('.cost-text');

        if (button.classList.contains('unlock')) {
            button.disabled = gameState.gold < (companionDef.unlockCost || 0) || !!companionInstance;
            if (costSpan) costSpan.textContent = `(${formatNumber(companionDef.unlockCost || 0)} Z)`;
        } else if (button.classList.contains('upgrade-companion')) {
            if (companionInstance && companionInstance.level < (companionDef.maxLevel || Infinity)) {
                const upgradeCost = Math.ceil((companionDef.upgradeBaseCost || 0) * Math.pow(companionDef.upgradeCostMultiplier || 1, companionInstance.level -1));
                button.disabled = gameState.gold < upgradeCost;
                if (costSpan) costSpan.textContent = `(${formatNumber(upgradeCost)} Z)`;
            } else {
                button.disabled = true;
                if (costSpan && companionInstance && companionInstance.level >= (companionDef.maxLevel || Infinity)) costSpan.textContent = '(MAX)';
                else if (costSpan) costSpan.textContent = '';
            }
        } else if (button.classList.contains('open-skills-companion')) {
            button.disabled = !companionInstance || !companionDef.skillTree || Object.keys(companionDef.skillTree).length === 0;
        }
    });
}
