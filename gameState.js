// SOUBOR: gameState.js

// --- Hlavní Objekt Herního Stavu ---
const gameState = {
    gold: 0,
    baseClickDamage: 10,
    effectiveClickDamage: 10,
    passivePercentFromTiers: 0,
    currentGlobalTierClickDamageBonus: 0,
    totalCompanionPassivePercent: 0,
    currentTierIndex: 0,

    enemy: {
        name: "Slime",
        currentHealth: 10,
        maxHealth: 10,
        goldReward: 5,
        effectiveLevel: 1,
        isChampion: false,
        isBoss: false
    },
    currentWorld: 1,
    currentZoneInWorld: 1,
    enemiesDefeatedInZone: 0,
    playerLevel: 1,
    playerXP: 0,
    xpToNextLevel: 70,
    talentPoints: 0,
    clicksSinceLastGuaranteedCrit: 0,
    equipment: {},
    activeBuffs: {},
    activeDebuffs: {},
    mocnyUderCooldownTimeLeft: 0,
    mocnyUderActive: false,
    mocnyUderDurationLeft: 0,
    zlataHoreckaAktivniCooldownTimeLeft: 0,
    zlataHoreckaAktivniActive: false,
    zlataHoreckaAktivniDurationLeft: 0,
    echoShards: 0,
    echoCount: 0,
    highestEffectiveLevelReachedThisEcho: 1,
    echoPermanentGoldBonus: 1.0,
    echoPermanentDamageBonus: 1.0,
    echoGoldLevelCount: 0,
    echoDamageLevelCount: 0,
    echoGoldUpgradeCost: 5,
    echoDamageUpgradeCost: 5,
    bossFightTimerActive: false,
    bossFightTimeLeft: 0,
    bossFightInitialDuration: 0,
    lifetimeStats: {
        totalClicks: 0, totalCrits: 0, highestDamageDealt: 0, totalBossesKilled: 0,
        totalChampionsKilled: 0, totalEnemiesKilled: 0, lifetimeGoldEarned: 0,
        lifetimeEchoShardsEarned: 0, lifetimePlayerLevelsGained: 0, lifetimeTiersAdvanced: 0,
        companionEssenceCollectedTotal: 0, expeditionsCompletedTotal: 0,
        totalPlayTimeSeconds: 0, fastestBossKillSeconds: Infinity,
    },
    milestones: [],
    totalGoldEarnedThisEcho: 0,
    enemiesKilledThisEcho: 0,
    currentRunPlayTimeSeconds: 0,
    ownedArtifactsData: {},
    ownedCompanions: {},
    baseCritChance: 0.05,
    effectiveCritChance: 0.05,
    dailyQuestData: { quests: [], lastResetDate: null, goldEarnedForQuestToday: 0 },
    gameSettings: {
        showDamageNumbers: true,
        showGoldAnimations: true,
        soundVolume: 0.5,
        soundMuted: false
    },
    playerResearchProgress: {},
    playerEssences: {},
    companionEssence: 0,
    companionSkillLevels: {},
    activeExpeditions: [],
    expeditionSlots: 1, // Základní počet slotů pro expedice
    lastSaveTime: Date.now(),
    lastTickTime: Date.now(),
    lastActiveTime: Date.now()
};

// Funkce pro inicializaci/reset proměnných pro novou hru nebo po načtení defaultních hodnot
function initializeDefaultGameStateVariables() {
    // console.log("initializeDefaultGameStateVariables CALLED!");

    gameState.gold = 0;
    gameState.baseClickDamage = 10;
    gameState.effectiveClickDamage = 10;
    gameState.passivePercentFromTiers = 0;
    gameState.currentGlobalTierClickDamageBonus = 0;
    gameState.totalCompanionPassivePercent = 0;
    gameState.currentTierIndex = 0;

    gameState.enemy = {
        name: "Slime", currentHealth: 10, maxHealth: 10, goldReward: 5,
        effectiveLevel: 1, isChampion: false, isBoss: false
    };
    gameState.currentWorld = 1;
    gameState.currentZoneInWorld = 1;
    gameState.enemiesDefeatedInZone = 0;
    gameState.playerLevel = 1;
    gameState.playerXP = 0;
    gameState.talentPoints = 0;
    gameState.clicksSinceLastGuaranteedCrit = 0;
    gameState.activeBuffs = {};
    gameState.activeDebuffs = {};
    gameState.mocnyUderCooldownTimeLeft = 0;
    gameState.mocnyUderActive = false;
    gameState.mocnyUderDurationLeft = 0;
    gameState.zlataHoreckaAktivniCooldownTimeLeft = 0;
    gameState.zlataHoreckaAktivniActive = false;
    gameState.zlataHoreckaAktivniDurationLeft = 0;
    gameState.echoShards = 0;
    gameState.echoCount = 0;
    gameState.highestEffectiveLevelReachedThisEcho = 1;
    gameState.echoPermanentGoldBonus = 1.0;
    gameState.echoPermanentDamageBonus = 1.0;
    gameState.echoGoldLevelCount = 0;
    gameState.echoDamageLevelCount = 0;
    gameState.echoGoldUpgradeCost = (typeof initialEchoGoldUpgradeCost !== 'undefined') ? initialEchoGoldUpgradeCost : 5;
    gameState.echoDamageUpgradeCost = (typeof initialEchoDamageUpgradeCost !== 'undefined') ? initialEchoDamageUpgradeCost : 5;
    gameState.bossFightTimerActive = false;
    gameState.bossFightTimeLeft = 0;
    gameState.bossFightInitialDuration = 0;
    gameState.lifetimeStats = {
        totalClicks: 0, totalCrits: 0, highestDamageDealt: 0, totalBossesKilled: 0,
        totalChampionsKilled: 0, totalEnemiesKilled: 0, lifetimeGoldEarned: 0,
        lifetimeEchoShardsEarned: 0, lifetimePlayerLevelsGained: 0, lifetimeTiersAdvanced: 0,
        companionEssenceCollectedTotal: 0, expeditionsCompletedTotal: 0,
        totalPlayTimeSeconds: 0, fastestBossKillSeconds: Infinity,
    };
    gameState.totalGoldEarnedThisEcho = 0;
    gameState.enemiesKilledThisEcho = 0;
    gameState.currentRunPlayTimeSeconds = 0;
    gameState.ownedArtifactsData = {};
    gameState.ownedCompanions = {};
    gameState.baseCritChance = 0.05;
    gameState.effectiveCritChance = 0.05;
    gameState.dailyQuestData = { quests: [], lastResetDate: null, goldEarnedForQuestToday: 0 };
    gameState.playerResearchProgress = {};
    gameState.playerEssences = {};
    gameState.companionEssence = 0;
    gameState.companionSkillLevels = {};
    gameState.activeExpeditions = [];
    gameState.expeditionSlots = 1; // Reset i zde
    gameState.lastSaveTime = Date.now();
    gameState.lastTickTime = Date.now();
    gameState.lastActiveTime = Date.now();

    // Reset úrovní talentů (včetně nových)
    if (typeof talents !== 'undefined') { // 'talents' je objekt s definicemi z config.js
        for (const id in talents) {
            if (talents.hasOwnProperty(id)) {
                talents[id].currentLevel = 0; // Resetujeme currentLevel přímo v definicích pro novou hru
            }
        }
    }

    if (typeof initializeEquipment === 'function') {
        initializeEquipment();
    } else {
        console.error("INIT_DEFAULT_GAME_STATE: initializeEquipment function not found!");
        gameState.equipment = {};
        if(typeof equipmentSlots !== 'undefined' && Array.isArray(equipmentSlots)){
            equipmentSlots.forEach(slot => { gameState.equipment[slot] = { level: 0 }; });
        }
    }

    if (typeof allMilestonesConfig !== 'undefined') {
        gameState.milestones = JSON.parse(JSON.stringify(allMilestonesConfig)).map(m => ({...m, achieved: false}));
    } else {
        gameState.milestones = [];
    }

    if (typeof allResearchProjects !== 'undefined') {
        for (const id in allResearchProjects) {
            if (allResearchProjects.hasOwnProperty(id)) {
                gameState.playerResearchProgress[id] = { level: 0 };
            }
        }
    }
    if (typeof allEssences !== 'undefined') {
        for (const id in allEssences) {
            if (allEssences.hasOwnProperty(id)) {
                gameState.playerEssences[id] = { level: 0 };
            }
        }
    }
    if (typeof allCompanions !== 'undefined') {
        for (const companionId in allCompanions) {
            if (allCompanions.hasOwnProperty(companionId)) {
                if (!gameState.companionSkillLevels[companionId]) gameState.companionSkillLevels[companionId] = {};
                if (allCompanions[companionId].skillTree) {
                    for (const skillId in allCompanions[companionId].skillTree) {
                        if (allCompanions[companionId].skillTree.hasOwnProperty(skillId)) {
                            gameState.companionSkillLevels[companionId][skillId] = 0;
                        }
                    }
                }
            }
        }
    }

    if (typeof calculateXpToNextLevel === 'function') {
        gameState.xpToNextLevel = calculateXpToNextLevel();
    } else {
        gameState.xpToNextLevel = 70;
    }
    // console.log("INIT_DEFAULT_GAME_STATE: Dokončeno.");
}
