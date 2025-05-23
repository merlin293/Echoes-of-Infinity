// SOUBOR: main.js

let firstGestureMade = false;
let gameInitializationAttempted = false;

async function firstUserGestureHandler() {
    if (firstGestureMade) return;
    firstGestureMade = true;
    if (typeof soundManager !== 'undefined' && typeof soundManager._startAudioContextAndInitialize === 'function') {
        console.log("MAIN.JS: First user gesture detected, attempting to start audio context.");
        await soundManager._startAudioContextAndInitialize();
    } else {
        console.error("SoundManager or _startAudioContextAndInitialize not found for firstUserGestureHandler.");
    }
}

function initializeGame() {
    if (typeof window.gameConfigLoaded === 'undefined' || !window.gameConfigLoaded) {
        if (!gameInitializationAttempted) {
            console.warn("Config.js se ještě nenačetl. Zkouším znovu za 100ms...");
            gameInitializationAttempted = true;
            setTimeout(initializeGame, 100);
        } else {
            console.error("KRITICKÁ CHYBA: Config.js se nepodařilo načíst ani po zpoždění. Hra nemůže pokračovat.");
            if (typeof showMessageBox === 'function') {
                showMessageBox("Kritická chyba: Konfigurace hry se nenahrála. Zkuste obnovit stránku.", true, 10000);
            }
        }
        return;
    }

    const splashScreen = document.getElementById('splashScreen');
    const gameArea = document.getElementById('gameArea');

    if (!splashScreen || !gameArea) {
        console.error("Splash screen or game area element not found!");
        // If splash is missing, try to show gameArea directly to avoid getting stuck
        if (gameArea) gameArea.classList.remove('hidden');
        // Proceed with the rest of initialization if possible
    } else {
        // Game area is initially hidden by class in HTML
        // splashScreen.classList.remove('hidden'); // Splash is visible by default

        splashScreen.addEventListener('click', async () => {
            console.log("Splash screen clicked.");
            await firstUserGestureHandler(); // Ensure audio context is started on this first click
            splashScreen.classList.add('hidden');
            gameArea.classList.remove('hidden');
            console.log("Game area shown.");
            // After the game is visible, we might want to trigger an initial UI update
            // if it hasn't happened yet or if some elements depend on visibility.
            if (typeof updateUI === 'function') {
                // updateUI(); // Consider if needed here, or if loadGame handles it.
            }
        }, { once: true }); // Event listener to run only once
    }


    if (typeof initializeUIElements === 'function') {
        initializeUIElements();
    } else {
        console.error("initializeUIElements function not found. UI cannot be initialized.");
        return;
    }

    if (typeof loadGame === 'function') {
        loadGame();
    } else {
        console.error("loadGame function not found. Cannot start or load the game.");
        return;
    }

    if (enemyElement && typeof handleEnemyClick === 'function') {
        enemyElement.addEventListener('click', handleEnemyClick);
    }

    if (cleanseDebuffButton && typeof onCleanseParasite === 'function') {
        cleanseDebuffButton.addEventListener('click', onCleanseParasite);
    }
    if (echoButton && typeof handleEcho === 'function') {
        echoButton.addEventListener('click', handleEcho);
    }
    if (mocnyUderButton && typeof activateMocnyUder === 'function') {
        mocnyUderButton.addEventListener('click', activateMocnyUder);
    }
    if (zlataHoreckaAktivniButton && typeof activateZlataHoreckaAktivni === 'function') {
        zlataHoreckaAktivniButton.addEventListener('click', activateZlataHoreckaAktivni);
    }

    if (upgradeEchoGoldButton && typeof onUpgradeEchoGold === 'function') {
        upgradeEchoGoldButton.addEventListener('click', onUpgradeEchoGold);
    }
    if (upgradeEchoDamageButton && typeof onUpgradeEchoDamage === 'function') {
        upgradeEchoDamageButton.addEventListener('click', onUpgradeEchoDamage);
    }

    if (equipmentContainer && typeof upgradeEquipmentItem === 'function') {
        equipmentContainer.addEventListener('click', (event) => {
            const button = event.target.closest('.equipment-level-button');
            if (!button || button.disabled) return;
            const slot = button.dataset.slot;
            const amount = button.dataset.amount;
            if (slot && amount) {
                upgradeEquipmentItem(slot, amount);
            }
        });
    }
    if (advanceTierButton && typeof advanceToNextTier === 'function') {
        advanceTierButton.addEventListener('click', advanceToNextTier);
    }

     if (companionsContainer && typeof unlockCompanion === 'function' && typeof upgradeCompanion === 'function' && typeof openCompanionSkillTreeModalUI === 'function') {
        companionsContainer.addEventListener('click', (event) => {
            const button = event.target.closest('.companion-button');
            if (button && !button.disabled) {
                const companionId = button.dataset.id;
                if (button.classList.contains('unlock')) {
                    unlockCompanion(companionId);
                } else if (button.classList.contains('upgrade-companion')) {
                    upgradeCompanion(companionId);
                } else if (button.classList.contains('open-skills-companion')) {
                    openCompanionSkillTreeModalUI(companionId);
                }
            }
        });
    }

    if (openTalentTreeButton && typeof openTalentTreeModalUI === 'function') {
        openTalentTreeButton.addEventListener('click', openTalentTreeModalUI);
    }
    if (closeTalentTreeButton && typeof closeModal === 'function' && typeof talentTreeModal !== 'undefined') {
        closeTalentTreeButton.addEventListener('click', () => closeModal(talentTreeModal));
    }
    if (openResearchLabButton && typeof openResearchLabModalUI === 'function') {
        openResearchLabButton.addEventListener('click', openResearchLabModalUI);
    }
    if (closeResearchModalButton && typeof closeModal === 'function' && typeof researchModal !== 'undefined') {
        closeResearchModalButton.addEventListener('click', () => closeModal(researchModal));
    }
    if (openEssenceForgeButton && typeof openEssenceForgeModalUI === 'function') {
        openEssenceForgeButton.addEventListener('click', openEssenceForgeModalUI);
    }
    if (closeEssenceForgeButton && typeof closeModal === 'function' && typeof essenceForgeModal !== 'undefined') {
        closeEssenceForgeButton.addEventListener('click', () => closeModal(essenceForgeModal));
    }
    if (openAdvancedSettingsButton && typeof openAdvancedSettingsModalUI === 'function') {
        openAdvancedSettingsButton.addEventListener('click', openAdvancedSettingsModalUI);
    }
    if (closeAdvancedSettingsButton && typeof closeModal === 'function' && typeof advancedSettingsModal !== 'undefined') {
        closeAdvancedSettingsButton.addEventListener('click', () => closeModal(advancedSettingsModal));
    }
    if (openHelpButton && typeof openHelpModalUI === 'function') {
        openHelpButton.addEventListener('click', openHelpModalUI);
    }
    if (closeHelpButton && typeof closeModal === 'function' && typeof helpModal !== 'undefined') {
        closeHelpButton.addEventListener('click', () => closeModal(helpModal));
    }
    if (openDailyQuestsButton && typeof openDailyQuestsModalUI === 'function') {
        openDailyQuestsButton.addEventListener('click', openDailyQuestsModalUI);
    }
    if (closeDailyQuestsButton && typeof closeModal === 'function' && typeof dailyQuestsModal !== 'undefined') {
        closeDailyQuestsButton.addEventListener('click', () => closeModal(dailyQuestsModal));
    }
    if (openMilestonesButton && typeof openMilestonesModalUI === 'function') {
        openMilestonesButton.addEventListener('click', openMilestonesModalUI);
    }
    if (closeMilestonesButton && typeof closeModal === 'function' && typeof milestonesModal !== 'undefined') {
        closeMilestonesButton.addEventListener('click', () => closeModal(milestonesModal));
    }
    if (closeCompanionSkillModalButton && typeof closeModal === 'function' && typeof companionSkillModal !== 'undefined') {
        closeCompanionSkillModalButton.addEventListener('click', () => closeModal(companionSkillModal));
    }
    if (openExpeditionsButton && typeof openExpeditionsModalUI === 'function') {
        openExpeditionsButton.addEventListener('click', openExpeditionsModalUI);
    }
    if (closeExpeditionsModalButton && typeof closeModal === 'function' && typeof expeditionsModal !== 'undefined') {
        closeExpeditionsModalButton.addEventListener('click', () => closeModal(expeditionsModal));
    }
    if (expeditionsListContainer && typeof openCompanionSelectModalForExpedition === 'function') {
        expeditionsListContainer.addEventListener('click', (event) => {
            const startButton = event.target.closest('.start-expedition-btn');
            if (startButton && !startButton.disabled) {
                const expeditionId = startButton.dataset.expeditionId;
                if (expeditionId) {
                    openCompanionSelectModalForExpedition(expeditionId);
                }
            }
        });
    }
    if (expeditionCompanionSelectList && typeof updateConfirmExpeditionButtonState === 'function') {
        expeditionCompanionSelectList.addEventListener('change', (event) => {
            if (event.target.classList.contains('companion-checkbox')) {
                updateConfirmExpeditionButtonState();
            }
        });
    }
    if (confirmExpeditionStartButton && typeof startExpedition === 'function') {
        confirmExpeditionStartButton.addEventListener('click', startExpedition);
    }
    if (cancelExpeditionStartButton && typeof closeModal === 'function' && typeof expeditionCompanionSelectModal !== 'undefined') {
        cancelExpeditionStartButton.addEventListener('click', () => closeModal(expeditionCompanionSelectModal));
    }

    if (requestTalentResetButton && typeof handleTalentResetRequest === 'function') {
        requestTalentResetButton.addEventListener('click', handleTalentResetRequest);
    }
    if (resetTalentsWithShardsButton && typeof performTalentReset === 'function') {
        resetTalentsWithShardsButton.addEventListener('click', () => performTalentReset('shards'));
    }
    if (resetTalentsWithGoldButton && typeof performTalentReset === 'function') {
        resetTalentsWithGoldButton.addEventListener('click', () => performTalentReset('gold'));
    }
    if (cancelTalentResetButton && typeof cancelTalentReset === 'function') {
        cancelTalentResetButton.addEventListener('click', cancelTalentReset);
    }

    if (toggleDamageNumbersEl) {
        toggleDamageNumbersEl.addEventListener('change', () => {
            if (gameState && gameState.gameSettings) {
                gameState.gameSettings.showDamageNumbers = toggleDamageNumbersEl.checked;
            }
        });
    }
    if (toggleGoldAnimationsEl) {
        toggleGoldAnimationsEl.addEventListener('change', () => {
            if (gameState && gameState.gameSettings) {
                gameState.gameSettings.showGoldAnimations = toggleGoldAnimationsEl.checked;
            }
        });
    }
    if (resetGameButtonAdvanced && typeof requestHardResetConfirmation === 'function') {
        resetGameButtonAdvanced.addEventListener('click', requestHardResetConfirmation);
    }

    if (confirmHardResetButton && typeof performHardReset === 'function') {
        confirmHardResetButton.addEventListener('click', performHardReset);
    }
    if (cancelHardResetButton && typeof closeResetConfirmModalUI === 'function') {
        cancelHardResetButton.addEventListener('click', closeResetConfirmModalUI);
    }

    if (volumeSlider && typeof soundManager !== 'undefined' && typeof soundManager.setVolume === 'function') {
        volumeSlider.addEventListener('input', (event) => {
            soundManager.setVolume(event.target.value);
        });
    }
    if (muteButton && typeof soundManager !== 'undefined' && typeof soundManager.toggleMute === 'function') {
        muteButton.addEventListener('click', () => {
            soundManager.toggleMute();
        });
    }

    // Odebráno: Listenery pro první interakci jsou nyní na splash screenu
    // document.body.addEventListener('click', firstUserGestureHandler, { capture: true, once: true });
    // document.body.addEventListener('touchstart', firstUserGestureHandler, { capture: true, once: true });
    // document.body.addEventListener('keydown', firstUserGestureHandler, { capture: true, once: true });

    if (typeof gameTick === 'function' && typeof saveGame === 'function' && typeof checkCompletedExpeditions === 'function') {
        setInterval(() => {
            gameTick();
            checkCompletedExpeditions();
        }, 100);
        setInterval(saveGame, 15000);
        console.log("Game loops started (including expedition check).");
    } else {
        // ... (stávající chybové hlášky) ...
    }

    console.log("Echoes of Infinity initialized!");
}

window.onload = initializeGame;

window.onbeforeunload = () => {
    if (typeof saveGame === 'function') {
        saveGame();
    }
};
