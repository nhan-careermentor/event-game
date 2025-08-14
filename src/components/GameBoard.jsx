import React, { useState, useEffect, useMemo, useRef } from 'react';
import { URLS, GAME_CONFIG, ICONS } from '../utils/constants';
import { SoundControl } from '../hooks/useSoundManager';

// Background Animation Component - Creates moving particles and effects
const AnimatedBackground = ({ timeLeft, phase, gameIntensity }) => {
  const [backgroundParticles, setBackgroundParticles] = useState([]);
  
  // Calculate background colors based on time pressure
  const backgroundGradient = useMemo(() => {
    if (phase !== "game") return "from-blue-50 to-purple-50";
    
    const timeRatio = timeLeft / GAME_CONFIG.DURATION_SEC;
    if (timeRatio > 0.7) return "from-blue-50 via-cyan-50 to-purple-50";
    if (timeRatio > 0.3) return "from-yellow-50 via-orange-50 to-red-50";
    return "from-red-100 via-pink-100 to-purple-100";
  }, [timeLeft, phase]);

  // Spawn floating background elements during game
  useEffect(() => {
    if (phase !== "game") return;

    const spawnBackgroundParticle = () => {
      const newParticle = {
        id: Date.now() + Math.random(),
        x: Math.random() * 100,
        y: 105, // Start below screen
        icon: 'mortarboard', // Use career icon for background
        size: 20 + Math.random() * 15,
        speed: 0.5 + Math.random() * 1,
        opacity: 0.1 + Math.random() * 0.15,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 2
      };
      
      setBackgroundParticles(prev => [...prev.slice(-8), newParticle]);
    };

    const interval = setInterval(spawnBackgroundParticle, 2000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, [phase]);

  // Animate background particles
  useEffect(() => {
    if (phase !== "game") {
      setBackgroundParticles([]);
      return;
    }

    const animationInterval = setInterval(() => {
      setBackgroundParticles(prev => 
        prev.map(particle => ({
          ...particle,
          y: particle.y - particle.speed,
          rotation: particle.rotation + particle.rotationSpeed
        })).filter(particle => particle.y > -10)
      );
    }, 50);

    return () => clearInterval(animationInterval);
  }, [phase]);

  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${backgroundGradient} transition-all duration-1000`}>
      {/* Animated grid pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, ${0.1 + gameIntensity * 0.2}) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
          animation: phase === "game" ? 'pulse 2s ease-in-out infinite' : 'none'
        }}
      />
      
      {/* Floating background particles */}
      {backgroundParticles.map(particle => (
        <div
          key={particle.id}
          className="absolute pointer-events-none"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: particle.opacity,
            transform: `rotate(${particle.rotation}deg)`,
            transition: 'opacity 0.5s ease-out'
          }}
        >
          <img
            src={ICONS[particle.icon]}
            alt=""
            style={{ width: particle.size, height: particle.size }}
            className="object-contain"
          />
        </div>
      ))}

      {/* Time pressure warning overlay */}
      {phase === "game" && timeLeft <= 10 && (
        <div 
          className="absolute inset-0 bg-red-500 pointer-events-none"
          style={{
            opacity: timeLeft <= 5 ? 0.1 + (0.1 * Math.sin(Date.now() / 200)) : 0.05,
            animation: timeLeft <= 5 ? 'pulse 0.5s ease-in-out infinite' : 'none'
          }}
        />
      )}
    </div>
  );
};

// Spawn Effect - Visual effect when items appear
const SpawnEffect = ({ x, y, onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Very quick effect - just 500ms total
    const timer = setTimeout(() => {
      setVisible(false);
      // Immediately call onComplete after hiding
      setTimeout(onComplete, 100);
    }, 400);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null; // Don't render anything if not visible

  return (
    <div
      className="absolute pointer-events-none z-10 animate-ping"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%)`,
        animationDuration: '0.4s',
        animationIterationCount: '1'
      }}
    >
      <div className="w-6 h-6 border-2 border-blue-400 rounded-full opacity-60" />
    </div>
  );
};

// Particle Effect - Shows points when items are clicked
const Particle = ({ x, y, type, onComplete, points = 1 }) => {
  const [opacity, setOpacity] = useState(1);
  const [scale, setScale] = useState(1);
  const [yOffset, setYOffset] = useState(0);

  useEffect(() => {
    const floatTimer = setTimeout(() => {
      setYOffset(-30);
      setOpacity(0);
      setScale(type === 'good' ? 1.2 : 0.8);
      setTimeout(onComplete, 300);
    }, 100);

    return () => clearTimeout(floatTimer);
  }, [type, onComplete]);

  const getParticleContent = () => {
    if (type === 'good') {
      if (points > 1) return `+${points}`;
      return '+1';
    }
    return '-1';
  };

  const getParticleColor = () => {
    if (type === 'good') {
      if (points >= 3) return 'text-yellow-500 font-extrabold text-xl';
      if (points >= 2) return 'text-blue-500 font-bold text-lg';
      return 'text-green-500 font-bold';
    }
    return 'text-red-500 font-bold';
  };

  return (
    <div
      className={`absolute pointer-events-none z-20 transition-all duration-300 ${getParticleColor()}`}
      style={{ 
        left: x, 
        top: y + yOffset, 
        opacity,
        transform: `scale(${scale}) translate(-50%, -50%)`,
        filter: points >= 3 ? 'drop-shadow(0 0 8px gold)' : 'none'
      }}
    >
      {getParticleContent()}
      {points >= 3 && <div className="absolute inset-0 animate-ping text-yellow-300">✨</div>}
    </div>
  );
};

// Combo Indicator (MOBILE OPTIMIZED)
const ComboIndicator = ({ combo, visible }) => {
  if (!visible || combo < 2) return null;
  
  const getComboStyle = () => {
    if (combo >= 10) return 'bg-gradient-to-r from-purple-600 to-pink-600 text-white animate-bounce';
    if (combo >= 7) return 'bg-gradient-to-r from-blue-600 to-purple-600 text-white animate-pulse';
    if (combo >= 5) return 'bg-gradient-to-r from-green-500 to-blue-500 text-white';
    if (combo >= 3) return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
    return 'bg-green-600 text-white';
  };

  return (
    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20">
      {/* SMALLER COMBO INDICATOR */}
      <div className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full font-bold shadow-lg ${getComboStyle()}`}>
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-sm sm:text-lg">{combo}x</span>
          <span className="text-xs sm:text-sm">COMBO!</span>
          {combo >= 5 && <span className="animate-spin text-sm">🔥</span>}
          {combo >= 10 && <span className="animate-bounce text-sm">💫</span>}
        </div>
      </div>
    </div>
  );
};

// Achievement Notification (MOBILE OPTIMIZED)
const Achievement = ({ achievement, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setTimeout(() => setIsVisible(true), 100);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 2500); // Shorter display time
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <div className={`absolute top-16 left-1/2 transform -translate-x-1/2 z-30 transition-all duration-300 ${
      isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'
    }`}>
      {/* SMALLER ACHIEVEMENT POPUP */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-black px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-bold shadow-lg border-2 border-yellow-300 max-w-xs sm:max-w-sm">
        <div className="flex items-center gap-2">
          <span className="text-lg sm:text-xl animate-bounce">🏆</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm sm:text-base font-bold truncate">{achievement.title}</div>
            <div className="text-xs opacity-80 truncate">{achievement.description}</div>
          </div>
          <span className="text-lg sm:text-xl animate-spin">✨</span>
        </div>
      </div>
      
      {/* SMALLER CELEBRATION PARTICLES */}
      <div className="absolute -top-1 -left-1 w-full h-full pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-ping"
            style={{
              left: `${20 + i * 20}%`,
              top: `${30 + (i % 2) * 40}%`,
              animationDelay: `${i * 100}ms`,
              animationDuration: '0.8s'
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Game Item - Individual clickable items in the game
  const GameItem = ({ item, onClick, gameIntensity }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const getItemStyle = () => {
    // MOBILE-FIRST sizing - bigger items on smaller screens
    const baseSize = (() => {
      if (item.kind === 'powerup') {
        return 'w-20 h-20 sm:w-16 sm:h-16 md:w-20 md:h-20'; // Bigger on mobile
      } else {
        return 'w-16 h-16 sm:w-12 sm:h-12 md:w-16 md:h-16'; // Bigger on mobile
      }
    })();
    
    const hoverScale = isHovered && isVisible && !isExiting ? 'scale-110' : 'scale-100';
    const exitScale = isExiting ? 'scale-0' : 'scale-100';
    const opacity = isVisible && !isExiting ? 'opacity-100' : 'opacity-0';
    
    return `${baseSize} ${hoverScale} ${exitScale} ${opacity} transition-all duration-200 object-contain cursor-pointer`;
  };

  const getItemContainer = () => {
    let classes = 'absolute -translate-x-1/2 -translate-y-1/2 select-none transition-all duration-200';
    
    // Add visual effects based on item type and state
    if (isVisible && !isExiting) {
      classes += ' drop-shadow-lg';
      
      if (item.kind === 'powerup') {
        // Bigger touch area for mobile
        classes += ' ring-4 ring-yellow-400 rounded-full bg-yellow-50 p-3 sm:p-2 md:p-3 animate-pulse shadow-lg';
      } else if (item.kind === 'bad') {
        classes += ' ring-3 ring-red-400 rounded-full bg-red-50 p-3 sm:p-2 md:p-3 animate-pulse shadow-lg';
      } else {
        classes += ' ring-1 ring-green-300 rounded-full bg-green-50 p-2 sm:p-1 md:p-2 hover:ring-2 hover:ring-green-400';
      }
    } else {
      classes += ' ring-0 bg-transparent p-0';
    }
    
    return classes;
  };

  const getGlowEffect = () => {
  // Only show glow effects if visible and not exiting
    if (!isVisible || isExiting) {
      return { filter: 'none' };
    }
    
    if (item.kind === 'powerup') {
      return {
        filter: 'drop-shadow(0 0 16px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 32px rgba(255, 215, 0, 0.4))',
      };
    }
    if (item.kind === 'bad') {
      return {
        filter: 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.7)) drop-shadow(0 0 24px rgba(239, 68, 68, 0.3))',
      };
    }
    // Subtle glow for good items
    return { 
      filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.4))' 
    };
  };

  const handleClick = (e) => {
    // Prevent the click event from being lost
    e.persist && e.persist(); // For older React versions
    
    // Start exit animation immediately
    setIsExiting(true);
    setIsVisible(false);
    
    // Call the actual click handler with a very short delay to allow ring to disappear
    setTimeout(() => {
      onClick(item.id, item.kind, item.points, e);
    }, 50); // Reduced from 100ms to 50ms for faster response
  };

  return (
    <button
      className={getItemContainer()}
      style={{ 
        left: `${item.x}%`, 
        top: `${item.y}%`,
        ...getGlowEffect()
      }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={item.title}
      title={`${item.title} (${item.points > 0 ? '+' : ''}${item.points} points)`}
    >
      <img 
        src={item.src} 
        alt={item.title} 
        className={getItemStyle()}
        draggable={false}
      />
      
      {/* Point indicator for power-ups */}
      {item.kind === 'powerup' && isVisible && !isExiting && (
        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
          +{item.points}
        </div>
      )}
      
      {/* Warning indicator for bad items */}
      {item.kind === 'bad' && isVisible && !isExiting && (
        <div className="absolute -top-2 -right-2 text-red-500 text-xl animate-bounce drop-shadow-lg">
          ⚠️
        </div>
      )}

      {/*Subtle indicator for good items */}
      {item.kind === 'good' && isVisible && !isExiting && (
        <div className="absolute -top-1 -right-1 text-green-500 text-sm opacity-75">
          ✓
        </div>
      )}
    </button>
  );
};

// Main Game Board Component
const GameBoard = ({ 
  items, 
  particles, 
  spawnEffects,
  onItemClick, 
  timeLeft, 
  combo, 
  phase, 
  achievement, 
  onAchievementClose,
  isShaking,
  gameIntensity,
  name,
  university,
  playsLeft,
  score,
  level,
  stats,
  soundEnabled,
  toggleSound,
  soundsLoaded
}) => {
  // Emergency cleanup effect - add this right here
  useEffect(() => {
    // Force cleanup of spawn effects every 2 seconds
    const cleanupInterval = setInterval(() => {
      if (spawnEffects.length > 10) { // If too many spawn effects
        console.log('🧹 Emergency cleanup: too many spawn effects', spawnEffects.length);
        // Call onComplete for all old effects
        spawnEffects.forEach(effect => {
          if (effect.onComplete) {
            effect.onComplete(effect.id);
          }
        });
      }
    }, 2000);

    return () => clearInterval(cleanupInterval);
  }, [spawnEffects]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-200">
      
      {/* Game Header - MOBILE OPTIMIZED */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-4">
        
        {/* Player Info - Stack on mobile */}
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 text-purple-800">
            👤 {name?.length > 10 ? name.substring(0, 10) + '...' : name || "Player"}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-800">
            🏫 {university?.length > 8 ? university.substring(0, 8) + '...' : university || "University"}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-700">
            🎯 {Math.max(0, playsLeft - 1)} left
          </span>
        </div>
        
        {/* Game Stats - More prominent on mobile */}
        <div className="flex items-center gap-2 text-sm sm:text-base">
          <SoundControl soundEnabled={soundEnabled} onToggle={toggleSound} soundsLoaded={soundsLoaded}/>
          <span className="px-3 py-2 rounded-full bg-yellow-400 text-yellow-900 font-bold text-lg sm:text-base">
            ⏱ {timeLeft}s
          </span>
          <span className="px-3 py-2 rounded-full bg-green-100 text-green-800 font-bold text-lg sm:text-base">
            ⭐ {score}
          </span>
          <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm">
            📈 {level}
          </span>
        </div>
      </div>

      {/* Game Playing Area */}
      <div className={`relative w-full overflow-hidden rounded-2xl border-2 border-gray-200 ${
        isShaking ? 'animate-pulse' : ''
      } ${
        // Responsive height - bigger on mobile
        'h-[70vh] min-h-[500px] md:h-[60vh] md:min-h-[420px]'
      }`}>
        
        {/* Animated Background */}
        <AnimatedBackground timeLeft={timeLeft} phase={phase} gameIntensity={gameIntensity} />
        
        {/* Watermark */}
        <img 
          src={URLS.LOGO} 
          alt="CM watermark" 
          className="pointer-events-none select-none absolute right-4 bottom-4 h-16 w-16 opacity-20 animate-pulse"
        />

        {/* Combo Indicator */}
        <ComboIndicator combo={combo} visible={phase === "game"} />

        {/* Achievement Notification */}
        <Achievement 
          achievement={achievement} 
          onClose={onAchievementClose} 
        />

        {/* Spawn Effects */}
        {spawnEffects.map((effect) => (
          <SpawnEffect
            key={effect.id}
            x={effect.x}
            y={effect.y}
            onComplete={() => effect.onComplete(effect.id)}
          />
        ))}

        {/* Game Items */}
        {items.map((item) => (
          <GameItem
            key={item.id}
            item={item}
            onClick={onItemClick}
            gameIntensity={gameIntensity}
          />
        ))}

        {/* Particles */}
        {particles.map((particle) => (
          <Particle
            key={particle.id}
            x={particle.x}
            y={particle.y}
            type={particle.type}
            points={particle.points}
            onComplete={() => particle.onComplete(particle.id)}
          />
        ))}

        {/* Game Tips */}
        <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 text-xs px-3 py-2 rounded-full backdrop-blur-sm border shadow-lg transition-all duration-300 max-w-[90%] text-center ${
          timeLeft <= 10 
            ? 'bg-red-100/90 border-red-200 text-red-800' 
            : 'bg-white/90 border-gray-200 text-gray-700'
        }`}>
          <div className="hidden sm:block">
            <span className="text-green-600 font-medium">✅ Career</span> • 
            <span className="text-red-600 ml-1 font-medium">❌ Distractions</span> • 
            <span className="text-yellow-600 ml-1 font-medium">⭐ Power-ups</span>
          </div>
          <div className="block sm:hidden">
            <span className="text-green-600">✅</span> Career • 
            <span className="text-red-600">❌</span> Bad • 
            <span className="text-yellow-600">⭐</span> Power
          </div>
          {timeLeft <= 10 && <div className="animate-pulse font-bold">⏰ HURRY!</div>}
        </div>

        {/* Time Pressure Warning */}
        {timeLeft <= 5 && (
          <div className="absolute top-4 right-4 animate-bounce">
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              ⏰ {timeLeft}s
            </div>
          </div>
        )}
      </div>

      {/* Game Stats */}
      <div className="mt-4 flex justify-center gap-4 text-sm text-gray-600">
        <span>Good: {stats.goodClicks}</span>
        <span>Bad: {stats.badClicks}</span>
        <span>Combo: {combo}x</span>
        <span>Accuracy: {stats.goodClicks + stats.badClicks > 0 ? Math.round((stats.goodClicks / (stats.goodClicks + stats.badClicks)) * 100) : 0}%</span>
      </div>
    </div>
  );
};

export default GameBoard;