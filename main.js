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
    const splashClickText = document.getElementById('splashClickText'); // Získání reference na text

    if (!splashScreen || !gameArea || !splashClickText) {
        console.error("Splash screen, game area or splash click text element not found!");
        if (gameArea) gameArea.classList.remove('hidden'); // Alespoň zkusit zobrazit hru
    } else {
        // Event listener pro pohyb myši na splash screenu
        splashScreen.addEventListener('mousemove', (event) => {
            if (!splashScreen.classList.contains('hidden')) { // Jen pokud je splash screen viditelný
                splashClickText.classList.remove('hidden'); // Zobrazit text
                splashClickText.style.left = `${event.clientX}px`;
                splashClickText.style.top = `${event.clientY}px`;
            }
        });

        // Event listener pro opuštění splash screenu myší (volitelné, pokud chceme text skrýt)
        splashScreen.addEventListener('mouseleave', () => {
            splashClickText.classList.add('hidden');
        });

        splashScreen.addEventListener('click', async () => {
            console.log("Splash screen clicked.");
            await firstUserGestureHandler();
            splashScreen.classList.add('hidden');
            splashClickText.classList.add('hidden'); // Skrýt i text při kliknutí
            gameArea.classList.remove('hidden');
            console.log("Game area shown.");
        }, { once: true });
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

    // ... (zbytek vašich event listenerů v initializeGame) ...
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

    if (typeof gameTick === 'function' && typeof saveGame === 'function' && typeof checkCompletedExpeditions === 'function') {
        setInterval(() => {
            gameTick();
            checkCompletedExpeditions();
        }, 100);
        setInterval(saveGame, 15000);
        console.log("Game loops started (including expedition check).");
    } else {
        console.error("Herní smyčky nebyly spuštěny.");
    }
    
    console.log("Echoes of Infinity initialized!");
}

window.onload = initializeGame;

window.onbeforeunload = () => {
    if (typeof saveGame === 'function') {
        saveGame();
    }
};
