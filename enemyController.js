// SOUBOR: enemyController.js

/**
 * Spawne nového nepřítele s odpovídajícími statistikami na základě aktuálního světa a zóny.
 * Aktualizuje globální objekt 'enemy' v gameState.js.
 */
function spawnNewEnemy() {
    const worldZoneBaseLevel = ((gameState.currentWorld - 1) * ZONES_PER_WORLD * 10) + ((gameState.currentZoneInWorld - 1) * 10);
    const levelOffsetInZone = Math.floor(gameState.enemiesDefeatedInZone / (ENEMIES_PER_ZONE / 10));

    gameState.enemy.effectiveLevel = worldZoneBaseLevel + levelOffsetInZone + 1;

    if (gameState.enemy.effectiveLevel > gameState.highestEffectiveLevelReachedThisEcho) {
        gameState.highestEffectiveLevelReachedThisEcho = gameState.enemy.effectiveLevel;
    }

    const monsterNumberInZone = gameState.enemiesDefeatedInZone + 1;
    gameState.enemy.isBoss = (monsterNumberInZone >= ENEMIES_PER_ZONE);
    gameState.enemy.isChampion = !gameState.enemy.isBoss && (monsterNumberInZone % 10 === 0);

    let healthMultiplier = 1;
    let goldMultiplier = 1;

    if (gameState.enemy.isBoss) {
        healthMultiplier = 10;
        goldMultiplier = 5;
        gameState.bossFightTimerActive = true;
        gameState.bossFightTimeLeft = BOSS_FIGHT_DURATION;
        gameState.bossFightInitialDuration = BOSS_FIGHT_DURATION;
        if (typeof showMessageBox === 'function') showMessageBox("Boss se objevil!", false, 2000);
        if (typeof soundManager !== 'undefined') soundManager.playSound('bossDefeat', 'C3', '2n'); // Použijeme zvuk pro objevení bosse
    } else if (gameState.enemy.isChampion) {
        healthMultiplier = 3;
        goldMultiplier = 2.5;
        if (typeof showMessageBox === 'function') showMessageBox("Šampion se objevil!", false, 1500);
         if (typeof soundManager !== 'undefined') soundManager.playSound('championDefeat', undefined, '4n');
    }

    const baseHealth = 10 * Math.pow(1.25, gameState.enemy.effectiveLevel -1) * healthMultiplier;
    const baseGold = 5 * Math.pow(1.10, gameState.enemy.effectiveLevel -1) * goldMultiplier;

    gameState.enemy.maxHealth = Math.ceil(baseHealth);
    gameState.enemy.currentHealth = gameState.enemy.maxHealth;
    gameState.enemy.goldReward = Math.ceil(baseGold);

    // Nastavení jména a vzhledu nepřítele
    // enemyNames a enemySVGs jsou pole z config.js
    const baseNameIndex = (gameState.enemy.effectiveLevel - 1 + enemyNames.length) % enemyNames.length;
    gameState.enemy.name = (gameState.enemy.isBoss ? "Boss: " : (gameState.enemy.isChampion ? "Šampion: " : "")) + enemyNames[baseNameIndex];

    if (enemyArtElement) { // enemyArtElement je DOM element z uiController.js
        if (enemyNames[baseNameIndex] === "Slizoun" || baseNameIndex === 0) { // Pokud je to první/defaultní nepřítel "Slizoun"
            enemyArtElement.innerHTML = '<img src="/assets/slizoun_Normal.gif" alt="Slizoun" style="width:100%; height:100%; object-fit:contain;">';
        } else if (typeof enemySVGs !== 'undefined' && enemySVGs.length > 0) {
            enemyArtElement.innerHTML = enemySVGs[baseNameIndex % enemySVGs.length];
        } else {
            enemyArtElement.innerHTML = ''; // Fallback, pokud nic není definováno
        }
    }

    if (typeof updateUI === 'function') updateUI(); // Funkce z uiController.js
}


/**
 * Zpracuje kliknutí na nepřítele.
 * @param {MouseEvent} event - Událost kliknutí.
 */
function handleEnemyClick(event) {
    if (!gameState.enemy || gameState.enemy.currentHealth <= 0) return;

    let damageDealt = gameState.effectiveClickDamage;
    let isCrit = false;

    // Zvýšení počtu kliknutí
    gameState.lifetimeStats.totalClicks++;
    gameState.clicksSinceLastGuaranteedCrit++;

    // Kontrola garantovaného kritického zásahu z talentu
    let guaranteedCritTalentActive = false;
    if (talents.ultimateCritMastery && talents.ultimateCritMastery.currentLevel > 0) {
        if (gameState.clicksSinceLastGuaranteedCrit >= talents.ultimateCritMastery.effectValue) {
            isCrit = true;
            guaranteedCritTalentActive = true;
            gameState.clicksSinceLastGuaranteedCrit = 0; // Reset počítadla
        }
    }

    // Pokud nebyl garantovaný krit, zkusíme normální šanci na krit
    if (!isCrit && Math.random() < gameState.effectiveCritChance) {
        isCrit = true;
    }

    if (isCrit) {
        let currentCritMultiplier = critDamageMultiplier; // Základní násobek z configu
        if (talents.critDamageBoost.currentLevel > 0) {
            currentCritMultiplier *= (1 + talents.critDamageBoost.effectValue * talents.critDamageBoost.currentLevel);
        }
        damageDealt *= currentCritMultiplier;
        gameState.lifetimeStats.totalCrits++;
        if (typeof soundManager !== 'undefined') soundManager.playSound('critClick', 'E5', '16n');
    } else {
        if (typeof soundManager !== 'undefined') soundManager.playSound('click', 'C4', '16n');
    }

    // Aplikace Mocného úderu
    if (gameState.mocnyUderActive) {
        damageDealt *= MOCNY_UDER_DAMAGE_MULTIPLIER;
    }

    damageDealt = Math.ceil(damageDealt);
    gameState.enemy.currentHealth -= damageDealt;

    if (typeof showDamageNumber === 'function') { // showDamageNumber z uiController.js
        const clickX = event.clientX;
        const clickY = event.clientY;
        showDamageNumber(damageDealt, clickX, clickY, isCrit);
    }

    if (damageDealt > gameState.lifetimeStats.highestDamageDealt) {
        gameState.lifetimeStats.highestDamageDealt = damageDealt;
    }

    if (gameState.enemy.currentHealth <= 0) {
        onEnemyDefeated();
    }

    if (typeof updateUI === 'function') updateUI();
}

/**
 * Zpracuje poražení nepřítele.
 */
function onEnemyDefeated() {
    let goldEarned = gameState.enemy.goldReward;
    let xpEarned = gameState.enemy.effectiveLevel; // Základní XP

    // Aplikace Zlaté horečky (aktivní)
    if (gameState.zlataHoreckaAktivniActive) {
        goldEarned *= ZLATA_HORECKA_AKTIVNI_GOLD_MULTIPLIER;
    }
    // Aplikace Zlaté horečky (pasivní buff)
    if (gameState.activeBuffs[BUFF_TYPE_GOLD_RUSH]) {
        goldEarned *= GOLD_RUSH_MULTIPLIER;
    }

    // Bonus zlata z talentů a artefaktů se aplikuje v updateUI/gameTick, ale zde můžeme přidat multiplikátor pro zobrazení
    let goldMultiplierForDisplay = gameState.echoPermanentGoldBonus;
     if (talents.goldVeins.currentLevel > 0) {
        goldMultiplierForDisplay *= (1 + talents.goldVeins.effectValue * talents.goldVeins.currentLevel);
    }
    if (typeof getArtifactBonus === 'function') {
        goldMultiplierForDisplay *= (1 + (getArtifactBonus('gold_bonus_percent_additive') / 100));
    }
     if (typeof getResearchBonus === 'function') {
        goldMultiplierForDisplay *= (1 + getResearchBonus('research_gold_multiplier_all_percent'));
    }
    if (typeof getEssenceBonus === 'function') {
        goldMultiplierForDisplay *= (1 + getEssenceBonus('essence_gold_multiplier_all_percent'));
    }

    // Aplikace globálních bonusů od společníků
    if (gameState.ownedCompanions) {
        for (const companionId in gameState.ownedCompanions) {
            if (gameState.ownedCompanions.hasOwnProperty(companionId) && gameState.ownedCompanions[companionId].level > 0) {
                const globalGoldBonusFromCompanion = getCompanionSkillBonus(companionId, 'global_player_gold_multiplier_percent_if_active');
                if (globalGoldBonusFromCompanion > 0) {
                    goldMultiplierForDisplay *= (1 + globalGoldBonusFromCompanion);
                }
            }
        }
    }

    goldEarned = Math.floor(goldEarned * goldMultiplierForDisplay);


    gameState.gold += goldEarned;
    gameState.lifetimeStats.lifetimeGoldEarned += goldEarned;
    gameState.totalGoldEarnedThisEcho += goldEarned;
    gameState.dailyQuestData.goldEarnedForQuestToday += goldEarned;


    if (typeof gainXP === 'function') gainXP(xpEarned); // gainXP je v playerController.js

    if (typeof showGoldGainAnimation === 'function') showGoldGainAnimation(goldEarned);

    gameState.enemiesDefeatedInZone++;
    gameState.lifetimeStats.totalEnemiesKilled++;
    gameState.enemiesKilledThisEcho++;

    if (typeof updateDailyQuestProgress === 'function') {
        updateDailyQuestProgress('enemyKill', 1);
        if (gameState.enemy.isChampion) updateDailyQuestProgress('championKill', 1);
    }


    if (gameState.enemy.isBoss) {
        gameState.lifetimeStats.totalBossesKilled++;
        if (typeof soundManager !== 'undefined') soundManager.playSound('bossDefeat', 'C4', '1n');
        if (typeof showMessageBox === 'function') showMessageBox(`Boss poražen! Získal jsi ${formatNumber(goldEarned)} zlata.`, false);

        // Šance na drop artefaktu
        if (typeof tryDropArtifact === 'function') tryDropArtifact();

        // Šance na drop esence společníků
        if (Math.random() < COMPANION_ESSENCE_DROP_CHANCE_FROM_BOSS) {
            if (typeof gainCompanionEssence === 'function') gainCompanionEssence(1);
        }


        // Reset pro další zónu/svět
        gameState.enemiesDefeatedInZone = 0;
        gameState.currentZoneInWorld++;
        if (gameState.currentZoneInWorld > ZONES_PER_WORLD) {
            gameState.currentZoneInWorld = 1;
            gameState.currentWorld++;
            if (gameState.currentWorld > MAX_WORLDS) {
                // Hráč dosáhl maximálního světa - co dál? Možná Echo nebo speciální zpráva.
                // Prozatím necháme hráče v posledním světě.
                gameState.currentWorld = MAX_WORLDS;
                if (typeof showMessageBox === 'function') showMessageBox("Gratulujeme! Dosáhl jsi posledního světa!", false, 5000);
            }
            if (typeof showMessageBox === 'function') showMessageBox(`Postupuješ do Světa ${gameState.currentWorld}!`, false, 2500);
            gameState.lifetimeStats.lifetimeTiersAdvanced++; // Počítáme jako "tier" postupu
        }
        gameState.bossFightTimerActive = false;
        gameState.bossFightTimeLeft = 0;

    } else if (gameState.enemy.isChampion) {
        gameState.lifetimeStats.totalChampionsKilled++;
        if (typeof soundManager !== 'undefined') soundManager.playSound('championDefeat', undefined, '2n');

        // Šance na drop esence společníků
        if (Math.random() < COMPANION_ESSENCE_DROP_CHANCE_FROM_CHAMPION) {
            if (typeof gainCompanionEssence === 'function') gainCompanionEssence(1);
        }

    } else {
        if (typeof soundManager !== 'undefined') soundManager.playSound('enemyDefeat', undefined, '8n');
    }


    // Náhodné buffy/debuffy
    if (Math.random() < POWER_SHARD_DROP_CHANCE) {
        if (typeof activateBuff === 'function') activateBuff(BUFF_TYPE_POWER_SHARD, POWER_SHARD_DURATION);
    }
    if (gameState.echoCount > 0 && Math.random() < GOLD_RUSH_DROP_CHANCE) {
        if (typeof activateBuff === 'function') activateBuff(BUFF_TYPE_GOLD_RUSH, GOLD_RUSH_DURATION);
    }
    if (Math.random() < PARASITE_APPLY_CHANCE && !gameState.activeDebuffs[DEBUFF_TYPE_PARASITE]) {
        if (typeof applyDebuff === 'function') applyDebuff(DEBUFF_TYPE_PARASITE, PARASITE_DURATION, PARASITE_GOLD_DRAIN_PER_SECOND);
    }

    spawnNewEnemy();
    if (typeof updateUI === 'function') updateUI();
    if (typeof checkMilestones === 'function') checkMilestones();
}


/**
 * Zpracuje situaci, kdy vyprší čas na poražení bosse.
 */
function handleBossFightTimeout() {
    if (typeof showMessageBox === 'function') showMessageBox(`Boss nebyl poražen včas! Zóna ${gameState.currentZoneInWorld} (Svět ${gameState.currentWorld}) se restartuje.`, true, 3000);
    gameState.bossFightTimerActive = false;
    gameState.bossFightTimeLeft = 0;
    gameState.enemiesDefeatedInZone = 0; // Reset postupu v zóně
    spawnNewEnemy(); // Spawn nového (pravděpodobně ne-boss) nepřítele
    if (typeof updateUI === 'function') updateUI();
}
