function initializeEquipment() {
    if (typeof gameState.equipment !== 'object' || gameState.equipment === null) {
        gameState.equipment = {};
    }
    equipmentSlots.forEach(slot => { 
        gameState.equipment[slot] = { 
            level: 0,
        };
    });
    // renderEquipmentUI se volá až po úplné inicializaci gameState v loadGame nebo initializeNewGameVariablesAndUI
}

/**
 * Vypočítá cenu vylepšení pro daný předmět na dané úrovni a tieru.
 * @param {string} itemSlot - Slot vybavení (např. 'weapon').
 * @param {number} localLevel - Aktuální lokální úroveň předmětu v rámci tieru.
 * @param {number} tierIndexOfItem - Index aktuálního tieru předmětu.
 * @returns {number} - Cena vylepšení.
 */
function calculateItemUpgradeCost(itemSlot, localLevel, tierIndexOfItem) {
    const baseCost = 10; 
    let currentTierIndex = tierIndexOfItem;

    if (typeof tiers === 'undefined' || !Array.isArray(tiers) || tiers.length === 0) {
        console.error(`calculateItemUpgradeCost: Pole 'tiers' není dostupné. Používám minimální cost multiplier pro slot ${itemSlot}.`);
        return Math.ceil((baseCost * 1) * Math.pow(1.12 , localLevel));
    }

    if (typeof currentTierIndex !== 'number' || isNaN(currentTierIndex) || currentTierIndex < 0 || currentTierIndex >= tiers.length) {
        console.warn(`calculateItemUpgradeCost: Neplatný tierIndexOfItem (${tierIndexOfItem}) pro slot ${itemSlot}. Používám tier 0.`);
        currentTierIndex = 0; 
    }
    
    const tierConfig = tiers[currentTierIndex];

    if (!tierConfig) { 
        console.error(`calculateItemUpgradeCost: tierConfig pro index ${currentTierIndex} není definován. Používám minimální cost multiplier pro slot ${itemSlot}.`);
        return Math.ceil((baseCost * 1) * Math.pow(1.12 , localLevel));
    }

    const tierCostMultiplier = tierConfig.costMultiplier || 1; 
    const effectiveLevelForCosting = (currentTierIndex * MAX_ITEM_LEVEL) + localLevel; 
    return Math.ceil((baseCost * tierCostMultiplier) * Math.pow(1.12 , effectiveLevelForCosting)); 
}
        
/**
 * Vypočítá poškození poskytované předmětem na dané úrovni.
 * @param {number} level - Úroveň předmětu.
 * @returns {number} - Poškození předmětu.
 */
function getItemDamage(level) {
    if (level <= 0) return 0;
    let totalDamage = 0;
    const levelBlocksDamage = [1, 2, 4, 8, 16, 32, 64, 128, 256, 521]; 
    const levelsPerBlock = 10;

    for (let blockIndex = 0; blockIndex < levelBlocksDamage.length; blockIndex++) {
        const damagePerLevelInThisBlock = levelBlocksDamage[blockIndex];
        const blockStartLevel = blockIndex * levelsPerBlock + 1;
        const blockEndLevel = (blockIndex + 1) * levelsPerBlock;

        if (level < blockStartLevel) break; 

        const levelsInThisBlockToCalculate = Math.min(level, blockEndLevel) - blockStartLevel + 1;
        totalDamage += levelsInThisBlockToCalculate * damagePerLevelInThisBlock;

        if (level <= blockEndLevel) break; 
    }
    if (level > levelBlocksDamage.length * levelsPerBlock) {
        const remainingLevels = level - (levelBlocksDamage.length * levelsPerBlock);
        totalDamage += remainingLevels * levelBlocksDamage[levelBlocksDamage.length - 1]; 
    }
    return totalDamage;
}

/**
 * Vykreslí panel s vybavením hráče.
 */
function renderEquipmentUI() {
    if (!equipmentContainer || !currentTierDisplay) {
        console.error("Equipment UI elements (equipmentContainer or currentTierDisplay) not found for rendering.");
        return;
    }
    equipmentContainer.innerHTML = ''; 

    let currentTierIndexToUse = 0;
    if (typeof gameState.currentTierIndex === 'number' && gameState.currentTierIndex >= 0) {
        currentTierIndexToUse = gameState.currentTierIndex;
    } else {
        console.warn(`renderEquipmentUI: gameState.currentTierIndex je '${gameState.currentTierIndex}'. Používám fallback 0.`);
    }

    let tierNameForHeader = `T${currentTierIndexToUse} (Načítání...)`;
    let currentTierForItemsObject = null;

    if (typeof tiers !== 'undefined' && Array.isArray(tiers) && tiers.length > 0) {
        if (currentTierIndexToUse < tiers.length && tiers[currentTierIndexToUse]) {
            currentTierForItemsObject = tiers[currentTierIndexToUse];
            if (typeof currentTierForItemsObject.name === 'string') {
                tierNameForHeader = `T${currentTierIndexToUse} ${currentTierForItemsObject.name}`;
            } else {
                 console.warn(`renderEquipmentUI: tiers[${currentTierIndexToUse}] nemá vlastnost 'name'.`);
                 tierNameForHeader = `T${currentTierIndexToUse} (Neznámý název)`;
            }
        } else {
            console.warn(`renderEquipmentUI: Index ${currentTierIndexToUse} je mimo rozsah pro pole 'tiers' (délka ${tiers.length}). Používám fallback na Tier 0.`);
            if (tiers[0] && typeof tiers[0].name === 'string') { 
                currentTierForItemsObject = tiers[0];
                tierNameForHeader = `T0 ${tiers[0].name} (Původní index: ${currentTierIndexToUse})`;
                currentTierIndexToUse = 0; 
            } else {
                console.error("renderEquipmentUI: Fallback tier 0 je také neplatný nebo 'tiers' pole je prázdné.");
                tierNameForHeader = `T${currentTierIndexToUse} (Chyba tieru)`;
            }
        }
    } else {
        console.error("CRITICAL: 'tiers' array from config.js is not defined, not an array, or empty when renderEquipmentUI is called.");
        // Pokud tiers není dostupné, currentTierForItemsObject zůstane null
    }
    currentTierDisplay.textContent = tierNameForHeader;

    equipmentSlots.forEach(slot => { 
        const item = gameState.equipment[slot]; 
        if (!item) { 
            console.warn(`Chybějící data pro vybavení ve slotu: ${slot}. Inicializuji na úroveň 0.`);
            gameState.equipment[slot] = { level: 0 }; 
        }
        const itemDamage = getItemDamage(item.level); 
        
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('equipment-item');
        
        const infoDiv = document.createElement('div');
        infoDiv.classList.add('equipment-info');

        const itemTierName = currentTierForItemsObject && typeof currentTierForItemsObject.name === 'string' ? currentTierForItemsObject.name : "Neznámý";

        infoDiv.innerHTML = `
            <span class="equipment-item-icon" style="float: left; margin-right: 0.5rem;">${itemIcons[slot]}</span>
            <div>
                <span class="equipment-name">${itemNamesCzech[slot]}</span>
                <span class="equipment-tier-level">T${currentTierIndexToUse} ${itemTierName} - Úr. ${item.level}/${MAX_ITEM_LEVEL}</span>
                <span class="equipment-bonus">+${formatNumber(itemDamage)} Poškození</span>
            </div>`;
        itemDiv.appendChild(infoDiv);
        
        const upgradeOptionsDiv = document.createElement('div');
        upgradeOptionsDiv.classList.add('equipment-upgrade-options');
        
        const costForNextLevel = item.level < MAX_ITEM_LEVEL ? calculateItemUpgradeCost(slot, item.level, currentTierIndexToUse) : 'MAX';
        const disabledStatus = item.level >= MAX_ITEM_LEVEL ? 'disabled' : '';
        
        upgradeOptionsDiv.innerHTML = `
            <button data-slot="${slot}" data-amount="1" class="equipment-level-button" ${disabledStatus}> 
                +1 Úr. <span class="cost-text">(${costForNextLevel === 'MAX' ? 'MAX' : formatNumber(costForNextLevel) + ' Z'})</span>
            </button>
            <button data-slot="${slot}" data-amount="5" class="equipment-level-button" ${disabledStatus}>+5 Úr.</button>
            <button data-slot="${slot}" data-amount="10" class="equipment-level-button" ${disabledStatus}>+10 Úr.</button>
            <button data-slot="${slot}" data-amount="max" class="equipment-level-button" ${disabledStatus}>Max Úr.</button>`;
        itemDiv.appendChild(upgradeOptionsDiv);
        equipmentContainer.appendChild(itemDiv);
    });
    if (typeof updateEquipmentButtonStates === 'function') updateEquipmentButtonStates(); 
    checkTierAdvanceReady(); 
}
        
/**
 * Zpracuje kliknutí na tlačítko pro vylepšení vybavení.
 */
function upgradeEquipmentItem(slot, amount) {
    const item = gameState.equipment[slot]; 
    if (!item || item.level >= MAX_ITEM_LEVEL) return;

    let levelsPurchased = 0;
    let totalCost = 0;
    
    let tierIndexForCostCalculation = gameState.currentTierIndex;
    if (typeof tierIndexForCostCalculation !== 'number' || tierIndexForCostCalculation < 0 || (typeof tiers !== 'undefined' && tierIndexForCostCalculation >= tiers.length)) {
        console.warn(`upgradeEquipmentItem: Neplatný currentTierIndex (${gameState.currentTierIndex}). Používám 0 pro výpočet ceny.`);
        tierIndexForCostCalculation = 0;
    }


    if (amount === 'max') {
        let tempGold = gameState.gold; 
        let tempLevel = item.level;
        while (tempLevel < MAX_ITEM_LEVEL) {
            const costForThisLevel = calculateItemUpgradeCost(slot, tempLevel, tierIndexForCostCalculation); 
            if (tempGold >= costForThisLevel) {
                tempGold -= costForThisLevel;
                totalCost += costForThisLevel;
                tempLevel++;
                levelsPurchased++;
            } else {
                break;
            }
        }
    } else {
        const numAmount = parseInt(amount);
        let tempLevel = item.level;
        for (let i = 0; i < numAmount; i++) {
            if (tempLevel >= MAX_ITEM_LEVEL) break;
            const costForThisLevel = calculateItemUpgradeCost(slot, tempLevel, tierIndexForCostCalculation);
            if (gameState.gold >= totalCost + costForThisLevel) { 
                totalCost += costForThisLevel;
                tempLevel++;
                levelsPurchased++;
            } else {
                if (levelsPurchased === 0 && i === 0 && typeof showMessageBox === 'function') showMessageBox("Nedostatek zlata!", true); 
                break; 
            }
        }
    }

    if (levelsPurchased > 0) {
        gameState.gold -= totalCost; 
        gameState.equipment[slot].level += levelsPurchased;
        
        if (typeof soundManager !== 'undefined') soundManager.playSound('upgrade', 'C5', '16n');
        
        if (typeof calculateEffectiveStats === 'function') calculateEffectiveStats(); 
        if (typeof renderEquipmentUI === 'function') renderEquipmentUI(); 
        if (typeof updateUI === 'function') updateUI(); 
        
        checkTierAdvanceReady(); 
    }
}

/**
 * Zkontroluje, zda je možné postoupit na další tier vybavení a aktualizuje tlačítko.
 */
function checkTierAdvanceReady() {
    if (!advanceTierButton) return;

    const allMaxLevel = equipmentSlots.every(slot => gameState.equipment[slot] && gameState.equipment[slot].level >= MAX_ITEM_LEVEL);
    const nextTierExists = typeof tiers !== 'undefined' && Array.isArray(tiers) && gameState.currentTierIndex < tiers.length - 1;
    
    advanceTierButton.disabled = !allMaxLevel || !nextTierExists; 

    if (!nextTierExists) {
         advanceTierButton.textContent = "MAX TIER"; 
    } else if (allMaxLevel) {
        const nextTierName = (tiers[gameState.currentTierIndex+1] && tiers[gameState.currentTierIndex+1].name) ? tiers[gameState.currentTierIndex+1].name : "Další Tier";
        advanceTierButton.textContent = `Postoupit na T${gameState.currentTierIndex + 1} ${nextTierName}`;
    } else {
         advanceTierButton.textContent = `Vyleveluj vše na ${MAX_ITEM_LEVEL}`;
    }
}
        
/**
 * Zpracuje postup na další tier vybavení.
 */
function advanceToNextTier() {
    const nextTierExists = typeof tiers !== 'undefined' && Array.isArray(tiers) && gameState.currentTierIndex < tiers.length - 1;
    if (nextTierExists && equipmentSlots.every(slot => gameState.equipment[slot] && gameState.equipment[slot].level >= MAX_ITEM_LEVEL)) {
        let itemDamageFromCompletedTier = 0;
        equipmentSlots.forEach(slot => {
            itemDamageFromCompletedTier += getItemDamage(gameState.equipment[slot].level);
        });
        gameState.baseClickDamage += itemDamageFromCompletedTier; 
        gameState.currentTierIndex++; 
        gameState.lifetimeStats.lifetimeTiersAdvanced++; 
        
        if (typeof updateCurrentTierBonuses === 'function') updateCurrentTierBonuses(); 
        
        equipmentSlots.forEach(slot => { 
            gameState.equipment[slot].level = 0;
        });
        
        const currentTierName = (tiers[gameState.currentTierIndex] && tiers[gameState.currentTierIndex].name) ? tiers[gameState.currentTierIndex].name : `Tier ${gameState.currentTierIndex}`;
        if (typeof showMessageBox === 'function') showMessageBox(`Postup na Tier ${gameState.currentTierIndex}: ${currentTierName}! Bonusy aktualizovány. Poškození z předchozího tieru zachováno.`, false); 
        if (typeof soundManager !== 'undefined') soundManager.playSound('tierAdvance', 'C4', '2n'); 
        
        if (typeof calculateEffectiveStats === 'function') calculateEffectiveStats(); 
        if (typeof renderEquipmentUI === 'function') renderEquipmentUI(); 
        if (typeof updateUI === 'function') updateUI(); 
        if (typeof checkMilestones === 'function') checkMilestones(); 
    }
}

/**
 * Aktualizuje globální proměnné passivePercentFromTiers a currentGlobalTierClickDamageBonus.
 */
function updateCurrentTierBonuses() {
    let cumulativeTierPassivePercent = 0;
    let cumulativeTierClickDmg = 0;

    if (typeof tiers !== 'undefined' && Array.isArray(tiers)) {
        // Zajistíme, že currentTierIndex je platný
        let validTierIndex = 0;
        if(typeof gameState.currentTierIndex === 'number' && gameState.currentTierIndex >= 0 && gameState.currentTierIndex < tiers.length) {
            validTierIndex = gameState.currentTierIndex;
        } else if (gameState.currentTierIndex >= tiers.length) {
            validTierIndex = tiers.length -1; // Pokud je index moc velký, použijeme poslední platný
        }


        for (let i = 0; i <= validTierIndex; i++) { 
            if (tiers[i]) { 
                cumulativeTierPassivePercent += tiers[i].passivePercentBonus || 0;
                cumulativeTierClickDmg += tiers[i].clickDamageBonus || 0; 
            }
        }
    } else {
        console.error("updateCurrentTierBonuses: 'tiers' array is not defined or not an array.");
    }

    gameState.passivePercentFromTiers = cumulativeTierPassivePercent; 
    if (typeof getArtifactBonus === 'function') {
         gameState.passivePercentFromTiers += getArtifactBonus('passive_percent_flat_additive'); 
    }
    if (typeof talents !== 'undefined' && talents.passivePercentFlatBoostTalent && talents.passivePercentFlatBoostTalent.currentLevel > 0) {
        gameState.passivePercentFromTiers += talents.passivePercentFlatBoostTalent.effectValue * talents.passivePercentFlatBoostTalent.currentLevel;
    }
    
    gameState.currentGlobalTierClickDamageBonus = cumulativeTierClickDmg; 
}