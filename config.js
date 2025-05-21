// SOUBOR: config.js

// --- Herní Konstanty a Definice ---

const ENEMIES_PER_ZONE = 100; 
const ZONES_PER_WORLD = 10; 
const MAX_WORLDS = 30; 
const MAX_ITEM_LEVEL = 100; 

const BUFF_TYPE_POWER_SHARD = 'powerShard'; 
const BUFF_TYPE_GOLD_RUSH = 'goldRush'; 
const DEBUFF_TYPE_PARASITE = 'parasite';

const POWER_SHARD_DROP_CHANCE = 0.03; 
const POWER_SHARD_DURATION = 10; 
const POWER_SHARD_MULTIPLIER = 2; 
const GOLD_RUSH_DROP_CHANCE = 0.05; 
const GOLD_RUSH_DURATION = 15; 
const GOLD_RUSH_MULTIPLIER = 3; 
const PARASITE_APPLY_CHANCE = 0.05; 
const PARASITE_DURATION = 15; 
const PARASITE_GOLD_DRAIN_PER_SECOND = 2; 
const PARASITE_CLEANSE_COST = 30;

const MOCNY_UDER_COOLDOWN = 300; // sekundy
const MOCNY_UDER_DURATION = 10; // sekundy
const MOCNY_UDER_DAMAGE_MULTIPLIER = 7; 

const ZLATA_HORECKA_AKTIVNI_COOLDOWN = 300; // sekundy
const ZLATA_HORECKA_AKTIVNI_DURATION = 15; // sekundy
const ZLATA_HORECKA_AKTIVNI_GOLD_MULTIPLIER = 4; 

const initialEchoGoldUpgradeCost = 5; 
const echoGoldUpgradeValue = 0.05; // +5%
const initialEchoDamageUpgradeCost = 5; 
const echoDamageUpgradeValue = 0.10; // +10%

const BOSS_FIGHT_DURATION = 30; // sekundy
const ARTIFACT_DROP_CHANCE_FROM_BOSS = 0.20; // 20%
const TALENT_RESET_COST_SHARDS = 25; 
const TALENT_RESET_BASE_GOLD_COST = 50000; 
const critDamageMultiplier = 2;

const COMPANION_ESSENCE_DROP_CHANCE_FROM_CHAMPION = 0.1; 
const COMPANION_ESSENCE_DROP_CHANCE_FROM_BOSS = 0.5; 

const MAX_OFFLINE_TIME_SECONDS = 60 * 60 * 8; 
const OFFLINE_GOLD_EARN_PERCENTAGE = 0.25;   
const OFFLINE_XP_EARN_PERCENTAGE = 0.10;     
const MIN_OFFLINE_TIME_FOR_PROGRESS_SECONDS = 60 * 2; 


const equipmentSlots = ['weapon', 'helmet', 'gloves', 'armor', 'pants', 'boots'];
const itemNamesCzech = {
    weapon: 'Zbraň', helmet: 'Helma', gloves: 'Rukavice',
    armor: 'Brnění', pants: 'Kalhoty', boots: 'Boty'
};
const itemIcons = { 
    weapon: '⚔️', helmet: '🛡️', gloves: '🧤',
    armor: '👕', pants: '�', boots: '👢'
};
const tiers = [ 
    { name: "Plátěné", passivePercentBonus: 0, costMultiplier: 1, clickDamageBonus: 0 }, 
    { name: "Dřevěné", passivePercentBonus: 0.0001, costMultiplier: 1.5, clickDamageBonus: 500 },
    { name: "Kamenné", passivePercentBonus: 0.0002, costMultiplier: 2.2, clickDamageBonus: 1500 },
    { name: "Bronzové", passivePercentBonus: 0.0003, costMultiplier: 3.5, clickDamageBonus: 4000 },
    { name: "Železné", passivePercentBonus: 0.0005, costMultiplier: 5, clickDamageBonus: 10000 },
    { name: "Platinové", passivePercentBonus: 0.0008, costMultiplier: 7.5, clickDamageBonus: 25000 },
    { name: "Diamantové", passivePercentBonus: 0.0012, costMultiplier: 12, clickDamageBonus: 60000 }
];

const talents = {
    increasedClickDamage: { name: "Základní Síla", description: "Zvyšuje základní poškození kliknutím o 10% za úroveň.", maxLevel: 10, currentLevel:0, cost: (level) => 1 + level, effectType: 'base_click_damage_multiplier_percent', effectValue: 0.10, branch: 'basic' },
    goldVeins: { name: "Zlaté Žíly", description: "Zvyšuje veškeré získané zlato o 3% za úroveň.", maxLevel: 10, currentLevel:0, cost: (level) => 1 + Math.floor(level/2), effectType: 'gold_multiplier_all_percent', effectValue: 0.03, branch: 'basic', requires: 'increasedClickDamage' },
    echoAffinity: { name: "Echo Příbuznost", description: "Zvyšuje množství získaných Echo Úlomků z Echa o 5% za úroveň.", maxLevel: 5, currentLevel:0, cost: (level) => 2 + level, effectType: 'echo_shard_multiplier_percent', effectValue: 0.05, branch: 'basic', requires: 'goldVeins' },
    critChanceBoost: { name: "Ostříží Zrak", description: "Zvyšuje šanci na kritický zásah o 0.5% za úroveň.", maxLevel: 10, currentLevel:0, cost: (level) => 2 + level, effectType: 'crit_chance_bonus_percent', effectValue: 0.005, branch: 'crit' },
    critDamageBoost: { name: "Brutální Síla", description: "Zvyšuje poškození kritickým zásahem o 10% (multiplikativně) za úroveň.", maxLevel: 10, currentLevel:0, cost: (level) => 2 + level, effectType: 'crit_damage_multiplier_bonus_percent', effectValue: 0.10, branch: 'crit', requires: 'critChanceBoost' }, 
    ultimateCritMastery: { name: "Smrtící Přesnost", description: "Každých 20 kliknutí je zaručený kritický zásah.", maxLevel: 1, currentLevel:0, cost: () => 10, effectType: 'guaranteed_crit_every_x_hits', effectValue: 20, branch: 'crit', requires: 'critDamageBoost', isUltimate: true },
    passivePercentFlatBoostTalent: { name: "Trvalý Oheň (%HP)", description: "Přidává +0.01% max HP/s k pasivnímu poškození za úroveň.", maxLevel: 10, currentLevel:0, cost: (level) => 2 + level, effectType: 'passive_percent_flat_boost_talent', effectValue: 0.0001, branch: 'passive_dps' },
    passivePercentMultiplierTalent: { name: "Síla Aury (%HP)", description: "Zvyšuje veškeré pasivní poškození (%HP/s) o 5% za úroveň.", maxLevel: 10, currentLevel:0, cost: (level) => 3 + level, effectType: 'all_passive_percent_multiplier_talent', effectValue: 0.05, branch: 'passive_dps', requires: 'passivePercentFlatBoostTalent'},
    ultimateAuraOfDecay: { name: "Aura Rozkladu", description: "Nepřátelé ztrácí 0.5% svého MAX. zdraví za sekundu (max. 500 DPS).", maxLevel: 1, currentLevel:0, cost: () => 15, effectType: 'aura_percent_health_damage', effectValue: { percent: 0.005, cap: 500 }, branch: 'passive_dps', requires: 'passivePercentMultiplierTalent', isUltimate: true },
};

const allArtifacts = { 
    'relic_dmg_01': {
        id: 'relic_dmg_01', name: "Střípek Prastaré Síly", descriptionFormat: "+{bonusValue}% k veškerému poškození.",
        baseBonusValue: 0.1, bonusPerLevel: 0.1, valueType: 'percent_actual_for_calc_multiplied_for_display', 
        bonusType: 'all_damage_percent_additive', icon: '✨', source: 'boss_drop', maxLevel: 20 
    },
    'relic_gold_01': {
        id: 'relic_gold_01', name: "Okem Zlatokopa", descriptionFormat: "+{bonusValue}% zlata navíc z nepřátel.",
        baseBonusValue: 1, bonusPerLevel: 0.5, valueType: 'percent_direct_for_calc_multiplied_for_display',
        bonusType: 'gold_bonus_percent_additive', icon: '💰', source: 'boss_drop', maxLevel: 20
    },
    'relic_echo_double_01': { 
        id: 'relic_echo_double_01', name: "Rezonující Krystal", descriptionFormat: "{bonusValue}% šance na dvojnásobný zisk Echo Úlomků.",
        baseBonusValue: 1, bonusPerLevel: 0.2, valueType: 'percent_direct_for_calc_multiplied_for_display', 
        bonusType: 'echo_shard_double_chance', icon: '🔮', source: 'boss_drop', maxLevel: 25 
    },
    'relic_passive_percent_flat_01': {
        id: 'relic_passive_percent_flat_01', name: "Šepot Věčnosti (%HP)", descriptionFormat: "+{bonusValue}% max HP/s pasivně.",
        baseBonusValue: 0.0001, bonusPerLevel: 0.00005, valueType: 'percent_actual_for_calc_multiplied_for_display',
        bonusType: 'passive_percent_flat_additive', icon: '🌀', source: 'boss_drop', maxLevel: 50
    },
    'relic_cooldown_power_strike_01': {
        id: 'relic_cooldown_power_strike_01', name: "Chronometronové Ozubené Kolečko", descriptionFormat: "-{bonusValue}% k cooldownu Mocného úderu.",
        baseBonusValue: 2, bonusPerLevel: 0.5, valueType: 'percent_direct_for_calc_multiplied_for_display', 
        bonusType: 'cooldown_reduction_power_strike_percent', icon: '⏱️', source: 'boss_drop', maxLevel: 10
    },
    'relic_crit_chance_01': {
        id: 'relic_crit_chance_01', name: "Oko Predátora", descriptionFormat: "+{bonusValue}% šance na kritický zásah.",
        baseBonusValue: 0.005, bonusPerLevel: 0.0025, valueType: 'percent_actual_for_calc_multiplied_for_display',
        bonusType: 'crit_chance_percent_additive', icon: '🎯', source: 'boss_drop', maxLevel: 20
    }
};

const allPossibleQuests = [
    { id: 'dq_kill_champions_5', description: "Poraz 5 Šampionů", actionType: 'championKill', target: 5, rewardType: 'echo_shards', rewardAmount: 25, icon: '🏆' },
    { id: 'dq_earn_gold_10k', description: "Nasbírej 10000 Zlata (v tomto sezení)", actionType: 'goldEarnedQuest', target: 10000, rewardType: 'gold', rewardAmount: 5000, icon: '💰' },
    { id: 'dq_use_power_strike_3', description: "Použij Mocný úder 3x", actionType: 'powerStrikeUsed', target: 3, rewardType: 'echo_shards', rewardAmount: 15, icon: '💥' },
    { id: 'dq_defeat_enemies_50', description: "Poraz 50 nepřátel", actionType: 'enemyKill', target: 50, rewardType: 'gold', rewardAmount: 2500, icon: '💀' },
    { id: 'dq_reach_zone_3', description: "Dosáhni Zóny 3 (v aktuálním světě)", actionType: 'zoneReached', target: 3, rewardType: 'echo_shards', rewardAmount: 10, icon: '🗺️' },
    { id: 'dq_collect_companion_essence_5', description: "Nasbírej 5 Esencí Společníků", actionType: 'companionEssenceCollected', target: 5, rewardType: 'echo_shards', rewardAmount: 20, icon: '🐾'}
];

const allCompanions = {
    'bat_companion': {
        id: 'bat_companion', name: "Věrný Netopýr", icon: '🦇', description: "Malý netopýr, který ti pomáhá útočit.",
        basePassivePercent: 0.0002, passivePercentPerLevel: 0.0001, maxLevel: 50,
        unlockCost: 5000,  upgradeBaseCost: 20, upgradeCostMultiplier: 1.15, source: 'shop',
        skillTree: {
            'bat_faster_attacks': { 
                id: 'bat_faster_attacks', name: "Rychlejší Útoky", 
                description: "Zvyšuje efektivitu pasivního poškození netopýra o {bonusValue}%.", 
                maxLevel: 10, 
                cost: (level) => 2 + level, 
                effectType: 'companion_damage_multiplier_percent', 
                effectValuePerLevel: 0.05, 
                icon: '💨'
            },
            'bat_life_steal': {
                id: 'bat_life_steal', name: "Vysátí Zlata",
                description: "Dává {bonusValue}% šanci, že útok netopýra okamžitě přidá malé množství zlata.",
                maxLevel: 5,
                cost: (level) => 5 + level * 2,
                effectType: 'companion_gold_on_hit_chance', 
                effectValuePerLevel: 0.01, 
                goldAmount: (compLevel) => 10 + compLevel * 2, 
                icon: '💰',
                requires: { skill: 'bat_faster_attacks', level: 3 } 
            }
        }
    },
    'wolf_companion': {
        id: 'wolf_companion', name: "Mystický Vlk", icon: '🐺', description: "Silný vlk, který způsobuje značné poškození.",
        basePassivePercent: 0.001, passivePercentPerLevel: 0.0004, maxLevel: 30,
        unlockCost: 25000, upgradeBaseCost: 100, upgradeCostMultiplier: 1.20, source: 'shop',
        skillTree: {
            'wolf_stronger_fangs': {
                id: 'wolf_stronger_fangs', name: "Silnější Tesáky",
                description: "Zvyšuje základní pasivní poškození vlka o {bonusValue}%.",
                maxLevel: 10,
                cost: (level) => 3 + level,
                effectType: 'companion_base_damage_increase_percent', 
                effectValuePerLevel: 0.10, 
                icon: '🦷'
            },
            'wolf_pack_howl': {
                id: 'wolf_pack_howl', name: "Vytí Smečky",
                description: "Pasivně zvyšuje veškeré poškození hráče o {bonusValue}%, když je vlk aktivní.",
                maxLevel: 5,
                cost: (level) => 10 + level * 3,
                effectType: 'global_player_damage_percent_if_active', 
                effectValuePerLevel: 0.005, 
                icon: '🗣️',
                requires: { skill: 'wolf_stronger_fangs', level: 5}
            }
        }
    },
    'golem_guardian': {
        id: 'golem_guardian', name: "Golem Strážce", icon: '🛡️', description: "Robustní golem s vysokým základním poškozením.",
        basePassivePercent: 0.0015, passivePercentPerLevel: 0.0003, maxLevel: 25,
        unlockCost: 75000, upgradeBaseCost: 250, upgradeCostMultiplier: 1.22, source: 'shop',
        skillTree: {
            'golem_fortitude': {
                id: 'golem_fortitude', name: "Opevnění",
                description: "Zvyšuje základní pasivní poškození golema o {bonusValue}%.",
                maxLevel: 10,
                cost: (level) => 4 + level * 2,
                effectType: 'companion_base_damage_increase_percent',
                effectValuePerLevel: 0.08, 
                icon: '🧱'
            },
            'golem_taunt': {
                id: 'golem_taunt', name: "Posměch",
                description: "Malá šance, že nepřítel na okamžik způsobí menší poškození hráči (efekt zatím není implementován).",
                maxLevel: 3,
                cost: (level) => 15 + level * 5,
                effectType: 'enemy_damage_reduction_chance', 
                effectValuePerLevel: 0.02, 
                icon: '😠'
            }
        }
    },
    'fire_sprite': {
        id: 'fire_sprite', name: "Ohnivý Skřítek", icon: '🔥', description: "Mrštný skřítek, který může nepřátele popálit.",
        basePassivePercent: 0.0005, passivePercentPerLevel: 0.00015, maxLevel: 40,
        unlockCost: 40000, upgradeBaseCost: 70, upgradeCostMultiplier: 1.18, source: 'shop',
        skillTree: {
            'sprite_kindle': {
                id: 'sprite_kindle', name: "Rozdmýchání",
                description: "Zvyšuje efektivitu pasivního poškození skřítka o {bonusValue}%.",
                maxLevel: 10,
                cost: (level) => 3 + level,
                effectType: 'companion_damage_multiplier_percent',
                effectValuePerLevel: 0.06, 
                icon: '♨️'
            },
            'sprite_burning_aura': {
                id: 'sprite_burning_aura', name: "Spalující Aura",
                description: "Přidává malý dodatečný pasivní %HP/s efekt všem společníkům ({bonusValue}%).",
                maxLevel: 5,
                cost: (level) => 20 + level * 4,
                effectType: 'global_companion_passive_percent_flat_boost', 
                effectValuePerLevel: 0.00005, 
                icon: '☄️',
                requires: { skill: 'sprite_kindle', level: 4}
            }
        }
    },
    'forest_dryad': {
        id: 'forest_dryad', name: "Lesní Dryáda", icon: '🌿', description: "Mystické stvoření lesa, které pomáhá shromažďovat zdroje.",
        basePassivePercent: 0.0001, passivePercentPerLevel: 0.00005, maxLevel: 60,
        unlockCost: 100000, upgradeBaseCost: 50, upgradeCostMultiplier: 1.16, source: 'shop',
        skillTree: {
            'dryad_gold_blessing': {
                id: 'dryad_gold_blessing', name: "Zlaté Požehnání",
                description: "Zvyšuje veškerý zisk zlata hráče o {bonusValue}%, když je dryáda aktivní.",
                maxLevel: 10,
                cost: (level) => 5 + level * 2,
                effectType: 'global_player_gold_multiplier_percent_if_active', 
                effectValuePerLevel: 0.01, 
                icon: '🌟'
            },
            'dryad_essence_whisper': {
                id: 'dryad_essence_whisper', name: "Šepot Esencí",
                description: "Zvyšuje šanci na zisk Esencí Společníků o {bonusValue}% (absolutní bonus).",
                maxLevel: 5,
                cost: (level) => 25 + level * 5,
                effectType: 'global_companion_essence_drop_chance_additive_percent', 
                effectValuePerLevel: 0.005, 
                icon: '✨',
                requires: { skill: 'dryad_gold_blessing', level: 3}
            }
        }
    }
};

const allExpeditions = {
    'exp_short_gold_hunt': {
        id: 'exp_short_gold_hunt',
        name: "Krátký Lov Zlata",
        description: "Rychlá výprava za trochou zlata navíc.",
        icon: '💰',
        durationSeconds: 60 * 5, 
        cost: { gold: 5000 }, 
        requiredCompanions: 1, 
        difficulty: 1, 
        possibleRewards: [
            { type: 'gold', baseAmountMin: 7500, baseAmountMax: 15000, chance: 1.0 } 
        ],
        unlockCondition: () => gameState.playerLevel >= 5,
        unlockConditionText: "Vyžaduje Úroveň Hráče: 5"
    },
    'exp_medium_shard_search': {
        id: 'exp_medium_shard_search',
        name: "Pátrání po Úlomcích",
        description: "Delší výprava s šancí na zisk Echo Úlomků.",
        icon: '🔮',
        durationSeconds: 60 * 30, 
        cost: { gold: 20000 },
        requiredCompanions: 2,
        difficulty: 3,
        possibleRewards: [
            { type: 'echo_shards', baseAmountMin: 5, baseAmountMax: 15, chance: 0.7 }, 
            { type: 'gold', baseAmountMin: 10000, baseAmountMax: 30000, chance: 0.3 }  
        ],
        unlockCondition: () => gameState.playerLevel >= 10 && gameState.echoCount >= 1,
        unlockConditionText: "Vyžaduje Úroveň Hráče: 10 & Počet Ech: 1"
    },
    'exp_long_artifact_recon': {
        id: 'exp_long_artifact_recon',
        name: "Průzkum Artefaktů",
        description: "Náročná výprava s malou šancí na nalezení artefaktu.",
        icon: '🗺️',
        durationSeconds: 60 * 60 * 2, 
        cost: { echo_shards: 25 }, 
        requiredCompanions: 3,
        difficulty: 5,
        possibleRewards: [
            { type: 'artifact_chance', artifactPool: 'boss_drop', chance: 0.1 }, 
            { type: 'companion_essence', baseAmountMin: 3, baseAmountMax: 7, chance: 0.5 },
            { type: 'echo_shards', baseAmountMin: 20, baseAmountMax: 50, chance: 0.4 }
        ],
        unlockCondition: () => gameState.playerLevel >= 20 && gameState.echoCount >= 2 && Object.keys(gameState.ownedArtifactsData).length > 0,
        unlockConditionText: "Vyžaduje Úr. Hráče: 20, Počet Ech: 2 & Alespoň 1 Artefakt"
    }
};


const enemySVGs = [ 
    '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="#A7F3D0"/><circle cx="40" cy="40" r="5" fill="black"/><circle cx="60" cy="40" r="5" fill="black"/><path d="M 40 60 Q 50 70 60 60" stroke="black" fill="transparent"/></svg>', 
    '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="25" y="30" width="50" height="60" rx="10" fill="#86EFAC"/><circle cx="40" cy="50" r="5" fill="red"/><circle cx="60" cy="50" r="5" fill="red"/><rect x="35" y="70" width="30" height="10" fill="brown"/></svg>', 
    '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M30 90 Q50 70 70 90 Q90 50 70 20 Q50 40 30 20 Q10 50 30 90Z" fill="#E0E7FF"/><circle cx="45" cy="45" r="4" fill="black"/><circle cx="55" cy="45" r="4" fill="black"/></svg>', 
    '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M10 30 L50 70 L90 30 L75 50 L50 20 L25 50 Z" fill="#6B7280"/><circle cx="40" cy="35" r="3" fill="red"/><circle cx="60" cy="35" r="3" fill="red"/></svg>', 
    '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="20" width="40" height="70" rx="5" fill="#A3A3A3"/><ellipse cx="50" cy="20" rx="25" ry="10" fill="#737373"/><circle cx="40" cy="30" r="3" fill="yellow"/><circle cx="60" cy="30" r="3" fill="yellow"/></svg>', 
    '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="10" width="60" height="80" rx="15" fill="#78716C"/><circle cx="40" cy="30" r="6" fill="#FBBF24"/><circle cx="60" cy="30" r="6" fill="#FBBF24"/><rect x="30" y="50" width="40" height="10" fill="#57534E"/></svg>', 
    '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 10 C 40 30, 30 30, 20 50 C 30 70, 40 80, 50 90 C 60 80, 70 70, 80 50 C 70 30, 60 30, 50 10 Z" fill="#FB923C"/><circle cx="45" cy="40" r="5" fill="yellow"/><circle cx="55" cy="40" r="5" fill="yellow"/><path d="M40 60 Q50 50 60 60" stroke="red" stroke-width="3" fill="transparent"/></svg>'
];
const enemyNames = ["Slizoun", "Goblin", "Duch", "Netopýr", "Skřetí Pařez", "Kamenný Golem", "Ohnivý Skřítek"];

const allResearchProjects = {
    'research_echo_amp_1': {
        id: 'research_echo_amp_1', name: "Zesílení Echa I", 
        description: "Zvyšuje množství získaných Echo Úlomků o {bonusValue}%.",
        maxLevel: 10, category: 'Echo', icon: '🔮',
        cost: (level) => 15 + Math.floor(Math.pow(level + 1, 2.2) * 5), 
        effectType: 'research_echo_shard_multiplier_percent', baseEffectValue: 0, effectValuePerLevel: 0.02, 
        requires: null 
    },
    'research_gold_synth_1': {
        id: 'research_gold_synth_1', name: "Syntéza Zlata I",
        description: "Zvyšuje veškerý zisk zlata o {bonusValue}%.",
        maxLevel: 15, category: 'Ekonomika', icon: '💰',
        cost: (level) => 10 + Math.floor(Math.pow(level + 1, 2.1) * 4),
        effectType: 'research_gold_multiplier_all_percent', baseEffectValue: 0, effectValuePerLevel: 0.01, 
        requires: null
    },
     'research_kinetic_studies_1': {
        id: 'research_kinetic_studies_1', name: "Kinetické Studie I",
        description: "Zvyšuje veškeré poškození kliknutím o {bonusValue}%.",
        maxLevel: 15, category: 'Boj', icon: '⚔️',
        cost: (level) => 12 + Math.floor(Math.pow(level + 1, 2.15) * 4.5),
        effectType: 'research_click_damage_multiplier_percent', baseEffectValue: 0, effectValuePerLevel: 0.015, 
        requires: null
    },
    'research_comp_synergy_1': {
        id: 'research_comp_synergy_1', name: "Synergie Společníků I",
        description: "Zvyšuje veškeré pasivní poškození od společníků o {bonusValue}%.",
        maxLevel: 10, category: 'Společníci', icon: '🐾',
        cost: (level) => 20 + Math.floor(Math.pow(level + 1, 2.3) * 6),
        effectType: 'research_companion_damage_multiplier_percent', baseEffectValue: 0, effectValuePerLevel: 0.025, 
        requires: null
    },
    'research_artifact_lore_1': {
        id: 'research_artifact_lore_1', name: "Znalost Artefaktů I",
        description: "Zvyšuje šanci na nalezení artefaktu o {bonusValue}% (absolutní bonus).",
        maxLevel: 5, category: 'Průzkum', icon: '📜',
        cost: (level) => 50 + Math.floor(Math.pow(level + 1, 2.5) * 20),
        effectType: 'research_artifact_drop_chance_additive_percent', baseEffectValue: 0, effectValuePerLevel: 0.005, 
        requires: 'research_echo_amp_1' 
    }
};

const allEssences = {
    'essence_click_damage': {
        id: 'essence_click_damage', name: "Esence Úderu", icon: '💥',
        description: "Zvyšuje veškeré poškození kliknutím o {bonusValue}%.",
        maxLevel: 20, category: 'Boj',
        cost: (level) => 25 + Math.floor(Math.pow(level + 1, 2.3) * 8), 
        effectType: 'essence_click_damage_multiplier_percent', baseEffectValue: 0, effectValuePerLevel: 0.02, 
    },
    'essence_gold_gain': {
        id: 'essence_gold_gain', name: "Esence Hojnosti", icon: '🌟',
        description: "Zvyšuje veškerý zisk zlata o {bonusValue}%.",
        maxLevel: 20, category: 'Ekonomika',
        cost: (level) => 20 + Math.floor(Math.pow(level + 1, 2.2) * 7),
        effectType: 'essence_gold_multiplier_all_percent', baseEffectValue: 0, effectValuePerLevel: 0.015, 
    },
    'essence_echo_shards': {
        id: 'essence_echo_shards', name: "Esence Šepotu Věčnosti", icon: '🌌',
        description: "Zvyšuje zisk Echo Úlomků při Echu o {bonusValue}%.",
        maxLevel: 10, category: 'Echo',
        cost: (level) => 100 + Math.floor(Math.pow(level + 1, 2.8) * 25),
        effectType: 'essence_echo_shard_multiplier_percent', baseEffectValue: 0, effectValuePerLevel: 0.01, 
    },
    'essence_crit_chance': {
        id: 'essence_crit_chance', name: "Esence Přesnosti", icon: '🎯',
        description: "Zvyšuje šanci na kritický zásah o {bonusValue}% (absolutní bonus).",
        maxLevel: 10, category: 'Boj',
        cost: (level) => 75 + Math.floor(Math.pow(level + 1, 2.6) * 15),
        effectType: 'essence_crit_chance_additive_percent', baseEffectValue: 0, effectValuePerLevel: 0.002, 
    },
    'essence_passive_dps': {
        id: 'essence_passive_dps', name: "Esence Trvalosti", icon: '⏳',
        description: "Zvyšuje veškeré pasivní %HP poškození o {bonusValue}%.",
        maxLevel: 15, category: 'Pasivní',
        cost: (level) => 50 + Math.floor(Math.pow(level + 1, 2.4) * 10),
        effectType: 'essence_passive_dps_multiplier_percent', baseEffectValue: 0, effectValuePerLevel: 0.02, 
    }
};

const allMilestonesConfig = [ 
    { 
        id: 'zone_5_world_1', 
        description: 'Dosáhni Zóny 5 ve Světě 1', 
        condition: () => gameState.currentWorld >= 1 && gameState.currentZoneInWorld >= 5, 
        rewardText: '+5 EÚ', 
        applyReward: () => { gameState.echoShards += 5; if (typeof soundManager !== 'undefined') soundManager.playSound('milestone', 'G5', '4n'); }, 
        perEcho: true 
    },
    { 
        id: 'player_level_5', 
        description: 'Dosáhni úrovně hráče 5', 
        condition: () => gameState.playerLevel >= 5, 
        rewardText: '+1 Talentový Bod', 
        applyReward: () => { gameState.talentPoints += 1; if (typeof soundManager !== 'undefined') soundManager.playSound('milestone', 'A5', '4n'); }, 
        perEcho: false 
    },
    { 
        id: 'total_gold_1000_echo', 
        description: 'Nasbírej 1000 zlata v tomto Echu', 
        condition: () => gameState.totalGoldEarnedThisEcho >= 1000, 
        rewardText: '+10 EÚ', 
        applyReward: () => { gameState.echoShards += 10; if (typeof soundManager !== 'undefined') soundManager.playSound('milestone', 'B5', '4n'); }, 
        perEcho: true 
    },
    { 
        id: 'enemies_killed_100_echo', 
        description: 'Poraz 100 nepřátel v tomto Echu', 
        condition: () => gameState.enemiesKilledThisEcho >= 100, 
        rewardText: '+10 EÚ', 
        applyReward: () => { gameState.echoShards += 10; if (typeof soundManager !== 'undefined') soundManager.playSound('milestone', 'C6', '4n'); }, 
        perEcho: true 
    },
    { 
        id: 'first_echo', 
        description: 'Proveď své první Echo', 
        condition: () => gameState.echoCount >= 1, 
        rewardText: 'Odemkni Zlatou Horečku (pasivní)', 
        applyReward: () => { if (typeof soundManager !== 'undefined') soundManager.playSound('milestone', 'D6', '2n'); }, 
        perEcho: false 
    }, 
    { 
        id: 'total_echo_shards_50', 
        description: 'Nasbírej celkem 50 Echo Úlomků', 
        condition: () => gameState.lifetimeStats.lifetimeEchoShardsEarned >= 50, 
        rewardText: '+5% k pasivnímu příjmu zlata (trvale)', 
        applyReward: () => { gameState.echoPermanentGoldBonus += 0.05; if (typeof soundManager !== 'undefined') soundManager.playSound('milestone', 'E6', '2n'); }, 
        perEcho: false 
    },
    { 
        id: 'echo_count_3', 
        description: 'Proveď 3 Echa', 
        condition: () => gameState.echoCount >= 3, 
        rewardText: '+10% k poškození kliknutím (trvale)', 
        applyReward: () => { gameState.echoPermanentDamageBonus += 0.10; if (typeof soundManager !== 'undefined') soundManager.playSound('milestone', 'F#6', '2n'); }, 
        perEcho: false 
    },
    { 
        id: 'player_level_10', 
        description: 'Dosáhni úrovně hráče 10', 
        condition: () => gameState.playerLevel >= 10, 
        rewardText: '+2 Talentové Body', 
        applyReward: () => { gameState.talentPoints += 2; if (typeof soundManager !== 'undefined') soundManager.playSound('milestone', 'G6', '2n'); }, 
        perEcho: false 
    },
    { 
        id: 'reach_world_2', 
        description: 'Dosáhni Světa 2', 
        condition: () => gameState.currentWorld >= 2, 
        rewardText: '+25 EÚ', 
        applyReward: () => { gameState.echoShards += 25; if (typeof soundManager !== 'undefined') soundManager.playSound('milestone', 'A6', '1n'); }, 
        perEcho: true 
    },
    { 
        id: 'reach_tier_1', 
        description: 'Dosáhni Tieru 1 (Dřevěné)', 
        condition: () => gameState.currentTierIndex >= 1, 
        rewardText: '+10 EÚ', 
        applyReward: () => { gameState.echoShards += 10; if (typeof soundManager !== 'undefined') soundManager.playSound('milestone', 'B6', '1n'); }, 
        perEcho: false 
    }, 
    {
        id: 'unlock_first_companion',
        description: 'Odemkni svého prvního společníka',
        condition: () => Object.keys(gameState.ownedCompanions).length > 0,
        rewardText: '+5 Esencí Společníků',
        applyReward: () => { gameState.companionEssence = (gameState.companionEssence || 0) + 5; if (typeof soundManager !== 'undefined') soundManager.playSound('milestone', 'C#6', '4n'); },
        perEcho: false
    },
    {
        id: 'complete_first_expedition',
        description: 'Dokonči svou první výpravu',
        condition: () => gameState.lifetimeStats.expeditionsCompletedTotal >= 1,
        rewardText: '+10 Esencí Společníků',
        applyReward: () => { gameState.companionEssence = (gameState.companionEssence || 0) + 10; if (typeof soundManager !== 'undefined') soundManager.playSound('milestone', 'D#6', '4n'); },
        perEcho: false
    }
];

const SAVE_KEY = 'echoesOfInfinitySave_v34_offline_progress'; 
const talentPointGainPerLevel = 1;

// Vlajka pro signalizaci načtení konfigurace
window.gameConfigLoaded = true;
// console.log("Config.js loaded and gameConfigLoaded set to true.");