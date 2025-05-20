// SOUBOR: equipmentController.js

/**
 * Inicializuje vybavení hráče pro všechny sloty na úroveň 0 a vypočítá počáteční cenu vylepšení.
 * Volá se na začátku nové hry nebo při resetu Echa, které resetuje vybavení.
 */
function initializeEquipment() {
    // equipmentSlots je globální konstanta z config.js
    // gameState je globální objekt z gameState.js
    equipmentSlots.forEach(slot => { 
        gameState.equipment[slot] = { 
            level: 0,
            // Cena se vypočítá při prvním renderování nebo při pokusu o vylepšení
        };
    });
    // Po inicializaci je dobré rovnou překreslit UI vybavení
    if (typeof renderEquipmentUI === 'function') { // renderEquipmentUI z uiController.js
        renderEquipmentUI();
    }
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
    // tiers a MAX_ITEM_LEVEL jsou globální konstanty z config.js
    const tierConfig = tiers[tierIndexOfItem]; 
    if (!tierConfig) {
        console.error(`Neznámý tier index: ${tierIndexOfItem} pro slot ${itemSlot}`);
        return Infinity; 
    }
    const tierCostMultiplier = tierConfig.costMultiplier; 
    const effectiveLevelForCosting = (tierIndexOfItem * MAX_ITEM_LEVEL) + localLevel; 
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
    // Tato logika pro výpočet poškození je specifická pro hru
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
 * Volá se při inicializaci a po každé změně vybavení nebo tieru.
 */
function renderEquipmentUI() {
    // equipmentContainer a currentTierDisplay jsou DOM elementy z uiController.js
    if (!equipmentContainer || !currentTierDisplay) {
        console.error("Equipment UI elements not found for rendering.");
        return;
    }
    equipmentContainer.innerHTML = ''; 
    // gameState a tiers jsou z gameState.js a config.js
    currentTierDisplay.textContent = `T${gameState.currentTierIndex} ${tiers[gameState.currentTierIndex].name}`; 

    // equipmentSlots, itemIcons, itemNamesCzech, MAX_ITEM_LEVEL jsou z config.js
    equipmentSlots.forEach(slot => { 
        const item = gameState.equipment[slot]; 
        if (!item) {
            console.warn(`Chybějící data pro vybavení ve slotu: ${slot}`);
            gameState.equipment[slot] = { level: 0 }; // Základní inicializace, pokud chybí
        }
        const itemDamage = getItemDamage(item.level); 
        
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('equipment-item');
        
        const infoDiv = document.createElement('div');
        infoDiv.classList.add('equipment-info');
        infoDiv.innerHTML = `
            <span class="equipment-item-icon" style="float: left; margin-right: 0.5rem;">${itemIcons[slot]}</span>
            <div>
                <span class="equipment-name">${itemNamesCzech[slot]}</span>
                <span class="equipment-tier-level">T${gameState.currentTierIndex} ${tiers[gameState.currentTierIndex].name} - Úr. ${item.level}/${MAX_ITEM_LEVEL}</span>
                <span class="equipment-bonus">+${formatNumber(itemDamage)} Poškození</span>
            </div>`; // formatNumber z utils.js
        itemDiv.appendChild(infoDiv);
        
        const upgradeOptionsDiv = document.createElement('div');
        upgradeOptionsDiv.classList.add('equipment-upgrade-options');
        
        const costForNextLevel = item.level < MAX_ITEM_LEVEL ? calculateItemUpgradeCost(slot, item.level, gameState.currentTierIndex) : 'MAX';
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
    if (typeof updateEquipmentButtonStates === 'function') updateEquipmentButtonStates(); // z uiController.js
    checkTierAdvanceReady(); 
}
        
/**
 * Zpracuje kliknutí na tlačítko pro vylepšení vybavení.
 * @param {string} slot - Slot vybavení.
 * @param {string} amount - Počet úrovní k vylepšení ('1', '5', '10', 'max').
 */
function upgradeEquipmentItem(slot, amount) {
    // gameState, MAX_ITEM_LEVEL jsou z gameState.js a config.js
    const item = gameState.equipment[slot]; 
    if (!item || item.level >= MAX_ITEM_LEVEL) return;

    let levelsPurchased = 0;
    let totalCost = 0;

    if (amount === 'max') {
        let tempGold = gameState.gold; 
        let tempLevel = item.level;
        while (tempLevel < MAX_ITEM_LEVEL) {
            const costForThisLevel = calculateItemUpgradeCost(slot, tempLevel, gameState.currentTierIndex); 
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
            const costForThisLevel = calculateItemUpgradeCost(slot, tempLevel, gameState.currentTierIndex);
            if (gameState.gold >= totalCost + costForThisLevel) { 
                totalCost += costForThisLevel;
                tempLevel++;
                levelsPurchased++;
            } else {
                if (levelsPurchased === 0 && i === 0 && typeof showMessageBox === 'function') showMessageBox("Nedostatek zlata!", true); // showMessageBox z uiController.js
                break; 
            }
        }
    }

    if (levelsPurchased > 0) {
        gameState.gold -= totalCost; 
        gameState.equipment[slot].level += levelsPurchased;
        
        if (typeof soundManager !== 'undefined') soundManager.playSound('upgrade', 'C5', '16n'); // soundManager z utils.js
        
        if (typeof calculateEffectiveStats === 'function') calculateEffectiveStats(); // z gameLogic.js
        
        // Přidáno explicitní volání renderEquipmentUI pro překreslení panelu vybavení
        if (typeof renderEquipmentUI === 'function') renderEquipmentUI(); // z uiController.js
        
        if (typeof updateUI === 'function') updateUI(); // z uiController.js (pro ostatní části UI)
        
        checkTierAdvanceReady(); 
    }
}

/**
 * Zkontroluje, zda je možné postoupit na další tier vybavení a aktualizuje tlačítko.
 */
function checkTierAdvanceReady() {
    // advanceTierButton je DOM element z uiController.js
    // equipmentSlots, MAX_ITEM_LEVEL, tiers jsou z config.js
    // gameState je z gameState.js
    if (!advanceTierButton) return;

    const allMaxLevel = equipmentSlots.every(slot => gameState.equipment[slot] && gameState.equipment[slot].level >= MAX_ITEM_LEVEL);
    advanceTierButton.disabled = !allMaxLevel || gameState.currentTierIndex >= tiers.length - 1; 

    if (gameState.currentTierIndex >= tiers.length - 1) {
         advanceTierButton.textContent = "MAX TIER"; 
    } else if (allMaxLevel) {
        advanceTierButton.textContent = `Postoupit na T${gameState.currentTierIndex + 1} ${tiers[gameState.currentTierIndex+1].name}`;
    } else {
         advanceTierButton.textContent = `Vyleveluj vše na ${MAX_ITEM_LEVEL}`;
    }
}
        
/**
 * Zpracuje postup na další tier vybavení.
 */
function advanceToNextTier() {
    // gameState, tiers, equipmentSlots jsou z gameState.js a config.js
    if (gameState.currentTierIndex < tiers.length - 1 && equipmentSlots.every(slot => gameState.equipment[slot] && gameState.equipment[slot].level >= MAX_ITEM_LEVEL)) {
        let itemDamageFromCompletedTier = 0;
        equipmentSlots.forEach(slot => {
            itemDamageFromCompletedTier += getItemDamage(gameState.equipment[slot].level);
        });
        gameState.baseClickDamage += itemDamageFromCompletedTier; 
        gameState.currentTierIndex++; 
        gameState.lifetimeStats.lifetimeTiersAdvanced++; 
        
        if (typeof updateCurrentTierBonuses === 'function') updateCurrentTierBonuses(); 
        
        equipmentSlots.forEach(slot => { // Reset úrovní vybavení pro nový tier
            gameState.equipment[slot].level = 0;
        });
        
        if (typeof showMessageBox === 'function') showMessageBox(`Postup na Tier ${gameState.currentTierIndex}: ${tiers[gameState.currentTierIndex].name}! Bonusy aktualizovány. Poškození z předchozího tieru zachováno.`, false); // showMessageBox z uiController.js
        if (typeof soundManager !== 'undefined') soundManager.playSound('tierAdvance', 'C4', '2n'); // soundManager z utils.js
        
        if (typeof calculateEffectiveStats === 'function') calculateEffectiveStats(); // z gameLogic.js
        
        // Přidáno explicitní volání renderEquipmentUI pro překreslení panelu vybavení po postupu na tier
        if (typeof renderEquipmentUI === 'function') renderEquipmentUI(); // z uiController.js

        if (typeof updateUI === 'function') updateUI(); // z uiController.js (pro ostatní části UI)
        if (typeof checkMilestones === 'function') checkMilestones(); // z milestoneController.js
    }
}

/**
 * Aktualizuje globální proměnné passivePercentFromTiers a currentGlobalTierClickDamageBonus.
 * Volá se po změně tieru nebo po načtení hry.
 */
function updateCurrentTierBonuses() {
    // gameState, tiers jsou z gameState.js a config.js
    // talents je z config.js (pro přístup k talentům)
    // getArtifactBonus je z artifactController.js
    let cumulativeTierPassivePercent = 0;
    let cumulativeTierClickDmg = 0;
    for (let i = 0; i <= gameState.currentTierIndex; i++) { 
        if (tiers[i]) { 
            cumulativeTierPassivePercent += tiers[i].passivePercentBonus || 0;
            cumulativeTierClickDmg += tiers[i].clickDamageBonus || 0; 
        }
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