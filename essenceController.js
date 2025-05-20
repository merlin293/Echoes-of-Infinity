// SOUBOR: essenceController.js

/**
 * Otevře modální okno Kovárny Esencí a vykreslí její obsah.
 */
function openEssenceForgeModalUI() {
    // DOM elementy jsou z uiController.js (předpokládáme, že jsou inicializovány)
    if (essenceForgeModal && modalEchoShardsEssence) {
        modalEchoShardsEssence.textContent = formatNumber(gameState.echoShards); // Přístup přes gameState
        renderEssenceForgeUI(); 
        essenceForgeModal.classList.remove('hidden');
        if (typeof soundManager !== 'undefined') {
            soundManager.playSound('openModal', 'C#5', '16n');
        }
    } else {
        console.error("Essence Forge modal elements not found for openEssenceForgeModalUI");
    }
}

/**
 * Zavře modální okno Kovárny Esencí.
 */
function closeEssenceForgeModalUI() {
    if (essenceForgeModal) { // DOM element z uiController.js
        essenceForgeModal.classList.add('hidden');
        if (typeof soundManager !== 'undefined') {
            soundManager.playSound('closeModal', 'C#4', '16n');
        }
    } else {
        console.error("Essence Forge modal element not found for closeEssenceForgeModalUI");
    }
}

/**
 * Vykreslí všechny dostupné Esence v modálním okně Kovárny.
 */
function renderEssenceForgeUI() {
    // DOM elementy z uiController.js
    if (!essenceContainer || !modalEchoShardsEssence) {
        console.error("Essence Forge UI elements not found for rendering.");
        return;
    }
    essenceContainer.innerHTML = ''; 
    modalEchoShardsEssence.textContent = formatNumber(gameState.echoShards); // Přístup přes gameState

    // allEssences z config.js
    for (const id in allEssences) { 
        if (allEssences.hasOwnProperty(id)) {
            const essence = allEssences[id];
            // gameState.playerEssences z gameState.js
            const essenceProgress = gameState.playerEssences[essence.id] || { level: 0 }; 
            
            const essenceDiv = document.createElement('div');
            essenceDiv.classList.add('essence-item');

            let currentBonusValue = essenceProgress.level * essence.effectValuePerLevel;
            
            const nameP = document.createElement('p');
            nameP.classList.add('essence-name');
            nameP.textContent = `${essence.icon} ${essence.name} (Úr. ${essenceProgress.level}/${essence.maxLevel})`;
            essenceDiv.appendChild(nameP);

            const descP = document.createElement('p');
            descP.classList.add('essence-description');
            let bonusTextForDisplay = currentBonusValue;
             if (essence.effectType.includes('percent')) { 
                bonusTextForDisplay = formatNumber(currentBonusValue * 100, 2); // formatNumber z utils.js
             } else {
                bonusTextForDisplay = formatNumber(currentBonusValue, 0);
             }
             if (essence.effectType === 'essence_crit_chance_additive_percent') { 
                 bonusTextForDisplay = formatNumber(currentBonusValue * 100, 3); 
            }
            descP.textContent = essence.description.replace('{bonusValue}', bonusTextForDisplay);
            essenceDiv.appendChild(descP);

            const costP = document.createElement('p');
            costP.classList.add('essence-level-cost');

            if (essenceProgress.level < essence.maxLevel) {
                const currentCost = essence.cost(essenceProgress.level);
                costP.textContent = `Cena další úrovně: ${formatNumber(currentCost)} EÚ`;
                const upgradeButton = document.createElement('button');
                upgradeButton.classList.add('essence-upgrade-button'); 
                upgradeButton.textContent = 'Vytvořit/Vylepšit';
                upgradeButton.disabled = gameState.echoShards < currentCost; // Přístup přes gameState
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
    const essence = allEssences[essenceId]; // Z config.js
    const essenceProgress = gameState.playerEssences[essenceId] || { level: 0 }; // Z gameState.js

    if (!essence) {
        console.error(`Esence s ID ${essenceId} nebyla nalezena.`);
        return;
    }

    if (essenceProgress.level >= essence.maxLevel) {
        if(typeof showMessageBox === 'function') showMessageBox("Tato esence je již na maximální úrovni!", true);
        return;
    }

    const cost = essence.cost(essenceProgress.level);
    if (gameState.echoShards >= cost) { // Přístup přes gameState
        gameState.echoShards -= cost;
        essenceProgress.level++;
        gameState.playerEssences[essenceId] = essenceProgress; 

        if(typeof showMessageBox === 'function') showMessageBox(`Esence "${essence.name}" vylepšena na úroveň ${essenceProgress.level}!`, false);
        if (typeof soundManager !== 'undefined') {
            soundManager.playSound('upgrade', 'A#4', '8n'); 
        }

        if (typeof calculateEffectiveStats === 'function') calculateEffectiveStats(); 
        if (typeof updateUI === 'function') updateUI(); 
        
        renderEssenceForgeUI(); 
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
    // gameState.playerEssences z gameState.js
    for (const essenceId in gameState.playerEssences) { 
        if (gameState.playerEssences.hasOwnProperty(essenceId)) {
            const essenceDef = allEssences[essenceId]; // Z config.js
            const currentProgress = gameState.playerEssences[essenceId];
            if (essenceDef && essenceDef.effectType === bonusType && currentProgress.level > 0) {
                totalBonus += (currentProgress.level * essenceDef.effectValuePerLevel);
            }
        }
    }
    return totalBonus;
}
