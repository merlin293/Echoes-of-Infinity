// SOUBOR: main.js

// Globální proměnná pro sledování prvního gesta uživatele (pro SoundManager)
let firstGestureMade = false; 
let gameInitializationAttempted = false; // Nová vlajka, aby se initializeGame nevolala donekonečna

/**
 * Zpracuje první interakci uživatele pro inicializaci audio kontextu.
 */
async function firstUserGestureHandler() { 
    if (firstGestureMade) return;
    firstGestureMade = true;
    if (typeof soundManager !== 'undefined' && typeof soundManager._startAudioContextAndInitialize === 'function') {
        await soundManager._startAudioContextAndInitialize(); 
    } else {
        console.error("SoundManager or _startAudioContextAndInitialize not found for firstUserGestureHandler.");
    }
}

/**
 * Hlavní inicializační funkce hry.
 * Volá se po načtení celého DOM.
 */
function initializeGame() {
    // Kontrola, zda je konfigurace načtena
    if (typeof window.gameConfigLoaded === 'undefined' || !window.gameConfigLoaded) {
        if (!gameInitializationAttempted) { // Zkusíme jen jednou odložit, abychom se vyhnuli nekonečné smyčce
            console.warn("Config.js se ještě nenačetl. Zkouším znovu za 100ms...");
            gameInitializationAttempted = true;
            setTimeout(initializeGame, 100); // Zkusíme znovu za 100ms
        } else {
            console.error("KRITICKÁ CHYBA: Config.js se nepodařilo načíst ani po zpoždění. Hra nemůže pokračovat.");
            // Zde by se mohlo zobrazit chybové hlášení uživateli
            if (typeof showMessageBox === 'function') {
                showMessageBox("Kritická chyba: Konfigurace hry se nenahrála. Zkuste obnovit stránku.", true, 10000);
            }
        }
        return; // Ukončíme aktuální pokus o inicializaci
    }
    // console.log("Config.js je načten, pokračuji s initializeGame.");


    if (typeof initializeUIElements === 'function') {
        initializeUIElements(); 
    } else {
        console.error("initializeUIElements function not found. UI cannot be initialized.");
        return; 
    }

    if (typeof loadGame === 'function') {
        loadGame(); // loadGame by měla volat initializeEquipment a renderEquipmentUI na správných místech
    } else {
        console.error("loadGame function not found. Cannot start or load the game.");
        return; 
    }
    
    // Interakce s nepřítelem
    if (enemyElement && typeof handleEnemyClick === 'function') { 
        enemyElement.addEventListener('click', handleEnemyClick);
    }

    // Tlačítka v panelu akcí
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

    // Echo Vylepšení
    if (upgradeEchoGoldButton && typeof onUpgradeEchoGold === 'function') { 
        upgradeEchoGoldButton.addEventListener('click', onUpgradeEchoGold);
    }
    if (upgradeEchoDamageButton && typeof onUpgradeEchoDamage === 'function') { 
        upgradeEchoDamageButton.addEventListener('click', onUpgradeEchoDamage);
    }

    // Vybavení
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
    
    // Společníci
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

    // Otevírání/Zavírání Modálních Oken
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


    // Reset Talentů
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

    // Pokročilá Nastavení
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

    // Listenery pro Reset Confirm Modal
    if (confirmHardResetButton && typeof performHardReset === 'function') {
        confirmHardResetButton.addEventListener('click', performHardReset);
    }
    if (cancelHardResetButton && typeof closeResetConfirmModalUI === 'function') {
        cancelHardResetButton.addEventListener('click', closeResetConfirmModalUI);
    }


    // Ovládání Zvuku
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
    
    // Listenery pro první interakci uživatele (pro audio)
    document.body.addEventListener('click', firstUserGestureHandler, { capture: true, once: true });
    document.body.addEventListener('touchstart', firstUserGestureHandler, { capture: true, once: true });
    document.body.addEventListener('keydown', firstUserGestureHandler, { capture: true, once: true });

    // Spuštění herních smyček
    if (typeof gameTick === 'function' && typeof saveGame === 'function' && typeof checkCompletedExpeditions === 'function') {
        setInterval(() => {
            gameTick();
            checkCompletedExpeditions(); 
        }, 100); 
        setInterval(saveGame, 15000); 
        console.log("Game loops started (including expedition check).");
    } else {
        if (typeof gameTick !== 'function') {
            console.error("CHYBA: Funkce 'gameTick' nebyla nalezena. Zkontrolujte soubor gameLogic.js a jeho správné načtení.");
        }
        if (typeof saveGame !== 'function') {
            console.error("CHYBA: Funkce 'saveGame' nebyla nalezena. Zkontrolujte soubor saveLoadController.js a jeho správné načtení.");
        }
        if (typeof checkCompletedExpeditions !== 'function') {
            console.error("CHYBA: Funkce 'checkCompletedExpeditions' nebyla nalezena. Zkontrolujte soubor expeditionController.js a jeho správné načtení.");
        }
        console.error("Herní smyčky nebyly spuštěny, protože jedna nebo více požadovaných funkcí nebyly nalezeny.");
    }
    
    console.log("Echoes of Infinity initialized!");
}

// Spuštění hry po načtení celého DOM
window.onload = initializeGame;

// Uložení hry při zavření/opětovném načtení stránky
window.onbeforeunload = () => {
    if (typeof saveGame === 'function') {
        saveGame();
    }
};