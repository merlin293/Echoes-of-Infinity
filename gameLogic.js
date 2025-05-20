// SOUBOR: gameLogic.js

/**
 * Hlavní herní smyčka, volá se opakovaně pomocí setInterval.
 * Zpracovává pasivní poškození, buffy, debuffy, cooldowny a další pravidelné aktualizace.
 */
function gameTick() {
    // gameState je globální objekt z gameState.js
    // talents je objekt z config.js
    // BUFF_TYPE_GOLD_RUSH, GOLD_RUSH_MULTIPLIER, DEBUFF_TYPE_PARASITE jsou konstanty z config.js
    // getResearchBonus je funkce z researchController.js
    // getEssenceBonus je funkce z essenceController.js
    // getArtifactBonus je funkce z artifactController.js
    // onEnemyDefeated, handleBossFightTimeout jsou funkce z enemyController.js
    // removeBuff, clearDebuff jsou funkce z actionController.js
    // calculateEffectiveStats je funkce z tohoto souboru (gameLogic.js)
    // checkMilestones je funkce z milestoneController.js
    // updateUI je funkce z uiController.js
    // showMessageBox je funkce z uiController.js

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
        const damageThisTick = gameState.enemy.maxHealth * finalEffectivePassivePercent / 10; 
        gameState.enemy.currentHealth -= damageThisTick;
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
        const auraDamageThisTick = Math.min(gameState.enemy.maxHealth * auraDamageConfig.percent, auraDamageConfig.cap) / 10; 
        gameState.enemy.currentHealth -= auraDamageThisTick;
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

    if (gameState.bossFightTimerActive && gameState.enemy.isBoss) {
        gameState.bossFightTimeLeft -= 0.1; 
        if (gameState.bossFightTimeLeft <= 0 && gameState.enemy.currentHealth > 0) { 
            gameState.bossFightTimeLeft = 0; 
            if (typeof handleBossFightTimeout === 'function') handleBossFightTimeout(); 
        }
    }

    for (const buffKey in gameState.activeBuffs) {
        if (gameState.activeBuffs.hasOwnProperty(buffKey)) {
            gameState.activeBuffs[buffKey].duration -= 0.1; 
            if (gameState.activeBuffs[buffKey].duration <= 0) {
                if (typeof removeBuff === 'function') removeBuff(buffKey); 
            }
        }
    }

    for (const debuffKey in gameState.activeDebuffs) {
        if (gameState.activeDebuffs.hasOwnProperty(debuffKey)) {
            gameState.activeDebuffs[debuffKey].duration -= 0.1;
            if (debuffKey === DEBUFF_TYPE_PARASITE) { 
                let goldToDrain = gameState.activeDebuffs[debuffKey].effectValue / 10; 
                gameState.gold = Math.max(0, gameState.gold - goldToDrain); 
            }
            if (gameState.activeDebuffs[debuffKey].duration <= 0) {
                if (typeof clearDebuff === 'function') clearDebuff(debuffKey); 
                if (debuffKey === DEBUFF_TYPE_PARASITE && typeof showMessageBox === 'function') {
                    showMessageBox("Parazit sám od sebe zmizel.", false, 2000); 
                }
            }
        }
    }

    if (gameState.mocnyUderCooldownTimeLeft > 0) {
        gameState.mocnyUderCooldownTimeLeft -= 0.1; 
        if(gameState.mocnyUderCooldownTimeLeft < 0) gameState.mocnyUderCooldownTimeLeft = 0;
    }
    if (gameState.mocnyUderActive) {
        gameState.mocnyUderDurationLeft -= 0.1;
        if (gameState.mocnyUderDurationLeft <= 0) { 
            gameState.mocnyUderActive = false; 
            if (typeof calculateEffectiveStats === 'function') calculateEffectiveStats(); 
            if (typeof showMessageBox === 'function') showMessageBox("Mocný úder vyprchal.", true); 
        }
    }
    if (gameState.zlataHoreckaAktivniCooldownTimeLeft > 0) {
        gameState.zlataHoreckaAktivniCooldownTimeLeft -= 0.1; 
        if(gameState.zlataHoreckaAktivniCooldownTimeLeft < 0) gameState.zlataHoreckaAktivniCooldownTimeLeft = 0;
    }
    if (gameState.zlataHoreckaAktivniActive) {
        gameState.zlataHoreckaAktivniDurationLeft -= 0.1;
        if (gameState.zlataHoreckaAktivniDurationLeft <= 0) { 
            gameState.zlataHoreckaAktivniActive = false; 
            if (typeof showMessageBox === 'function') showMessageBox("Zlatá horečka (Aktivní) skončila.", true); 
        }
    }

    // Zpracování efektů "zlato za zásah" od společníků (simulace pro každý tick)
    // Toto je zjednodušení, ideálně by se to dělo při "útoku" společníka,
    // ale pro %HP/s pasivní poškození nemáme diskrétní útoky.
    // Můžeme to simulovat tak, že každou sekundu (nebo párkrát za sekundu) je šance na tento efekt.
    // Pro jednoduchost to zde nebudeme implementovat přímo v ticku, ale spíše
    // ponecháme na implementaci v `handleEnemyClick` pro aktivní klikání,
    // nebo by to vyžadovalo komplexnější systém "útoků společníků".
    // Prozatím se zaměříme na globální bonusy v calculateEffectiveStats.


    if (typeof checkMilestones === 'function') checkMilestones(); 
    if (typeof updateUI === 'function') updateUI(); 
}


/**
 * Vypočítá všechny efektivní statistiky hráče na základě základních hodnot,
 * vybavení, talentů, artefaktů, výzkumu, esencí a dovedností společníků.
 * Aktualizuje globální proměnné v gameState.js (např. effectiveClickDamage, effectiveCritChance).
 */
function calculateEffectiveStats() {
    // gameState je globální objekt z gameState.js
    // equipmentSlots, talents, critDamageMultiplier jsou z config.js
    // getItemDamage je z equipmentController.js
    // getArtifactBonus je z artifactController.js
    // getResearchBonus je z researchController.js
    // getEssenceBonus je z essenceController.js
    // getCompanionSkillBonus je z companionSkillController.js
    // allCompanions je z config.js

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

    // Aplikace globálních bonusů k poškození hráče z dovedností aktivních společníků
    if (typeof getCompanionSkillBonus === 'function' && typeof allCompanions !== 'undefined' && typeof gameState.ownedCompanions !== 'undefined') {
        for (const companionId in gameState.ownedCompanions) {
            if (gameState.ownedCompanions.hasOwnProperty(companionId) && gameState.ownedCompanions[companionId].level > 0) {
                // Zde by se kontrolovaly specifické dovednosti, které dávají globální bonus
                // Například pro 'global_player_damage_percent_if_active'
                const globalDamageBonusFromCompanion = getCompanionSkillBonus(companionId, 'global_player_damage_percent_if_active');
                if (globalDamageBonusFromCompanion > 0) {
                    calculatedDamage *= (1 + globalDamageBonusFromCompanion);
                }
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