import React, { useState, useEffect } from "react";
import { supabase } from './utils/supabase';

// Import our organized components
import PlayerForm from "./components/PlayerForm";
import GameBoard from "./components/GameBoard";
import ResultsScreen from "./components/ResultsScreen";
import AdminPanel from "./components/AdminPanel";

// Import our custom hooks
import { useSoundManager } from "./hooks/useSoundManager";
import { useGameLogic } from "./hooks/useGameLogic";

// Import constants and utilities
import { URLS, GAME_CONFIG } from "./utils/constants";

// Data submission functions
const submitViaEmail = async (data) => {
  const subject = `Career Game Submission - ${data.name}`;
  const body = `
Name: ${data.name}
Email: ${data.email}
University: ${data.university}
Event: ${data.event}
Score: ${data.score}
Timestamp: ${data.timestamp}
Booth Code: ${data.boothCode}
  `.trim();
  
  const mailtoLink = `mailto:admin@careermentor.au?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoLink);
};

const submitToSupabase = async (data) => {
  try {
    console.log('📊 Submitting to Supabase:', data);
    
    const result = await supabase.insertGameSubmission(data);
    
    if (result.success) {
      console.log('✅ Data successfully saved to Supabase');
      return true;
    } else {
      console.error('❌ Supabase error:', result.error);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Failed to submit to Supabase:', error);
    return false;
  }
};

// Main App Component
export default function EnhancedCareerGame() {
  // Check if this is admin mode
  const isAdmin = new URLSearchParams(window.location.search).get("admin") === "1";
  
  // App state
  const [phase, setPhase] = useState("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [university, setUniversity] = useState("");
  const [joined, setJoined] = useState(false);
  const [playsUsed, setPlaysUsed] = useState(0);

  // Calculate plays remaining
  const playsLeft = Math.max(0, GAME_CONFIG.MAX_PLAYS - playsUsed);

  // Initialize sound manager
  const { playSound, soundEnabled, toggleSound, soundsLoaded } = useSoundManager();

  // Initialize game logic
  const gameLogic = useGameLogic(phase, playSound);

  // Handle game end logic
useEffect(() => {
  if (phase !== "game" || gameLogic.timeLeft > 0) return;
  
  playSound('end');
  setPhase("result");
  
  // Update play count
  const newCount = Math.min(GAME_CONFIG.MAX_PLAYS, playsUsed + 1);
  setPlaysUsed(newCount);
  
  // Generate end game data
  const { timestamp, boothCode } = gameLogic.generateEndGameData(email);
  
  // Calculate accuracy
  const totalClicks = gameLogic.stats.goodClicks + gameLogic.stats.badClicks;
  const accuracy = totalClicks > 0 ? Math.round((gameLogic.stats.goodClicks / totalClicks) * 100) : 0;
  
  // Enhanced submission data
  const submissionData = {
    name,
    email,
    university,
    event: GAME_CONFIG.EVENT_ID,
    score: gameLogic.score,
    timestamp: new Date(timestamp).toISOString(),
    boothCode: boothCode,
    achievements: gameLogic.achievement ? gameLogic.achievement.title : '',
    goodClicks: gameLogic.stats.goodClicks,
    badClicks: gameLogic.stats.badClicks,
    accuracy: accuracy,
    level: gameLogic.level
  };
  
  // Save to localStorage (backup)
  try {
    const key = "cm_submissions";
    const rows = JSON.parse(localStorage.getItem(key) || "[]");
    rows.push(submissionData);
    localStorage.setItem(key, JSON.stringify(rows));
  } catch {}
  
  // Submit to Supabase
  submitToSupabase(submissionData);
  
}, [phase, gameLogic.timeLeft, playsUsed, email, gameLogic.score, name, university, gameLogic.stats, gameLogic.achievement, gameLogic.level, playSound, gameLogic]);

  // Check if form is valid
  const formValid = (() => {
    const emailOk = /.+@.+\..+/.test(email);
    return name.trim().length > 1 && emailOk && university.trim().length > 1 && joined;
  })();

  // Handle starting the game (IMPROVED VERSION)
  const handleStart = () => {
    if (!formValid || playsLeft <= 0) return;
    
    console.log('🚀 Starting new game...'); // DEBUG
    
    // Reset game logic BEFORE changing phase
    gameLogic.resetGame();
    
    // Small delay to ensure reset is complete, then start game
    setTimeout(() => {
      playSound('start');
      setPhase("game");
      console.log('🎮 Game phase set to "game"'); // DEBUG
    }, 100);
  };

  // Handle going back to form
  const handleGoHome = () => {
    setPhase("form");
  };

  // Show admin panel if in admin mode
  if (isAdmin) {
    return (
      <AdminPanel 
        soundEnabled={soundEnabled}
        toggleSound={toggleSound}
        soundsLoaded={soundsLoaded}
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-purple-50 text-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        
        {/* Clean Compact Header */}
        <header className="flex items-center justify-between gap-4 mb-6 p-3 bg-white rounded-xl shadow-md border border-gray-100">
          
          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-600 p-2.5 shadow-lg">
              <img 
                src={URLS.LOGO} 
                alt="CM" 
                className="w-full h-full object-contain filter brightness-0 invert" 
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Catch Your <span className="text-red-600">Future</span>
              </h1>
              <p className="text-xs text-gray-500">Career Mentor Game</p>
            </div>
          </div>

          {/* Compact Button */}
          <a 
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium shadow-md hover:bg-red-700 transition-colors"
            href={URLS.FB_GROUP} 
            target="_blank" 
            rel="noreferrer"
          >
            Join Group
          </a>
        </header>

        {/* Main Content - Different screens based on current phase */}
        {phase === "form" && (
          <PlayerForm
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            university={university}
            setUniversity={setUniversity}
            joined={joined}
            setJoined={setJoined}
            onStart={handleStart}
            playsLeft={playsLeft}
            playsUsed={playsUsed}
          />
        )}

        {phase === "game" && (
          <GameBoard
            items={gameLogic.items}
            particles={gameLogic.particles}
            spawnEffects={gameLogic.spawnEffects}
            onItemClick={gameLogic.handleClickItem}
            timeLeft={gameLogic.timeLeft}
            combo={gameLogic.combo}
            phase={phase}
            achievement={gameLogic.achievement}
            onAchievementClose={gameLogic.handleAchievementClose}
            isShaking={gameLogic.isShaking}
            gameIntensity={gameLogic.gameIntensity}
            name={name}
            university={university}
            playsLeft={playsLeft}
            score={gameLogic.score}
            level={gameLogic.level}
            stats={gameLogic.stats}
            soundEnabled={soundEnabled}
            toggleSound={toggleSound}
            soundsLoaded={soundsLoaded}
          />
        )}

        {phase === "result" && (
          <ResultsScreen
            name={name}
            email={email}
            university={university}
            score={gameLogic.score}
            stats={gameLogic.stats}
            combo={gameLogic.combo}
            achievement={gameLogic.achievement}
            endedAt={gameLogic.endedAt}
            boothCode={gameLogic.boothCode}
            playsLeft={playsLeft}
            onStart={handleStart}
            onGoHome={handleGoHome}
          />
        )}

        {/* Footer */}
        <footer className="text-xs text-gray-500 text-center mt-8 space-y-1">
          <div>© {new Date().getFullYear()} Career Mentor • Enhanced Game Experience</div>
          <div className="text-gray-400">Built with React • Powered by passion for careers</div>
        </footer>
      </div>
    </div>
  );
}