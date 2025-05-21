// SOUBOR: saveLoadController.js

/**
 * Uloží aktuální stav hry do localStorage.
 */
function saveGame() {
    const talentLevelsToSave = {};
    if (typeof talents !== 'undefined') { 
        for (const id in talents) {
            if (talents.hasOwnProperty(id)) {
                talentLevelsToSave[id] = talents[id].currentLevel;
            }
        }
    }

    const equipmentToSave = {};
    if (typeof gameState !== 'undefined' && typeof gameState.equipment !== 'undefined' && typeof equipmentSlots !== 'undefined') {
        equipmentSlots.forEach(slot => {
            if (gameState.equipment[slot]) { 
                equipmentToSave[slot] = { level: gameState.equipment[slot].level }; 
            }
        });
    }
    
    gameState.lastActiveTime = Date.now();

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
        lifetimeStats: gameState.lifetimeStats,
        totalGoldEarnedThisEcho: gameState.totalGoldEarnedThisEcho,
        enemiesKilledThisEcho: gameState.enemiesKilledThisEcho,
        currentRunPlayTimeSeconds: gameState.currentRunPlayTimeSeconds,
        milestonesAchieved: gameState.milestones.map(m => m.achieved),
        lastSaveTime: gameState.lastSaveTime, 
        lastActiveTime: gameState.lastActiveTime, 
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
        bossFightInitialDuration: gameState.bossFightInitialDuration,
        dailyQuestData: gameState.dailyQuestData,
        gameSettings: gameState.gameSettings,
        playerResearchProgress: gameState.playerResearchProgress,
        playerEssences: gameState.playerEssences,
        companionEssence: gameState.companionEssence, 
        companionSkillLevels: gameState.companionSkillLevels,
        activeExpeditions: gameState.activeExpeditions, 
        expeditionSlots: gameState.expeditionSlots     
    };
    
    gameState.lastSaveTime = Date.now(); 
    gameStateToSave.lastSaveTime = gameState.lastSaveTime; 

    localStorage.setItem(SAVE_KEY, JSON.stringify(gameStateToSave)); 
}

/**
 * Načte stav hry z localStorage. Pokud žádný uložený stav neexistuje, inicializuje novou hru.
 */
function loadGame() {
    const savedStateString = localStorage.getItem(SAVE_KEY); 

    if (savedStateString) {
        const loadedGameState = JSON.parse(savedStateString);
        
        // 1. Načtení a validace currentTierIndex jako první
        let tempCurrentTierIndex = loadedGameState.currentTierIndex;
        if (typeof tempCurrentTierIndex !== 'number' || isNaN(tempCurrentTierIndex)) {
            tempCurrentTierIndex = 0; 
        }
        if (typeof tiers !== 'undefined' && Array.isArray(tiers) && tiers.length > 0) {
            if (tempCurrentTierIndex < 0 || tempCurrentTierIndex >= tiers.length) {
                console.warn(`loadGame: Načtený currentTierIndex (${loadedGameState.currentTierIndex}) je mimo meze pole tiers (délka ${tiers.length}). Nastavuji na 0.`);
                tempCurrentTierIndex = 0;
            }
        } else {
             console.warn("loadGame: Pole 'tiers' není definováno nebo je prázdné při nastavování currentTierIndex. Používám 0.");
             tempCurrentTierIndex = 0; 
        }
        gameState.currentTierIndex = tempCurrentTierIndex; // Nastavení PŘED initializeEquipment
        console.log(`LOADGAME: gameState.currentTierIndex nastaven na: ${gameState.currentTierIndex}`);


        // 2. Inicializace základní struktury vybavení
        if (typeof initializeEquipment === 'function') {
            initializeEquipment(); // Tato funkce by NEMĚLA volat renderEquipmentUI
            console.log("LOADGAME: initializeEquipment() zavoláno.");
        } else {
            console.error("loadGame: initializeEquipment function not found!");
            gameState.equipment = {}; 
        }

        // 3. Načtení ostatních jednoduchých hodnot gameState
        Object.keys(loadedGameState).forEach(key => {
            if (gameState.hasOwnProperty(key) && 
                key !== 'talents' && 
                key !== 'equipment' && 
                key !== 'milestones' && 
                key !== 'enemy' && 
                key !== 'lifetimeStats' && 
                key !== 'playerResearchProgress' && 
                key !== 'playerEssences' && 
                key !== 'companionSkillLevels' && 
                key !== 'activeExpeditions' &&
                key !== 'currentTierIndex'
                ) {
                if (typeof loadedGameState[key] !== 'object' || loadedGameState[key] === null) {
                    gameState[key] = loadedGameState[key];
                } else if (Array.isArray(loadedGameState[key])) {
                    gameState[key] = JSON.parse(JSON.stringify(loadedGameState[key]));
                } else {
                    gameState[key] = { ...(gameState[key] || {}), ...loadedGameState[key] };
                }
            }
        });
        // Fallbacky pro klíčové hodnoty
        gameState.gold = loadedGameState.gold || 0;
        // ... (ostatní fallbacky pro jednoduché hodnoty) ...

        // 4. Načtení úrovní vybavení do již existující struktury gameState.equipment
        if (loadedGameState.equipment && typeof equipmentSlots !== 'undefined' && gameState.equipment) { 
            equipmentSlots.forEach(slot => {
                if (gameState.equipment[slot]) { 
                    if (loadedGameState.equipment[slot]) {
                        gameState.equipment[slot].level = loadedGameState.equipment[slot].level || 0;
                    } else {
                        gameState.equipment[slot].level = 0; 
                    }
                } else {
                     console.warn(`loadGame: Slot '${slot}' chybí v gameState.equipment po inicializaci při načítání úrovní. Vytvářím.`);
                     gameState.equipment[slot] = { level: (loadedGameState.equipment[slot] ? loadedGameState.equipment[slot].level : 0) || 0 };
                }
            });
        }
        console.log("LOADGAME: Úrovně vybavení načteny:", JSON.parse(JSON.stringify(gameState.equipment)));
        
        // Načtení komplexnějších struktur (talenty, statistiky, atd.)
        gameState.enemy = { ...(gameState.enemy || { name: "Slime", currentHealth: 10, maxHealth: 10, goldReward: 5, effectiveLevel: 1, isChampion: false, isBoss: false }), ...(loadedGameState.enemy || {}) };
        gameState.lifetimeStats = { 
            totalClicks: 0, totalCrits: 0, highestDamageDealt: 0, totalBossesKilled: 0, 
            totalChampionsKilled: 0, totalEnemiesKilled: 0, lifetimeGoldEarned: 0, 
            lifetimeEchoShardsEarned: 0, lifetimePlayerLevelsGained: 0, lifetimeTiersAdvanced: 0,
            companionEssenceCollectedTotal: 0, expeditionsCompletedTotal: 0,
            totalPlayTimeSeconds: 0, fastestBossKillSeconds: Infinity,
            ...(loadedGameState.lifetimeStats || {}) 
        };
        // ... (zbytek načítání komplexních struktur) ...
        
        if (typeof updateCurrentTierBonuses === 'function') updateCurrentTierBonuses(); 
        if (typeof updateTotalCompanionPassivePercentOnGameState === 'function') updateTotalCompanionPassivePercentOnGameState();
        if (typeof calculateEffectiveStats === 'function') calculateEffectiveStats(); 

        const lastActive = loadedGameState.lastActiveTime || loadedGameState.lastSaveTime || Date.now();
        const offlineDurationSeconds = (Date.now() - lastActive) / 1000;
        calculateAndApplyOfflineProgress(offlineDurationSeconds);
        
        if (typeof calculateEffectiveStats === 'function') calculateEffectiveStats(); 
        
        if (loadedGameState.enemy && loadedGameState.enemy.currentHealth > 0 && (!gameState.bossFightTimerActive || gameState.bossFightTimeLeft > 0)) {
            if(!(gameState.enemy.isBoss && gameState.enemy.currentHealth <=0)){ 
                 gameState.enemy = {...(gameState.enemy || {}), ...loadedGameState.enemy}; 
            } else { 
                 if (typeof spawnNewEnemy === 'function') spawnNewEnemy();
            }
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
        
        if (typeof initializeOrResetDailyQuests === 'function') initializeOrResetDailyQuests(); 
        
        // Finální překreslení UI
        console.log("LOADGAME: Před finálním renderEquipmentUI. currentTierIndex:", gameState.currentTierIndex, "typeof tiers:", typeof tiers);
        if (typeof renderEquipmentUI === 'function') renderEquipmentUI(); 
        if (typeof renderArtifactsUI === 'function') renderArtifactsUI();
        // ... (ostatní render funkce) ...

    } else { // Pokud neexistuje uložený stav
        console.log("LOADGAME: Nebyl nalezen žádný uložený stav, volám initializeNewGameVariablesAndUI.");
        if (typeof initializeNewGameVariablesAndUI === 'function') {
            initializeNewGameVariablesAndUI(); // Tato funkce by měla volat renderEquipmentUI na svém konci
        } else {
            console.error("initializeNewGameVariablesAndUI function not found!");
        }
    }
    
    gameState.lastTickTime = Date.now(); 
    gameState.lastActiveTime = Date.now(); 

    if (typeof updateUI === 'function') updateUI(); 
}


/**
 * Vypočítá a aplikuje offline progres.
 * @param {number} offlineDurationTotalSeconds - Celková doba, po kterou byl hráč offline, v sekundách.
 */
function calculateAndApplyOfflineProgress(offlineDurationTotalSeconds) {
    if (offlineDurationTotalSeconds < MIN_OFFLINE_TIME_FOR_PROGRESS_SECONDS) {
        if (typeof showMessageBox === 'function') showMessageBox("Vítej zpět!", false, 2000);
        return; 
    }
    // ... (zbytek funkce zůstává stejný) ...
    const effectiveOfflineDurationSeconds = Math.min(offlineDurationTotalSeconds, MAX_OFFLINE_TIME_SECONDS);

    let passiveDamageFromTiersArtifactsTalents = gameState.passivePercentFromTiers; 
    let passiveDamageFromCompanions = gameState.totalCompanionPassivePercent;
    if (typeof getResearchBonus === 'function') {
        passiveDamageFromCompanions *= (1 + getResearchBonus('research_companion_damage_multiplier_percent'));
    }
    let finalEffectivePassivePercent = passiveDamageFromTiersArtifactsTalents + passiveDamageFromCompanions;
    if (talents.passivePercentMultiplierTalent.currentLevel > 0) { 
        finalEffectivePassivePercent *= (1 + talents.passivePercentMultiplierTalent.effectValue * talents.passivePercentMultiplierTalent.currentLevel);
    }
    if (typeof getEssenceBonus === 'function') {
        finalEffectivePassivePercent *= (1 + getEssenceBonus('essence_passive_dps_multiplier_percent')); 
    }
    if (talents.ultimateAuraOfDecay.currentLevel > 0) {
        const auraDamageConfig = talents.ultimateAuraOfDecay.effectValue;
        if (gameState.enemy && gameState.enemy.maxHealth && gameState.enemy.maxHealth > 0) {
             finalEffectivePassivePercent += Math.min(auraDamageConfig.percent, auraDamageConfig.cap / gameState.enemy.maxHealth);
        }
    }

    let goldGainedOffline = 0;
    let xpGainedOffline = 0;
    let enemiesKilledOffline = 0;

    if (finalEffectivePassivePercent > 0 && gameState.enemy && gameState.enemy.maxHealth > 0) {
        const timeToKillOneEnemySeconds = (finalEffectivePassivePercent > 0) ? (1 / finalEffectivePassivePercent) : Infinity; 
        
        if (timeToKillOneEnemySeconds > 0 && timeToKillOneEnemySeconds !== Infinity) {
            enemiesKilledOffline = Math.floor(effectiveOfflineDurationSeconds / timeToKillOneEnemySeconds);
            
            const baseGoldPerKill = gameState.enemy.goldReward || 1; 
            let goldMultiplierOffline = gameState.echoPermanentGoldBonus;
            if (talents.goldVeins.currentLevel > 0) goldMultiplierOffline *= (1 + talents.goldVeins.effectValue * talents.goldVeins.currentLevel);
            if (typeof getArtifactBonus === 'function') goldMultiplierOffline *= (1 + (getArtifactBonus('gold_bonus_percent_additive') / 100));
            if (typeof getResearchBonus === 'function') goldMultiplierOffline *= (1 + getResearchBonus('research_gold_multiplier_all_percent'));
            if (typeof getEssenceBonus === 'function') goldMultiplierOffline *= (1 + getEssenceBonus('essence_gold_multiplier_all_percent'));

            goldGainedOffline = Math.floor(enemiesKilledOffline * baseGoldPerKill * goldMultiplierOffline * OFFLINE_GOLD_EARN_PERCENTAGE);

            const baseXpPerKill = gameState.enemy.effectiveLevel || 1; 
            xpGainedOffline = Math.floor(enemiesKilledOffline * baseXpPerKill * OFFLINE_XP_EARN_PERCENTAGE);
        }
    }

    gameState.gold += goldGainedOffline;
    gameState.lifetimeStats.lifetimeGoldEarned += goldGainedOffline;
    gameState.totalGoldEarnedThisEcho += goldGainedOffline; 

    if (xpGainedOffline > 0 && typeof gainXP === 'function') {
        gainXP(xpGainedOffline); 
    }
    
    gameState.lifetimeStats.totalPlayTimeSeconds = (gameState.lifetimeStats.totalPlayTimeSeconds || 0) + effectiveOfflineDurationSeconds;
    gameState.currentRunPlayTimeSeconds = (gameState.currentRunPlayTimeSeconds || 0) + effectiveOfflineDurationSeconds;
    gameState.enemiesKilledThisEcho += enemiesKilledOffline; 
    gameState.lifetimeStats.totalEnemiesKilled += enemiesKilledOffline;
    
    if (gameState.bossFightTimerActive && gameState.enemy.isBoss) {
        gameState.bossFightTimeLeft -= effectiveOfflineDurationSeconds;
        if (gameState.bossFightTimeLeft <= 0) {
            gameState.bossFightTimeLeft = 0;
            if (gameState.enemy.currentHealth > 0) { 
                 if (typeof showMessageBox === 'function') showMessageBox(`Boss vypršel během tvé nepřítomnosti. Zóna ${gameState.currentZoneInWorld} restartována.`, true, 3000);
                 gameState.enemiesDefeatedInZone = 0;
            }
            gameState.bossFightTimerActive = false;
            gameState.bossFightInitialDuration = 0;
        }
    }

    let summaryMessage = `Vítej zpět! Během tvé ${formatTime(offlineDurationTotalSeconds)} nepřítomnosti jsi získal:\n`;
    let gainedSomething = false;
    if (goldGainedOffline > 0) {
        summaryMessage += `- ${formatNumber(goldGainedOffline)} Zlata\n`;
        gainedSomething = true;
    }
    if (xpGainedOffline > 0) {
        summaryMessage += `- ${formatNumber(xpGainedOffline)} Zkušeností\n`;
        gainedSomething = true;
    }
    if (enemiesKilledOffline > 0) {
        summaryMessage += `- Porazil jsi ${formatNumber(enemiesKilledOffline)} nepřátel\n`;
        gainedSomething = true;
    }

    if (gainedSomething) {
        if (offlineDurationTotalSeconds > MAX_OFFLINE_TIME_SECONDS) {
            summaryMessage += `(Offline progres byl započítán za maximálně ${formatTime(MAX_OFFLINE_TIME_SECONDS)}.)`;
        }
        if (typeof showMessageBox === 'function') showMessageBox(summaryMessage, false, 7000);
    } else {
        if (typeof showMessageBox === 'function') showMessageBox(`Vítej zpět! (Doba nepřítomnosti: ${formatTime(offlineDurationTotalSeconds)})`, false, 3000);
    }
}


/**
 * Inicializuje proměnné a UI pro novou hru.
 * Volá se, pokud se nenajde uložený stav, nebo při hard resetu.
 */
function initializeNewGameVariablesAndUI() {
    if (typeof initializeDefaultGameStateVariables === 'function') {
        initializeDefaultGameStateVariables(); // Tato funkce volá initializeEquipment
        console.log("NEW_GAME: initializeDefaultGameStateVariables() zavoláno. currentTierIndex:", gameState.currentTierIndex);
    } else {
        console.error("initializeDefaultGameStateVariables function not found!");
        return; 
    }
    
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

    // renderEquipmentUI se volá až po všech těchto inicializacích
    console.log("NEW_GAME: Před finálním renderEquipmentUI. currentTierIndex:", gameState.currentTierIndex, "typeof tiers:", typeof tiers);
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