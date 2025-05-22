// SOUBOR: uiController.js

// --- Proměnné pro DOM Elementy (budou inicializovány v initializeUIElements) ---
let goldDisplayContainer, enemyElement, enemyArtElement, enemyNameDisplay, enemyHealthTextDisplay,
    enemyHealthBar, bossTimerDisplay, goldDisplay, clickDamageDisplay, enemyEffectiveLevelDisplay,
    passiveDamageDisplay, currentWorldDisplay, currentZoneDisplay, zoneProgressDisplay,
    echoShardsDisplay, echoCountDisplay, playerLevelDisplay, talentPointsDisplay, playerXPBar,
    playerXPText, damageNumberContainer, activeEffectsContainer, cleanseDebuffButton,
    cleanseCostDisplay, echoButton, echoShardsToGain, echoConditionDisplay,
    messageBox, upgradeEchoGoldButton, echoGoldBonusValueDisplay, echoGoldLevelDisplay,
    echoGoldCostDisplay, upgradeEchoDamageButton, echoDamageBonusValueDisplay, echoDamageLevelDisplay,
    echoDamageCostDisplay, openTalentTreeButton, talentTreeModal, closeTalentTreeButton,
    talentsContainer, modalPlayerLevel, modalTalentPoints, equipmentContainer, currentTierDisplay,
    advanceTierButton, nextTierCostDisplay, mocnyUderButton, mocnyUderText, mocnyUderCooldownDisplay,
    zlataHoreckaAktivniButton, zlataHoreckaAktivniText, zlataHoreckaAktivniCooldownDisplay,
    artifactsPanelElement, artifactsListElement, dailyQuestsListElement, gameStatsContainer,
    openDailyQuestsButton, closeDailyQuestsButton, dailyQuestsModal, dailyQuestsListModalElement,
    openMilestonesButton, closeMilestonesButton, milestonesModal, milestonesListModalElement,
    companionsContainer, volumeSlider, muteButton, openHelpButton, closeHelpButton, helpModal,
    openAdvancedSettingsButton, closeAdvancedSettingsButton, advancedSettingsModal,
    toggleDamageNumbersEl, toggleGoldAnimationsEl, resetGameButtonAdvanced,
    requestTalentResetButton, talentResetCostOptions, resetTalentsWithShardsButton,
    resetCostShardsDisplay, resetTalentsWithGoldButton, resetCostGoldDisplay, cancelTalentResetButton,
    openResearchLabButton, closeResearchModalButton, researchModal, researchContainer,
    modalEchoShardsResearch, openEssenceForgeButton, closeEssenceForgeButton, essenceForgeModal,
    essenceContainer, modalEchoShardsEssence,
    resetConfirmModal, confirmHardResetButton, cancelHardResetButton,
    companionEssenceDisplay,
    companionSkillModal, companionSkillModalTitle, modalCompanionEssenceDisplay,
    companionSkillsContainer, closeCompanionSkillModalButton,
    openExpeditionsButton, expeditionsModal, expeditionsListContainer, closeExpeditionsModalButton,
    expeditionSlotsDisplay, expeditionCompanionSelectModal, expeditionCompanionSelectList,
    confirmExpeditionStartButton, cancelExpeditionStartButton,
    totalPlayTimeDisplay, currentRunPlayTimeDisplay, fastestBossKillDisplay,
    talentTooltipElement, essenceTooltipElement, researchTooltipElement; // Přidáno researchTooltipElement


function initializeUIElements() {
    goldDisplayContainer = document.getElementById('goldDisplayContainer');
    enemyElement = document.getElementById('enemy');
    enemyArtElement = document.getElementById('enemyArt');
    enemyNameDisplay = document.getElementById('enemyName');
    enemyHealthTextDisplay = document.getElementById('enemyHealthText');
    enemyHealthBar = document.getElementById('enemyHealthBar');
    bossTimerDisplay = document.getElementById('bossTimerDisplay');
    goldDisplay = document.getElementById('goldDisplay');
    clickDamageDisplay = document.getElementById('clickDamageDisplay');
    enemyEffectiveLevelDisplay = document.getElementById('enemyEffectiveLevelDisplay');
    passiveDamageDisplay = document.getElementById('passiveDamageDisplay');
    currentWorldDisplay = document.getElementById('currentWorldDisplay');
    currentZoneDisplay = document.getElementById('currentZoneDisplay');
    zoneProgressDisplay = document.getElementById('zoneProgressDisplay');
    echoShardsDisplay = document.getElementById('echoShardsDisplay');
    echoCountDisplay = document.getElementById('echoCountDisplay');
    playerLevelDisplay = document.getElementById('playerLevelDisplay');
    talentPointsDisplay = document.getElementById('talentPointsDisplay');
    playerXPBar = document.getElementById('playerXPBar');
    playerXPText = document.getElementById('playerXPText');
    damageNumberContainer = document.getElementById('enemyContainer');
    activeEffectsContainer = document.getElementById('activeEffectsContainer');
    cleanseDebuffButton = document.getElementById('cleanseDebuffButton');
    cleanseCostDisplay = document.getElementById('cleanseCostDisplay');
    echoButton = document.getElementById('echoButton');
    echoShardsToGain = document.getElementById('echoShardsToGain');
    echoConditionDisplay = document.getElementById('echoConditionDisplay');
    messageBox = document.getElementById('messageBox');
    upgradeEchoGoldButton = document.getElementById('upgradeEchoGold');
    echoGoldBonusValueDisplay = document.getElementById('echoGoldBonusValue');
    echoGoldLevelDisplay = document.getElementById('echoGoldLevel');
    echoGoldCostDisplay = document.getElementById('echoGoldCostDisplay');
    upgradeEchoDamageButton = document.getElementById('upgradeEchoDamage');
    echoDamageBonusValueDisplay = document.getElementById('echoDamageBonusValue');
    echoDamageLevelDisplay = document.getElementById('echoDamageLevel');
    echoDamageCostDisplay = document.getElementById('echoDamageCostDisplay');
    openTalentTreeButton = document.getElementById('openTalentTreeButton');
    talentTreeModal = document.getElementById('talentTreeModal');
    closeTalentTreeButton = document.getElementById('closeTalentTreeButton');
    talentsContainer = document.getElementById('talentsContainer');
    modalPlayerLevel = document.getElementById('modalPlayerLevel');
    modalTalentPoints = document.getElementById('modalTalentPoints');
    equipmentContainer = document.getElementById('equipmentContainer');
    currentTierDisplay = document.getElementById('currentTierDisplay');
    advanceTierButton = document.getElementById('advanceTierButton');
    nextTierCostDisplay = document.getElementById('nextTierCostDisplay');
    mocnyUderButton = document.getElementById('mocnyUderButton');
    mocnyUderText = document.getElementById('mocnyUderText');
    mocnyUderCooldownDisplay = document.getElementById('mocnyUderCooldownDisplay');
    zlataHoreckaAktivniButton = document.getElementById('zlataHoreckaAktivniButton');
    zlataHoreckaAktivniText = document.getElementById('zlataHoreckaAktivniText');
    zlataHoreckaAktivniCooldownDisplay = document.getElementById('zlataHoreckaAktivniCooldownDisplay');
    artifactsPanelElement = document.getElementById('artifactsPanel');
    artifactsListElement = document.getElementById('artifactsList');
    gameStatsContainer = document.getElementById('gameStatsContainer');
    openDailyQuestsButton = document.getElementById('openDailyQuestsButton');
    closeDailyQuestsButton = document.getElementById('closeDailyQuestsButton');
    dailyQuestsModal = document.getElementById('dailyQuestsModal');
    dailyQuestsListModalElement = document.getElementById('dailyQuestsListModal');
    openMilestonesButton = document.getElementById('openMilestonesButton');
    closeMilestonesButton = document.getElementById('closeMilestonesButton');
    milestonesModal = document.getElementById('milestonesModal');
    milestonesListModalElement = document.getElementById('milestonesListModal');
    companionsContainer = document.getElementById('companionsContainer');
    volumeSlider = document.getElementById('volumeSlider');
    muteButton = document.getElementById('muteButton');
    openHelpButton = document.getElementById('openHelpButton');
    closeHelpButton = document.getElementById('closeHelpButton');
    helpModal = document.getElementById('helpModal');
    openAdvancedSettingsButton = document.getElementById('openAdvancedSettingsButton');
    closeAdvancedSettingsButton = document.getElementById('closeAdvancedSettingsButton');
    advancedSettingsModal = document.getElementById('advancedSettingsModal');
    toggleDamageNumbersEl = document.getElementById('toggleDamageNumbers');
    toggleGoldAnimationsEl = document.getElementById('toggleGoldAnimations');
    resetGameButtonAdvanced = document.getElementById('resetGameButtonAdvanced');
    requestTalentResetButton = document.getElementById('requestTalentResetButton');
    talentResetCostOptions = document.getElementById('talentResetCostOptions');
    resetTalentsWithShardsButton = document.getElementById('resetTalentsWithShardsButton');
    resetCostShardsDisplay = document.getElementById('resetCostShardsDisplay');
    resetTalentsWithGoldButton = document.getElementById('resetTalentsWithGoldButton');
    resetCostGoldDisplay = document.getElementById('resetCostGoldDisplay');
    cancelTalentResetButton = document.getElementById('cancelTalentResetButton');
    openResearchLabButton = document.getElementById('openResearchLabButton');
    closeResearchModalButton = document.getElementById('closeResearchModalButton');
    researchModal = document.getElementById('researchModal');
    researchContainer = document.getElementById('researchContainer');
    modalEchoShardsResearch = document.getElementById('modalEchoShardsResearch');
    openEssenceForgeButton = document.getElementById('openEssenceForgeButton');
    closeEssenceForgeButton = document.getElementById('closeEssenceForgeButton');
    essenceForgeModal = document.getElementById('essenceForgeModal');
    essenceContainer = document.getElementById('essenceContainer');
    modalEchoShardsEssence = document.getElementById('modalEchoShardsEssence');

    resetConfirmModal = document.getElementById('resetConfirmModal');
    confirmHardResetButton = document.getElementById('confirmHardResetButton');
    cancelHardResetButton = document.getElementById('cancelHardResetButton');

    companionEssenceDisplay = document.getElementById('companionEssenceDisplay');
    companionSkillModal = document.getElementById('companionSkillModal');
    companionSkillModalTitle = document.getElementById('companionSkillModalTitle');
    modalCompanionEssenceDisplay = document.getElementById('modalCompanionEssenceDisplay');
    companionSkillsContainer = document.getElementById('companionSkillsContainer');
    closeCompanionSkillModalButton = document.getElementById('closeCompanionSkillModalButton');

    openExpeditionsButton = document.getElementById('openExpeditionsButton');
    expeditionsModal = document.getElementById('expeditionsModal');
    expeditionsListContainer = document.getElementById('expeditionsListContainer');
    closeExpeditionsModalButton = document.getElementById('closeExpeditionsModalButton');
    expeditionSlotsDisplay = document.getElementById('expeditionSlotsDisplay');
    expeditionCompanionSelectModal = document.getElementById('expeditionCompanionSelectModal');
    expeditionCompanionSelectList = document.getElementById('expeditionCompanionSelectList');
    confirmExpeditionStartButton = document.getElementById('confirmExpeditionStartButton');
    cancelExpeditionStartButton = document.getElementById('cancelExpeditionStartButton');

    totalPlayTimeDisplay = document.getElementById('totalPlayTimeDisplay');
    currentRunPlayTimeDisplay = document.getElementById('currentRunPlayTimeDisplay');
    fastestBossKillDisplay = document.getElementById('fastestBossKillDisplay');

    talentTooltipElement = document.getElementById('talentTooltip');
    essenceTooltipElement = document.getElementById('essenceTooltip');
    researchTooltipElement = document.getElementById('researchTooltip'); // Inicializace research tooltipu
}

// ... (zbytek funkcí v uiController.js zůstává stejný)
function showMessageBox(message, isError = false, duration = 3500) {
    if (!messageBox) return;
    messageBox.textContent = message;
    messageBox.classList.remove('hidden');
    messageBox.className = `p-3 text-center text-sm rounded-md messageBox ${isError ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`;
    messageBox.style.maxWidth = '1000px'; messageBox.style.width = '100%';
    setTimeout(() => messageBox.classList.add('hidden') , duration);
}

function showDamageNumber(damage, x, y, isCrit) {
    if (!gameState.gameSettings.showDamageNumbers || !damageNumberContainer) return;
    const damageText = document.createElement('div');
    damageText.textContent = formatNumber(Math.ceil(damage));
    damageText.classList.add('damage-number');
    if (isCrit) damageText.classList.add('crit');
    const containerRect = damageNumberContainer.getBoundingClientRect();
    const approxTextWidth = (damageText.textContent.length * 10) + (isCrit ? 10:0);
    const approxTextHeight = 20 + (isCrit ? 5:0);
    damageText.style.left = `${x - containerRect.left - (approxTextWidth / 2)}px`;
    damageText.style.top = `${y - containerRect.top - (approxTextHeight / 2) - 15}px`;
    damageNumberContainer.appendChild(damageText);
    damageText.addEventListener('animationend', () => damageText.remove());
}

function showGoldGainAnimation(amount) {
    if (!gameState.gameSettings.showGoldAnimations || !goldDisplayContainer) return;
    const goldText = document.createElement('div');
    goldText.textContent = `+${formatNumber(amount)} Z`;
    goldText.classList.add('gold-gain-animation');
    goldDisplayContainer.appendChild(goldText);
    goldText.addEventListener('animationend', () => goldText.remove());
}

function updateEquipmentButtonStates() {
    if (!equipmentContainer || typeof gameState === 'undefined' || typeof gameState.equipment === 'undefined') {
        return;
    }

    let validCurrentTierIndex = 0;
    if (typeof gameState.currentTierIndex === 'number' && gameState.currentTierIndex >= 0) {
        if (typeof tiers !== 'undefined' && Array.isArray(tiers) && gameState.currentTierIndex < tiers.length) {
            validCurrentTierIndex = gameState.currentTierIndex;
        } else if (typeof tiers !== 'undefined' && Array.isArray(tiers) && tiers.length > 0) {
            validCurrentTierIndex = 0;
        }
    }


    equipmentSlots.forEach(slot => {
        const item = gameState.equipment[slot];
        const upgradeButtons = equipmentContainer.querySelectorAll(`.equipment-level-button[data-slot="${slot}"]`);

        if (!item || typeof item.level === 'undefined') {
            upgradeButtons.forEach(btn => {
                btn.disabled = true;
                const costSpan = btn.querySelector('.cost-text');
                if (costSpan && btn.dataset.amount === "1") costSpan.textContent = '(N/A)';
            });
            return;
        }

        upgradeButtons.forEach(button => {
            const amount = button.dataset.amount;
            let cost = 0;
            let canAfford = false;
            let isMaxLevel = item.level >= MAX_ITEM_LEVEL;

            const costSpan = button.querySelector('.cost-text');

            if (isMaxLevel) {
                button.disabled = true;
                if (amount === "1" && costSpan) {
                    costSpan.textContent = '(MAX)';
                }
                button.classList.remove('affordable');
                return;
            }

            button.disabled = false;
            cost = calculateItemUpgradeCost(slot, item.level, validCurrentTierIndex);
            canAfford = gameState.gold >= cost;

            if (amount === "1" && costSpan) {
                costSpan.textContent = `(${formatNumber(cost)} Z)`;
                button.classList.toggle('affordable', canAfford);
            } else {
                button.classList.remove('affordable');
            }
             if (amount !== "1") {
                button.disabled = !canAfford || isMaxLevel;
            } else {
                 button.disabled = !canAfford || isMaxLevel;
            }
        });
    });
}


function updateUI() {
    if (!goldDisplay || !passiveDamageDisplay || !companionEssenceDisplay) {
        return;
    }

    let passiveDamageFromTiersArtifactsTalentsUI = gameState.passivePercentFromTiers;
    let passiveDamageFromCompanionsUI = gameState.totalCompanionPassivePercent;

    if (typeof getResearchBonus === 'function') {
        passiveDamageFromCompanionsUI *= (1 + getResearchBonus('research_companion_damage_multiplier_percent'));
    }

    let totalBasePassivePercentUI = passiveDamageFromTiersArtifactsTalentsUI + passiveDamageFromCompanionsUI;

    if (typeof talents !== 'undefined' && talents.passivePercentMultiplierTalent && talents.passivePercentMultiplierTalent.currentLevel > 0) {
        totalBasePassivePercentUI *= (1 + talents.passivePercentMultiplierTalent.effectValue * talents.passivePercentMultiplierTalent.currentLevel);
    }
    if (typeof getEssenceBonus === 'function') {
        totalBasePassivePercentUI *= (1 + getEssenceBonus('essence_passive_dps_multiplier_percent'));
    }
    passiveDamageDisplay.textContent = formatNumber(totalBasePassivePercentUI * 100, 2) + "% HP/s";

    let goldMultiplier = gameState.echoPermanentGoldBonus;
    if (typeof talents !== 'undefined' && talents.goldVeins && talents.goldVeins.currentLevel > 0) {
        goldMultiplier *= (1 + talents.goldVeins.effectValue * talents.goldVeins.currentLevel);
    }
    if (typeof getArtifactBonus === 'function') {
        let artifactGoldBonus = getArtifactBonus('gold_bonus_percent_additive') / 100;
        goldMultiplier *= (1 + artifactGoldBonus);
    }
    if (typeof getResearchBonus === 'function') {
        goldMultiplier *= (1 + getResearchBonus('research_gold_multiplier_all_percent'));
    }
    if (typeof getEssenceBonus === 'function') {
        goldMultiplier *= (1 + getEssenceBonus('essence_gold_multiplier_all_percent'));
    }

    goldDisplay.textContent = formatNumber(Math.floor(gameState.gold));
    clickDamageDisplay.textContent = formatNumber(gameState.effectiveClickDamage);
    enemyEffectiveLevelDisplay.textContent = gameState.enemy.effectiveLevel;
    currentWorldDisplay.textContent = gameState.currentWorld;
    currentZoneDisplay.textContent = gameState.currentZoneInWorld;
    zoneProgressDisplay.textContent = `Postup v zóně: ${gameState.enemiesDefeatedInZone}/${ENEMIES_PER_ZONE}`;
    echoShardsDisplay.textContent = formatNumber(gameState.echoShards);
    companionEssenceDisplay.textContent = formatNumber(gameState.companionEssence);
    echoCountDisplay.textContent = formatNumber(gameState.echoCount);
    playerLevelDisplay.textContent = gameState.playerLevel;
    talentPointsDisplay.textContent = formatNumber(gameState.talentPoints);
    playerXPBar.style.width = `${(gameState.playerXP / gameState.xpToNextLevel) * 100}%`;
    playerXPText.textContent = `XP: ${formatNumber(Math.floor(gameState.playerXP))} / ${formatNumber(gameState.xpToNextLevel)}`;

    if (enemyNameDisplay) enemyNameDisplay.textContent = gameState.enemy.name;
    if (enemyHealthTextDisplay) enemyHealthTextDisplay.textContent = `${formatNumber(Math.max(0, Math.ceil(gameState.enemy.currentHealth)))} / ${formatNumber(Math.ceil(gameState.enemy.maxHealth))}`;
    if (enemyHealthBar) enemyHealthBar.style.width = `${(Math.max(0, gameState.enemy.currentHealth) / gameState.enemy.maxHealth) * 100}%`;
    if (enemyElement) {
        enemyElement.classList.toggle('champion', gameState.enemy.isChampion);
        enemyElement.classList.toggle('boss', gameState.enemy.isBoss);
    }
    if (bossTimerDisplay) {
        bossTimerDisplay.classList.toggle('hidden', !gameState.bossFightTimerActive);
        if(gameState.bossFightTimerActive) bossTimerDisplay.textContent = `Čas na bosse: ${gameState.bossFightTimeLeft.toFixed(1)}s`;
    }

    if (activeEffectsContainer) {
        activeEffectsContainer.innerHTML = '<h3 class="font-semibold text-gray-100">Aktivní efekty</h3>';
        let hasActiveEffects = false;
        Object.keys(gameState.activeBuffs).forEach(buffKey => {
            hasActiveEffects = true; const buff = gameState.activeBuffs[buffKey]; const el = document.createElement('div');
            if (buffKey === BUFF_TYPE_POWER_SHARD) { el.classList.add('buff-display'); el.textContent = `Úlomek síly: +${((POWER_SHARD_MULTIPLIER -1) * 100).toFixed(0)}% poškození (${buff.duration.toFixed(1)}s)`; }
            else if (buffKey === BUFF_TYPE_GOLD_RUSH) { el.classList.add('buff-display', 'gold-rush-buff'); el.textContent = `Zlatá horečka (Pasivní): ${GOLD_RUSH_MULTIPLIER}x zlato (${buff.duration.toFixed(1)}s)`;}
            activeEffectsContainer.appendChild(el);
        });
        Object.keys(gameState.activeDebuffs).forEach(debuffKey => {
            hasActiveEffects = true; const debuff = gameState.activeDebuffs[debuffKey]; const el = document.createElement('div'); el.classList.add('debuff-display');
            if (debuffKey === DEBUFF_TYPE_PARASITE) el.textContent = `Parazit: -${formatNumber(debuff.effectValue)} Z/s (${debuff.duration.toFixed(1)}s)`;
            activeEffectsContainer.appendChild(el);
        });
        if (gameState.mocnyUderActive) {
            hasActiveEffects = true; const el = document.createElement('div'); el.classList.add('skill-active-display');
            el.textContent = `Mocný úder: ${MOCNY_UDER_DAMAGE_MULTIPLIER.toFixed(0)}x Poškození (${gameState.mocnyUderDurationLeft.toFixed(1)}s)`; activeEffectsContainer.appendChild(el);
        }
        if (gameState.zlataHoreckaAktivniActive) {
            hasActiveEffects = true; const el = document.createElement('div'); el.classList.add('skill-active-display', 'gold-rush-buff');
            el.textContent = `Zlatá horečka (Aktivní): ${ZLATA_HORECKA_AKTIVNI_GOLD_MULTIPLIER}x Zlato (${gameState.zlataHoreckaAktivniDurationLeft.toFixed(1)}s)`; activeEffectsContainer.appendChild(el);
        }
        activeEffectsContainer.classList.toggle('hidden', !hasActiveEffects);
    }

    if (cleanseDebuffButton && cleanseCostDisplay) {
        cleanseDebuffButton.classList.toggle('hidden', !gameState.activeDebuffs[DEBUFF_TYPE_PARASITE]);
        if(gameState.activeDebuffs[DEBUFF_TYPE_PARASITE]) {
            cleanseCostDisplay.textContent = formatNumber(PARASITE_CLEANSE_COST);
            cleanseDebuffButton.disabled = gameState.gold < PARASITE_CLEANSE_COST;
        }
    }

    if (echoButton && echoShardsToGain && echoConditionDisplay) {
        const canEchoNow = gameState.currentTierIndex === tiers.length - 1 && equipmentSlots.every(slot => gameState.equipment[slot] && gameState.equipment[slot].level >= MAX_ITEM_LEVEL);
        echoButton.classList.toggle('hidden', !(canEchoNow && !gameState.bossFightTimerActive));
        if(canEchoNow && !gameState.bossFightTimerActive && typeof calculateEchoShardsToGain === 'function') {
            echoShardsToGain.textContent = formatNumber(calculateEchoShardsToGain());
            echoConditionDisplay.textContent = "Připraveno!";
        }
    }

    if (upgradeEchoGoldButton && echoGoldBonusValueDisplay && echoGoldLevelDisplay && echoGoldCostDisplay) {
        echoGoldBonusValueDisplay.textContent = (echoGoldUpgradeValue * 100).toFixed(0);
        echoGoldLevelDisplay.textContent = `(Úr. ${gameState.echoGoldLevelCount})`;
        echoGoldCostDisplay.textContent = formatNumber(gameState.echoGoldUpgradeCost);
        upgradeEchoGoldButton.disabled = gameState.echoShards < gameState.echoGoldUpgradeCost;
    }
    if (upgradeEchoDamageButton && echoDamageBonusValueDisplay && echoDamageLevelDisplay && echoDamageCostDisplay) {
        echoDamageBonusValueDisplay.textContent = (echoDamageUpgradeValue * 100).toFixed(0);
        echoDamageLevelDisplay.textContent = `(Úr. ${gameState.echoDamageLevelCount})`;
        echoDamageCostDisplay.textContent = formatNumber(gameState.echoDamageUpgradeCost);
        upgradeEchoDamageButton.disabled = gameState.echoShards < gameState.echoDamageUpgradeCost;
    }

    if (typeof updateEquipmentButtonStates === 'function') updateEquipmentButtonStates();
    if (typeof updateCompanionButtonStates === 'function') updateCompanionButtonStates();
    if (typeof renderGameStatsUI === 'function') renderGameStatsUI();

    if (mocnyUderButton && mocnyUderCooldownDisplay) {
        mocnyUderButton.disabled = gameState.mocnyUderActive || gameState.mocnyUderCooldownTimeLeft > 0;
        mocnyUderCooldownDisplay.textContent = gameState.mocnyUderActive ? `Aktivní: ${gameState.mocnyUderDurationLeft.toFixed(1)}s` : (gameState.mocnyUderCooldownTimeLeft > 0 ? `Nabíjí se: ${Math.ceil(gameState.mocnyUderCooldownTimeLeft)}s` : "(Připraveno)");
    }
    if (zlataHoreckaAktivniButton && zlataHoreckaAktivniCooldownDisplay) {
        zlataHoreckaAktivniButton.disabled = gameState.zlataHoreckaAktivniActive || gameState.zlataHoreckaAktivniCooldownTimeLeft > 0;
        zlataHoreckaAktivniCooldownDisplay.textContent = gameState.zlataHoreckaAktivniActive ? `Aktivní: ${gameState.zlataHoreckaAktivniDurationLeft.toFixed(1)}s` : (gameState.zlataHoreckaAktivniCooldownTimeLeft > 0 ? `Nabíjí se: ${Math.ceil(gameState.zlataHoreckaAktivniCooldownTimeLeft)}s` : "(Připraveno)");
    }
}

function renderGameStatsUI() {
    if (!gameStatsContainer) return;
    gameStatsContainer.innerHTML = '';
    const statsToShow = [
        { label: "Celkem kliknutí", value: formatNumber(gameState.lifetimeStats.totalClicks) },
        { label: "Kritických zásahů", value: formatNumber(gameState.lifetimeStats.totalCrits) },
        { label: "Nejvyšší poškození", value: formatNumber(gameState.lifetimeStats.highestDamageDealt) },
        { label: "Celkem zabitých nepřátel", value: formatNumber(gameState.lifetimeStats.totalEnemiesKilled) },
        { label: "Zabitých Bossů", value: formatNumber(gameState.lifetimeStats.totalBossesKilled) },
        { label: "Zabitých Šampionů", value: formatNumber(gameState.lifetimeStats.totalChampionsKilled) },
        { label: "Celkem zlata", value: formatNumber(Math.floor(gameState.lifetimeStats.lifetimeGoldEarned)) },
        { label: "Celkem Echo Úlomků", value: formatNumber(gameState.lifetimeStats.lifetimeEchoShardsEarned) },
        { label: "Nasbíraných Esencí Spol.", value: formatNumber(gameState.lifetimeStats.companionEssenceCollectedTotal || 0)},
        { label: "Dokončených Výprav", value: formatNumber(gameState.lifetimeStats.expeditionsCompletedTotal || 0)},
        { label: "Dosažených úrovní", value: formatNumber(gameState.lifetimeStats.lifetimePlayerLevelsGained) },
        { label: "Postoupených Tierů", value: formatNumber(gameState.lifetimeStats.lifetimeTiersAdvanced) },
        { label: "Celkový čas hraní", value: formatTime(gameState.lifetimeStats.totalPlayTimeSeconds || 0), id: "totalPlayTimeDisplay" },
        { label: "Čas v tomto Echu", value: formatTime(gameState.currentRunPlayTimeSeconds || 0), id: "currentRunPlayTimeDisplay" },
        { label: "Nejrychlejší Boss Kill", value: gameState.lifetimeStats.fastestBossKillSeconds === Infinity ? "N/A" : formatTime(gameState.lifetimeStats.fastestBossKillSeconds), id: "fastestBossKillDisplay" }
    ];

    statsToShow.forEach(stat => {
        const statDiv = document.createElement('div');
        statDiv.classList.add('stat-item');
        statDiv.innerHTML = `<span class="stat-label">${stat.label}:</span> <span class="stat-value" ${stat.id ? `id="${stat.id}"` : ''}>${stat.value}</span>`;
        gameStatsContainer.appendChild(statDiv);
    });
}

function openModal(modalElement) {
    if (modalElement) {
        modalElement.classList.remove('hidden');
        if (typeof soundManager !== 'undefined') soundManager.playSound('openModal');
    }
}

function closeModal(modalElement) {
    if (modalElement) {
        modalElement.classList.add('hidden');
        if (typeof soundManager !== 'undefined') soundManager.playSound('closeModal');
    }
}

function openTalentTreeModalUI() {
    if (typeof renderTalentTree === 'function') renderTalentTree();
    if (typeof updateTalentResetButtonState === 'function') updateTalentResetButtonState();
    openModal(talentTreeModal);
}

function openResearchLabModalUI() {
    if (typeof renderResearchUI === 'function') renderResearchUI();
    openModal(researchModal);
}

function openEssenceForgeModalUI() {
    if (typeof renderEssenceForgeUI === 'function') renderEssenceForgeUI();
    openModal(essenceForgeModal);
}

function openDailyQuestsModalUI() {
    if (typeof renderDailyQuestsUI === 'function') renderDailyQuestsUI();
    openModal(dailyQuestsModal);
}

function openMilestonesModalUI() {
    if (typeof renderMilestonesUI === 'function') renderMilestonesUI();
    openModal(milestonesModal);
}

function openHelpModalUI() {
    openModal(helpModal);
}

function openAdvancedSettingsModalUI() {
    if (toggleDamageNumbersEl) toggleDamageNumbersEl.checked = gameState.gameSettings.showDamageNumbers;
    if (toggleGoldAnimationsEl) toggleGoldAnimationsEl.checked = gameState.gameSettings.showGoldAnimations;
    openModal(advancedSettingsModal);
}

function openResetConfirmModalUI() {
    if (resetConfirmModal) {
        openModal(resetConfirmModal);
    } else {
        console.error("Reset confirm modal element not found for openResetConfirmModalUI");
    }
}

function closeResetConfirmModalUI() {
    if (resetConfirmModal) {
        closeModal(resetConfirmModal);
    } else {
        console.error("Reset confirm modal element not found for closeResetConfirmModalUI");
    }
}

function closeExpeditionsModalUI() {
    if (expeditionsModal) {
        closeModal(expeditionsModal);
    }
}

function closeExpeditionCompanionSelectModalUI() {
    if (expeditionCompanionSelectModal) {
        closeModal(expeditionCompanionSelectModal);
    }
}
