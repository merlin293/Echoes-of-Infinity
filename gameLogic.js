// SOUBOR: gameLogic.js

/**
 * Hlavní herní smyčka, volá se opakovaně pomocí setInterval.
 * Zpracovává pasivní poškození, buffy, debuffy, cooldowny a další pravidelné aktualizace.
 */
function gameTick() {
    // Výpočet delta času od posledního ticku
    const now = Date.now();
    const deltaTime = (now - gameState.lastTickTime) / 1000; // Delta čas v sekundách
    gameState.lastTickTime = now;

    // Aktualizace časových statistik
    gameState.lifetimeStats.totalPlayTimeSeconds += deltaTime;
    gameState.currentRunPlayTimeSeconds += deltaTime;


    // --- Pasivní Poškození ---
    let passiveDamageFromTiersArtifactsTalents = gameState.passivePercentFromTiers; 
    let passiveDamageFromCompanions = gameState.totalCompanionPassivePercent;

    if (typeof getResearchBonus === 'function') {
        passiveDamageFromCompanions *= (1 + getResearchBonus('research_companion_damage_multiplier_percent'));
    }

    let totalBasePassivePercent = passiveDamageFromTiersArtifactsTalents + passiveDamageFromCompanions;

    if (talents.passivePercentMultiplierTalent.currentLevel > 0) { 
        totalBasePassivePercent *= (1 + talents.passivePercentMultiplierTalent.effectValue * talents.passivePercentMultiplierTalent.currentLevel);
    }
    if (typeof getEssenceBonus === 'function') {
        totalBasePassivePercent *= (1 + getEssenceBonus('essence_passive_dps_multiplier_percent')); 
    }
    
    const finalEffectivePassivePercent = totalBasePassivePercent;

    if (finalEffectivePassivePercent > 0 && gameState.enemy.currentHealth > 0 ) {
        // Poškození se aplikuje na základě deltaTime, aby bylo konzistentní i při různých frekvencích ticku
        const damageThisActualTick = gameState.enemy.maxHealth * finalEffectivePassivePercent * deltaTime; 
        gameState.enemy.currentHealth -= damageThisActualTick;

        if (gameState.enemy.currentHealth <= 0) {
            let goldMultiplierForPassive = gameState.echoPermanentGoldBonus;
            if (talents.goldVeins.currentLevel > 0) goldMultiplierForPassive *= (1 + talents.goldVeins.effectValue * talents.goldVeins.currentLevel);
            if (typeof getResearchBonus === 'function') goldMultiplierForPassive *= (1 + getResearchBonus('research_gold_multiplier_all_percent'));
            if (typeof getEssenceBonus === 'function') goldMultiplierForPassive *= (1 + getEssenceBonus('essence_gold_multiplier_all_percent'));
            if (gameState.activeBuffs[BUFF_TYPE_GOLD_RUSH]) goldMultiplierForPassive *= GOLD_RUSH_MULTIPLIER;
            if (gameState.zlataHoreckaAktivniActive) goldMultiplierForPassive *= ZLATA_HORECKA_AKTIVNI_GOLD_MULTIPLIER;
            let artifactGoldBonusPassive = 0;
            if (typeof getArtifactBonus === 'function') artifactGoldBonusPassive = getArtifactBonus('gold_bonus_percent_additive') / 100; 
            goldMultiplierForPassive *= (1 + artifactGoldBonusPassive);

            if (typeof onEnemyDefeated === 'function') onEnemyDefeated(goldMultiplierForPassive); 
        }
    }
    
    if (talents.ultimateAuraOfDecay.currentLevel > 0 && gameState.enemy.currentHealth > 0) {
        const auraDamageConfig = talents.ultimateAuraOfDecay.effectValue;
        // Poškození aury také aplikováno na základě deltaTime
        const auraDamageThisActualTick = Math.min(gameState.enemy.maxHealth * auraDamageConfig.percent, auraDamageConfig.cap) * deltaTime; 
        gameState.enemy.currentHealth -= auraDamageThisActualTick;
        if (gameState.enemy.currentHealth <= 0) {
             let goldMultiplierForPassive = gameState.echoPermanentGoldBonus;
            if (talents.goldVeins.currentLevel > 0) goldMultiplierForPassive *= (1 + talents.goldVeins.effectValue * talents.goldVeins.currentLevel);
            if (typeof getResearchBonus === 'function') goldMultiplierForPassive *= (1 + getResearchBonus('research_gold_multiplier_all_percent'));
            if (typeof getEssenceBonus === 'function') goldMultiplierForPassive *= (1 + getEssenceBonus('essence_gold_multiplier_all_percent'));
            if (gameState.activeBuffs[BUFF_TYPE_GOLD_RUSH]) goldMultiplierForPassive *= GOLD_RUSH_MULTIPLIER;
            if (gameState.zlataHoreckaAktivniActive) goldMultiplierForPassive *= ZLATA_HORECKA_AKTIVNI_GOLD_MULTIPLIER;
            let artifactGoldBonusPassive = 0;
            if (typeof getArtifactBonus === 'function') artifactGoldBonusPassive = getArtifactBonus('gold_bonus_percent_additive') / 100;
            goldMultiplierForPassive *= (1 + artifactGoldBonusPassive);

            if (typeof onEnemyDefeated === 'function') onEnemyDefeated(goldMultiplierForPassive); 
        }
    }

    // Boss Fight Timer - aktualizace na základě deltaTime
    if (gameState.bossFightTimerActive && gameState.enemy.isBoss) {
        gameState.bossFightTimeLeft -= deltaTime; 
        if (gameState.bossFightTimeLeft <= 0 && gameState.enemy.currentHealth > 0) { 
            gameState.bossFightTimeLeft = 0; 
            if (typeof handleBossFightTimeout === 'function') handleBossFightTimeout(); 
        }
    }

    // Buffy - aktualizace na základě deltaTime
    for (const buffKey in gameState.activeBuffs) {
        if (gameState.activeBuffs.hasOwnProperty(buffKey)) {
            gameState.activeBuffs[buffKey].duration -= deltaTime; 
            if (gameState.activeBuffs[buffKey].duration <= 0) {
                if (typeof removeBuff === 'function') removeBuff(buffKey); 
            }
        }
    }

    // Debuffy - aktualizace na základě deltaTime
    for (const debuffKey in gameState.activeDebuffs) {
        if (gameState.activeDebuffs.hasOwnProperty(debuffKey)) {
            gameState.activeDebuffs[debuffKey].duration -= deltaTime;
            if (debuffKey === DEBUFF_TYPE_PARASITE) { 
                let goldToDrainThisTick = gameState.activeDebuffs[debuffKey].effectValue * deltaTime; 
                gameState.gold = Math.max(0, gameState.gold - goldToDrainThisTick); 
            }
            if (gameState.activeDebuffs[debuffKey].duration <= 0) {
                if (typeof clearDebuff === 'function') clearDebuff(debuffKey); 
                if (debuffKey === DEBUFF_TYPE_PARASITE && typeof showMessageBox === 'function') {
                    showMessageBox("Parazit sám od sebe zmizel.", false, 2000); 
                }
            }
        }
    }

    // Cooldowny a trvání schopností - aktualizace na základě deltaTime
    if (gameState.mocnyUderCooldownTimeLeft > 0) {
        gameState.mocnyUderCooldownTimeLeft -= deltaTime; 
        if(gameState.mocnyUderCooldownTimeLeft < 0) gameState.mocnyUderCooldownTimeLeft = 0;
    }
    if (gameState.mocnyUderActive) {
        gameState.mocnyUderDurationLeft -= deltaTime;
        if (gameState.mocnyUderDurationLeft <= 0) { 
            gameState.mocnyUderActive = false; 
            if (typeof calculateEffectiveStats === 'function') calculateEffectiveStats(); 
            if (typeof showMessageBox === 'function') showMessageBox("Mocný úder vyprchal.", true); 
        }
    }
    if (gameState.zlataHoreckaAktivniCooldownTimeLeft > 0) {
        gameState.zlataHoreckaAktivniCooldownTimeLeft -= deltaTime; 
        if(gameState.zlataHoreckaAktivniCooldownTimeLeft < 0) gameState.zlataHoreckaAktivniCooldownTimeLeft = 0;
    }
    if (gameState.zlataHoreckaAktivniActive) {
        gameState.zlataHoreckaAktivniDurationLeft -= deltaTime;
        if (gameState.zlataHoreckaAktivniDurationLeft <= 0) { 
            gameState.zlataHoreckaAktivniActive = false; 
            if (typeof showMessageBox === 'function') showMessageBox("Zlatá horečka (Aktivní) skončila.", true); 
        }
    }

    if (typeof checkMilestones === 'function') checkMilestones(); 
    if (typeof updateUI === 'function') updateUI(); 
}


/**
 * Vypočítá všechny efektivní statistiky hráče na základě základních hodnot,
 * vybavení, talentů, artefaktů, výzkumu, esencí a dovedností společníků.
 * Aktualizuje globální proměnné v gameState.js (např. effectiveClickDamage, effectiveCritChance).
 */
function calculateEffectiveStats() {
    let currentTierItemDamage = 0;
    if (typeof equipmentSlots !== 'undefined' && typeof gameState.equipment !== 'undefined' && typeof getItemDamage === 'function') {
        equipmentSlots.forEach(slot => { 
            if (gameState.equipment[slot]) {
                currentTierItemDamage += getItemDamage(gameState.equipment[slot].level); 
            }
        });
    }
    
    let calculatedDamage = gameState.baseClickDamage + currentTierItemDamage + gameState.currentGlobalTierClickDamageBonus; 
    
    calculatedDamage *= gameState.echoPermanentDamageBonus; 
    
    if (talents.increasedClickDamage.currentLevel > 0) { 
        calculatedDamage *= (1 + talents.increasedClickDamage.effectValue * talents.increasedClickDamage.currentLevel);
    }
    
    if (typeof getArtifactBonus === 'function') {
        let artifactAllDamageBonus = getArtifactBonus('all_damage_percent_additive'); 
        calculatedDamage *= (1 + artifactAllDamageBonus); 
    }

    if (typeof getResearchBonus === 'function') {
        calculatedDamage *= (1 + getResearchBonus('research_click_damage_multiplier_percent'));
    }
    if (typeof getEssenceBonus === 'function') {
        calculatedDamage *= (1 + getEssenceBonus('essence_click_damage_multiplier_percent')); 
    }

    if (typeof getCompanionSkillBonus === 'function' && typeof allCompanions !== 'undefined' && typeof gameState.ownedCompanions !== 'undefined') {
        for (const companionId in gameState.ownedCompanions) {
            if (gameState.ownedCompanions.hasOwnProperty(companionId) && gameState.ownedCompanions[companionId].level > 0) {
                const globalDamageBonusFromCompanion = getCompanionSkillBonus(companionId, 'global_player_damage_percent_if_active');
                if (globalDamageBonusFromCompanion > 0) {
                    calculatedDamage *= (1 + globalDamageBonusFromCompanion);
                }
                // Zde by se mohly přidat další globální bonusy od společníků, pokud by existovaly
                const globalGoldBonusFromCompanion = getCompanionSkillBonus(companionId, 'global_player_gold_multiplier_percent_if_active');
                // Tento bonus se neaplikuje na click damage, ale je zde pro úplnost, pokud by se počítal jinde
            }
        }
    }
            
    gameState.effectiveClickDamage = Math.ceil(calculatedDamage);
    
    let calculatedCritChance = gameState.baseCritChance; 
    if (typeof getArtifactBonus === 'function') {
        calculatedCritChance += getArtifactBonus('crit_chance_percent_additive');
    }
    if (typeof getEssenceBonus === 'function') {
        calculatedCritChance += getEssenceBonus('essence_crit_chance_additive_percent'); 
    }
    if (talents.critChanceBoost.currentLevel > 0) {
        calculatedCritChance += talents.critChanceBoost.effectValue * talents.critChanceBoost.currentLevel;
    }
    gameState.effectiveCritChance = Math.min(1, calculatedCritChance); 
}