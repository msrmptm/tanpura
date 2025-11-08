document.addEventListener('DOMContentLoaded', () => {

    // --- Configuration ---
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    // --- DOM Element References ---
    const noteSelector = document.getElementById('note-selector');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const volumeSlider = document.getElementById('volume-slider'); // === MODIFICATION ===

    // --- Web Audio API Setup ---
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const gainNode = audioContext.createGain(); // === MODIFICATION ===
    
    let currentSource = null;
    let activeButton = null;
    let isContextUnlocked = false;

    // === MODIFICATION ===
    // Connect the gain node to the speakers (destination)
    // This only needs to be done once.
    gainNode.connect(audioContext.destination);
    
    // Set the initial volume from the slider's default value
    gainNode.gain.value = volumeSlider.value;


    playPauseBtn.disabled = true;

    function unlockAudioContext() {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        isContextUnlocked = true;
    }

    function createNoteButtons() {
        notes.forEach(note => {
            const button = document.createElement('button');
            button.className = 'note-button';
            button.textContent = note;
            button.dataset.note = note;
            button.addEventListener('click', handleNoteClick);
            noteSelector.appendChild(button);
        });
    }

    async function handleNoteClick(event) {
        if (!isContextUnlocked) unlockAudioContext();

        const clickedButton = event.currentTarget;

        // 1. Immediately update the visual highlight for instant feedback.
        if (activeButton) {
            activeButton.classList.remove('active');
        }
        clickedButton.classList.add('active');
        
        // 2. Stop any existing audio source and resume context if needed.
        stopAudio();
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        const note = clickedButton.dataset.note;
        const encodedNote = encodeURIComponent(note);
        const filePath = `Tanpura ${encodedNote}.wav`;
        
        // 3. Load and play the new sound.
        await loadAndPlayAudio(filePath, clickedButton);
    }
    
    async function loadAndPlayAudio(url, buttonElement) {
