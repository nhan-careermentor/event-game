import { useEffect, useRef, useState } from 'react';
import { SOUNDS } from '../utils/constants';

// Sound Manager Hook - Controls all game audio
export const useSoundManager = () => {
  const soundsRef = useRef({});
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundsLoaded, setSoundsLoaded] = useState(false);

  // Load all sound files when component starts
  useEffect(() => {
    const loadSounds = async () => {
      const soundPromises = Object.entries(SOUNDS).map(([key, src]) => {
        return new Promise((resolve) => {
          const audio = new Audio(src);
          audio.preload = 'auto';
          audio.volume = 0.3; // Set volume to 30%
          
          const handleLoad = () => {
            soundsRef.current[key] = audio;
            resolve();
          };
          
          // When sound loads successfully
          audio.addEventListener('canplaythrough', handleLoad, { once: true });
          
          // If sound fails to load, don't break the game
          audio.addEventListener('error', () => {
            console.warn(`Failed to load sound: ${src}`);
            resolve();
          }, { once: true });
        });
      });

      // Wait for all sounds to load
      await Promise.all(soundPromises);
      setSoundsLoaded(true);
    };

    loadSounds();
  }, []);

  // Function to play a specific sound
  const playSound = (soundKey) => {
    // Don't play if sounds are disabled or not loaded yet
    if (!soundEnabled || !soundsLoaded) return;
    
    const sound = soundsRef.current[soundKey];
    if (sound) {
      sound.currentTime = 0; // Reset to beginning
      sound.play().catch(error => {
        console.warn(`Error playing sound ${soundKey}:`, error);
      });
    }
  };

  // Function to turn sounds on/off
  const toggleSound = () => setSoundEnabled(prev => !prev);

  // Return functions that other parts of the game can use
  return { 
    playSound, 
    soundEnabled, 
    toggleSound, 
    soundsLoaded 
  };
};

// Sound Control Button Component
export const SoundControl = ({ soundEnabled, onToggle, soundsLoaded }) => {
  return (
    <button
      onClick={onToggle}
      className={`p-2 rounded-lg transition-all duration-200 ${
        soundEnabled 
          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
      }`}
      title={soundEnabled ? 'Sound On' : 'Sound Off'}
    >
      {soundsLoaded ? (
        soundEnabled ? '🔊' : '🔇'
      ) : (
        '⏳' // Loading icon
      )}
    </button>
  );
};