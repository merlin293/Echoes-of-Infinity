// SOUBOR: actionController.js

/**
 * Aktivuje buff pro hráče.
 * @param {string} buffType - Typ buffu (např. BUFF_TYPE_POWER_SHARD).
 * @param {number} duration - Doba trvání buffu v sekundách.
 */
function activateBuff(buffType, duration) {
    if (!gameState || !gameState.activeBuffs) {
        console.error("gameState or gameState.activeBuffs is not defined in activateBuff");
        return;
    }
    if (buffType === BUFF_TYPE_POWER_SHARD) {
        if (gameState.activeBuffs[buffType]) {
            gameState.activeBuffs[buffType].duration = duration; 
        } else {
            gameState.activeBuffs[buffType] = { duration: duration }; 
        }
        if (typeof showMessageBox === 'function') showMessageBox(`Úlomek síly aktivován! +${((POWER_SHARD_MULTIPLIER -1) * 100).toFixed(0)}% poškození!`, false, 2000);
        if (typeof soundManager !== 'undefined') soundManager.playSound('buffGain', 'G5', '8n');
    } else if (buffType === BUFF_TYPE_GOLD_RUSH) {
        if (gameState.activeBuffs[buffType]) {
            gameState.activeBuffs[buffType].duration = duration; 
        } else {
            gameState.activeBuffs[buffType] = { duration: duration }; 
        }
        if (typeof showMessageBox === 'function') showMessageBox(`Zlatá horečka (Pasivní) aktivována! ${GOLD_RUSH_MULTIPLIER}x zlato!`, false, 2000);
        if (typeof soundManager !== 'undefined') soundManager.playSound('buffGain', 'A#5', '8n');
    }
    if (typeof calculateEffectiveStats === 'function') calculateEffectiveStats(); 
    if (typeof updateUI === 'function') updateUI();
}

/**
 * Odstraní buff hráči.
 * @param {string} buffType - Typ buffu k odstranění.
 */
function removeBuff(buffType) {
    if (!gameState || !gameState.activeBuffs) return;
    if (gameState.activeBuffs[buffType]) { 
        delete gameState.activeBuffs[buffType];
        if (buffType === BUFF_TYPE_POWER_SHARD) {
            if (typeof showMessageBox === 'function') showMessageBox("Úlomek síly vyprchal.", true, 2000); 
        } else if (buffType === BUFF_TYPE_GOLD_RUSH) {
            if (typeof showMessageBox === 'function') showMessageBox("Zlatá horečka (Pasivní) skončila.", true, 2000);
        }
        if (typeof calculateEffectiveStats === 'function') calculateEffectiveStats(); 
        if (typeof updateUI === 'function') updateUI();
    }
}

/**
 * Aplikuje debuff na hráče.
 * @param {string} debuffType - Typ debuffu.
 * @param {number} duration - Doba trvání debuffu v sekundách.
 * @param {number} effectValue - Hodnota efektu debuffu (např. odsávání zlata za sekundu).
 */
function applyDebuff(debuffType, duration, effectValue) {
    if (!gameState || !gameState.activeDebuffs) return;
    if (debuffType === DEBUFF_TYPE_PARASITE) {
        if (gameState.activeDebuffs[debuffType]) return; 
        gameState.activeDebuffs[debuffType] = { duration: duration, effectValue: effectValue };
        if (typeof showMessageBox === 'function') showMessageBox(`Chytil jsi Parazita! Odsává ti zlato!`, true, 2500);
        if (typeof soundManager !== 'undefined') soundManager.playSound('debuffApply', 'F3', '4n');
    }
    if (typeof updateUI === 'function') updateUI();
}

/**
 * Odstraní debuff hráči.
 * @param {string} debuffType - Typ debuffu k odstranění.
 */
function clearDebuff(debuffType) {
    if (!gameState || !gameState.activeDebuffs) return;
    if (gameState.activeDebuffs[debuffType]) { 
        delete gameState.activeDebuffs[debuffType];
        if (debuffType === DEBUFF_TYPE_PARASITE) { 
            if (typeof showMessageBox === 'function') showMessageBox("Parazit byl odstraněn!", false, 2000); 
            if (typeof soundManager !== 'undefined') soundManager.playSound('buffGain', 'C4', '8n'); 
        }
        if (typeof updateUI === 'function') updateUI();
    }
}

/**
 * Zpracuje pokus o očistění parazita.
 */
function onCleanseParasite() {
    if (!gameState || !gameState.activeDebuffs) return;
    if (gameState.activeDebuffs[DEBUFF_TYPE_PARASITE] && gameState.gold >= PARASITE_CLEANSE_COST) {
        gameState.gold -= PARASITE_CLEANSE_COST; 
        clearDebuff(DEBUFF_TYPE_PARASITE);
    } else if (gameState.gold < PARASITE_CLEANSE_COST) {
        if (typeof showMessageBox === 'function') showMessageBox("Nedostatek zlata na očistění!", true);
    }
}

/**
 * Aktivuje schopnost Mocný úder.
 */
function activateMocnyUder() {
    if (!gameState) return;
    if (gameState.mocnyUderCooldownTimeLeft > 0) { 
        if (typeof showMessageBox === 'function') showMessageBox("Mocný úder se stále nabíjí!", true); 
        return; 
    }
    gameState.mocnyUderActive = true; 
    gameState.mocnyUderDurationLeft = MOCNY_UDER_DURATION;
    
    let baseCooldown = MOCNY_UDER_COOLDOWN;
    if (typeof getArtifactBonus === 'function') { 
        const reductionPercent = getArtifactBonus('cooldown_reduction_power_strike_percent');
        const effectiveReduction = Math.min(reductionPercent, 90); 
        baseCooldown *= (1 - (effectiveReduction / 100));
    }
    gameState.mocnyUderCooldownTimeLeft = baseCooldown;
    
    if (typeof soundManager !== 'undefined') soundManager.playSound('skillActivate', 'E4', '4n');
    if (typeof updateDailyQuestProgress === 'function') updateDailyQuestProgress('powerStrikeUsed', 1); 
    
    if (typeof calculateEffectiveStats === 'function') calculateEffectiveStats(); 
    if (typeof updateUI === 'function') updateUI();
    if (typeof showMessageBox === 'function') showMessageBox(`Mocný úder aktivován! ${MOCNY_UDER_DAMAGE_MULTIPLIER}x poškození na ${MOCNY_UDER_DURATION}s!`, false);
}

/**
 * Aktivuje schopnost Zlatá horečka.
 */
function activateZlataHoreckaAktivni() {
    if (!gameState) return;
    if (gameState.zlataHoreckaAktivniCooldownTimeLeft > 0) { 
        if (typeof showMessageBox === 'function') showMessageBox("Zlatá horečka se stále nabíjí!", true); 
        return; 
    }
    gameState.zlataHoreckaAktivniActive = true; 
    gameState.zlataHoreckaAktivniDurationLeft = ZLATA_HORECKA_AKTIVNI_DURATION;
    gameState.zlataHoreckaAktivniCooldownTimeLeft = ZLATA_HORECKA_AKTIVNI_COOLDOWN;
    
    if (typeof soundManager !== 'undefined') soundManager.playSound('skillActivate', 'G4', '4n');
    if (typeof updateUI === 'function') updateUI(); 
    if (typeof showMessageBox === 'function') showMessageBox(`Zlatá horečka aktivována! ${ZLATA_HORECKA_AKTIVNI_GOLD_MULTIPLIER}x zlato na ${ZLATA_HORECKA_AKTIVNI_DURATION}s!`, false);
}

/**
 * Vylepší permanentní bonus zlata z Echa.
 */
function onUpgradeEchoGold() {
    if (!gameState) return;
    if (gameState.echoShards >= gameState.echoGoldUpgradeCost) {
        gameState.echoShards -= gameState.echoGoldUpgradeCost;
        gameState.echoPermanentGoldBonus += echoGoldUpgradeValue; 
        gameState.echoGoldLevelCount++;
        gameState.echoGoldUpgradeCost = Math.ceil(initialEchoGoldUpgradeCost * Math.pow(1.5, gameState.echoGoldLevelCount)); 
        
        if (typeof showMessageBox === 'function') showMessageBox(`Permanentní bonus zlata zvýšen na +${((gameState.echoPermanentGoldBonus - 1) * 100).toFixed(0)}%!`, false);
        if (typeof soundManager !== 'undefined') soundManager.playSound('upgrade', 'E5', '16n');
        
        if (typeof calculateEffectiveStats === 'function') calculateEffectiveStats(); 
        if (typeof updateUI === 'function') updateUI();
    } else {
        if (typeof showMessageBox === 'function') showMessageBox("Nedostatek Echo Úlomků!", true);
    }
}

/**
 * Vylepší permanentní bonus poškození z Echa.
 */
function onUpgradeEchoDamage() {
    if (!gameState) return;
    if (gameState.echoShards >= gameState.echoDamageUpgradeCost) {
        gameState.echoShards -= gameState.echoDamageUpgradeCost;
        gameState.echoPermanentDamageBonus += echoDamageUpgradeValue; 
        gameState.echoDamageLevelCount++;
        gameState.echoDamageUpgradeCost = Math.ceil(initialEchoDamageUpgradeCost * Math.pow(1.5, gameState.echoDamageLevelCount));
        
        if (typeof showMessageBox === 'function') showMessageBox(`Permanentní bonus poškození zvýšen na +${((gameState.echoPermanentDamageBonus - 1) * 100).toFixed(0)}%!`, false);
        if (typeof soundManager !== 'undefined') soundManager.playSound('upgrade', 'F#5', '16n');
        
        if (typeof calculateEffectiveStats === 'function') calculateEffectiveStats(); 
        if (typeof updateUI === 'function') updateUI();
    } else {
        if (typeof showMessageBox === 'function') showMessageBox("Nedostatek Echo Úlomků!", true);
    }
}


/**
 * Vypočítá množství Echo Úlomků, které hráč získá při provedení Echa.
 * @returns {number} - Počet Echo Úlomků.
 */
function calculateEchoShardsToGain() {
    if (!gameState || typeof talents === 'undefined' || typeof tiers === 'undefined') {
        console.error("Chybějící data pro calculateEchoShardsToGain (gameState, talents, or tiers).");
        return 1; 
    }
    let shards = Math.floor(gameState.highestEffectiveLevelReachedThisEcho / 3.5) + 
                 Math.floor(gameState.totalGoldEarnedThisEcho / 1000) + 
                 (gameState.echoCount * 7) + 
                 ((tiers.length - 1) * 10); 
    
    if (talents.echoAffinity.currentLevel > 0) { 
        shards = Math.floor(shards * (1 + talents.echoAffinity.effectValue * talents.echoAffinity.currentLevel));
    }
    
    if (typeof getResearchBonus === 'function') {
        shards *= (1 + getResearchBonus('research_echo_shard_multiplier_percent'));
    }
    if (typeof getEssenceBonus === 'function') {
        shards *= (1 + getEssenceBonus('essence_echo_shard_multiplier_percent')); 
    }
    shards = Math.floor(shards);

    if (typeof getArtifactBonus === 'function') {
        let artifactDoubleChanceBonus = getArtifactBonus('echo_shard_double_chance');
        if (Math.random() < (artifactDoubleChanceBonus / 100)) { 
            shards = Math.floor(shards * 2);
            if (typeof showMessageBox === 'function') showMessageBox("Dvojnásobek Echo Úlomků díky artefaktu!", false, 2500);
        }
    }
    return Math.max(1, shards); 
}

/**
 * Resetuje aktuální postup pro Echo (zlato, tiery, svět, zóny atd.).
 * Volá se z handleEcho.
 */
function resetCurrentEchoProgress() {
    if (!gameState) return;
    gameState.gold = 0; 
    gameState.currentTierIndex = 0; 
    gameState.baseClickDamage = 10; 
    
    if (typeof initializeEquipment === 'function') initializeEquipment(); 
    
    gameState.currentWorld = 1; 
    gameState.currentZoneInWorld = 1; 
    gameState.enemiesDefeatedInZone = 0;
    if(gameState.enemy) gameState.enemy.effectiveLevel = 0; 
    gameState.highestEffectiveLevelReachedThisEcho = 1; 
    
    gameState.totalGoldEarnedThisEcho = 0; 
    gameState.enemiesKilledThisEcho = 0; 
    gameState.currentRunPlayTimeSeconds = 0; // Reset času běhu pro toto Echo

    if (gameState.milestones && typeof allMilestonesConfig !== 'undefined') { 
        gameState.milestones.forEach(milestoneInstance => { 
            const milestoneConfig = allMilestonesConfig.find(m => m.id === milestoneInstance.id); 
            if (milestoneConfig && milestoneConfig.perEcho) {
                milestoneInstance.achieved = false; 
            }
        }); 
    }
    
    gameState.activeBuffs = {}; 
    gameState.activeDebuffs = {}; 
    gameState.bossFightTimerActive = false; 
    gameState.bossFightTimeLeft = 0;
    gameState.bossFightInitialDuration = 0; // Reset i zde
    
    if (typeof updateCurrentTierBonuses === 'function') updateCurrentTierBonuses(); 
}

/**
 * Zpracuje mechaniku Echa (prestiže).
 */
function handleEcho() {
    if (!gameState || typeof tiers === 'undefined' || typeof equipmentSlots === 'undefined' || typeof MAX_ITEM_LEVEL === 'undefined') return;

    if (gameState.bossFightTimerActive) { 
        if (typeof showMessageBox === 'function') showMessageBox("Nelze provést Echo během souboje s bossem!", true); 
        return; 
    }
    const canEcho = gameState.currentTierIndex === tiers.length - 1 && 
                    equipmentSlots.every(slot => gameState.equipment[slot] && gameState.equipment[slot].level >= MAX_ITEM_LEVEL); 
    
    if (!canEcho) { 
        if (typeof showMessageBox === 'function') showMessageBox(`Musíš mít veškeré vybavení na Tieru ${tiers.length -1} (${tiers[tiers.length-1].name}) a maximální úrovni (${MAX_ITEM_LEVEL}) pro Echo!`, true, 4000); 
        return; 
    }
    
    const shardsGained = calculateEchoShardsToGain();
    gameState.echoShards += shardsGained; 
    gameState.lifetimeStats.lifetimeEchoShardsEarned += shardsGained; 
    gameState.echoCount++; 
    
    if (typeof soundManager !== 'undefined') soundManager.playSound('echo', 'C2', '1n');
    
    resetCurrentEchoProgress(); 
    
    if (typeof showMessageBox === 'function') showMessageBox(`Echo provedeno! Získal jsi ${formatNumber(shardsGained)} Echo Úlomků. Celkem máš ${formatNumber(gameState.echoShards)}. Zlato, svět a zóny resetovány.`, false, 4000);
    
    if (typeof spawnNewEnemy === 'function') spawnNewEnemy(); 
    if (typeof calculateEffectiveStats === 'function') calculateEffectiveStats(); 
    if (typeof updateUI === 'function') updateUI(); 
}