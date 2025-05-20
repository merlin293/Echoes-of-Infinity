// SOUBOR: milestoneController.js

/**
 * Vykreslí milníky v modálním okně milníků.
 * Volá se při otevření modálního okna nebo po dosažení nového milníku.
 */
function renderMilestonesUI() {
    // DOM element milestonesListModalElement je z uiController.js (předpokládáme, že je inicializován)
    if (!milestonesListModalElement) { 
        console.error("Milestones modal list element not found for rendering.");
        return;
    }
    milestonesListModalElement.innerHTML = ''; 

    // Přístup k gameState.milestones
    if (!gameState.milestones || gameState.milestones.length === 0) {
        // console.warn("No milestones to render or gameState.milestones is not initialized.");
        // Můžeme zde zobrazit zprávu, že žádné milníky nejsou, nebo počkat na inicializaci.
        // Prozatím, pokud je prázdné, nic nevykreslíme, nebo můžeme přidat zprávu.
        milestonesListModalElement.innerHTML = '<p class="text-xs text-gray-400 text-center">Žádné milníky k zobrazení.</p>';
        return;
    }

    gameState.milestones.forEach(milestoneInstance => { 
        const milestoneConfig = allMilestonesConfig.find(m => m.id === milestoneInstance.id); // allMilestonesConfig z config.js
        if (!milestoneConfig) {
            console.warn(`Config for milestone ID ${milestoneInstance.id} not found.`);
            return; 
        }

        const milestoneDiv = document.createElement('div');
        milestoneDiv.classList.add('milestone');
        milestoneDiv.classList.toggle('achieved', milestoneInstance.achieved);
        milestoneDiv.classList.toggle('pending', !milestoneInstance.achieved);
        
        const descSpan = document.createElement('span'); 
        descSpan.classList.add('description'); 
        descSpan.textContent = milestoneConfig.description; 
        milestoneDiv.appendChild(descSpan);
        
        const rewardSpan = document.createElement('span'); 
        rewardSpan.classList.add('reward');
        rewardSpan.textContent = milestoneInstance.achieved ? 
                                 ` (Odměna: ${milestoneConfig.rewardText} - Získáno!)` : 
                                 ` (Odměna: ${milestoneConfig.rewardText})`; 
        milestoneDiv.appendChild(rewardSpan);
        
        milestonesListModalElement.appendChild(milestoneDiv);
    });
}

/**
 * Zkontroluje, zda byly splněny nějaké milníky, a pokud ano, aplikuje jejich odměny.
 * Volá se pravidelně v herní smyčce nebo po relevantních akcích.
 */
function checkMilestones() {
    if (!gameState.milestones || typeof allMilestonesConfig === 'undefined') {
        // console.warn("Milestones or allMilestonesConfig not available for checking.");
        return;
    }
    let newMilestoneAchieved = false;
    gameState.milestones.forEach(milestoneInstance => { 
        const milestoneConfig = allMilestonesConfig.find(m => m.id === milestoneInstance.id); 
        if (milestoneConfig && !milestoneInstance.achieved && milestoneConfig.condition()) {
            // Podmínka je splněna a milník ještě nebyl dosažen
            // Funkce applyReward je definována v config.js a měla by pracovat s gameState
            milestoneConfig.applyReward(); 
            milestoneInstance.achieved = true;    
            newMilestoneAchieved = true;
            if (typeof showMessageBox === 'function') { // showMessageBox z uiController.js
                showMessageBox(`Milník dosažen: ${milestoneConfig.description}! Odměna: ${milestoneConfig.rewardText}`, false);
            }
        }
    });
    if (newMilestoneAchieved) { 
        renderMilestonesUI(); 
        if (typeof updateUI === 'function') updateUI(); // Funkce z uiController.js
    } 
}

/**
 * Resetuje stav 'achieved' pro milníky, které jsou definovány jako 'perEcho'.
 * Volá se při provedení Echa.
 */
function resetPerEchoMilestones() {
    if (!gameState.milestones || typeof allMilestonesConfig === 'undefined') return;

    gameState.milestones.forEach(milestoneInstance => { 
        const milestoneConfig = allMilestonesConfig.find(m => m.id === milestoneInstance.id); 
        if (milestoneConfig && milestoneConfig.perEcho) {
            milestoneInstance.achieved = false;
        }
    });
}
