// SOUBOR: playerController.js

/**
 * Vypočítá potřebné XP pro další úroveň hráče.
 * @returns {number} - Počet XP potřebných pro další úroveň.
 */
function calculateXpToNextLevel() {
    // gameState.playerLevel je z gameState.js
    return Math.floor(70 * Math.pow(1.10, gameState.playerLevel - 1)); 
}

/**
 * Přidá hráči zkušenosti a případně ho posune na další úroveň.
 * @param {number} amount - Množství XP k přidání.
 */
function gainXP(amount) {
    gameState.playerXP += amount; 
    let leveledUp = false;
    while (gameState.playerXP >= gameState.xpToNextLevel) { 
        gameState.playerXP -= gameState.xpToNextLevel;
        gameState.playerLevel++; 
        gameState.lifetimeStats.lifetimePlayerLevelsGained++; 
        // talentPointGainPerLevel by měla být globální konstanta z config.js
        if (typeof talentPointGainPerLevel === 'undefined') {
            console.error("CHYBA: talentPointGainPerLevel není definována! Zkontrolujte config.js a pořadí načítání skriptů.");
            gameState.talentPoints += 1; // Fallback na 1, aby hra úplně nespadla
        } else {
            gameState.talentPoints += talentPointGainPerLevel; 
        }
        gameState.xpToNextLevel = calculateXpToNextLevel(); 
        leveledUp = true;
        if (typeof showMessageBox === 'function') showMessageBox(`Postup na úroveň ${gameState.playerLevel}! Získal jsi ${talentPointGainPerLevel || 1} talentový bod.`, false, 3000);
        if (typeof soundManager !== 'undefined') {
            soundManager.playSound('milestone', 'D5', '4n'); 
        }
    }
    if (leveledUp) { 
        if (typeof renderTalentTree === 'function') renderTalentTree(); 
        if (typeof updateUI === 'function') updateUI(); 
    } 
}

/**
 * Vykreslí strom talentů v modálním okně.
 */
function renderTalentTree() {
    if (!talentsContainer || !modalPlayerLevel || !modalTalentPoints) { 
        console.error("Talent tree UI elements not found for rendering.");
        return;
    }
    talentsContainer.innerHTML = ''; 
    modalPlayerLevel.textContent = gameState.playerLevel; 
    modalTalentPoints.textContent = formatNumber(gameState.talentPoints); 

    const branches = {}; 
    for (const id in talents) { // talents z config.js
        if (talents.hasOwnProperty(id)) {
            const talent = talents[id];
            if (!branches[talent.branch]) {
                branches[talent.branch] = [];
            }
            branches[talent.branch].push({ ...talent, id }); 
        }
    }

    for (const branchName in branches) {
        const branchTitle = document.createElement('h4'); 
        branchTitle.classList.add('talent-branch-title');
        let readableBranchName = branchName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); 
        if (branchName === 'basic') readableBranchName = "Základní Vylepšení";
        if (branchName === 'crit') readableBranchName = "Kritické Zásahy";
        if (branchName === 'passive_dps') readableBranchName = "Pasivní Poškození (%HP)";
        branchTitle.textContent = readableBranchName; 
        talentsContainer.appendChild(branchTitle);

        branches[branchName].forEach(talent => {
            const talentDiv = document.createElement('div'); 
            talentDiv.classList.add('talent-item');
            if (talent.isUltimate) talentDiv.classList.add('is-ultimate');
            
            const nameP = document.createElement('p'); 
            nameP.classList.add('talent-name'); 
            nameP.textContent = `${talent.name} (Úr. ${talents[talent.id].currentLevel}/${talent.maxLevel})`; 
            talentDiv.appendChild(nameP);
            
            const descP = document.createElement('p'); 
            descP.classList.add('talent-description'); 
            descP.textContent = talent.description; 
            talentDiv.appendChild(descP);
            
            const costP = document.createElement('p'); 
            costP.classList.add('talent-level-cost');
            const currentCost = talent.cost(talents[talent.id].currentLevel);
            costP.textContent = talents[talent.id].currentLevel < talent.maxLevel ? `Cena další úrovně: ${formatNumber(currentCost)} TB` : 'Maximální úroveň'; 
            talentDiv.appendChild(costP);
            
            if (talents[talent.id].currentLevel < talent.maxLevel) {
                const upgradeButton = document.createElement('button'); 
                upgradeButton.classList.add('talent-upgrade-button'); 
                upgradeButton.textContent = 'Vylepšit';
                
                let prerequisiteMet = true;
                if (talent.requires) {
                    const prerequisiteTalent = talents[talent.requires]; 
                    if (prerequisiteTalent) {
                        if (talents[talent.requires].isUltimate) {
                            prerequisiteMet = prerequisiteTalent.currentLevel > 0;
                        } else {
                            prerequisiteMet = prerequisiteTalent.currentLevel >= prerequisiteTalent.maxLevel;
                        }
                    } else {
                        prerequisiteMet = false; 
                    }
                }
                upgradeButton.disabled = gameState.talentPoints < currentCost || !prerequisiteMet; 
                upgradeButton.onclick = () => upgradeTalent(talent.id); 
                talentDiv.appendChild(upgradeButton);
            }
            talentsContainer.appendChild(talentDiv);
        });
    }
    if (typeof updateTalentResetButtonState === 'function') updateTalentResetButtonState(); 
}

/**
 * Vylepší talent hráče.
 * @param {string} talentId - ID talentu k vylepšení.
 */
function upgradeTalent(talentId) {
    const talent = talents[talentId]; 
    if (!talent) {
        console.error(`Talent s ID ${talentId} nebyl nalezen.`);
        return;
    }
    
    const cost = talent.cost(talent.currentLevel);
    if (gameState.talentPoints >= cost && talent.currentLevel < talent.maxLevel) { 
        gameState.talentPoints -= cost; 
        talent.currentLevel++; 

        if (typeof showMessageBox === 'function') showMessageBox(`Talent "${talent.name}" vylepšen na úroveň ${talent.currentLevel}!`, false, 2000);
        if (typeof soundManager !== 'undefined') {
            soundManager.playSound('upgrade', 'G5', '16n');
        }
        
        if (talent.effectType === 'passive_percent_flat_boost_talent' || talent.effectType === 'all_passive_percent_multiplier_talent') {
            if (typeof updateCurrentTierBonuses === 'function') updateCurrentTierBonuses(); 
        }
        
        if (typeof calculateEffectiveStats === 'function') calculateEffectiveStats(); 
        renderTalentTree(); 
        if (typeof updateUI === 'function') updateUI(); 
    } else if (gameState.talentPoints < cost) {
        if (typeof showMessageBox === 'function') showMessageBox("Nedostatek talentových bodů!", true);
    } else if (talent.currentLevel >= talent.maxLevel) {
        if (typeof showMessageBox === 'function') showMessageBox("Tento talent je již na maximální úrovni!", true);
    }
}

/**
 * Aktualizuje stav tlačítka pro reset talentů a zobrazí/skryje možnosti platby.
 */
function updateTalentResetButtonState() {
    if (!requestTalentResetButton || !talentResetCostOptions) return; 

    const anyTalentAllocated = Object.values(talents).some(t => t.currentLevel > 0); 
    
    requestTalentResetButton.disabled = !anyTalentAllocated;
    requestTalentResetButton.textContent = anyTalentAllocated ? "Resetovat Talentové Body" : "Žádné talenty k resetu";
    
    talentResetCostOptions.classList.add('hidden');
    requestTalentResetButton.classList.remove('hidden');
}

/**
 * Zobrazí možnosti pro reset talentů a vypočítá náklady.
 */
function handleTalentResetRequest() {
    if (!requestTalentResetButton || !talentResetCostOptions || !resetCostShardsDisplay || !resetCostGoldDisplay || !resetTalentsWithShardsButton || !resetTalentsWithGoldButton) return;

    const anyTalentAllocated = Object.values(talents).some(t => t.currentLevel > 0);
    if (!anyTalentAllocated) {
        if (typeof showMessageBox === 'function') showMessageBox("Žádné talentové body nejsou aktuálně investovány.", true);
        return;
    }

    const goldCost = calculateTalentResetGoldCost();
    resetCostShardsDisplay.textContent = formatNumber(TALENT_RESET_COST_SHARDS); 
    resetCostGoldDisplay.textContent = formatNumber(goldCost);

    resetTalentsWithShardsButton.disabled = gameState.echoShards < TALENT_RESET_COST_SHARDS; 
    resetTalentsWithGoldButton.disabled = gameState.gold < goldCost; 

    requestTalentResetButton.classList.add('hidden');
    talentResetCostOptions.classList.remove('hidden');
}

/**
 * Vypočítá cenu resetu talentů ve zlatě.
 * @returns {number} - Cena ve zlatě.
 */
function calculateTalentResetGoldCost() {
    let cost = TALENT_RESET_BASE_GOLD_COST; 
    cost += (gameState.playerLevel * 2000) * (gameState.echoCount + 1); 
    return Math.floor(cost);
}

/**
 * Zruší proces resetu talentů a skryje možnosti platby.
 */
function cancelTalentReset() {
    if (!talentResetCostOptions || !requestTalentResetButton) return;
    talentResetCostOptions.classList.add('hidden');
    requestTalentResetButton.classList.remove('hidden');
    updateTalentResetButtonState(); 
}

/**
 * Provede reset talentových bodů po zaplacení.
 * @param {string} paymentType - Typ platby ('shards' nebo 'gold').
 */
function performTalentReset(paymentType) {
    let actualPointsRefunded = 0;
    for (const id in talents) { 
        if (talents.hasOwnProperty(id)) {
            const talent = talents[id];
            if (talent.currentLevel > 0) {
                for (let i = 0; i < talent.currentLevel; i++) {
                    actualPointsRefunded += talent.cost(i); 
                }
            }
        }
    }

    if (actualPointsRefunded === 0) { 
        if (typeof showMessageBox === 'function') showMessageBox("Žádné talentové body k resetování.", true);
        cancelTalentReset();
        return;
    }

    if (paymentType === 'shards') {
        if (gameState.echoShards >= TALENT_RESET_COST_SHARDS) { 
            gameState.echoShards -= TALENT_RESET_COST_SHARDS;
        } else {
            if (typeof showMessageBox === 'function') showMessageBox("Nedostatek Echo Úlomků pro reset!", true);
            return;
        }
    } else if (paymentType === 'gold') {
        const goldCost = calculateTalentResetGoldCost();
        if (gameState.gold >= goldCost) { 
            gameState.gold -= goldCost;
        } else {
            if (typeof showMessageBox === 'function') showMessageBox("Nedostatek Zlata pro reset!", true);
            return;
        }
    } else {
        console.error("Neznámý typ platby pro reset talentů:", paymentType);
        return; 
    }

    gameState.talentPoints += actualPointsRefunded; 
    for (const id in talents) { 
        if (talents.hasOwnProperty(id)) {
            talents[id].currentLevel = 0; 
        }
    }

    if (typeof showMessageBox === 'function') showMessageBox(`Talentové body byly úspěšně resetovány! Získal jsi zpět ${formatNumber(actualPointsRefunded)} talentových bodů.`, false, 3500);
    if (typeof soundManager !== 'undefined') {
        soundManager.playSound('echo', 'A4', '2n'); 
    }

    if (typeof calculateEffectiveStats === 'function') calculateEffectiveStats(); 
    if (typeof updateCurrentTierBonuses === 'function') updateCurrentTierBonuses(); 
    renderTalentTree(); 
    if (typeof updateUI === 'function') updateUI(); 
    cancelTalentReset(); 
    updateTalentResetButtonState(); 
}
