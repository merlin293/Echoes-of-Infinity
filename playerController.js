// SOUBOR: playerController.js

// Globální proměnná pro tooltip element (bude inicializována v uiController.js)
// let talentTooltipElement;

/**
 * Vypočítá potřebné XP pro další úroveň hráče.
 * @returns {number} - Počet XP potřebných pro další úroveň.
 */
function calculateXpToNextLevel() {
    return Math.floor(70 * Math.pow(1.10, gameState.playerLevel - 1));
}

/**
 * Přidá hráči zkušenosti a případně ho posune na další úroveň.
 * @param {number} amount - Množství XP k přidání.
 */
function gainXP(amount) {
    gameState.playerXP += amount;
    let leveledUp = false;
    while (gameState.playerXP >= gameState.xpToNextLevel) {
        gameState.playerXP -= gameState.xpToNextLevel;
        gameState.playerLevel++;
        gameState.lifetimeStats.lifetimePlayerLevelsGained++;
        if (typeof talentPointGainPerLevel === 'undefined') {
            console.error("CHYBA: talentPointGainPerLevel není definována! Zkontrolujte config.js a pořadí načítání skriptů.");
            gameState.talentPoints += 1; // Fallback
        } else {
            gameState.talentPoints += talentPointGainPerLevel;
        }
        gameState.xpToNextLevel = calculateXpToNextLevel();
        leveledUp = true;
        if (typeof showMessageBox === 'function') showMessageBox(`Postup na úroveň ${gameState.playerLevel}! Získal jsi ${talentPointGainPerLevel || 1} talentový bod.`, false, 3000);
        if (typeof soundManager !== 'undefined') {
            soundManager.playSound('milestone', 'D5', '4n');
        }
    }
    if (leveledUp) {
        if (typeof renderTalentTree === 'function') renderTalentTree();
        if (typeof updateUI === 'function') updateUI();
    }
}

/**
 * Pomocná funkce pro výpočet celkového efektivního pasivního poškození v %HP/s pro náhled.
 * @returns {number} - Celkové pasivní poškození v procentech (např. 0.005 pro 0.5%).
 */
function calculateTotalEffectivePassivePercentForPreview() {
    let passiveFromTiersArtifactsTalents = gameState.passivePercentFromTiers;
    let passiveFromCompanions = gameState.totalCompanionPassivePercent;

    if (typeof getResearchBonus === 'function') {
        passiveFromCompanions *= (1 + getResearchBonus('research_companion_damage_multiplier_percent'));
    }

    let totalBasePassive = passiveFromTiersArtifactsTalents + passiveFromCompanions;

    // Zde se ujistíme, že přistupujeme k talents[id].currentLevel bezpečně
    const passiveMultiplierTalent = talents.passivePercentMultiplierTalent;
    if (passiveMultiplierTalent && (passiveMultiplierTalent.currentLevel || 0) > 0) {
        totalBasePassive *= (1 + passiveMultiplierTalent.effectValue * (passiveMultiplierTalent.currentLevel || 0));
    }
    if (typeof getEssenceBonus === 'function') {
        totalBasePassive *= (1 + getEssenceBonus('essence_passive_dps_multiplier_percent'));
    }
    return totalBasePassive;
}


/**
 * Pomocná funkce pro získání efektivních statistik s dočasně změněnou úrovní talentu.
 * @param {string} talentIdToMod - ID talentu, jehož úroveň se má dočasně změnit.
 * @param {number} tempLevel - Dočasná úroveň talentu pro výpočet.
 * @returns {object} - Objekt s náhledovými statistikami.
 */
function getEffectiveStatsWithTempTalentLevel(talentIdToMod, tempLevel) {
    const originalLevel = talents[talentIdToMod].currentLevel || 0;
    talents[talentIdToMod].currentLevel = tempLevel;

    // Přepočet statistik, které mohou být ovlivněny talenty
    if (typeof updateCurrentTierBonuses === 'function') updateCurrentTierBonuses(); // Může být ovlivněno talenty
    if (typeof calculateEffectiveStats === 'function') calculateEffectiveStats(); // Hlavní přepočet
    // Přepočet pro expedice a offline, pokud jsou relevantní pro tento talent
    let tempExpeditionSlots = gameState.expeditionSlots;
    if (talentIdToMod === 'expeditionSlotsTalent' && talents.expeditionSlotsTalent) {
         // Musíme simulovat, jak by se změnily sloty
        let baseSlots = 1; // Nebo nějaká jiná základní hodnota, pokud ji máte
        // Najdeme původní příspěvek talentu a odečteme ho, pak přičteme nový
        let otherTalentSlots = 0;
        for (const id in talents) {
            if (talents[id].effectType === 'expedition_slots_additive' && id !== talentIdToMod) {
                otherTalentSlots += (talents[id].currentLevel || 0) * talents[id].effectValue;
            }
        }
        tempExpeditionSlots = baseSlots + otherTalentSlots + (tempLevel * talents.expeditionSlotsTalent.effectValue);
    }


    const previewStats = {
        clickDamage: gameState.effectiveClickDamage,
        critChance: gameState.effectiveCritChance,
        totalPassivePercent: calculateTotalEffectivePassivePercentForPreview(),
        expeditionSlots: tempExpeditionSlots,
        // Pro offline bonusy se náhled zobrazuje přímo jako procento talentu
    };

    // Obnovení původního stavu
    talents[talentIdToMod].currentLevel = originalLevel;
    if (typeof updateCurrentTierBonuses === 'function') updateCurrentTierBonuses();
    if (typeof calculateEffectiveStats === 'function') calculateEffectiveStats();
    // Není potřeba explicitně obnovovat gameState.expeditionSlots zde, protože se mění jen dočasná proměnná

    return previewStats;
}


/**
 * Generuje texty pro náhled efektu talentu.
 * @param {string} talentId - ID talentu.
 * @returns {object} - Objekt s texty pro tooltip.
 */
function getTalentEffectPreviewText(talentId) {
    const talent = talents[talentId];
    if (!talent) {
        console.error(`getTalentEffectPreviewText: Talent definition not found for ID: ${talentId}`);
        return { name: "Neznámý talent", description: "", currentLevelText: "", currentEffectText: "Chyba: Definice nenalezena", nextEffectText: "", costText: "" };
    }

    const currentLevel = talent.currentLevel || 0;
    let currentEffectText = "";
    let nextEffectText = "";
    let previewStatsNextLevel;

    if (currentLevel < talent.maxLevel) {
        previewStatsNextLevel = getEffectiveStatsWithTempTalentLevel(talentId, currentLevel + 1);
    }

    switch (talent.effectType) {
        case 'base_click_damage_multiplier_percent':
            currentEffectText = `Nyní: ${formatNumber(gameState.effectiveClickDamage, 0)} Poškození klikem`;
            if (previewStatsNextLevel) {
                nextEffectText = `Další úr.: ${formatNumber(previewStatsNextLevel.clickDamage, 0)} Poškození klikem`;
            }
            break;
        case 'crit_chance_bonus_percent':
            currentEffectText = `Nyní: ${formatNumber(gameState.effectiveCritChance * 100, 1)}% Šance na krit`;
            if (previewStatsNextLevel) {
                nextEffectText = `Další úr.: ${formatNumber(previewStatsNextLevel.critChance * 100, 1)}% Šance na krit`;
            }
            break;
        case 'passive_percent_flat_boost_talent':
        case 'all_passive_percent_multiplier_talent':
            currentEffectText = `Nyní: ${formatNumber(calculateTotalEffectivePassivePercentForPreview() * 100, 2)}% Max HP/s (celkem)`;
            if (previewStatsNextLevel) {
                nextEffectText = `Další úr.: ${formatNumber(previewStatsNextLevel.totalPassivePercent * 100, 2)}% Max HP/s (celkem)`;
            }
            break;
        // Talenty s přímým procentuálním efektem
        case 'gold_multiplier_all_percent':
        case 'echo_shard_multiplier_percent':
        case 'crit_damage_multiplier_bonus_percent':
        case 'expedition_duration_reduction_percent':
        case 'expedition_extra_reward_chance_percent':
        case 'expedition_cost_reduction_percent':
            currentEffectText = `Nyní: +${formatNumber(currentLevel * talent.effectValue * 100, 0)}%`;
            if (currentLevel < talent.maxLevel) {
                nextEffectText = `Další úr.: +${formatNumber((currentLevel + 1) * talent.effectValue * 100, 0)}%`;
            }
            break;
        case 'offline_gold_earn_percentage_additive_talent':
        case 'offline_xp_earn_percentage_additive_talent':
            currentEffectText = `Nyní: +${formatNumber(currentLevel * talent.effectValue * 100, 0)}% (k základu offline)`;
            if (currentLevel < talent.maxLevel) {
                nextEffectText = `Další úr.: +${formatNumber((currentLevel + 1) * talent.effectValue * 100, 0)}% (k základu offline)`;
            }
            break;
        case 'max_offline_time_increase_hours_additive':
            currentEffectText = `Nyní: +${formatNumber(currentLevel * talent.effectValue, 0)} hod. (k max. offline času)`;
            if (currentLevel < talent.maxLevel) {
                nextEffectText = `Další úr.: +${formatNumber((currentLevel + 1) * talent.effectValue, 0)} hod.`;
            }
            break;
        case 'expedition_slots_additive':
            currentEffectText = `Nyní: ${gameState.expeditionSlots} slotů pro výpravy`;
            if (previewStatsNextLevel) { // previewStatsNextLevel zde obsahuje .expeditionSlots
                nextEffectText = `Další úr.: ${previewStatsNextLevel.expeditionSlots} slotů pro výpravy`;
            }
            break;
        case 'guaranteed_crit_every_x_hits':
             currentEffectText = currentLevel > 0 ? `Efekt: Každý ${formatNumber(talent.effectValue,0)}. klik je kritický.` : "Efekt: Neaktivní";
             nextEffectText = currentLevel < talent.maxLevel ? `Další úr.: Aktivuje efekt (každý ${formatNumber(talent.effectValue,0)}. klik).` : "";
            break;
        case 'aura_percent_health_damage':
            if (currentLevel > 0) {
                currentEffectText = `Efekt: ${formatNumber(talent.effectValue.percent * 100,1)}% max HP/s (max ${formatNumber(talent.effectValue.cap)} DPS)`;
            } else {
                currentEffectText = "Efekt: Neaktivní";
            }
            nextEffectText = currentLevel < talent.maxLevel ? `Další úr.: Aktivuje auru.` : "";
            break;
        default:
            let genericCurrentBonus = currentLevel * (talent.effectValue || 0);
            currentEffectText = `Nyní (přímý efekt): ${formatNumber(genericCurrentBonus, 2)}`;
            if (currentLevel < talent.maxLevel) {
                let genericNextBonus = (currentLevel + 1) * (talent.effectValue || 0);
                nextEffectText = `Další úr. (přímý efekt): ${formatNumber(genericNextBonus, 2)}`;
            }
    }

    if (currentLevel >= talent.maxLevel) {
        nextEffectText = "Maximální úroveň";
    }

    return {
        name: `${talent.icon || '⭐'} ${talent.name}`,
        description: talent.description,
        currentLevelText: `Úroveň: ${currentLevel}/${talent.maxLevel}`,
        currentEffectText,
        nextEffectText,
        costText: currentLevel < talent.maxLevel ? `Cena další úrovně: ${formatNumber(talent.cost(currentLevel))} TB` : ""
    };
}

/**
 * Zobrazí tooltip s informacemi o talentu.
 * @param {string} talentId - ID talentu.
 * @param {MouseEvent} event - Událost myši pro pozicování.
 */
function showTalentTooltip(talentId, event) {
    if (!talentTooltipElement) {
        return;
    }
    const preview = getTalentEffectPreviewText(talentId);
    let tooltipHTML = `
        <strong class="talent-tooltip-name">${preview.name}</strong>
        <p class="talent-tooltip-level">${preview.currentLevelText}</p>
        <p class="talent-tooltip-description">${preview.description}</p>
        <hr class="talent-tooltip-hr">
        <p class="talent-tooltip-effect">${preview.currentEffectText}</p>`;
    if (preview.nextEffectText) {
        tooltipHTML += `<p class="talent-tooltip-effect-next">${preview.nextEffectText}</p>`;
    }
    talentTooltipElement.innerHTML = tooltipHTML;
    talentTooltipElement.classList.remove('hidden');
    updateTalentTooltipPosition(event);
}

/**
 * Skryje tooltip talentu.
 */
function hideTalentTooltip() {
    if (talentTooltipElement) {
        talentTooltipElement.classList.add('hidden');
    }
}

/**
 * Aktualizuje pozici tooltipu talentu.
 * @param {MouseEvent} event - Událost myši.
 */
function updateTalentTooltipPosition(event) {
    if (!talentTooltipElement || talentTooltipElement.classList.contains('hidden')) return;
    const tooltipWidth = talentTooltipElement.offsetWidth;
    const tooltipHeight = talentTooltipElement.offsetHeight;
    let x = event.clientX + 15;
    let y = event.clientY + 15;
    const viewportRight = window.innerWidth;
    const viewportBottom = window.innerHeight;
    if (x + tooltipWidth > viewportRight - 10) {
        x = event.clientX - tooltipWidth - 15;
    }
    if (y + tooltipHeight > viewportBottom - 10) {
        y = event.clientY - tooltipHeight - 15;
    }
    x = Math.max(10, x);
    y = Math.max(10, y);
    talentTooltipElement.style.left = `${x}px`;
    talentTooltipElement.style.top = `${y}px`;
}


/**
 * Vykreslí strom talentů v modálním okně.
 */
function renderTalentTree() {
    if (!talentsContainer || !modalPlayerLevel || !modalTalentPoints) {
        console.error("Talent tree UI elements not found for rendering.");
        return;
    }
    talentsContainer.innerHTML = '';
    modalPlayerLevel.textContent = gameState.playerLevel;
    modalTalentPoints.textContent = formatNumber(gameState.talentPoints);

    const branches = {};
    const talentDefinitions = talents;

    for (const id in talentDefinitions) {
        if (talentDefinitions.hasOwnProperty(id)) {
            const talent = talentDefinitions[id];
            if (!branches[talent.branch]) {
                branches[talent.branch] = [];
            }
            branches[talent.branch].push({ ...talent, id });
        }
    }

    for (const branchName in branches) {
        const branchTitle = document.createElement('h4');
        branchTitle.classList.add('talent-branch-title');
        let readableBranchName = branchName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        if (branchName === 'basic') readableBranchName = "Základní Vylepšení";
        if (branchName === 'crit') readableBranchName = "Kritické Zásahy";
        if (branchName === 'passive_dps') readableBranchName = "Pasivní Poškození (%HP)";
        if (branchName === 'expedition_mastery') readableBranchName = "🗺️ Mistrovství Výprav";
        if (branchName === 'temporal_echoes') readableBranchName = "⏳ Časové Ozvěny (Offline)";
        branchTitle.textContent = readableBranchName;
        talentsContainer.appendChild(branchTitle);

        branches[branchName].forEach(talent => {
            const talentDiv = document.createElement('div');
            talentDiv.classList.add('talent-item');
            if (talent.isUltimate) talentDiv.classList.add('is-ultimate');

            talentDiv.addEventListener('mouseenter', (event) => showTalentTooltip(talent.id, event));
            talentDiv.addEventListener('mouseleave', hideTalentTooltip);
            talentDiv.addEventListener('mousemove', updateTalentTooltipPosition);

            const nameP = document.createElement('p');
            nameP.classList.add('talent-name');
            nameP.textContent = `${talent.icon || '⭐'} ${talent.name} (Úr. ${talent.currentLevel || 0}/${talent.maxLevel})`;
            talentDiv.appendChild(nameP);

            const descP = document.createElement('p');
            descP.classList.add('talent-description');
            descP.textContent = talent.description;
            talentDiv.appendChild(descP);

            const costP = document.createElement('p');
            costP.classList.add('talent-level-cost');
            const currentCost = talent.cost(talent.currentLevel || 0);
            costP.textContent = (talent.currentLevel || 0) < talent.maxLevel ? `Cena další úrovně: ${formatNumber(currentCost)} TB` : 'Maximální úroveň';
            talentDiv.appendChild(costP);

            if ((talent.currentLevel || 0) < talent.maxLevel) {
                const upgradeButton = document.createElement('button');
                upgradeButton.classList.add('talent-upgrade-button');
                upgradeButton.textContent = 'Vylepšit';

                let prerequisiteMet = true;
                if (talent.requires) {
                    const prerequisiteTalentDef = talentDefinitions[talent.requires];
                    const prerequisiteTalentCurrentLevel = talents[talent.requires]?.currentLevel || 0;

                    if (prerequisiteTalentDef) {
                        const requiredLevelForPrereq = prerequisiteTalentDef.isUltimate ? 1 : prerequisiteTalentDef.maxLevel;
                        prerequisiteMet = prerequisiteTalentCurrentLevel >= requiredLevelForPrereq;

                        if (!prerequisiteMet) {
                            costP.innerHTML += `<br><span class="text-xs text-red-400">Vyžaduje: ${prerequisiteTalentDef.icon || ''} ${prerequisiteTalentDef.name} (${prerequisiteTalentDef.isUltimate ? 'aktivní' : `úr. ${requiredLevelForPrereq}`})</span>`;
                        }
                    } else {
                        prerequisiteMet = false;
                        console.warn(`Předpoklad '${talent.requires}' pro talent '${talent.id}' nebyl nalezen.`);
                         costP.innerHTML += `<br><span class="text-xs text-red-400">Chyba: Předpoklad nenalezen.</span>`;
                    }
                }
                upgradeButton.disabled = gameState.talentPoints < currentCost || !prerequisiteMet;
                upgradeButton.onclick = () => upgradeTalent(talent.id);
                talentDiv.appendChild(upgradeButton);
            }
            talentsContainer.appendChild(talentDiv);
        });
    }
    if (typeof updateTalentResetButtonState === 'function') updateTalentResetButtonState();
}

/**
 * Vylepší talent hráče.
 * @param {string} talentId - ID talentu k vylepšení.
 */
function upgradeTalent(talentId) {
    const talent = talents[talentId];

    if (!talent) {
        console.error(`Talent s ID ${talentId} nebyl nalezen.`);
        return;
    }

    const cost = talent.cost(talent.currentLevel || 0);
    if (gameState.talentPoints >= cost && (talent.currentLevel || 0) < talent.maxLevel) {
        gameState.talentPoints -= cost;
        talent.currentLevel = (talent.currentLevel || 0) + 1;

        if (typeof showMessageBox === 'function') showMessageBox(`Talent "${talent.name}" vylepšen na úroveň ${talent.currentLevel}!`, false, 2000);
        if (typeof soundManager !== 'undefined') {
            soundManager.playSound('upgrade', 'G5', '16n');
        }

        // Specifické akce po vylepšení talentu
        if (talent.effectType === 'expedition_slots_additive') {
            gameState.expeditionSlots += talent.effectValue; // Přidáme sloty
            if (typeof renderAvailableExpeditions === 'function') renderAvailableExpeditions(); // Aktualizujeme UI expedic
        }

        if (talent.effectType === 'passive_percent_flat_boost_talent' || talent.effectType === 'all_passive_percent_multiplier_talent') {
            if (typeof updateCurrentTierBonuses === 'function') updateCurrentTierBonuses();
        }

        if (typeof calculateEffectiveStats === 'function') calculateEffectiveStats();
        renderTalentTree();
        if (typeof updateUI === 'function') updateUI();
    } else if (gameState.talentPoints < cost) {
        if (typeof showMessageBox === 'function') showMessageBox("Nedostatek talentových bodů!", true);
    } else if ((talent.currentLevel || 0) >= talent.maxLevel) {
        if (typeof showMessageBox === 'function') showMessageBox("Tento talent je již na maximální úrovni!", true);
    }
}

/**
 * Aktualizuje stav tlačítka pro reset talentů a zobrazí/skryje možnosti platby.
 */
function updateTalentResetButtonState() {
    if (!requestTalentResetButton || !talentResetCostOptions) return;
    const anyTalentAllocated = Object.values(talents).some(t => (t.currentLevel || 0) > 0);
    requestTalentResetButton.disabled = !anyTalentAllocated;
    requestTalentResetButton.textContent = anyTalentAllocated ? "♻️ Resetovat Talentové Body" : "Žádné talenty k resetu";
    talentResetCostOptions.classList.add('hidden');
    requestTalentResetButton.classList.remove('hidden');
}

/**
 * Zobrazí možnosti pro reset talentů a vypočítá náklady.
 */
function handleTalentResetRequest() {
    if (!requestTalentResetButton || !talentResetCostOptions || !resetCostShardsDisplay || !resetCostGoldDisplay || !resetTalentsWithShardsButton || !resetTalentsWithGoldButton) return;
    const anyTalentAllocated = Object.values(talents).some(t => (t.currentLevel || 0) > 0);
    if (!anyTalentAllocated) {
        if (typeof showMessageBox === 'function') showMessageBox("Žádné talentové body nejsou aktuálně investovány.", true);
        return;
    }
    const goldCost = calculateTalentResetGoldCost();
    resetCostShardsDisplay.textContent = formatNumber(TALENT_RESET_COST_SHARDS);
    resetCostGoldDisplay.textContent = formatNumber(goldCost);
    resetTalentsWithShardsButton.disabled = gameState.echoShards < TALENT_RESET_COST_SHARDS;
    resetTalentsWithGoldButton.disabled = gameState.gold < goldCost;
    requestTalentResetButton.classList.add('hidden');
    talentResetCostOptions.classList.remove('hidden');
}

/**
 * Vypočítá cenu resetu talentů ve zlatě.
 * @returns {number} - Cena ve zlatě.
 */
function calculateTalentResetGoldCost() {
    let cost = TALENT_RESET_BASE_GOLD_COST;
    cost += (gameState.playerLevel * 2000) * (gameState.echoCount + 1);
    return Math.floor(cost);
}

/**
 * Zruší proces resetu talentů a skryje možnosti platby.
 */
function cancelTalentReset() {
    if (!talentResetCostOptions || !requestTalentResetButton) return;
    talentResetCostOptions.classList.add('hidden');
    requestTalentResetButton.classList.remove('hidden');
    updateTalentResetButtonState();
}

/**
 * Provede reset talentových bodů po zaplacení.
 * @param {string} paymentType - Typ platby ('shards' nebo 'gold').
 */
function performTalentReset(paymentType) {
    let actualPointsRefunded = 0;
    for (const id in talents) {
        if (talents.hasOwnProperty(id)) {
            const talent = talents[id];
            if ((talent.currentLevel || 0) > 0) {
                for (let i = 0; i < (talent.currentLevel || 0); i++) {
                    actualPointsRefunded += talent.cost(i);
                }
            }
        }
    }

    if (actualPointsRefunded === 0) {
        if (typeof showMessageBox === 'function') showMessageBox("Žádné talentové body k resetování.", true);
        cancelTalentReset();
        return;
    }

    if (paymentType === 'shards') {
        if (gameState.echoShards >= TALENT_RESET_COST_SHARDS) {
            gameState.echoShards -= TALENT_RESET_COST_SHARDS;
        } else {
            if (typeof showMessageBox === 'function') showMessageBox("Nedostatek Echo Úlomků pro reset!", true);
            return;
        }
    } else if (paymentType === 'gold') {
        const goldCost = calculateTalentResetGoldCost();
        if (gameState.gold >= goldCost) {
            gameState.gold -= goldCost;
        } else {
            if (typeof showMessageBox === 'function') showMessageBox("Nedostatek Zlata pro reset!", true);
            return;
        }
    } else {
        console.error("Neznámý typ platby pro reset talentů:", paymentType);
        return;
    }

    gameState.talentPoints += actualPointsRefunded;
    for (const id in talents) {
        if (talents.hasOwnProperty(id)) {
            // Resetujeme i sloty expedic, pokud byly přidány talentem
            if (talents[id].effectType === 'expedition_slots_additive' && talents[id].currentLevel > 0) {
                gameState.expeditionSlots -= (talents[id].currentLevel * talents[id].effectValue);
            }
            talents[id].currentLevel = 0;
        }
    }
    // Zajistíme, aby počet slotů neklesl pod základní hodnotu
    gameState.expeditionSlots = Math.max(1, gameState.expeditionSlots);


    if (typeof showMessageBox === 'function') showMessageBox(`Talentové body byly úspěšně resetovány! Získal jsi zpět ${formatNumber(actualPointsRefunded)} talentových bodů.`, false, 3500);
    if (typeof soundManager !== 'undefined') {
        soundManager.playSound('echo', 'A4', '2n');
    }

    if (typeof calculateEffectiveStats === 'function') calculateEffectiveStats();
    if (typeof updateCurrentTierBonuses === 'function') updateCurrentTierBonuses();
    renderTalentTree();
    if (typeof updateUI === 'function') updateUI();
    if (typeof renderAvailableExpeditions === 'function') renderAvailableExpeditions(); // Aktualizujeme UI expedic po resetu slotů
    cancelTalentReset();
    updateTalentResetButtonState();
}
