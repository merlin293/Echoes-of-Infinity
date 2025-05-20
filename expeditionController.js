// SOUBOR: expeditionController.js

// --- DOM Elementy pro Modální Okno Expedic (budou definovány a inicializovány v uiController.js) ---
// let expeditionsModal, expeditionsListContainer, closeExpeditionsModalButton, 
//     expeditionCompanionSelectModal, expeditionCompanionSelectList, 
//     confirmExpeditionStartButton, cancelExpeditionStartButton,
//     expeditionSlotsDisplay; 

let currentExpeditionToStart = null;
let selectedCompanionsForExpedition = [];

/**
 * Otevře modální okno s dostupnými expedicemi.
 */
function openExpeditionsModalUI() {
    if (expeditionsModal && expeditionsListContainer && closeExpeditionsModalButton && expeditionSlotsDisplay) {
        renderAvailableExpeditions();
        expeditionSlotsDisplay.textContent = `${gameState.activeExpeditions.length} / ${gameState.expeditionSlots}`;
        openModal(expeditionsModal); 
    } else {
        console.error("DOM elementy pro modální okno expedic nebyly nalezeny/inicializovány.");
    }
}

/**
 * Vykreslí seznam dostupných a probíhajících expedic.
 */
function renderAvailableExpeditions() {
    if (!expeditionsListContainer || !expeditionSlotsDisplay) return;
    expeditionsListContainer.innerHTML = '';
    expeditionSlotsDisplay.textContent = `${gameState.activeExpeditions.length} / ${gameState.expeditionSlots}`;

    // Zobrazení probíhajících expedic
    if (gameState.activeExpeditions.length > 0) {
        const runningTitle = document.createElement('h4');
        runningTitle.classList.add('expedition-category-title'); 
        runningTitle.textContent = "Probíhající Výpravy";
        expeditionsListContainer.appendChild(runningTitle);

        gameState.activeExpeditions.forEach(activeExp => {
            const expDef = allExpeditions[activeExp.expeditionId]; 
            const expDiv = document.createElement('div');
            expDiv.classList.add('expedition-item', 'running');

            const timeLeft = Math.max(0, (activeExp.completionTime - Date.now()) / 1000);
            const assignedCompanionsNames = activeExp.assignedCompanionIds.map(id => allCompanions[id] ? allCompanions[id].name : 'Neznámý').join(', ');

            expDiv.innerHTML = `
                <div class="expedition-header">
                    <span class="expedition-icon">${expDef.icon}</span>
                    <h5 class="expedition-name">${expDef.name} (Probíhá)</h5>
                </div>
                <p class="expedition-description">${expDef.description}</p>
                <p class="expedition-details">Zbývající čas: <span class="expedition-timer">${formatTime(timeLeft)}</span></p>
                <p class="expedition-details">Vyslaní společníci: ${assignedCompanionsNames || 'Žádní'}</p>
                <button class="expedition-button" disabled>Probíhá...</button>
            `;
            expeditionsListContainer.appendChild(expDiv);
        });
    }

    // Zobrazení dostupných (i zamčených) expedic
    const availableTitle = document.createElement('h4');
    availableTitle.classList.add('expedition-category-title');
    availableTitle.textContent = "Dostupné Výpravy";
    expeditionsListContainer.appendChild(availableTitle);

    let expeditionsToShowCount = 0;
    for (const id in allExpeditions) {
        if (allExpeditions.hasOwnProperty(id)) {
            expeditionsToShowCount++;
            const expDef = allExpeditions[id];
            const isUnlocked = typeof expDef.unlockCondition === 'function' && expDef.unlockCondition();

            const expDiv = document.createElement('div');
            expDiv.classList.add('expedition-item');
            if (!isUnlocked) {
                expDiv.classList.add('locked'); // Přidáme třídu pro případné odlišné stylování zamčených
            }

            let costString = "";
            if (expDef.cost.gold) costString += `${formatNumber(expDef.cost.gold)} Zlata `;
            if (expDef.cost.echo_shards) costString += `${formatNumber(expDef.cost.echo_shards)} EÚ `;

            let buttonHTML = '';
            let unlockTextHTML = '';

            if (isUnlocked) {
                buttonHTML = `<button class="expedition-button start-expedition-btn" data-expedition-id="${id}">Zahájit Výpravu</button>`;
            } else {
                buttonHTML = `<button class="expedition-button" disabled>Zamčeno</button>`;
                if (expDef.unlockConditionText) {
                    unlockTextHTML = `<p class="expedition-unlock-condition">${expDef.unlockConditionText}</p>`;
                }
            }

            expDiv.innerHTML = `
                <div class="expedition-header">
                    <span class="expedition-icon">${expDef.icon}</span>
                    <h5 class="expedition-name">${expDef.name}</h5>
                </div>
                <p class="expedition-description">${expDef.description}</p>
                <p class="expedition-details">Doba trvání: ${formatTime(expDef.durationSeconds)}</p>
                <p class="expedition-details">Požadováno společníků: ${expDef.requiredCompanions}</p>
                <p class="expedition-details">Cena: ${costString.trim()}</p>
                <p class="expedition-details">Odměny: ${formatPossibleRewards(expDef.possibleRewards)}</p>
                ${unlockTextHTML}
                ${buttonHTML}
            `;
            expeditionsListContainer.appendChild(expDiv);
        }
    }
    if(expeditionsToShowCount === 0){ // Pokud by nebyly žádné expedice definované v configu
        expeditionsListContainer.innerHTML += '<p class="text-xs text-gray-400 text-center">Žádné výpravy nejsou aktuálně definovány.</p>';
    }
}

/**
 * Formátuje možné odměny pro zobrazení.
 * @param {Array<object>} rewards - Pole objektů s definicemi odměn.
 * @returns {string} - Formátovaný řetězec odměn.
 */
function formatPossibleRewards(rewards) {
    if (!rewards || rewards.length === 0) return "Žádné specifické odměny.";
    return rewards.map(r => {
        let rewardText = "";
        if (r.type === 'gold') rewardText = `${formatNumber(r.baseAmountMin)}-${formatNumber(r.baseAmountMax)} Zlata`;
        else if (r.type === 'echo_shards') rewardText = `${r.baseAmountMin}-${r.baseAmountMax} EÚ`;
        else if (r.type === 'companion_essence') rewardText = `${r.baseAmountMin}-${r.baseAmountMax} Esencí Spol.`;
        else if (r.type === 'artifact_chance') rewardText = `Šance na Artefakt`;
        else rewardText = r.type;
        return `${rewardText} (${(r.chance * 100).toFixed(0)}%)`;
    }).join(', ');
}


/**
 * Otevře modální okno pro výběr společníků pro expedici.
 * @param {string} expeditionId - ID expedice, pro kterou se vybírají společníci.
 */
function openCompanionSelectModalForExpedition(expeditionId) {
    const expDef = allExpeditions[expeditionId];
    if (!expDef) {
        console.error(`Expedice s ID ${expeditionId} nebyla nalezena.`);
        return;
    }

    // Zkontrolujeme, zda je expedice odemčená PŘED otevřením výběru společníků
    if (typeof expDef.unlockCondition === 'function' && !expDef.unlockCondition()) {
        if (typeof showMessageBox === 'function') showMessageBox("Tato výprava ještě není odemčená!", true);
        return;
    }

    if (gameState.activeExpeditions.length >= gameState.expeditionSlots) {
        if (typeof showMessageBox === 'function') showMessageBox("Nemáš volné sloty pro další výpravu!", true);
        return;
    }

    if (expDef.cost.gold && gameState.gold < expDef.cost.gold) {
        if (typeof showMessageBox === 'function') showMessageBox("Nedostatek zlata pro zahájení této výpravy!", true);
        return;
    }
    if (expDef.cost.echo_shards && gameState.echoShards < expDef.cost.echo_shards) {
        if (typeof showMessageBox === 'function') showMessageBox("Nedostatek Echo Úlomků pro zahájení této výpravy!", true);
        return;
    }

    currentExpeditionToStart = expeditionId;
    selectedCompanionsForExpedition = []; 

    if (expeditionCompanionSelectModal && expeditionCompanionSelectList && confirmExpeditionStartButton && cancelExpeditionStartButton) {
        expeditionCompanionSelectList.innerHTML = ''; 
        let availableCompanionsCount = 0;

        for (const compId in gameState.ownedCompanions) {
            if (gameState.ownedCompanions.hasOwnProperty(compId) && gameState.ownedCompanions[compId].level > 0) {
                const isOnAnotherExpedition = gameState.activeExpeditions.some(exp => exp.assignedCompanionIds.includes(compId));
                if (isOnAnotherExpedition) continue;

                availableCompanionsCount++;
                const companion = allCompanions[compId];
                const li = document.createElement('li');
                li.classList.add('companion-select-item');
                li.innerHTML = `
                    <input type="checkbox" id="comp-select-${compId}" value="${compId}" class="companion-checkbox">
                    <label for="comp-select-${compId}">${companion.icon} ${companion.name} (Úr. ${gameState.ownedCompanions[compId].level})</label>
                `;
                expeditionCompanionSelectList.appendChild(li);
            }
        }

        if (availableCompanionsCount < expDef.requiredCompanions) {
            if (typeof showMessageBox === 'function') showMessageBox(`Potřebuješ alespoň ${expDef.requiredCompanions} volných společníků pro tuto výpravu! (Máš ${availableCompanionsCount})`, true);
            currentExpeditionToStart = null; 
            return;
        }
        
        const titleElement = expeditionCompanionSelectModal.querySelector('.modal-title');
        if(titleElement) titleElement.textContent = `Vyber ${expDef.requiredCompanions} společníky pro: ${expDef.name}`;

        updateConfirmExpeditionButtonState();
        openModal(expeditionCompanionSelectModal);
    } else {
        console.error("DOM elementy pro modální okno výběru společníků nebyly nalezeny.");
    }
}

/**
 * Aktualizuje stav potvrzovacího tlačítka pro zahájení expedice.
 */
function updateConfirmExpeditionButtonState() {
    if (!currentExpeditionToStart || !confirmExpeditionStartButton || !expeditionCompanionSelectList) return; // Přidána kontrola pro expeditionCompanionSelectList
    const expDef = allExpeditions[currentExpeditionToStart];
    const checkboxes = expeditionCompanionSelectList.querySelectorAll('.companion-checkbox:checked');
    selectedCompanionsForExpedition = Array.from(checkboxes).map(cb => cb.value);
    
    confirmExpeditionStartButton.disabled = selectedCompanionsForExpedition.length !== expDef.requiredCompanions;
}


/**
 * Zahájí vybranou expedici s vybranými společníky.
 */
function startExpedition() {
    if (!currentExpeditionToStart) return;
    const expDef = allExpeditions[currentExpeditionToStart];

    if (selectedCompanionsForExpedition.length !== expDef.requiredCompanions) {
        if (typeof showMessageBox === 'function') showMessageBox(`Musíš vybrat přesně ${expDef.requiredCompanions} společníky.`, true);
        return;
    }

    if (expDef.cost.gold) gameState.gold -= expDef.cost.gold;
    if (expDef.cost.echo_shards) gameState.echoShards -= expDef.cost.echo_shards;

    const now = Date.now();
    const newActiveExpedition = {
        id: `exp_run_${now}_${Math.random().toString(36).substring(2, 7)}`, 
        expeditionId: currentExpeditionToStart,
        startTime: now,
        durationSeconds: expDef.durationSeconds,
        completionTime: now + (expDef.durationSeconds * 1000),
        assignedCompanionIds: [...selectedCompanionsForExpedition]
    };
    gameState.activeExpeditions.push(newActiveExpedition);

    if (typeof showMessageBox === 'function') showMessageBox(`Výprava "${expDef.name}" byla zahájena!`, false);
    if (typeof soundManager !== 'undefined') soundManager.playSound('skillActivate', 'C4', '4n'); 

    currentExpeditionToStart = null;
    selectedCompanionsForExpedition = [];
    closeModal(expeditionCompanionSelectModal); 
    renderAvailableExpeditions(); 
    if (typeof updateUI === 'function') updateUI();
}

/**
 * Zkontroluje probíhající expedice a zpracuje ty dokončené.
 * Volá se v hlavní herní smyčce (gameTick).
 */
function checkCompletedExpeditions() {
    if (!gameState || !gameState.activeExpeditions || gameState.activeExpeditions.length === 0) {
        return;
    }

    const now = Date.now();
    const completedExpeditions = [];

    gameState.activeExpeditions = gameState.activeExpeditions.filter(activeExp => {
        if (now >= activeExp.completionTime) {
            completedExpeditions.push(activeExp);
            return false; 
        }
        return true; 
    });

    if (completedExpeditions.length > 0) {
        completedExpeditions.forEach(completedExp => {
            processCompletedExpedition(completedExp);
        });
        renderAvailableExpeditions(); 
        if (typeof updateUI === 'function') updateUI(); 
    }
}

/**
 * Zpracuje dokončenou expedici - udělí odměny.
 * @param {object} completedExp - Objekt dokončené expedice z gameState.activeExpeditions.
 */
function processCompletedExpedition(completedExp) {
    const expDef = allExpeditions[completedExp.expeditionId];
    if (!expDef) {
        console.error(`Definice pro dokončenou expedici ${completedExp.expeditionId} nebyla nalezena.`);
        return;
    }

    let rewardSummary = [`Výprava "${expDef.name}" dokončena! Získal jsi:`];

    expDef.possibleRewards.forEach(rewardDef => {
        if (Math.random() < rewardDef.chance) {
            let amount = 0;
            if (rewardDef.type === 'gold') {
                amount = Math.floor(Math.random() * (rewardDef.baseAmountMax - rewardDef.baseAmountMin + 1)) + rewardDef.baseAmountMin;
                gameState.gold += amount;
                gameState.lifetimeStats.lifetimeGoldEarned += amount; 
                rewardSummary.push(`- ${formatNumber(amount)} Zlata`);
            } else if (rewardDef.type === 'echo_shards') {
                amount = Math.floor(Math.random() * (rewardDef.baseAmountMax - rewardDef.baseAmountMin + 1)) + rewardDef.baseAmountMin;
                gameState.echoShards += amount;
                gameState.lifetimeStats.lifetimeEchoShardsEarned += amount;
                rewardSummary.push(`- ${formatNumber(amount)} Echo Úlomků`);
            } else if (rewardDef.type === 'companion_essence') {
                amount = Math.floor(Math.random() * (rewardDef.baseAmountMax - rewardDef.baseAmountMin + 1)) + rewardDef.baseAmountMin;
                gainCompanionEssence(amount); 
                // Zpráva je již v gainCompanionEssence, ale můžeme ji zde zopakovat nebo upravit
                // rewardSummary.push(`- ${formatNumber(amount)} Esencí Společníků`); 
            } else if (rewardDef.type === 'artifact_chance') {
                const availableArtifactsToDrop = Object.values(allArtifacts).filter(art => art.source === rewardDef.artifactPool);
                if (availableArtifactsToDrop.length > 0) {
                    const droppedArtifactDefinition = availableArtifactsToDrop[Math.floor(Math.random() * availableArtifactsToDrop.length)];
                    const droppedArtifactId = droppedArtifactDefinition.id;
                    if (gameState.ownedArtifactsData[droppedArtifactId]) {
                        const artifactInstance = gameState.ownedArtifactsData[droppedArtifactId];
                        if (!droppedArtifactDefinition.maxLevel || artifactInstance.level < droppedArtifactDefinition.maxLevel) {
                            artifactInstance.level++;
                            rewardSummary.push(`- Artefakt ${droppedArtifactDefinition.name} vylepšen na úr. ${artifactInstance.level}!`);
                        } else {
                             rewardSummary.push(`- Artefakt ${droppedArtifactDefinition.name} (již max. úr.)`);
                        }
                    } else {
                        gameState.ownedArtifactsData[droppedArtifactId] = { level: 1 };
                        rewardSummary.push(`- Nový artefakt: ${droppedArtifactDefinition.name}!`);
                    }
                    if (typeof renderArtifactsUI === 'function') renderArtifactsUI();
                } else {
                    rewardSummary.push("- Žádný artefakt nenalezen tentokrát.");
                }
            }
        }
    });

    gameState.lifetimeStats.expeditionsCompletedTotal = (gameState.lifetimeStats.expeditionsCompletedTotal || 0) + 1;
    if (typeof checkMilestones === 'function') checkMilestones(); 

    if (typeof showMessageBox === 'function') {
        if (rewardSummary.length > 1) {
            showMessageBox(rewardSummary.join("\n"), false, 5000);
        } else {
            showMessageBox(`Výprava "${expDef.name}" dokončena, ale bohužel bez speciálních odměn.`, true, 3000);
        }
    }
    if (typeof soundManager !== 'undefined') soundManager.playSound('milestone', 'E4', '2n');
}

/**
 * Formátuje čas v sekundách na čitelný řetězec (např. "1h 15m 30s").
 * @param {number} totalSeconds - Celkový počet sekund.
 * @returns {string} - Formátovaný čas.
 */
function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    let timeString = "";
    if (hours > 0) timeString += `${hours}h `;
    if (minutes > 0) timeString += `${minutes}m `;
    if (seconds >= 0 || (hours === 0 && minutes === 0)) timeString += `${seconds}s`; 
    return timeString.trim() || "0s";
}