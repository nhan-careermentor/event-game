import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  GAME_CONFIG, 
  ICONS, 
  ITEM_CATEGORIES, 
  ACHIEVEMENTS, 
  rand, 
  pick, 
  makeBoothCode 
} from '../utils/constants';

// Custom hook for countdown timer
const useCountdown = (active, seconds) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const intervalRef = useRef(null);
  
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (!active) {
      setTimeLeft(seconds); // Reset time when not active
      return;
    }
    
    console.log('⏰ Starting countdown from', seconds); // DEBUG
    setTimeLeft(seconds);
    
    intervalRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime > 0 ? prevTime - 1 : 0;
        console.log('⏰ Time left:', newTime); // DEBUG
        return newTime;
      });
    }, 1000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [active, seconds]);
  
  return timeLeft;
};

// Custom hook for screen shake effect
const useScreenShake = () => {
  const [isShaking, setIsShaking] = useState(false);

  const triggerShake = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 200);
  }, []);

  return { isShaking, triggerShake };
};

// Main Game Logic Hook
export const useGameLogic = (phase, playSound) => {
  // Game State
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [level, setLevel] = useState("Student");
  const [items, setItems] = useState([]);
  const [particles, setParticles] = useState([]);
  const [spawnEffects, setSpawnEffects] = useState([]);
  const [achievement, setAchievement] = useState(null);
  const [stats, setStats] = useState({ goodClicks: 0, badClicks: 0, missedItems: 0 });
  const [endedAt, setEndedAt] = useState(null);
  const [boothCode, setBoothCode] = useState("");

  // Timers and refs
  const spawnTimer = useRef(null);
  const cleanupTimer = useRef(null);
  const comboTimer = useRef(null);

  // Screen shake hook
  const { isShaking, triggerShake } = useScreenShake();

  // Countdown timer
  const timeLeft = useCountdown(phase === "game", GAME_CONFIG.DURATION_SEC);

  // Calculate game intensity for visual effects
  const gameIntensity = useMemo(() => {
    if (phase !== "game") return 0;
    return Math.min(1, (GAME_CONFIG.DURATION_SEC - timeLeft) / GAME_CONFIG.DURATION_SEC);
  }, [timeLeft, phase]);

  // Reset game state
  const resetGame = useCallback(() => {
    console.log('🔄 Resetting game state...'); // DEBUG
    
    setScore(0);
    setCombo(0);
    setLevel("Student");
    setItems([]);
    setParticles([]);
    setSpawnEffects([]);
    setAchievement(null);
    setStats({ goodClicks: 0, badClicks: 0, missedItems: 0 });
    setEndedAt(null);
    setBoothCode("");

    // Clear any existing timers
    if (spawnTimer.current) {
      clearInterval(spawnTimer.current);
      spawnTimer.current = null;
    }
    if (cleanupTimer.current) {
      clearInterval(cleanupTimer.current);
      cleanupTimer.current = null;
    }
    if (comboTimer.current) {
      clearTimeout(comboTimer.current);
      comboTimer.current = null;
    }
    
    console.log('✅ Game state reset complete'); // DEBUG
  }, []);

  // Item spawning logic
  useEffect(() => {
    if (phase !== "game") return;
    
    const start = Date.now();
    
    const spawn = () => {
      const elapsed = (Date.now() - start) / 1000;
      const difficulty = Math.min(1, elapsed / GAME_CONFIG.DURATION_SEC);

      // Check if mobile (simple detection)
      const isMobile = window.innerWidth < 640;
      
      // Dynamic difficulty scaling
      const speedMultiplier = 1 + (difficulty * (isMobile ? 0.3 : 0.4)); // Slower on mobile
      const badItemChance = 0.35 + (difficulty * 0.15);
      const powerUpChance = 0.03 + (difficulty * 0.02);
      
      // Sometimes spawn multiple items at once
      const batch = Math.random() < (isMobile ? 0.2 : 0.3) ? 2 : 1;
      const newOnes = [];
      const newSpawnEffects = [];
      
      for (let i = 0; i < batch; i++) {
        let itemType, key, points;
        
        // Determine item type based on probability
        if (Math.random() < powerUpChance) {
          itemType = "powerup";
          key = pick(ITEM_CATEGORIES.POWER_UPS);
          points = key === "star" ? 3 : 2;
        } else if (Math.random() < badItemChance) {
          itemType = "bad";
          key = pick(ITEM_CATEGORIES.BAD);
          points = -1;
        } else {
          itemType = "good";
          key = pick(ITEM_CATEGORIES.GOOD);
          points = 1;
        }
        
        // Calculate item lifetime
        const ttl = (1200 - difficulty * 300) / speedMultiplier + (Math.random() * 200 - 100);
        const x = rand(isMobile ? 15 : 8, isMobile ? 85 : 92);
        const y = rand(isMobile ? 20 : 15, isMobile ? 80 : 85);
        
        // Create spawn effect (SIMPLIFIED VERSION)
        const spawnEffectId = `spawn-${Date.now()}-${i}`;
        newSpawnEffects.push({
          id: spawnEffectId,
          x,
          y,
          createdAt: Date.now(), // Add timestamp
          onComplete: () => {
            // Simplified cleanup
            setSpawnEffects(prev => prev.filter(effect => effect.id !== spawnEffectId));
          }
        });
        
        // Create game item
        newOnes.push({
          id: `${key}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          kind: itemType,
          src: ICONS[key],
          title: key,
          points,
          x,
          y,
          bornAt: Date.now(),
          ttl,
        });
      }
      
      setSpawnEffects(prev => [...prev, ...newSpawnEffects]);
      setItems((prev) => [...prev, ...newOnes]);
    };

    // Dynamic spawn rate based on time left
    const spawnInterval = Math.max(400, 700 - (timeLeft * 8));
    spawnTimer.current = window.setInterval(spawn, spawnInterval);
    
    // Clean up expired items
    cleanupTimer.current = window.setInterval(() => {
      setItems((prev) => {
        const filtered = prev.filter((it) => Date.now() - it.bornAt < it.ttl);
        const missedCount = prev.length - filtered.length;
        if (missedCount > 0) {
          setStats(s => ({ ...s, missedItems: s.missedItems + missedCount }));
        }
        return filtered;
      });
    }, 200);

    return () => {
      if (spawnTimer.current) window.clearInterval(spawnTimer.current);
      if (cleanupTimer.current) window.clearInterval(cleanupTimer.current);
    };
  }, [phase, timeLeft]);

  // Combo system - reset combo after 2 seconds of inactivity
  useEffect(() => {
    if (combo > 0) {
      if (comboTimer.current) clearTimeout(comboTimer.current);
      comboTimer.current = setTimeout(() => setCombo(0), 2000);
    }
    return () => {
      if (comboTimer.current) clearTimeout(comboTimer.current);
    };
  }, [combo]);

  // Achievement checking
  useEffect(() => {
    ACHIEVEMENTS.forEach(ach => {
      if (ach.check(stats, combo, score) && (!achievement || achievement.id !== ach.id)) {
        setAchievement(ach);
      }
    });
  }, [score, combo, stats.badClicks, stats.goodClicks]); // Removed 'achievement' from dependencies

  // Automatic spawn effects cleanup
  useEffect(() => {
    if (phase === "game") {
      // Clean up old spawn effects every second
      const cleanupInterval = setInterval(() => {
        const now = Date.now();
        setSpawnEffects(prev => {
          const filtered = prev.filter(effect => {
            const age = now - (effect.createdAt || 0);
            return age < 1000; // Remove effects older than 1 second
          });
          
          if (filtered.length !== prev.length) {
            console.log(`🧹 Cleaned up ${prev.length - filtered.length} old spawn effects`);
          }
          
          return filtered;
        });
      }, 1000);

      return () => clearInterval(cleanupInterval);
    }
  }, [phase]);

  // Level progression based on score
  useEffect(() => {
    if (score >= 20) setLevel("Professional");
    else if (score >= 10) setLevel("Intern");
    else setLevel("Student");
  }, [score]);

  // Handle item click
const handleClickItem = useCallback((id, kind, points, event) => {
  console.log('🎯 ITEM CLICKED!', { id, kind, points }); // DEBUG
  
  // Safely get click position with fallback
  let x = 100; // Default position
  let y = 100; // Default position
  
  try {
    if (event && event.currentTarget) {
      const rect = event.currentTarget.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }
  } catch (error) {
    console.warn('Could not get click position, using defaults');
  }

  console.log('📍 Click position:', { x, y }); // DEBUG

  // Play appropriate sound effect
  if (kind === 'bad') {
    console.log('🔊 Playing bad sound'); // DEBUG
    playSound && playSound('bad');
    triggerShake && triggerShake();
  } else {
    console.log('🔊 Playing good sound'); // DEBUG
    playSound && playSound('click');
  }

  // Remove item from game
  setItems((prev) => {
    console.log('🗑️ Removing item, items before:', prev.length); // DEBUG
    const filtered = prev.filter((it) => it.id !== id);
    console.log('🗑️ Items after:', filtered.length); // DEBUG
    return filtered;
  });

  // Add particle effect
  const particleId = Date.now() + Math.random();
  console.log('✨ Adding particle:', particleId); // DEBUG
  setParticles(prev => [...prev, { 
    id: particleId, 
    x, 
    y, 
    type: kind === 'bad' ? 'bad' : 'good',
    points: kind === 'bad' ? points : points,
    onComplete: (id) => {
      setParticles(prev => prev.filter(p => p.id !== id));
    }
  }]);

  // Update score and stats
  if (kind === 'bad') {
    console.log('❌ Bad item clicked'); // DEBUG
    setScore((s) => {
      const newScore = Math.max(0, s + points);
      console.log('❌ New score after bad click:', newScore); // DEBUG
      return newScore;
    });
    setStats(s => ({ ...s, badClicks: s.badClicks + 1 }));
    setCombo(0); // Break combo on bad click
  } else {
    console.log('✅ Good item clicked'); // DEBUG
    // Apply combo multiplier for good clicks
    setCombo(currentCombo => {
      const comboMultiplier = Math.min(3, Math.floor(currentCombo / 3) + 1);
      const finalPoints = points * comboMultiplier;
      console.log('✅ Points calculation:', { points, comboMultiplier, finalPoints }); // DEBUG
      
      setScore((s) => {
        const newScore = s + finalPoints;
        console.log('✅ New score after good click:', newScore); // DEBUG
        return newScore;
      });
      
      return currentCombo + 1;
    });
    setStats(s => ({ ...s, goodClicks: s.goodClicks + 1 }));
  }
}, [playSound, triggerShake]); // Removed score and combo from dependencies to avoid stale closures

  // Generate booth code and end timestamp
  const generateEndGameData = useCallback((email) => {
    const ts = Date.now();
    setEndedAt(ts);
    const code = makeBoothCode(`${email}|${score}|${ts}`);
    setBoothCode(code);
    return { timestamp: ts, boothCode: code };
  }, [score]);

  // Achievement close handler
  const handleAchievementClose = useCallback(() => {
    setAchievement(null);
  }, []);

  return {
    // Game state
    score,
    combo,
    level,
    items,
    particles,
    spawnEffects,
    achievement,
    stats,
    endedAt,
    boothCode,
    timeLeft,
    gameIntensity,
    isShaking,

    // Game actions
    resetGame,
    handleClickItem,
    generateEndGameData,
    handleAchievementClose,
  };
};