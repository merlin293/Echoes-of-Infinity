// SOUBOR: artifactController.js

/**
 * Získá celkový bonus z vlastněných artefaktů daného typu.
 * @param {string} bonusType - Typ bonusu, který se má sečíst.
 * @returns {number} - Celková hodnota bonusu.
 */
function getArtifactBonus(bonusType) {
    let totalBonus = 0;
    // Přístup k gameState.ownedArtifactsData
    // gameState je globální objekt z gameState.js
    // allArtifacts je globální objekt z config.js
    for (const artifactId in gameState.ownedArtifactsData) { 
        if (gameState.ownedArtifactsData.hasOwnProperty(artifactId)) {
            const artifactDefinition = allArtifacts[artifactId]; 
            const artifactInstance = gameState.ownedArtifactsData[artifactId];
            if (artifactDefinition && artifactDefinition.bonusType === bonusType && artifactInstance.level > 0) {
                let currentArtifactBonus = artifactDefinition.baseBonusValue;
                if (artifactInstance.level > 1) {
                    currentArtifactBonus += (artifactInstance.level - 1) * artifactDefinition.bonusPerLevel;
                }
                totalBonus += currentArtifactBonus;
            }
        }
    }
    return totalBonus;
}

/**
 * Vykreslí vlastněné artefakty v panelu artefaktů.
 */
function renderArtifactsUI() {
    // artifactsPanelElement, artifactsListElement jsou DOM elementy z uiController.js
    if (!artifactsPanelElement || !artifactsListElement) { 
        console.error("Artifact UI elements not found for rendering.");
        return;
    }

    // Přístup k gameState.ownedArtifactsData
    if (Object.keys(gameState.ownedArtifactsData).length === 0) { 
        artifactsPanelElement.classList.add('hidden');
        return;
    }
    artifactsPanelElement.classList.remove('hidden');
    artifactsListElement.innerHTML = ''; 

    for (const artifactId in gameState.ownedArtifactsData) {
        if (gameState.ownedArtifactsData.hasOwnProperty(artifactId)) {
            const artifactDefinition = allArtifacts[artifactId]; // allArtifacts z config.js
            const artifactInstance = gameState.ownedArtifactsData[artifactId];
            if (artifactDefinition) {
                const artifactDiv = document.createElement('div');
                artifactDiv.classList.add('artifact-item-display'); 

                const iconSpan = document.createElement('span');
                iconSpan.classList.add('icon');
                iconSpan.textContent = artifactDefinition.icon ? `${artifactDefinition.icon} ` : '';
                
                const nameSpan = document.createElement('span');
                nameSpan.classList.add('name'); 
                nameSpan.textContent = artifactDefinition.name;

                const levelSpan = document.createElement('span');
                levelSpan.classList.add('level');
                levelSpan.textContent = `(Úr. ${artifactInstance.level}${artifactDefinition.maxLevel ? '/' + artifactDefinition.maxLevel : ''})`;
                
                const descSpan = document.createElement('span');
                descSpan.classList.add('description'); 
                
                let rawBonusValue = artifactDefinition.baseBonusValue;
                if (artifactInstance.level > 1) {
                    rawBonusValue += (artifactInstance.level - 1) * artifactDefinition.bonusPerLevel;
                }

                let bonusValueForDisplay;
                // Opravená logika pro zobrazení bonusu
                if (artifactDefinition.valueType === 'percent_direct_for_calc_multiplied_for_display') {
                    // rawBonusValue je již hodnota, která se použije ve výpočtu jako X in X/100. 
                    // Pro zobrazení chceme X (např. pokud rawBonusValue = 2, zobrazí se "2.00").
                    bonusValueForDisplay = formatNumber(rawBonusValue, 2); 
                } else if (artifactDefinition.valueType === 'percent_actual_for_calc_multiplied_for_display') {
                    // rawBonusValue je skutečná hodnota (např. 0.02 pro 2%). Pro zobrazení násobíme 100.
                    bonusValueForDisplay = formatNumber(rawBonusValue * 100, 2);
                } else { 
                    bonusValueForDisplay = formatNumber(rawBonusValue); // formatNumber z utils.js
                }
                descSpan.textContent = artifactDefinition.descriptionFormat.replace('{bonusValue}', bonusValueForDisplay);

                artifactDiv.appendChild(iconSpan);
                nameSpan.appendChild(levelSpan); 
                artifactDiv.appendChild(nameSpan);
                artifactDiv.appendChild(descSpan);

                artifactsListElement.appendChild(artifactDiv);
            }
        }
    }
}

/**
 * Pokusí se o drop artefaktu po poražení bosse.
 */
function tryDropArtifact() {
    // ARTIFACT_DROP_CHANCE_FROM_BOSS je konstanta z config.js
    let dropChance = ARTIFACT_DROP_CHANCE_FROM_BOSS; 
    if (typeof getResearchBonus === 'function') { // getResearchBonus z researchController.js
        dropChance += getResearchBonus('research_artifact_drop_chance_additive_percent'); 
    }

    // gameState.enemy z gameState.js
    if (gameState.enemy.isBoss && Math.random() < dropChance) { 
        const availableArtifactsToDrop = Object.values(allArtifacts).filter(art => art.source === 'boss_drop'); // allArtifacts z config.js
        
        if (availableArtifactsToDrop.length > 0) {
            const droppedArtifactDefinition = availableArtifactsToDrop[Math.floor(Math.random() * availableArtifactsToDrop.length)];
            const droppedArtifactId = droppedArtifactDefinition.id;

            // Přístup k gameState.ownedArtifactsData
            if (gameState.ownedArtifactsData[droppedArtifactId]) { 
                const artifactInstance = gameState.ownedArtifactsData[droppedArtifactId];
                if (!droppedArtifactDefinition.maxLevel || artifactInstance.level < droppedArtifactDefinition.maxLevel) {
                    artifactInstance.level++;
                    // showMessageBox z uiController.js, soundManager z utils.js
                    if (typeof showMessageBox === 'function') showMessageBox(`Artefakt ${droppedArtifactDefinition.name} vylepšen na úroveň ${artifactInstance.level}!`, false, 3000); 
                    if (typeof soundManager !== 'undefined') soundManager.playSound('upgrade', 'A5', '16n'); 
                } else {
                    if (typeof showMessageBox === 'function') showMessageBox(`Artefakt ${droppedArtifactDefinition.name} je již na maximální úrovni!`, false, 3000);
                }
            } else { 
                gameState.ownedArtifactsData[droppedArtifactId] = { level: 1 };
                if (typeof showMessageBox === 'function') showMessageBox(`Získal jsi nový artefakt: ${droppedArtifactDefinition.name}!`, false, 3000);
                if (typeof soundManager !== 'undefined') soundManager.playSound('milestone', 'E5', '4n');
            }
            
            renderArtifactsUI(); 
            
            // updateCurrentTierBonuses z equipmentController.js
            // calculateEffectiveStats z gameLogic.js
            // updateUI z uiController.js
            if (typeof updateCurrentTierBonuses === 'function') updateCurrentTierBonuses(); 
            if (typeof calculateEffectiveStats === 'function') calculateEffectiveStats(); 
            if (typeof updateUI === 'function') updateUI(); 
        }
    }
}