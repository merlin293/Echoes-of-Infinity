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
    } else {
        if (gameState.bossFightTimerActive && !gameState.enemy.isBoss) {
            gameState.bossFightTimerActive = false;
            gameState.bossFightTimeLeft = 0;
        }
    }

    if (gameState.enemy.isChampion) { 
        healthMultiplier = 5;  
        goldMultiplier = 3; 
    }

    healthMultiplier *= Math.max(0.5, 1 - (gameState.echoCount * 0.04)); 
    
    gameState.enemy.maxHealth = Math.ceil(
        8 * Math.pow(1.13 + (gameState.currentWorld * 0.0008) + (tiers[gameState.currentTierIndex].passivePercentBonus * 10) + (gameState.currentTierIndex * 0.0025) , gameState.enemy.effectiveLevel -1) * healthMultiplier
    ); 
    gameState.enemy.currentHealth = gameState.enemy.maxHealth;
    gameState.enemy.goldReward = Math.ceil(
        15 * Math.pow(1.15 + (gameState.currentWorld * 0.002) + (tiers[gameState.currentTierIndex].costMultiplier * 0.001) + (gameState.currentTierIndex * 0.0045), gameState.enemy.effectiveLevel -1) * goldMultiplier
    ); 
    
    let baseNameIndex = (gameState.enemy.effectiveLevel - 1 + enemyNames.length) % enemyNames.length; 
    let baseName = enemyNames[baseNameIndex];
    gameState.enemy.name = gameState.enemy.isBoss ? `BOSS ${baseName}` : (gameState.enemy.isChampion ? `Šampion ${baseName}` : baseName);
    
    if (typeof enemyArtElement !== 'undefined' && typeof enemySVGs !== 'undefined' && enemySVGs.length > 0) { 
        enemyArtElement.innerHTML = enemySVGs[baseNameIndex % enemySVGs.length]; 
    }
}

/**
 * Zpracuje útok hráče na nepřítele.
 * Volá se z hlavní herní smyčky nebo event listeneru.
 * @param {MouseEvent} event - Událost kliknutí myší (pro zobrazení čísla poškození).
 */
function handleEnemyClick(event) {
    if (!gameState.enemy || gameState.enemy.currentHealth <= 0) return; 
    
    gameState.lifetimeStats.totalClicks++; 
    
    let currentGoldMultiplierOnClick = gameState.echoPermanentGoldBonus; 
    if (talents.goldVeins.currentLevel > 0) { 
        currentGoldMultiplierOnClick *= (1 + talents.goldVeins.effectValue * talents.goldVeins.currentLevel);
    }
    if (typeof getResearchBonus === 'function') currentGoldMultiplierOnClick *= (1 + getResearchBonus('research_gold_multiplier_all_percent')); 
    if (typeof getEssenceBonus === 'function') currentGoldMultiplierOnClick *= (1 + getEssenceBonus('essence_gold_multiplier_all_percent')); 


    if (gameState.activeBuffs[BUFF_TYPE_GOLD_RUSH]) currentGoldMultiplierOnClick *= GOLD_RUSH_MULTIPLIER; 
    if (gameState.zlataHoreckaAktivniActive) currentGoldMultiplierOnClick *= ZLATA_HORECKA_AKTIVNI_GOLD_MULTIPLIER; 
    
    let artifactGoldBonus = 0;
    if (typeof getArtifactBonus === 'function') artifactGoldBonus = getArtifactBonus('gold_bonus_percent_additive') / 100; 
    currentGoldMultiplierOnClick *= (1 + artifactGoldBonus);

    let currentDamageDealt = gameState.effectiveClickDamage; 
    let isCrit = false;

    if (talents.ultimateCritMastery.currentLevel > 0) {
        gameState.clicksSinceLastGuaranteedCrit++; 
        if (gameState.clicksSinceLastGuaranteedCrit >= talents.ultimateCritMastery.effectValue) { 
            isCrit = true; 
            gameState.clicksSinceLastGuaranteedCrit = 0; 
        }
    }
    if (!isCrit) {
        isCrit = Math.random() < gameState.effectiveCritChance; 
    }

    if (isCrit) {
        let actualCritMultiplier = critDamageMultiplier; 
        if (talents.critDamageBoost.currentLevel > 0) {
            actualCritMultiplier *= (1 + talents.critDamageBoost.effectValue * talents.critDamageBoost.currentLevel);
        }
        currentDamageDealt *= actualCritMultiplier; 
        gameState.lifetimeStats.totalCrits++; 
        if (typeof soundManager !== 'undefined') soundManager.playSound('critClick', 'E5', '16n');
    } else {
        if (typeof soundManager !== 'undefined') soundManager.playSound('click', 'C4', '16n');
    }

    if (gameState.mocnyUderActive) {
        currentDamageDealt *= MOCNY_UDER_DAMAGE_MULTIPLIER; 
    }
    if (gameState.activeBuffs[BUFF_TYPE_POWER_SHARD]) { 
        currentDamageDealt *= POWER_SHARD_MULTIPLIER;
    }

    if (currentDamageDealt > gameState.lifetimeStats.highestDamageDealt) {
        gameState.lifetimeStats.highestDamageDealt = Math.ceil(currentDamageDealt);
    }
    
    gameState.enemy.currentHealth -= currentDamageDealt;
    
    if (gameState.gameSettings.showDamageNumbers && typeof showDamageNumber === 'function') { 
        showDamageNumber(currentDamageDealt, event.clientX, event.clientY, isCrit); 
    }

    // Zpracování efektů "zlato za zásah" od společníků při kliknutí
    if (typeof getCompanionSkillBonus === 'function' && typeof allCompanions !== 'undefined' && typeof gameState.ownedCompanions !== 'undefined') {
        for (const companionId in gameState.ownedCompanions) {
            if (gameState.ownedCompanions.hasOwnProperty(companionId) && gameState.ownedCompanions[companionId].level > 0) {
                const companionDef = allCompanions[companionId];
                const goldOnHitChance = getCompanionSkillBonus(companionId, 'companion_gold_on_hit_chance');
                if (goldOnHitChance > 0 && Math.random() < goldOnHitChance) {
                    // Najdeme definici dovednosti, abychom získali funkci goldAmount
                    let goldAmountFromSkill = 0;
                    if (companionDef.skillTree) {
                        for (const skillId in companionDef.skillTree) {
                            if (companionDef.skillTree[skillId].effectType === 'companion_gold_on_hit_chance' && typeof companionDef.skillTree[skillId].goldAmount === 'function') {
                                // Předpokládáme, že může být jen jedna taková dovednost, nebo sečteme efekty, pokud by jich bylo více
                                // Pro jednoduchost vezmeme první nalezenou.
                                goldAmountFromSkill = companionDef.skillTree[skillId].goldAmount(gameState.ownedCompanions[companionId].level);
                                break;
                            }
                        }
                    }
                    if (goldAmountFromSkill > 0) {
                        const actualGoldGained = Math.ceil(goldAmountFromSkill * currentGoldMultiplierOnClick); // Aplikujeme i globální gold multiplikátory
                        gameState.gold += actualGoldGained;
                        gameState.lifetimeStats.lifetimeGoldEarned += actualGoldGained;
                        gameState.totalGoldEarnedThisEcho += actualGoldGained;
                        if (typeof showGoldGainAnimation === 'function') showGoldGainAnimation(actualGoldGained);
                        if (typeof updateDailyQuestProgress === 'function') updateDailyQuestProgress('goldEarnedQuest', actualGoldGained);
                        // Můžeme přidat i specifickou zprávu nebo zvuk
                        // if (typeof showMessageBox === 'function') showMessageBox(`${companionDef.name} našel ${formatNumber(actualGoldGained)} zlata!`, false, 1000);
                    }
                }
            }
        }
    }


    if (gameState.enemy.currentHealth <= 0) {
        onEnemyDefeated(currentGoldMultiplierOnClick); 
    } else {
        if (typeof updateUI === 'function') updateUI(); 
        if (typeof checkMilestones === 'function') checkMilestones(); 
    } 
}

/**
 * Zpracuje logiku po poražení nepřítele.
 * @param {number} currentGoldMultiplier - Aktuální multiplikátor zlata pro tohoto nepřítele.
 */
function onEnemyDefeated(currentGoldMultiplier) {
    const goldFromKill = gameState.enemy.goldReward * currentGoldMultiplier;
    gameState.gold += goldFromKill; 
    gameState.lifetimeStats.lifetimeGoldEarned += goldFromKill;
    gameState.totalGoldEarnedThisEcho += goldFromKill; 
    
    if (typeof updateDailyQuestProgress === 'function') updateDailyQuestProgress('goldEarnedQuest', goldFromKill); 
    if (typeof showGoldGainAnimation === 'function') showGoldGainAnimation(goldFromKill); 

    if (gameState.enemy.isBoss) { 
        if (typeof soundManager !== 'undefined') soundManager.playSound('bossDefeat', 'G2', '1n');
        gameState.bossFightTimerActive = false; 
        gameState.bossFightTimeLeft = 0;       
        gameState.lifetimeStats.totalBossesKilled++;
        if (typeof tryDropArtifact === 'function') tryDropArtifact(); 
        if (Math.random() < COMPANION_ESSENCE_DROP_CHANCE_FROM_BOSS) {
            const essenceAmount = Math.floor(Math.random() * 4) + 2; 
            if (typeof gainCompanionEssence === 'function') gainCompanionEssence(essenceAmount);
        }
    } else if (gameState.enemy.isChampion) { 
        if (typeof soundManager !== 'undefined') soundManager.playSound('championDefeat', 'A3', '8n');
        gameState.lifetimeStats.totalChampionsKilled++;
        if (typeof updateDailyQuestProgress === 'function') updateDailyQuestProgress('championKill', 1);
        if (Math.random() < COMPANION_ESSENCE_DROP_CHANCE_FROM_CHAMPION) {
            if (typeof gainCompanionEssence === 'function') gainCompanionEssence(1); 
        }
    } else { 
        if (typeof soundManager !== 'undefined') soundManager.playSound('enemyDefeat', 'C3', '16n');
    }
    
    gameState.lifetimeStats.totalEnemiesKilled++; 
    
    let xpFromKill = gameState.enemy.effectiveLevel; 
    if(gameState.enemy.isChampion) xpFromKill += Math.floor(gameState.enemy.effectiveLevel * 1.5); 
    if(gameState.enemy.isBoss) xpFromKill += Math.floor(gameState.enemy.effectiveLevel * 4.0); 
    if (typeof gainXP === 'function') gainXP(xpFromKill); 
    
    gameState.enemiesKilledThisEcho++; 
    gameState.enemiesDefeatedInZone++; 
    if (typeof updateDailyQuestProgress === 'function') updateDailyQuestProgress('enemyKill', 1);
    
    if (gameState.enemiesDefeatedInZone >= ENEMIES_PER_ZONE) {
        gameState.enemiesDefeatedInZone = 0; 
        gameState.currentZoneInWorld++; 
        if (typeof updateDailyQuestProgress === 'function') updateDailyQuestProgress('zoneReached', gameState.currentZoneInWorld); 
        
        if (gameState.currentZoneInWorld > ZONES_PER_WORLD) {
            gameState.currentZoneInWorld = 1; 
            gameState.currentWorld++; 
            if (gameState.currentWorld > MAX_WORLDS) { 
                if (typeof showMessageBox === 'function') showMessageBox("Gratulujeme! Dosáhl jsi konce známého multiversa!", false, 7000); 
                gameState.currentWorld = MAX_WORLDS; 
                gameState.currentZoneInWorld = ZONES_PER_WORLD;
            } else {
                if (typeof showMessageBox === 'function') showMessageBox(`Postup do Světa ${gameState.currentWorld}!`, false, 3000);
            }
        } else {
            if (typeof showMessageBox === 'function') showMessageBox(`Postup do Zóny ${gameState.currentZoneInWorld} (Svět ${gameState.currentWorld})!`, false, 2500);
        }
    }
    
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
    if (typeof showMessageBox === 'function') showMessageBox(`Boss nebyl poražen včas! Zóna ${gameState.currentZoneInWorld} (Svět ${gameState.currentWorld}) se restartuje.`, true, 4000);
    if (typeof soundManager !== 'undefined') soundManager.playSound('debuffApply', 'A2', '4n'); 
    
    gameState.bossFightTimerActive = false; 
    gameState.bossFightTimeLeft = 0;       
    gameState.enemiesDefeatedInZone = 0;  
    
    spawnNewEnemy(); 
    if (typeof updateUI === 'function') updateUI();
}