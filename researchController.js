// SOUBOR: researchController.js

/**
 * Otevře modální okno výzkumné laboratoře a vykreslí její obsah.
 */
function openResearchLabModalUI() {
    // DOM elementy jsou z uiController.js (předpokládáme, že jsou inicializovány)
    if (researchModal && modalEchoShardsResearch) {
        modalEchoShardsResearch.textContent = formatNumber(gameState.echoShards); // Přístup přes gameState
        renderResearchUI(); 
        researchModal.classList.remove('hidden');
        if (typeof soundManager !== 'undefined') {
            soundManager.playSound('openModal', 'A5', '16n');
        }
    } else {
        console.error("Research modal elements not found for openResearchLabModalUI");
    }
}

/**
 * Zavře modální okno výzkumné laboratoře.
 */
function closeResearchLabModalUI() {
    if (researchModal) { // DOM element z uiController.js
        researchModal.classList.add('hidden');
        if (typeof soundManager !== 'undefined') {
            soundManager.playSound('closeModal', 'A4', '16n');
        }
    } else {
        console.error("Research modal element not found for closeResearchLabModalUI");
    }
}

/**
 * Vykreslí všechny dostupné výzkumné projekty v modálním okně.
 */
function renderResearchUI() {
    // DOM elementy z uiController.js
    if (!researchContainer || !modalEchoShardsResearch) {
        console.error("Research UI elements not found for rendering.");
        return;
    }
    researchContainer.innerHTML = ''; 
    modalEchoShardsResearch.textContent = formatNumber(gameState.echoShards); // Přístup přes gameState

    const researchCategories = {};
    // allResearchProjects z config.js
    for (const id in allResearchProjects) {
        if (allResearchProjects.hasOwnProperty(id)) {
            const project = allResearchProjects[id];
            if (!researchCategories[project.category]) {
                researchCategories[project.category] = [];
            }
            researchCategories[project.category].push({ ...project, id }); 
        }
    }

    for (const categoryName in researchCategories) {
        const categoryTitle = document.createElement('h4');
        categoryTitle.classList.add('research-category-title');
        categoryTitle.textContent = categoryName;
        researchContainer.appendChild(categoryTitle);

        researchCategories[categoryName].forEach(project => {
            // gameState.playerResearchProgress z gameState.js
            const researchProgress = gameState.playerResearchProgress[project.id] || { level: 0 }; 
            const researchDiv = document.createElement('div');
            researchDiv.classList.add('research-item');

            let currentBonusValue = researchProgress.level * project.effectValuePerLevel;
            
            const nameP = document.createElement('p');
            nameP.classList.add('research-name');
            nameP.textContent = `${project.icon} ${project.name} (Úr. ${researchProgress.level}/${project.maxLevel})`;
            researchDiv.appendChild(nameP);

            const descP = document.createElement('p');
            descP.classList.add('research-description');
            let bonusTextForDisplay = currentBonusValue;
            if (project.effectType.includes('percent')) {
                 bonusTextForDisplay = formatNumber(currentBonusValue * 100, 2); // formatNumber z utils.js
            } else {
                 bonusTextForDisplay = formatNumber(currentBonusValue, 0);
            }
             if (project.id === 'research_artifact_lore_1') { 
                bonusTextForDisplay = formatNumber(currentBonusValue * 100, 3); 
            }
            descP.textContent = project.description.replace('{bonusValue}', bonusTextForDisplay);
            researchDiv.appendChild(descP);

            const costP = document.createElement('p');
            costP.classList.add('research-level-cost');
            
            let prerequisiteMet = true;
            if (project.requires) {
                const requiredResearchProgress = gameState.playerResearchProgress[project.requires];
                const requiredResearchDef = allResearchProjects[project.requires];
                if (!requiredResearchProgress || requiredResearchProgress.level < requiredResearchDef.maxLevel) {
                   prerequisiteMet = false;
                   costP.textContent = `Vyžaduje: ${requiredResearchDef.name} (Max. Úr.)`;
                }
            }

            if (researchProgress.level < project.maxLevel && prerequisiteMet) {
                const currentCost = project.cost(researchProgress.level);
                costP.textContent = `Cena další úrovně: ${formatNumber(currentCost)} EÚ`;
                const upgradeButton = document.createElement('button');
                upgradeButton.classList.add('research-upgrade-button');
                upgradeButton.textContent = 'Vyzkoumat';
                upgradeButton.disabled = gameState.echoShards < currentCost; // Přístup přes gameState
                upgradeButton.onclick = () => purchaseResearch(project.id);
                researchDiv.appendChild(upgradeButton);
            } else if (!prerequisiteMet) {
                // Text o předpokladu je již v costP
            } else {
                costP.textContent = 'Maximální úroveň výzkumu';
            }
            researchDiv.appendChild(costP);
            researchContainer.appendChild(researchDiv);
        });
    }
}

/**
 * Zpracuje nákup nebo vylepšení výzkumného projektu.
 * @param {string} researchId - ID výzkumného projektu.
 */
function purchaseResearch(researchId) {
    const project = allResearchProjects[researchId]; // Z config.js
    const researchProgress = gameState.playerResearchProgress[researchId] || { level: 0 }; // Z gameState.js

    if (!project) {
        console.error(`Výzkum s ID ${researchId} nebyl nalezen.`);
        return;
    }

    if (researchProgress.level >= project.maxLevel) {
        if(typeof showMessageBox === 'function') showMessageBox("Tento výzkum je již na maximální úrovni!", true);
        return;
    }

    let prerequisiteMet = true;
    if (project.requires) {
        const requiredResearchProgress = gameState.playerResearchProgress[project.requires];
        const requiredResearchDef = allResearchProjects[project.requires];
         if (!requiredResearchProgress || requiredResearchProgress.level < requiredResearchDef.maxLevel) {
           prerequisiteMet = false;
        }
    }
    if (!prerequisiteMet) {
         if(typeof showMessageBox === 'function') showMessageBox("Nejprve dokončete požadovaný výzkum!", true);
        return;
    }

    const cost = project.cost(researchProgress.level);
    if (gameState.echoShards >= cost) { // Přístup přes gameState
        gameState.echoShards -= cost;
        researchProgress.level++;
        gameState.playerResearchProgress[project.id] = researchProgress; 

        if(typeof showMessageBox === 'function') showMessageBox(`Výzkum "${project.name}" vylepšen na úroveň ${researchProgress.level}!`, false);
        if (typeof soundManager !== 'undefined') {
            soundManager.playSound('upgrade', 'B4', '8n'); 
        }

        if (typeof calculateEffectiveStats === 'function') calculateEffectiveStats(); 
        if (typeof updateUI === 'function') updateUI(); 
        
        renderResearchUI(); 
    } else {
        if(typeof showMessageBox === 'function') showMessageBox("Nedostatek Echo Úlomků pro tento výzkum!", true);
    }
}

/**
 * Získá celkový bonus z dokončených výzkumů daného typu.
 * @param {string} bonusType - Typ bonusu (např. 'research_click_damage_multiplier_percent').
 * @returns {number} - Celková hodnota bonusu.
 */
function getResearchBonus(bonusType) {
    let totalBonus = 0;
    // gameState.playerResearchProgress z gameState.js
    for (const researchId in gameState.playerResearchProgress) { 
        if (gameState.playerResearchProgress.hasOwnProperty(researchId)) {
            const researchDef = allResearchProjects[researchId]; // Z config.js
            const currentProgress = gameState.playerResearchProgress[researchId];
            if (researchDef && researchDef.effectType === bonusType && currentProgress.level > 0) {
                totalBonus += (currentProgress.level * researchDef.effectValuePerLevel);
            }
        }
    }
    return totalBonus;
}
