// SOUBOR: companionController.js

// Globální proměnná pro tooltip element (bude inicializována v uiController.js)
// let companionTooltipElement;

/**
 * Vypočítá pasivní poškození (%HP/s) daného společníka na základě jeho úrovně a dovedností.
 * @param {string} companionId - ID společníka.
 * @param {number} [forcedLevel] - Volitelná úroveň pro výpočet náhledu.
 * @returns {number} - Pasivní poškození v procentech (např. 0.0002 pro 0.02%).
 */
function calculateCompanionPassivePercent(companionId, forcedLevel = null) {
    const companionDef = allCompanions[companionId];
    const companionInstance = gameState.ownedCompanions[companionId];

    // Pokud je společník na aktivní výpravě a nepočítáme náhled pro jinou úroveň, DPS je 0
    if (forcedLevel === null && gameState.activeExpeditions && gameState.activeExpeditions.some(exp => exp.assignedCompanionIds.includes(companionId))) {
        return 0;
    }

    if (companionDef && companionInstance) {
        const levelToUse = forcedLevel !== null ? forcedLevel : companionInstance.level;
        if (levelToUse <= 0) return 0; // Pokud je úroveň 0 nebo méně, DPS je 0

        let currentBasePassivePercent = companionDef.basePassivePercent;

        if (typeof getCompanionSkillBonus === 'function') {
            const baseDamageIncreaseBonus = getCompanionSkillBonus(companionId, 'companion_base_damage_increase_percent');
            currentBasePassivePercent *= (1 + baseDamageIncreaseBonus);
        }

        let finalPassivePercent = currentBasePassivePercent + (levelToUse - 1) * companionDef.passivePercentPerLevel;

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
    if (!gameState.ownedCompanions) return 0;
    for (const id in gameState.ownedCompanions) {
        if (gameState.ownedCompanions.hasOwnProperty(id)) {
            totalPercent += calculateCompanionPassivePercent(id);
        }
    }
    return totalPercent;
}

/**
 * Aktualizuje globální proměnnou totalCompanionPassivePercent v gameState.js.
 */
function updateTotalCompanionPassivePercentOnGameState() {
    gameState.totalCompanionPassivePercent = calculateTotalCompanionPassivePercent();
}

/**
 * Generuje texty pro náhled vylepšení společníka.
 * @param {string} companionId - ID společníka.
 * @returns {object} - Objekt s texty pro tooltip.
 */
function getCompanionUpgradePreviewText(companionId) {
    const companionDef = allCompanions[companionId];
    const companionInstance = gameState.ownedCompanions[companionId];

    if (!companionDef || !companionInstance) {
        return { name: "Neznámý společník", currentLevelText: "", currentEffectText: "Chyba", nextEffectText: "" };
    }

    const currentLevel = companionInstance.level;
    const isOnExpedition = gameState.activeExpeditions && gameState.activeExpeditions.some(exp => exp.assignedCompanionIds.includes(companionId));

    let currentDps = calculateCompanionPassivePercent(companionId);
    let currentEffectText = `Nyní: ${formatNumber(currentDps * 100, 3)}% HP/s`;
    if (isOnExpedition) {
        currentEffectText += " (Na výpravě - 0% DPS)";
    }

    let nextEffectText = "";
    if (isOnExpedition) {
        nextEffectText = "Nelze vylepšit na výpravě.";
    } else if (currentLevel < companionDef.maxLevel) {
        const nextLevelDps = calculateCompanionPassivePercent(companionId, currentLevel + 1);
        nextEffectText = `Další úr. (${currentLevel + 1}): ${formatNumber(nextLevelDps * 100, 3)}% HP/s`;
    } else {
        nextEffectText = "Maximální úroveň";
    }

    return {
        name: companionDef.name,
        currentLevelText: `Úroveň: ${currentLevel}/${companionDef.maxLevel}`,
        currentEffectText,
        nextEffectText,
    };
}

/**
 * Zobrazí tooltip s informacemi o vylepšení společníka.
 * @param {string} companionId - ID společníka.
 * @param {MouseEvent} event - Událost myši pro pozicování.
 */
function showCompanionTooltip(companionId, event) {
    if (!companionTooltipElement) { // companionTooltipElement z uiController.js
        return;
    }

    const preview = getCompanionUpgradePreviewText(companionId);
    let tooltipHTML = `
        <strong class="companion-tooltip-name">${preview.name}</strong>
        <p class="companion-tooltip-level">${preview.currentLevelText}</p>
        <hr class="companion-tooltip-hr">
        <p class="companion-tooltip-effect">${preview.currentEffectText}</p>`;
    if (preview.nextEffectText) {
        tooltipHTML += `<p class="companion-tooltip-effect-next">${preview.nextEffectText}</p>`;
    }

    companionTooltipElement.innerHTML = tooltipHTML;
    companionTooltipElement.classList.remove('hidden');
    updateCompanionTooltipPosition(event);
}

/**
 * Skryje tooltip společníka.
 */
function hideCompanionTooltip() {
    if (companionTooltipElement) {
        companionTooltipElement.classList.add('hidden');
    }
}

/**
 * Aktualizuje pozici tooltipu společníka.
 * @param {MouseEvent} event - Událost myši.
 */
function updateCompanionTooltipPosition(event) {
    if (!companionTooltipElement || companionTooltipElement.classList.contains('hidden')) return;
    const tooltipWidth = companionTooltipElement.offsetWidth;
    const tooltipHeight = companionTooltipElement.offsetHeight;
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
    companionTooltipElement.style.left = `${x}px`;
    companionTooltipElement.style.top = `${y}px`;
}


/**
 * Vykreslí společníky v jejich panelu v UI.
 */
function renderCompanionsUI() {
    if (!companionsContainer) {
        console.error("renderCompanionsUI ERROR: Companions container (companionsContainer) not found for rendering.");
        return;
    }
    companionsContainer.innerHTML = '';

    if (typeof allCompanions !== 'object' || allCompanions === null || Object.keys(allCompanions).length === 0) {
        companionsContainer.innerHTML = '<p class="text-xs text-gray-400 text-center">Žádní společníci nejsou definováni v konfiguraci.</p>';
        return;
    }

    let appendedCount = 0;
    for (const id in allCompanions) {
        if (allCompanions.hasOwnProperty(id)) {
            const companionDef = allCompanions[id];
            const companionInstance = gameState.ownedCompanions ? gameState.ownedCompanions[id] : undefined;
            const isOnExpedition = gameState.activeExpeditions && gameState.activeExpeditions.some(exp => exp.assignedCompanionIds.includes(id));

            if (!companionDef) {
                continue;
            }

            const companionDiv = document.createElement('div');
            companionDiv.classList.add('companion-item');
            if (isOnExpedition) {
                companionDiv.classList.add('on-expedition');
            }

            let companionHTML = `
                <span class="companion-icon">${companionDef.icon || '❓'}</span>
                <div class="companion-info">
                    <span class="companion-name">${companionDef.name || 'Neznámý Společník'}</span>
                    <span class="text-xs text-gray-400">${companionDef.description || 'Popis chybí.'}</span>`;

            if (companionInstance) {
                const currentPassivePerc = calculateCompanionPassivePercent(id);
                companionHTML += `
                    <span class="companion-level">Úroveň: ${companionInstance.level} / ${companionDef.maxLevel || 'N/A'}</span>
                    <span class="companion-dps">%HP/s: ${formatNumber(currentPassivePerc * 100, 3)}%</span>`;
                if (isOnExpedition) {
                    companionHTML += `<span class="text-xs text-yellow-400 block mt-1">Na výpravě</span>`;
                }
                companionHTML += `
                </div>
                <div class="companion-upgrade-options">`;

                const upgradeButton = document.createElement('button');
                upgradeButton.dataset.id = id;
                upgradeButton.classList.add('companion-button', 'upgrade-companion');
                upgradeButton.disabled = isOnExpedition || companionInstance.level >= (companionDef.maxLevel || Infinity);
                const upgradeCost = Math.ceil((companionDef.upgradeBaseCost || 0) * Math.pow(companionDef.upgradeCostMultiplier || 1, companionInstance.level -1));
                upgradeButton.innerHTML = `Vylepšit <span class="cost-text">(${formatNumber(upgradeCost)} Z)</span>`;

                if (!isOnExpedition && companionInstance.level < (companionDef.maxLevel || Infinity)) {
                    upgradeButton.addEventListener('mouseenter', (event) => showCompanionTooltip(id, event));
                    upgradeButton.addEventListener('mouseleave', hideCompanionTooltip);
                    upgradeButton.addEventListener('mousemove', updateCompanionTooltipPosition);
                }
                
                const tempDiv = document.createElement('div'); // Pomocný div pro parsování HTML
                tempDiv.appendChild(upgradeButton);


                if (companionInstance.level < (companionDef.maxLevel || Infinity)) {
                     companionHTML += tempDiv.innerHTML;
                } else {
                    companionHTML += `<button class="companion-button" disabled>Max. úroveň</button>`;
                }


                if (companionDef.skillTree && Object.keys(companionDef.skillTree).length > 0) {
                    companionHTML += `<button data-id="${id}" class="companion-button open-skills-companion" ${isOnExpedition ? 'disabled' : ''}>Dovednosti</button>`;
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

            // Znovu připojení event listenerů pro dynamicky vytvořené tlačítko vylepšení
            if (companionInstance && !isOnExpedition && companionInstance.level < (companionDef.maxLevel || Infinity)) {
                const newUpgradeButton = companionDiv.querySelector(`.upgrade-companion[data-id="${id}"]`);
                if (newUpgradeButton) {
                    newUpgradeButton.addEventListener('mouseenter', (event) => showCompanionTooltip(id, event));
                    newUpgradeButton.addEventListener('mouseleave', hideCompanionTooltip);
                    newUpgradeButton.addEventListener('mousemove', updateCompanionTooltipPosition);
                }
            }

            appendedCount++;
        }
    }

    if (appendedCount === 0 && Object.keys(allCompanions).length > 0) {
        companionsContainer.innerHTML = '<p class="text-xs text-gray-400 text-center">Společníci jsou definováni, ale nepodařilo se je zobrazit.</p>';
    }

    if (typeof updateCompanionButtonStates === 'function') updateCompanionButtonStates();
}

/**
 * Odemkne společníka, pokud má hráč dostatek zlata.
 * @param {string} companionId - ID společníka k odemčení.
 */
function unlockCompanion(companionId) {
    const companionDef = allCompanions[companionId];

    if (!companionDef) {
        console.error(`UNLOCK_COMPANION ERROR: Companion definition for ID '${companionId}' not found in allCompanions.`);
        return;
    }

    const isAlreadyOwned = gameState.ownedCompanions && gameState.ownedCompanions[companionId];
    const canAfford = gameState.gold >= (companionDef.unlockCost || 0);

    if (!isAlreadyOwned && canAfford) {
        gameState.gold -= (companionDef.unlockCost || 0);
        if (!gameState.ownedCompanions) {
            gameState.ownedCompanions = {};
        }
        gameState.ownedCompanions[companionId] = { level: 1 };

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
        renderCompanionsUI();
        if (typeof updateUI === 'function') updateUI();
        if (typeof checkMilestones === 'function') checkMilestones();
    } else if (isAlreadyOwned) {
        if (typeof showMessageBox === 'function') showMessageBox("Tento společník je již odemčen.", true);
    } else if (!canAfford) {
        if (typeof showMessageBox === 'function') showMessageBox("Nedostatek zlata!", true);
    }
}

/**
 * Vylepší společníka o jednu úroveň, pokud má hráč dostatek zlata.
 * @param {string} companionId - ID společníka k vylepšení.
 */
function upgradeCompanion(companionId) {
    const companionDef = allCompanions[companionId];
    const companionInstance = gameState.ownedCompanions ? gameState.ownedCompanions[companionId] : undefined;
    const isOnExpedition = gameState.activeExpeditions && gameState.activeExpeditions.some(exp => exp.assignedCompanionIds.includes(companionId));

    if (isOnExpedition) {
        if (typeof showMessageBox === 'function') showMessageBox("Nelze vylepšit společníka, který je na výpravě.", true);
        return;
    }

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
 */
function updateCompanionButtonStates() {
    if (!companionsContainer) return;
    const companionButtons = companionsContainer.querySelectorAll('.companion-button');
    companionButtons.forEach(button => {
        const id = button.dataset.id;
        const companionDef = allCompanions[id];
        const companionInstance = gameState.ownedCompanions ? gameState.ownedCompanions[id] : undefined;
        if (!companionDef) return;

        const isOnExpedition = gameState.activeExpeditions && gameState.activeExpeditions.some(exp => exp.assignedCompanionIds.includes(id));

        const costSpan = button.querySelector('.cost-text');

        if (button.classList.contains('unlock')) {
            button.disabled = gameState.gold < (companionDef.unlockCost || 0) || !!companionInstance;
            if (costSpan) costSpan.textContent = `(${formatNumber(companionDef.unlockCost || 0)} Z)`;
        } else if (button.classList.contains('upgrade-companion')) {
            if (companionInstance && companionInstance.level < (companionDef.maxLevel || Infinity)) {
                const upgradeCost = Math.ceil((companionDef.upgradeBaseCost || 0) * Math.pow(companionDef.upgradeCostMultiplier || 1, companionInstance.level -1));
                button.disabled = gameState.gold < upgradeCost || isOnExpedition;
                if (costSpan) costSpan.textContent = `(${formatNumber(upgradeCost)} Z)`;
            } else {
                button.disabled = true;
                if (costSpan && companionInstance && companionInstance.level >= (companionDef.maxLevel || Infinity)) costSpan.textContent = '(MAX)';
                else if (costSpan) costSpan.textContent = '';
            }
        } else if (button.classList.contains('open-skills-companion')) {
            button.disabled = !companionInstance || !companionDef.skillTree || Object.keys(companionDef.skillTree).length === 0 || isOnExpedition;
        }
    });
}
