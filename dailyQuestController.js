// SOUBOR: dailyQuestController.js

/**
 * Inicializuje nebo resetuje denní výzvy, pokud je nový den.
 * Volá se při načtení hry a na začátku každého herního ticku (nebo méně často).
 */
function initializeOrResetDailyQuests() {
    const today = new Date().toDateString();
    // Přístup k gameState.dailyQuestData
    if (!gameState.dailyQuestData) { // Pojistka pro případ, že by gameState.dailyQuestData nebylo inicializováno
        gameState.dailyQuestData = { quests: [], lastResetDate: null, goldEarnedForQuestToday: 0 };
    }

    if (gameState.dailyQuestData.lastResetDate !== today) {
        gameState.dailyQuestData.lastResetDate = today;
        gameState.dailyQuestData.quests = [];
        gameState.dailyQuestData.goldEarnedForQuestToday = 0; 
        
        // allPossibleQuests je z config.js
        if (typeof allPossibleQuests !== 'undefined') {
            const shuffledQuests = [...allPossibleQuests].sort(() => 0.5 - Math.random());
            const selectedQuests = shuffledQuests.slice(0, 3); 
            
            selectedQuests.forEach(questDef => {
                gameState.dailyQuestData.quests.push({ 
                    ...questDef, 
                    currentProgress: 0, 
                    claimed: false 
                });
            });
            if (typeof showMessageBox === 'function') showMessageBox("Nové denní výzvy jsou k dispozici!", false, 3000);
        } else {
            console.error("allPossibleQuests is not defined in config.js. Daily quests cannot be initialized.");
        }
    }
    if (typeof renderDailyQuestsUI === 'function') renderDailyQuestsUI();
}

/**
 * Aktualizuje postup v denních výzvách na základě provedené akce.
 * @param {string} actionType - Typ akce (např. 'enemyKill', 'goldEarnedQuest').
 * @param {number} value - Hodnota akce (např. počet zabitých nepřátel, množství získaného zlata).
 */
function updateDailyQuestProgress(actionType, value = 1) {
    if (!gameState.dailyQuestData || !gameState.dailyQuestData.quests) return;

    let questUIUpdated = false;
    gameState.dailyQuestData.quests.forEach(quest => {
        if (!quest.claimed && quest.actionType === actionType) {
            if (actionType === 'goldEarnedQuest') {
                gameState.dailyQuestData.goldEarnedForQuestToday += value;
                quest.currentProgress = gameState.dailyQuestData.goldEarnedForQuestToday;
            } else if (actionType === 'zoneReached') {
                if (value > quest.currentProgress) {
                    quest.currentProgress = value;
                }
            } else {
                quest.currentProgress += value;
            }
            questUIUpdated = true;
        }
    });

    if (questUIUpdated && typeof renderDailyQuestsUI === 'function') {
        renderDailyQuestsUI(); 
    }
}

/**
 * Vykreslí denní výzvy v modálním okně.
 */
function renderDailyQuestsUI() {
    if (!dailyQuestsListModalElement) { 
        return;
    }
    dailyQuestsListModalElement.innerHTML = ''; 

    if (!gameState.dailyQuestData || !gameState.dailyQuestData.quests || gameState.dailyQuestData.quests.length === 0) {
        dailyQuestsListModalElement.innerHTML = '<p class="text-xs text-gray-400 text-center">Žádné aktivní výzvy.</p>';
        return;
    }

    gameState.dailyQuestData.quests.forEach(quest => {
        const questDiv = document.createElement('div'); 
        questDiv.classList.add('daily-quest-item');
        if (quest.claimed || quest.currentProgress >= quest.target) {
            questDiv.classList.add('completed'); 
        }

        const progressToShow = Math.min(quest.currentProgress, quest.target);
        const progressText = quest.actionType === 'zoneReached' ? 
                             `Zóna ${progressToShow} / ${quest.target}` :
                             `${formatNumber(progressToShow)} / ${formatNumber(quest.target)}`; // formatNumber z utils.js
        
        let rewardText = "";
        if (quest.rewardType === 'echo_shards') rewardText = `${formatNumber(quest.rewardAmount)} EÚ`;
        else if (quest.rewardType === 'gold') rewardText = `${formatNumber(quest.rewardAmount)} Zlata`;
        
        questDiv.innerHTML = `
            <p class="description">${quest.icon} ${quest.description}</p> 
            <p class="progress">Pokrok: ${progressText}</p>
            <p class="reward">Odměna: ${rewardText}</p>
            <button id="claim-quest-${quest.id}" class="claim-quest-button" 
                     ${quest.claimed || quest.currentProgress < quest.target ? 'disabled' : ''}>
                ${quest.claimed ? 'Vyzvednuto' : (quest.currentProgress >= quest.target ? 'Vyzvednout' : 'Probíhá')}
            </button>`;
        
        if (quest.claimed) {
            const button = questDiv.querySelector('.claim-quest-button');
            if (button) button.classList.add('claimed');
        }
        
        dailyQuestsListModalElement.appendChild(questDiv); 
        
        if (!quest.claimed && quest.currentProgress >= quest.target) {
            const button = document.getElementById(`claim-quest-${quest.id}`);
            if (button) {
                // Odstranění předchozího listeneru, aby se neduplikoval, pokud by se render volal vícekrát
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                newButton.addEventListener('click', () => claimDailyQuestReward(quest.id));
            }
        }
    });
}

/**
 * Zpracuje vyzvednutí odměny za splněnou denní výzvu.
 * @param {string} questId - ID výzvy k vyzvednutí.
 */
function claimDailyQuestReward(questId) {
    if (!gameState.dailyQuestData || !gameState.dailyQuestData.quests) return;
    const quest = gameState.dailyQuestData.quests.find(q => q.id === questId); 

    if (quest && !quest.claimed && quest.currentProgress >= quest.target) {
        if (quest.rewardType === 'echo_shards') {
            gameState.echoShards += quest.rewardAmount; 
            if (typeof showMessageBox === 'function') showMessageBox(`Získal jsi ${formatNumber(quest.rewardAmount)} Echo Úlomků!`, false);
        } else if (quest.rewardType === 'gold') {
            gameState.gold += quest.rewardAmount; 
            if (typeof showMessageBox === 'function') showMessageBox(`Získal jsi ${formatNumber(quest.rewardAmount)} Zlata!`, false);
        }
        quest.claimed = true; 
        if (typeof soundManager !== 'undefined') soundManager.playSound('milestone', 'C5', '4n');
        
        renderDailyQuestsUI(); 
        if (typeof updateUI === 'function') updateUI(); 
    }
}
