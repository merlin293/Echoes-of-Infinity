// SOUBOR: saveLoadController.js

/**
 * Uloží aktuální stav hry do localStorage.
 */
function saveGame() {
    // console.log("SAVEGAME_ENTRY: gameState.ownedCompanions at the very start of saveGame:", JSON.stringify(gameState.ownedCompanions));

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
    // console.log("SAVEGAME_PRE_CONSTRUCT: gameState.ownedCompanions just before constructing gameStateToSave:", JSON.stringify(gameState.ownedCompanions));

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

    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(gameStateToSave));
        // console.log("SAVEGAME_SUCCESS: Game saved. gameStateToSave.ownedCompanions:", JSON.stringify(gameStateToSave.ownedCompanions));
    } catch (e) {
        console.error("SAVEGAME_ERROR: Error during localStorage.setItem:", e);
        if (typeof showMessageBox === 'function') {
            showMessageBox("Chyba při ukládání hry! Postup nemusí být uložen.", true, 5000);
        }
    }
}

/**
 * Načte stav hry z localStorage. Pokud žádný uložený stav neexistuje, inicializuje novou hru.
 */
function loadGame() {
    // console.log("loadGame CALLED!"); // Ponecháno pro základní info
    // console.log("LOADGAME: Starting loadGame function.");
    const savedStateString = localStorage.getItem(SAVE_KEY);

    if (savedStateString) {
        // console.log("LOADGAME: Found saved state string.");
        let loadedGameState;
        try {
            loadedGameState = JSON.parse(savedStateString);
        } catch (e) {
            console.error("LOADGAME: Error parsing savedStateString from localStorage. Starting new game.", e);
            localStorage.removeItem(SAVE_KEY);
            if (typeof initializeNewGameVariablesAndUI === 'function') {
                initializeNewGameVariablesAndUI();
            } else {
                console.error("CRITICAL: initializeNewGameVariablesAndUI function not found after failed parse!");
            }
            if (typeof updateUI === 'function') updateUI();
            return;
        }

        let tempCurrentTierIndex = loadedGameState.currentTierIndex;
        if (typeof tempCurrentTierIndex !== 'number' || isNaN(tempCurrentTierIndex)) {
            tempCurrentTierIndex = 0;
        }
        if (typeof tiers !== 'undefined' && Array.isArray(tiers) && tiers.length > 0) {
            if (tempCurrentTierIndex < 0 || tempCurrentTierIndex >= tiers.length) {
                // console.warn(`loadGame: Načtený currentTierIndex (${loadedGameState.currentTierIndex}) je mimo meze pole tiers (délka ${tiers.length}). Nastavuji na 0.`);
                tempCurrentTierIndex = 0;
            }
        } else {
            // console.warn("loadGame: Pole 'tiers' není definováno nebo je prázdné při nastavování currentTierIndex. Používám 0.");
             tempCurrentTierIndex = 0;
        }
        gameState.currentTierIndex = tempCurrentTierIndex;
        // console.log(`LOADGAME (save exists): gameState.currentTierIndex set to: ${gameState.currentTierIndex}`);

        if (typeof initializeEquipment === 'function') {
            initializeEquipment();
            // console.log("LOADGAME (save exists): initializeEquipment() called.");
        } else {
            console.error("loadGame: initializeEquipment function not found!");
            gameState.equipment = {};
        }

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
                key !== 'currentTierIndex' &&
                key !== 'ownedCompanions'
                ) {
                if (typeof loadedGameState[key] !== 'object' || loadedGameState[key] === null) {
                    gameState[key] = loadedGameState[key];
                } else if (Array.isArray(loadedGameState[key])) {
                    gameState[key] = JSON.parse(JSON.stringify(loadedGameState[key]));
                } else {
                    if (typeof gameState[key] === 'object' && gameState[key] !== null && !Array.isArray(gameState[key])) {
                        gameState[key] = { ...gameState[key], ...loadedGameState[key] };
                    } else {
                        gameState[key] = JSON.parse(JSON.stringify(loadedGameState[key]));
                    }
                }
            }
        });
        // console.log("LOADGAME (save exists): Simple gameState properties loaded.");

        if (loadedGameState.ownedCompanions && typeof loadedGameState.ownedCompanions === 'object') {
            gameState.ownedCompanions = JSON.parse(JSON.stringify(loadedGameState.ownedCompanions));
            // console.log("LOADGAME (save exists): gameState.ownedCompanions loaded from save:", JSON.stringify(gameState.ownedCompanions));
        } else {
            gameState.ownedCompanions = {};
            // console.log("LOADGAME (save exists): No valid ownedCompanions in saved state, initialized to empty object.");
        }
        // try {
            // console.log("LOADGAME (save exists): allCompanions (from config for reference):", JSON.stringify(allCompanions || {}));
        // } catch(e) { console.error("Error stringifying allCompanions in loadGame", e); }

        if (loadedGameState.equipment && typeof equipmentSlots !== 'undefined' && gameState.equipment) {
            equipmentSlots.forEach(slot => {
                if (gameState.equipment[slot]) {
                    if (loadedGameState.equipment[slot] && typeof loadedGameState.equipment[slot].level === 'number') {
                        gameState.equipment[slot].level = loadedGameState.equipment[slot].level;
                    } else {
                        gameState.equipment[slot].level = 0;
                    }
                } else {
                    // console.warn(`loadGame (save exists): Slot '${slot}' chybí v gameState.equipment po inicializaci při načítání úrovní. Vytvářím.`);
                     gameState.equipment[slot] = { level: (loadedGameState.equipment[slot] && typeof loadedGameState.equipment[slot].level === 'number' ? loadedGameState.equipment[slot].level : 0) };
                }
            });
        }
        // console.log("LOADGAME (save exists): Equipment levels loaded:", JSON.parse(JSON.stringify(gameState.equipment)));

        gameState.enemy = { ...(gameState.enemy || { name: "Slime", currentHealth: 10, maxHealth: 10, goldReward: 5, effectiveLevel: 1, isChampion: false, isBoss: false }), ...(loadedGameState.enemy || {}) };
        gameState.lifetimeStats = {
            totalClicks: 0, totalCrits: 0, highestDamageDealt: 0, totalBossesKilled: 0,
            totalChampionsKilled: 0, totalEnemiesKilled: 0, lifetimeGoldEarned: 0,
            lifetimeEchoShardsEarned: 0, lifetimePlayerLevelsGained: 0, lifetimeTiersAdvanced: 0,
            companionEssenceCollectedTotal: 0, expeditionsCompletedTotal: 0,
            totalPlayTimeSeconds: 0, fastestBossKillSeconds: Infinity,
            ...(loadedGameState.lifetimeStats || {})
        };
        if (typeof gameState.lifetimeStats.companionEssenceCollectedTotal === 'undefined') gameState.lifetimeStats.companionEssenceCollectedTotal = 0;
        if (typeof gameState.lifetimeStats.expeditionsCompletedTotal === 'undefined') gameState.lifetimeStats.expeditionsCompletedTotal = 0;
        if (typeof gameState.lifetimeStats.totalPlayTimeSeconds === 'undefined') gameState.lifetimeStats.totalPlayTimeSeconds = 0;
        if (typeof gameState.lifetimeStats.fastestBossKillSeconds === 'undefined') gameState.lifetimeStats.fastestBossKillSeconds = Infinity;

        gameState.playerResearchProgress = loadedGameState.playerResearchProgress || {};
        if (typeof allResearchProjects !== 'undefined') {
            for (const id in allResearchProjects) {
                if (!gameState.playerResearchProgress[id]) gameState.playerResearchProgress[id] = { level: 0 };
            }
        }
        gameState.playerEssences = loadedGameState.playerEssences || {};
        if (typeof allEssences !== 'undefined') {
            for (const id in allEssences) {
                if (!gameState.playerEssences[id]) gameState.playerEssences[id] = { level: 0 };
            }
        }
        gameState.companionSkillLevels = loadedGameState.companionSkillLevels || {};
        if (typeof allCompanions !== 'undefined') {
            for (const companionId in allCompanions) {
                if (allCompanions.hasOwnProperty(companionId)) {
                    if (!gameState.companionSkillLevels[companionId]) gameState.companionSkillLevels[companionId] = {};
                    if (allCompanions[companionId].skillTree) {
                        for (const skillId in allCompanions[companionId].skillTree) {
                            if (typeof gameState.companionSkillLevels[companionId][skillId] === 'undefined') {
                                gameState.companionSkillLevels[companionId][skillId] = 0;
                            }
                        }
                    }
                }
            }
        }
        gameState.activeExpeditions = loadedGameState.activeExpeditions || [];
        gameState.expeditionSlots = loadedGameState.expeditionSlots || 1;

        if (loadedGameState.talentLevels && typeof talents !== 'undefined') {
            for (const id in loadedGameState.talentLevels) {
                if (talents.hasOwnProperty(id) && typeof loadedGameState.talentLevels[id] === 'number') {
                    talents[id].currentLevel = loadedGameState.talentLevels[id];
                } else if (talents.hasOwnProperty(id)) {
                    talents[id].currentLevel = 0;
                }
            }
        } else if (typeof talents !== 'undefined') {
             for (const id in talents) {
                if (talents.hasOwnProperty(id)) {
                    talents[id].currentLevel = 0;
                }
            }
        }

        if (typeof allMilestonesConfig !== 'undefined') {
            gameState.milestones = JSON.parse(JSON.stringify(allMilestonesConfig)).map((mConfig, index) => {
                let achievedState = false;
                if (loadedGameState.milestonesAchieved && Array.isArray(loadedGameState.milestonesAchieved) && loadedGameState.milestonesAchieved.length > index) {
                    achievedState = !!loadedGameState.milestonesAchieved[index];
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

        // console.log("LOADGAME (save exists): Calling updateCurrentTierBonuses.");
        if (typeof updateCurrentTierBonuses === 'function') updateCurrentTierBonuses();
        // console.log("LOADGAME (save exists): Calling updateTotalCompanionPassivePercentOnGameState. ownedCompanions before:", JSON.stringify(gameState.ownedCompanions));
        if (typeof updateTotalCompanionPassivePercentOnGameState === 'function') updateTotalCompanionPassivePercentOnGameState();
        // console.log("LOADGAME (save exists): Calling calculateEffectiveStats.");
        if (typeof calculateEffectiveStats === 'function') calculateEffectiveStats();

        const lastActive = loadedGameState.lastActiveTime || loadedGameState.lastSaveTime || Date.now();
        const offlineDurationSeconds = (Date.now() - lastActive) / 1000;
        // console.log(`LOADGAME (save exists): Calculating offline progress for ${offlineDurationSeconds}s.`);
        calculateAndApplyOfflineProgress(offlineDurationSeconds);

        // console.log("LOADGAME (save exists): Calling calculateEffectiveStats again after offline progress.");
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
            // console.log("LOADGAME (save exists): Spawning new enemy because loaded enemy health <= 0 or boss timer expired.");
            if (typeof spawnNewEnemy === 'function') spawnNewEnemy();
        }

        if (typeof soundManager !== 'undefined' && typeof soundManager.loadSettingsFromGameState === 'function') {
            soundManager.loadSettingsFromGameState();
        }

        if (typeof initializeOrResetDailyQuests === 'function') initializeOrResetDailyQuests();

        // console.log("LOADGAME (save exists): Calling render functions. CurrentTierIndex:", gameState.currentTierIndex, "typeof tiers:", typeof tiers);
        if (typeof renderEquipmentUI === 'function') {
            // console.log("LOADGAME: Calling renderEquipmentUI from loadGame (save exists).");
            renderEquipmentUI();
        }
        if (typeof renderArtifactsUI === 'function') {
            // console.log("LOADGAME: Calling renderArtifactsUI from loadGame (save exists).");
            renderArtifactsUI();
        }
        if (typeof renderCompanionsUI === 'function') {
            // console.log("LOADGAME: Calling renderCompanionsUI from loadGame (save exists). ownedCompanions before render:", JSON.stringify(gameState.ownedCompanions));
            renderCompanionsUI();
        }
         if (typeof renderTalentTree === 'function') renderTalentTree();
         if (typeof renderResearchUI === 'function') renderResearchUI();
         if (typeof renderEssenceForgeUI === 'function') renderEssenceForgeUI();
         if (typeof renderMilestonesUI === 'function') renderMilestonesUI();
         if (typeof renderDailyQuestsUI === 'function') renderDailyQuestsUI();

    } else {
        // console.log("LOADGAME: No saved state found, calling initializeNewGameVariablesAndUI.");
        if (typeof initializeNewGameVariablesAndUI === 'function') {
            initializeNewGameVariablesAndUI();
        } else {
            console.error("initializeNewGameVariablesAndUI function not found!");
        }
    }

    gameState.lastTickTime = Date.now();
    gameState.lastActiveTime = Date.now();

    // console.log("LOADGAME: Calling final updateUI. CurrentTierIndex:", gameState.currentTierIndex, "Final ownedCompanions:", JSON.stringify(gameState.ownedCompanions));
    if (typeof updateUI === 'function') {
        // console.log("LOADGAME: Calling updateUI at the end of loadGame.");
        updateUI();
    }
}

function initializeNewGameVariablesAndUI() {
    // console.log("initializeNewGameVariablesAndUI CALLED!"); // Ponecháno pro základní info
    // console.log("NEW_GAME: Starting initializeNewGameVariablesAndUI.");
    if (typeof initializeDefaultGameStateVariables === 'function') {
        initializeDefaultGameStateVariables();
        // console.log("NEW_GAME: After initializeDefaultGameStateVariables. currentTierIndex:", gameState.currentTierIndex, "Equipment keys:", Object.keys(gameState.equipment || {}));
        // console.log("NEW_GAME: ownedCompanions after default init:", JSON.stringify(gameState.ownedCompanions));
    } else {
        console.error("initializeDefaultGameStateVariables function not found! Critical initialization error.");
        gameState.currentTierIndex = 0;
        gameState.equipment = {};
        if(typeof equipmentSlots !== 'undefined' && Array.isArray(equipmentSlots)){
            equipmentSlots.forEach(slot => { gameState.equipment[slot] = { level: 0 }; });
        }
        gameState.ownedCompanions = {};
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

    // console.log("NEW_GAME: Calling render functions. CurrentTierIndex:", gameState.currentTierIndex, "typeof tiers:", (typeof tiers));
    if (typeof tiers === 'undefined') {
        console.error("CRITICAL in NEW_GAME: 'tiers' is undefined before renderEquipmentUI!");
    }

    if (typeof renderEquipmentUI === 'function') {
        // console.log("NEW_GAME: Calling renderEquipmentUI.");
        renderEquipmentUI();
    }
    if (typeof renderArtifactsUI === 'function') {
        // console.log("NEW_GAME: Calling renderArtifactsUI.");
        renderArtifactsUI();
    }
    if (typeof renderCompanionsUI === 'function') {
        // console.log("NEW_GAME: Calling renderCompanionsUI. ownedCompanions before render:", JSON.stringify(gameState.ownedCompanions));
        renderCompanionsUI();
    }
    if (typeof renderMilestonesUI === 'function') renderMilestonesUI();
    if (typeof renderResearchUI === 'function') renderResearchUI();
    if (typeof renderEssenceForgeUI === 'function') renderEssenceForgeUI();
    if (typeof renderTalentTree === 'function') renderTalentTree();

    if (typeof spawnNewEnemy === 'function') spawnNewEnemy();

    if (typeof showMessageBox === 'function') showMessageBox("Vítej ve hře Echoes of Infinity! Začínáš novou hru.", false, 3000);
    // console.log("NEW_GAME: End of initializeNewGameVariablesAndUI.");
}

function performHardReset() {
    // console.log("performHardReset CALLED!"); // Ponecháno pro základní info
    // console.log("HARD_RESET: Starting hard reset.");
    if (typeof closeResetConfirmModalUI === 'function') {
        closeResetConfirmModalUI();
    } else if (typeof closeModal === 'function' && typeof resetConfirmModal !== 'undefined' && !resetConfirmModal.classList.contains('hidden')) {
        closeModal(resetConfirmModal);
    }

    localStorage.removeItem(SAVE_KEY);
    // console.log("HARD_RESET: Saved game removed from localStorage.");

    if (typeof initializeNewGameVariablesAndUI === 'function') {
        // console.log("HARD_RESET: Calling initializeNewGameVariablesAndUI.");
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
        // console.log("HARD_RESET: Calling updateUI.");
        updateUI();
    }

    if (typeof showMessageBox === 'function') {
        showMessageBox("Hra byla kompletně restartována.", false, 3000);
    }
    // console.log("HARD_RESET: Hard reset complete. Attempting page reload.");

    try {
        setTimeout(() => {
            window.location.reload();
        }, 500);
    } catch (e) {
        console.warn("window.location.reload() failed, possibly due to environment restrictions. Game state has been reset in memory.", e);
    }
}

function calculateAndApplyOfflineProgress(offlineDurationTotalSeconds) {
    if (offlineDurationTotalSeconds < MIN_OFFLINE_TIME_FOR_PROGRESS_SECONDS) {
        if (typeof showMessageBox === 'function' && offlineDurationTotalSeconds > 5) {
             showMessageBox("Vítej zpět!", false, 2000);
        }
        return;
    }
    // console.log(`OFFLINE_PROGRESS: Calculating for ${offlineDurationTotalSeconds}s.`);

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
    // console.log(`OFFLINE_PROGRESS: finalEffectivePassivePercent = ${finalEffectivePassivePercent}`);

    let goldGainedOffline = 0;
    let xpGainedOffline = 0;
    let enemiesKilledOffline = 0;

    if (finalEffectivePassivePercent > 0 && gameState.enemy && gameState.enemy.maxHealth > 0) {
        const timeToKillOneEnemySeconds = (finalEffectivePassivePercent > 0) ? (1 / finalEffectivePassivePercent) : Infinity;
        // console.log(`OFFLINE_PROGRESS: timeToKillOneEnemySeconds = ${timeToKillOneEnemySeconds}`);

        if (timeToKillOneEnemySeconds > 0 && timeToKillOneEnemySeconds !== Infinity) {
            enemiesKilledOffline = Math.floor(effectiveOfflineDurationSeconds / timeToKillOneEnemySeconds);
            // console.log(`OFFLINE_PROGRESS: enemiesKilledOffline = ${enemiesKilledOffline}`);

            const baseGoldPerKill = gameState.enemy.goldReward || 1;
            let goldMultiplierOffline = gameState.echoPermanentGoldBonus;
            if (talents.goldVeins.currentLevel > 0) goldMultiplierOffline *= (1 + talents.goldVeins.effectValue * talents.goldVeins.currentLevel);
            if (typeof getArtifactBonus === 'function') goldMultiplierOffline *= (1 + (getArtifactBonus('gold_bonus_percent_additive') / 100));
            if (typeof getResearchBonus === 'function') goldMultiplierOffline *= (1 + getResearchBonus('research_gold_multiplier_all_percent'));
            if (typeof getEssenceBonus === 'function') goldMultiplierOffline *= (1 + getEssenceBonus('essence_gold_multiplier_all_percent'));

            goldGainedOffline = Math.floor(enemiesKilledOffline * baseGoldPerKill * goldMultiplierOffline * OFFLINE_GOLD_EARN_PERCENTAGE);
            // console.log(`OFFLINE_PROGRESS: goldGainedOffline = ${goldGainedOffline}`);

            const baseXpPerKill = gameState.enemy.effectiveLevel || 1;
            xpGainedOffline = Math.floor(enemiesKilledOffline * baseXpPerKill * OFFLINE_XP_EARN_PERCENTAGE);
            // console.log(`OFFLINE_PROGRESS: xpGainedOffline = ${xpGainedOffline}`);
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
    // console.log("OFFLINE_PROGRESS: Finished.");
}

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
