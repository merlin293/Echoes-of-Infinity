// SOUBOR: saveLoadController.js

/**
 * Uloží aktuální stav hry do localStorage.
 */
function saveGame() {
    // Příprava talentLevels pro uložení (pouze aktuální úrovně)
    const talentLevelsToSave = {};
    if (typeof talents !== 'undefined') { // talents z config.js
        for (const id in talents) {
            if (talents.hasOwnProperty(id)) {
                talentLevelsToSave[id] = talents[id].currentLevel;
            }
        }
    }

    // Příprava equipment pro uložení (pouze úrovně)
    const equipmentToSave = {};
    if (typeof gameState !== 'undefined' && typeof gameState.equipment !== 'undefined' && typeof equipmentSlots !== 'undefined') {
        equipmentSlots.forEach(slot => {
            if (gameState.equipment[slot]) { 
                equipmentToSave[slot] = { level: gameState.equipment[slot].level }; 
            }
        });
    }
    
    // Sestavení objektu pro uložení z proměnných v gameState.js
    const gameStateToSave = {
        gold: gameState.gold,
        baseClickDamage: gameState.baseClickDamage,
        passivePercentFromTiers: gameState.passivePercentFromTiers,
        currentTierIndex: gameState.currentTierIndex,
        equipment: equipmentToSave, 
        currentGlobalTierClickDamageBonus: gameState.currentGlobalTierClickDamageBonus,
        currentWorld: gameState.currentWorld,
        currentZoneInWorld: gameState.currentZoneInWorld,
        enemiesDefeatedInZone: gameState.enemiesDefeatedInZone,
        enemy: { 
            effectiveLevel: gameState.enemy.effectiveLevel, 
            currentHealth: gameState.enemy.currentHealth, 
            maxHealth: gameState.enemy.maxHealth, 
            name: gameState.enemy.name, 
            isChampion: gameState.enemy.isChampion, 
            isBoss: gameState.enemy.isBoss, 
            goldReward: gameState.enemy.goldReward 
        },
        highestEffectiveLevelReachedThisEcho: gameState.highestEffectiveLevelReachedThisEcho,
        activeBuffs: gameState.activeBuffs,
        activeDebuffs: gameState.activeDebuffs,
        echoShards: gameState.echoShards,
        echoCount: gameState.echoCount,
        echoPermanentGoldBonus: gameState.echoPermanentGoldBonus,
        echoPermanentDamageBonus: gameState.echoPermanentDamageBonus,
        echoGoldLevelCount: gameState.echoGoldLevelCount,
        echoDamageLevelCount: gameState.echoDamageLevelCount,
        echoGoldUpgradeCost: gameState.echoGoldUpgradeCost,
        echoDamageUpgradeCost: gameState.echoDamageUpgradeCost,
        lifetimeStats: gameState.lifetimeStats, // expeditionsCompletedTotal je již součástí lifetimeStats
        totalGoldEarnedThisEcho: gameState.totalGoldEarnedThisEcho,
        enemiesKilledThisEcho: gameState.enemiesKilledThisEcho,
        milestonesAchieved: gameState.milestones.map(m => m.achieved),
        lastSaveTime: Date.now(), 
        playerLevel: gameState.playerLevel,
        playerXP: gameState.playerXP,
        xpToNextLevel: gameState.xpToNextLevel,
        talentPoints: gameState.talentPoints,
        talentLevels: talentLevelsToSave,
        clicksSinceLastGuaranteedCrit: gameState.clicksSinceLastGuaranteedCrit,
        mocnyUderCooldownTimeLeft: gameState.mocnyUderCooldownTimeLeft,
        mocnyUderActive: gameState.mocnyUderActive,
        mocnyUderDurationLeft: gameState.mocnyUderDurationLeft,
        zlataHoreckaAktivniCooldownTimeLeft: gameState.zlataHoreckaAktivniCooldownTimeLeft,
        zlataHoreckaAktivniActive: gameState.zlataHoreckaAktivniActive,
        zlataHoreckaAktivniDurationLeft: gameState.zlataHoreckaAktivniDurationLeft,
        ownedArtifactsData: gameState.ownedArtifactsData,
        ownedCompanions: gameState.ownedCompanions,
        bossFightTimerActive: gameState.bossFightTimerActive,
        bossFightTimeLeft: gameState.bossFightTimeLeft,
        dailyQuestData: gameState.dailyQuestData,
        gameSettings: gameState.gameSettings,
        playerResearchProgress: gameState.playerResearchProgress,
        playerEssences: gameState.playerEssences,
        companionEssence: gameState.companionEssence, 
        companionSkillLevels: gameState.companionSkillLevels,
        activeExpeditions: gameState.activeExpeditions, // Přidáno ukládání aktivních expedic
        expeditionSlots: gameState.expeditionSlots     // Přidáno ukládání počtu slotů pro expedice
    };
    
    localStorage.setItem(SAVE_KEY, JSON.stringify(gameStateToSave)); // SAVE_KEY z config.js
}

/**
 * Načte stav hry z localStorage. Pokud žádný uložený stav neexistuje, inicializuje novou hru.
 */
function loadGame() {
    const savedStateString = localStorage.getItem(SAVE_KEY); 

    if (savedStateString) {
        const loadedGameState = JSON.parse(savedStateString);
        
        gameState.gold = loadedGameState.gold || 0;
        gameState.baseClickDamage = loadedGameState.baseClickDamage || 10;
        gameState.passivePercentFromTiers = loadedGameState.passivePercentFromTiers || 0;
        gameState.currentTierIndex = loadedGameState.currentTierIndex || 0;
        gameState.currentGlobalTierClickDamageBonus = loadedGameState.currentGlobalTierClickDamageBonus || 0;
        gameState.currentWorld = loadedGameState.currentWorld || 1;
        gameState.currentZoneInWorld = loadedGameState.currentZoneInWorld || 1;
        gameState.enemiesDefeatedInZone = loadedGameState.enemiesDefeatedInZone || 0;
        gameState.playerLevel = loadedGameState.playerLevel || 1;
        gameState.playerXP = loadedGameState.playerXP || 0;
        gameState.talentPoints = loadedGameState.talentPoints || 0;
        gameState.clicksSinceLastGuaranteedCrit = loadedGameState.clicksSinceLastGuaranteedCrit || 0;
        gameState.activeBuffs = loadedGameState.activeBuffs || {};
        gameState.activeDebuffs = loadedGameState.activeDebuffs || {};
        gameState.mocnyUderCooldownTimeLeft = loadedGameState.mocnyUderCooldownTimeLeft || 0;
        gameState.mocnyUderActive = loadedGameState.mocnyUderActive || false;
        gameState.mocnyUderDurationLeft = loadedGameState.mocnyUderDurationLeft || 0;
        gameState.zlataHoreckaAktivniCooldownTimeLeft = loadedGameState.zlataHoreckaAktivniCooldownTimeLeft || 0;
        gameState.zlataHoreckaAktivniActive = loadedGameState.zlataHoreckaAktivniActive || false;
        gameState.zlataHoreckaAktivniDurationLeft = loadedGameState.zlataHoreckaAktivniDurationLeft || 0;
        gameState.echoShards = loadedGameState.echoShards || 0;
        gameState.echoCount = loadedGameState.echoCount || 0;
        gameState.highestEffectiveLevelReachedThisEcho = loadedGameState.highestEffectiveLevelReachedThisEcho || 1;
        gameState.echoPermanentGoldBonus = loadedGameState.echoPermanentGoldBonus || 1.0;
        gameState.echoPermanentDamageBonus = loadedGameState.echoPermanentDamageBonus || 1.0;
        gameState.echoGoldLevelCount = loadedGameState.echoGoldLevelCount || 0;
        gameState.echoDamageLevelCount = loadedGameState.echoDamageLevelCount || 0;
        gameState.echoGoldUpgradeCost = loadedGameState.echoGoldUpgradeCost || (typeof initialEchoGoldUpgradeCost !== 'undefined' ? initialEchoGoldUpgradeCost : 5);
        gameState.echoDamageUpgradeCost = loadedGameState.echoDamageUpgradeCost || (typeof initialEchoDamageUpgradeCost !== 'undefined' ? initialEchoDamageUpgradeCost : 5);
        gameState.bossFightTimerActive = loadedGameState.bossFightTimerActive || false;
        gameState.bossFightTimeLeft = loadedGameState.bossFightTimeLeft || 0;
        
        gameState.lifetimeStats = loadedGameState.lifetimeStats || { 
            totalClicks: 0, totalCrits: 0, highestDamageDealt: 0, totalBossesKilled: 0, 
            totalChampionsKilled: 0, totalEnemiesKilled: 0, lifetimeGoldEarned: 0, 
            lifetimeEchoShardsEarned: 0, lifetimePlayerLevelsGained: 0, lifetimeTiersAdvanced: 0,
            companionEssenceCollectedTotal: 0, expeditionsCompletedTotal: 0 // Přidán fallback
        };
        if (typeof gameState.lifetimeStats.companionEssenceCollectedTotal === 'undefined') {
            gameState.lifetimeStats.companionEssenceCollectedTotal = 0;
        }
        if (typeof gameState.lifetimeStats.expeditionsCompletedTotal === 'undefined') {
            gameState.lifetimeStats.expeditionsCompletedTotal = 0;
        }

        gameState.totalGoldEarnedThisEcho = loadedGameState.totalGoldEarnedThisEcho || 0;
        gameState.enemiesKilledThisEcho = loadedGameState.enemiesKilledThisEcho || 0;
        gameState.ownedArtifactsData = loadedGameState.ownedArtifactsData || {};
        gameState.ownedCompanions = loadedGameState.ownedCompanions || {};
        gameState.dailyQuestData = loadedGameState.dailyQuestData || { quests: [], lastResetDate: null, goldEarnedForQuestToday: 0 };
        gameState.gameSettings = loadedGameState.gameSettings || { 
            showDamageNumbers: true, showGoldAnimations: true, soundVolume: 0.5, soundMuted: false 
        };
        gameState.playerResearchProgress = loadedGameState.playerResearchProgress || {};
        if (typeof allResearchProjects !== 'undefined') {
            for (const id in allResearchProjects) {
                if (!gameState.playerResearchProgress[id]) {
                    gameState.playerResearchProgress[id] = { level: 0 };
                }
            }
        }
        gameState.playerEssences = loadedGameState.playerEssences || {};
        if (typeof allEssences !== 'undefined') {
            for (const id in allEssences) {
                if (!gameState.playerEssences[id]) {
                    gameState.playerEssences[id] = { level: 0 };
                }
            }
        }
        gameState.lastSaveTime = loadedGameState.lastSaveTime || Date.now();
        
        gameState.companionEssence = loadedGameState.companionEssence || 0;
        gameState.companionSkillLevels = loadedGameState.companionSkillLevels || {};
        if (typeof allCompanions !== 'undefined') {
            for (const companionId in allCompanions) {
                if (allCompanions.hasOwnProperty(companionId)) {
                    if (!gameState.companionSkillLevels[companionId]) {
                        gameState.companionSkillLevels[companionId] = {};
                    }
                    if (allCompanions[companionId].skillTree) {
                        for (const skillId in allCompanions[companionId].skillTree) {
                            if (allCompanions[companionId].skillTree.hasOwnProperty(skillId)) {
                                if (typeof gameState.companionSkillLevels[companionId][skillId] === 'undefined') {
                                    gameState.companionSkillLevels[companionId][skillId] = 0; 
                                }
                            }
                        }
                    }
                }
            }
        }

        // Načítání dat pro Expedice
        gameState.activeExpeditions = loadedGameState.activeExpeditions || [];
        gameState.expeditionSlots = loadedGameState.expeditionSlots || 1;


        if (loadedGameState.talentLevels && typeof talents !== 'undefined') { 
            for (const id in loadedGameState.talentLevels) {
                if (talents.hasOwnProperty(id)) {
                    talents[id].currentLevel = loadedGameState.talentLevels[id] || 0;
                }
            }
        } else if (typeof talents !== 'undefined') {
             for (const id in talents) {
                if (talents.hasOwnProperty(id)) {
                    talents[id].currentLevel = 0;
                }
            }
        }

        if (typeof initializeEquipment === 'function') initializeEquipment(); 
        if (loadedGameState.equipment && typeof equipmentSlots !== 'undefined') { 
            equipmentSlots.forEach(slot => {
                if (loadedGameState.equipment[slot] && gameState.equipment[slot]) {
                    gameState.equipment[slot].level = loadedGameState.equipment[slot].level || 0;
                } else if (gameState.equipment[slot]) { 
                    gameState.equipment[slot].level = 0;
                }
            });
        }
        
        if (typeof allMilestonesConfig !== 'undefined') {
            gameState.milestones = JSON.parse(JSON.stringify(allMilestonesConfig)).map((mConfig, index) => {
                let achievedState = false;
                if (loadedGameState.milestonesAchieved && loadedGameState.milestonesAchieved.length > index) {
                    achievedState = loadedGameState.milestonesAchieved[index];
                }
                return {...mConfig, achieved: achievedState };
            });
        } else {
            gameState.milestones = [];
        }

        if (typeof calculateXpToNextLevel === 'function') {
            gameState.xpToNextLevel = calculateXpToNextLevel();
        } else {
            gameState.xpToNextLevel = 70; 
        }

        const timeSinceLastSave = (Date.now() - gameState.lastSaveTime) / 1000; 
        if (gameState.bossFightTimerActive && loadedGameState.enemy && loadedGameState.enemy.isBoss) {
            gameState.bossFightTimeLeft -= timeSinceLastSave;
            if (gameState.bossFightTimeLeft <= 0 && loadedGameState.enemy.currentHealth > 0) {
                gameState.bossFightTimeLeft = 0;
                if (typeof showMessageBox === 'function') {
                     showMessageBox("Souboj s bossem vypršel během tvé nepřítomnosti. Zóna byla restartována.", true, 4000);
                }
                gameState.enemiesDefeatedInZone = 0; 
                gameState.bossFightTimerActive = false; 
            }
        }
        
        if (loadedGameState.enemy && loadedGameState.enemy.currentHealth > 0 && (!gameState.bossFightTimerActive || gameState.bossFightTimeLeft > 0)) {
            gameState.enemy = {...loadedGameState.enemy};
            if (typeof enemyArtElement !== 'undefined' && typeof enemySVGs !== 'undefined' && enemySVGs.length > 0 && typeof enemyNames !== 'undefined') {
                const baseNameIndex = (gameState.enemy.effectiveLevel - 1 + enemyNames.length) % enemyNames.length;
                enemyArtElement.innerHTML = enemySVGs[baseNameIndex % enemySVGs.length];
            }
        } else {
            if (typeof spawnNewEnemy === 'function') spawnNewEnemy(); 
        }
        
        if (typeof soundManager !== 'undefined' && typeof soundManager.loadSettingsFromGameState === 'function') {
            soundManager.loadSettingsFromGameState();
        }
        
        if (typeof updateCurrentTierBonuses === 'function') updateCurrentTierBonuses(); 
        if (typeof initializeOrResetDailyQuests === 'function') initializeOrResetDailyQuests(); 
        if (typeof updateTotalCompanionPassivePercentOnGameState === 'function') updateTotalCompanionPassivePercentOnGameState(); 
        
        if (typeof renderEquipmentUI === 'function') renderEquipmentUI();
        if (typeof renderArtifactsUI === 'function') renderArtifactsUI();
        if (typeof renderCompanionsUI === 'function') renderCompanionsUI();
        if (typeof renderMilestonesUI === 'function') renderMilestonesUI(); 
        if (typeof renderResearchUI === 'function') renderResearchUI(); 
        if (typeof renderEssenceForgeUI === 'function') renderEssenceForgeUI(); 
        if (typeof renderTalentTree === 'function') renderTalentTree(); 

        if (typeof showMessageBox === 'function') showMessageBox("Hra načtena!", false, 2000);

    } else {
        if (typeof initializeNewGameVariablesAndUI === 'function') {
            initializeNewGameVariablesAndUI();
        } else {
            console.error("initializeNewGameVariablesAndUI function not found!");
        }
    }
    
    if (typeof calculateEffectiveStats === 'function') calculateEffectiveStats(); 
    if (typeof updateUI === 'function') updateUI(); 
}


/**
 * Inicializuje proměnné a UI pro novou hru.
 * Volá se, pokud se nenajde uložený stav, nebo při hard resetu.
 */
function initializeNewGameVariablesAndUI() {
    if (typeof initializeDefaultGameStateVariables === 'function') {
        initializeDefaultGameStateVariables(); 
    } else {
        console.error("initializeDefaultGameStateVariables function not found!");
        return; 
    }

    if (typeof initializeEquipment === 'function') initializeEquipment(); 
    if (typeof updateCurrentTierBonuses === 'function') updateCurrentTierBonuses(); 
    if (typeof initializeOrResetDailyQuests === 'function') initializeOrResetDailyQuests(); 
    if (typeof updateTotalCompanionPassivePercentOnGameState === 'function') updateTotalCompanionPassivePercentOnGameState(); 
    
    if (typeof soundManager !== 'undefined' && typeof soundManager.loadSettingsFromGameState === 'function') {
        soundManager.loadSettingsFromGameState(); 
    }
    if (typeof volumeSlider !== 'undefined' && volumeSlider && typeof muteButton !== 'undefined' && muteButton) {
        volumeSlider.value = gameState.gameSettings.soundVolume;
        muteButton.textContent = gameState.gameSettings.soundMuted ? "Odtlumit" : "Ztlumit";
        muteButton.classList.toggle('muted', gameState.gameSettings.soundMuted);
    }
    if (typeof toggleDamageNumbersEl !== 'undefined') toggleDamageNumbersEl.checked = gameState.gameSettings.showDamageNumbers;
    if (typeof toggleGoldAnimationsEl !== 'undefined') toggleGoldAnimationsEl.checked = gameState.gameSettings.showGoldAnimations;

    if (typeof renderEquipmentUI === 'function') renderEquipmentUI();
    if (typeof renderArtifactsUI === 'function') renderArtifactsUI();
    if (typeof renderCompanionsUI === 'function') renderCompanionsUI();
    if (typeof renderMilestonesUI === 'function') renderMilestonesUI();
    if (typeof renderResearchUI === 'function') renderResearchUI();
    if (typeof renderEssenceForgeUI === 'function') renderEssenceForgeUI();
    if (typeof renderTalentTree === 'function') renderTalentTree(); 
    
    if (typeof spawnNewEnemy === 'function') spawnNewEnemy(); 
    
    if (typeof showMessageBox === 'function') showMessageBox("Vítej ve hře Echoes of Infinity! Začínáš novou hru.", false, 3000);
}


/**
 * Zobrazí potvrzovací modál pro reset hry.
 */
function requestHardResetConfirmation() {
    if (typeof openResetConfirmModalUI === 'function') {
        openResetConfirmModalUI();
    } else {
        console.error("openResetConfirmModalUI function not found! Using basic confirm as fallback.");
        if (window.confirm("Opravdu si přejete restartovat celou hru? Veškerý postup bude ztracen a nelze jej obnovit!")) {
            performHardReset();
        }
    }
}

/**
 * Provede skutečný hard reset hry.
 * Tato funkce je volána po potvrzení v modálním okně.
 */
function performHardReset() {
    if (typeof closeResetConfirmModalUI === 'function') {
        closeResetConfirmModalUI();
    } else if (typeof closeModal === 'function' && typeof resetConfirmModal !== 'undefined' && !resetConfirmModal.classList.contains('hidden')) {
        closeModal(resetConfirmModal);
    }

    localStorage.removeItem(SAVE_KEY); 

    if (typeof initializeNewGameVariablesAndUI === 'function') {
        initializeNewGameVariablesAndUI(); 
    } else {
        console.error("performHardReset: initializeNewGameVariablesAndUI is not defined. Cannot reset game state fully in memory.");
        if (typeof initializeDefaultGameStateVariables === 'function') {
            initializeDefaultGameStateVariables(); 
        }
    }

    if (typeof calculateEffectiveStats === 'function') {
        calculateEffectiveStats();
    }
    if (typeof updateUI === 'function') { 
        updateUI(); 
    }
    
    if (typeof showMessageBox === 'function') {
        showMessageBox("Hra byla kompletně restartována.", false, 3000);
    }

    try {
        setTimeout(() => {
            window.location.reload();
        }, 500); 
    } catch (e) {
        console.warn("window.location.reload() failed, possibly due to environment restrictions. Game state has been reset in memory.", e);
    }
}