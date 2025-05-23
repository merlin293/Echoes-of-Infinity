// SOUBOR: utils.js

// --- Utility Functions ---
function formatNumber(num, precision = 2) {
    const absNum = Math.abs(num);
    if (absNum < 1000) {
        if (num !== 0 && absNum < 0.01 && precision === 2) {
            return num.toFixed(4);
        }
        return parseFloat(num.toFixed(precision)).toString();
    }
    const si = [
        { value: 1, symbol: "" }, { value: 1E3, symbol: "K" }, { value: 1E6, symbol: "M" },
        { value: 1E9, symbol: "B" }, { value: 1E12, symbol: "T" }, { value: 1E15, symbol: "P" },
        { value: 1E18, symbol: "E" }
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    let i;
    for (i = si.length - 1; i > 0; i--) {
        if (absNum >= si[i].value) {
            break;
        }
    }
    let formattedNum = (num / si[i].value).toFixed(precision);
    formattedNum = formattedNum.replace(rx, "$1");
    return formattedNum + si[i].symbol;
}

// --- Sound Manager ---
const soundManager = {
    isMuted: false,
    volume: 0.5,
    audioContextInitialized: false,
    synthsInitialized: false,
    synthConfigs: {
        click: { type: 'Synth', options: { oscillator: { type: "triangle" }, envelope: { attack: 0.005, decay: 0.05, sustain: 0, release: 0.1 }, volume: -18 } },
        critClick: { type: 'Synth', options: { oscillator: { type: "sawtooth" }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.05, release: 0.2 }, volume: -12 } },
        enemyDefeat: { type: 'NoiseSynth', options: { noise: { type: "white" }, envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.1 }, volume: -20 } },
        championDefeat: { type: 'NoiseSynth', options: { noise: { type: "pink" }, envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.2 }, volume: -15 } },
        bossDefeat: { type: 'MetalSynth', options: { frequency: 50, envelope: { attack: 0.01, decay: 0.4, release: 0.2 }, harmonicity: 3.1, modulationIndex: 16, resonance: 2000, octaves: 1.5, volume: -10 } },
        skillActivate: { type: 'Synth', options: { oscillator: { type: "pulse", width: 0.3 }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.3 }, volume: -10 } },
        buffGain: { type: 'Synth', options: { oscillator: { type: "sine" }, envelope: { attack: 0.001, decay: 0.1, sustain: 0.05, release: 0.1 }, volume: -15 } },
        debuffApply: { type: 'Synth', options: { oscillator: { type: "square" }, envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.1 }, filter: { type: "lowpass", frequency: 800 }, volume: -18 } },
        tierAdvance: { type: 'Synth', options: { oscillator: {type: "fmsquare", modulationType : "sine", harmonicity : 0.5, modulationIndex: 10}, envelope: {attack: 0.1, decay: 0.2, sustain: 0.3, release: 0.5}, volume: -8 } },
        echo: { type: 'MembraneSynth', options: { pitchDecay: 0.08, octaves: 5, oscillator: { type: "sine" }, envelope: { attack: 0.001, decay: 0.5, sustain: 0.01, release: 0.8, attackCurve: "exponential"}, volume: -5 } },
        milestone: { type: 'PluckSynth', options: { attackNoise: 0.5, dampening: 2000, resonance: 0.9, volume: -12 } },
        upgrade: { type: 'Synth', options: { oscillator: { type: "triangle" }, envelope: { attack: 0.001, decay: 0.02, sustain: 0, release: 0.05 }, volume: -22 } },
        openModal: { type: 'Synth', options: { oscillator: { type: "sine" }, envelope: { attack: 0.005, decay: 0.05, sustain: 0, release: 0.1 }, volume: -20 } },
        closeModal: { type: 'Synth', options: { oscillator: { type: "sine" }, envelope: { attack: 0.005, decay: 0.03, sustain: 0, release: 0.08 }, volume: -22 } }
    },
    sounds: {},

    init() {
    },

    async _startAudioContextAndInitialize() {
        if (this.audioContextInitialized) {
            if (!this.synthsInitialized) this._initializeSynthsInternal();
            return;
        }
        if (Tone.context.state !== 'running') {
            try {
                await Tone.start();
                this.audioContextInitialized = true;
            } catch (e) {
                console.error("Error starting AudioContext in _startAudioContextAndInitialize:", e);
                this.audioContextInitialized = false;
                return;
            }
        } else {
            this.audioContextInitialized = true;
        }
        this._initializeSynthsInternal();
        this.loadSettingsFromGameState();
    },

    _initializeSynthsInternal() {
        if (!this.audioContextInitialized || this.synthsInitialized) {
            return;
        }
        for (const soundName in this.synthConfigs) {
            const config = this.synthConfigs[soundName];
            try {
                if (Tone[config.type]) {
                    this.sounds[soundName] = new Tone[config.type](config.options).toDestination();
                } else {
                    console.error(`Unknown Tone synth type: ${config.type} for sound: ${soundName}`);
                }
            } catch (e) {
                console.error(`Error initializing synth ${soundName}:`, e);
            }
        }
        this.synthsInitialized = true;
    },

    async playSound(soundName, note = 'C4', duration = '8n') {
        if (!this.audioContextInitialized || !this.synthsInitialized) {
            if (typeof firstGestureMade !== 'undefined' && !firstGestureMade) {
                if (typeof firstUserGestureHandler === 'function') await firstUserGestureHandler();
            }
            if (!this.audioContextInitialized || !this.synthsInitialized) {
                // console.warn(`playSound(${soundName}) called, but audio still not fully initialized.`);
                return;
            }
        }
        if (this.isMuted) return;

        if (!this.sounds[soundName]) {
            console.warn(`Sound object for "${soundName}" not found. Synths might not be initialized correctly.`);
            return;
        }
        try {
            const synth = this.sounds[soundName];
            if (synth instanceof Tone.Synth || synth instanceof Tone.MetalSynth) {
                synth.triggerAttackRelease(note, duration, Tone.now());
            } else if (synth instanceof Tone.NoiseSynth || synth instanceof Tone.MembraneSynth) {
                // Pro NoiseSynth a MembraneSynth není argument 'note' vždy relevantní nebo může způsobit problémy.
                // Použijeme jen trvání. Pokud je potřeba výška tónu pro MembraneSynth,
                // je lepší ji nastavit v konfiguraci nebo použít specifické volání.
                synth.triggerAttackRelease(duration, Tone.now());
            } else if (synth instanceof Tone.PluckSynth) {
                synth.triggerAttack(note, Tone.now());
            }
        } catch (e) {
            console.error(`Error playing sound ${soundName}:`, e, this.sounds[soundName]);
        }
    },

    setVolume(volumeValue, internalCall = false) {
        this.volume = parseFloat(volumeValue);
        if (this.audioContextInitialized && !this.isMuted) {
            Tone.Destination.volume.value = Tone.gainToDb(this.volume);
        }
        if (!internalCall && typeof gameState !== 'undefined' && gameState.gameSettings) {
             gameState.gameSettings.soundVolume = this.volume;
        }
    },

    applyMuteState() {
        if (this.audioContextInitialized) {
             Tone.Destination.mute = this.isMuted;
             if (!this.isMuted) {
                Tone.Destination.volume.value = Tone.gainToDb(this.volume);
             }
        }
        if (typeof muteButton !== 'undefined' && muteButton) {
            muteButton.textContent = this.isMuted ? "Odtlumit" : "Ztlumit";
            muteButton.classList.toggle('muted', this.isMuted);
        }
    },

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.applyMuteState();

        if (typeof gameState !== 'undefined' && gameState.gameSettings) {
            gameState.gameSettings.soundMuted = this.isMuted;
        }
        return this.isMuted;
    },

    loadSettingsFromGameState() {
        if (typeof gameState !== 'undefined' && gameState.gameSettings) {
            this.volume = gameState.gameSettings.soundVolume !== undefined ? gameState.gameSettings.soundVolume : 0.5;
            this.isMuted = gameState.gameSettings.soundMuted !== undefined ? gameState.gameSettings.soundMuted : false;
        }

        if (this.audioContextInitialized) {
            this.setVolume(this.volume, true);
            this.applyMuteState();
        }
        else if (typeof muteButton !== 'undefined' && muteButton && typeof volumeSlider !== 'undefined' && volumeSlider) {
             muteButton.textContent = this.isMuted ? "Odtlumit" : "Ztlumit";
             muteButton.classList.toggle('muted', this.isMuted);
             volumeSlider.value = this.volume;
        }
    }
};
