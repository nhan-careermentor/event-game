import React, { useMemo } from 'react';
import { URLS, GAME_CONFIG, PRIZE_TIERS } from '../utils/constants';

const PlayerForm = ({ 
  name, 
  setName, 
  email, 
  setEmail, 
  university, 
  setUniversity, 
  joined, 
  setJoined, 
  onStart, 
  playsLeft, 
  playsUsed 
}) => {
  
  // Check if the form is filled out correctly
  const formValid = useMemo(() => {
    const emailOk = /.+@.+\..+/.test(email); // Basic email check
    return name.trim().length > 1 && emailOk && university.trim().length > 1 && joined;
  }, [name, email, university, joined]);

  return (
    <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200">
      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Left side - Form inputs */}
        <div>
          <h2 className="text-2xl font-bold mb-3 text-red-600">Step 1 · Your Details</h2>
          <p className="text-gray-600 mb-6">
            Fill in your details and join our FB group to unlock the enhanced game experience.
          </p>
          
          <div className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Name</label>
              <input 
                className="w-full rounded-xl border border-gray-300 p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition" 
                placeholder="Your full name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>
            
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
              <input 
                className="w-full rounded-xl border border-gray-300 p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition" 
                placeholder="you@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            
            {/* University Input */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">University</label>
              <input 
                className="w-full rounded-xl border border-gray-300 p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition" 
                placeholder="e.g., UniSA, Adelaide, Flinders..." 
                value={university} 
                onChange={(e) => setUniversity(e.target.value)} 
              />
            </div>
            
            {/* Event Input (read-only) */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Event</label>
              <input 
                className="w-full rounded-xl border border-gray-300 p-3 bg-gray-100 text-gray-600" 
                value={GAME_CONFIG.EVENT_ID} 
                readOnly 
                disabled 
              />
            </div>
            
            {/* Facebook Group Checkbox */}
            <label className="flex items-center gap-3 text-sm cursor-pointer">
              <input 
                type="checkbox" 
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" 
                checked={joined} 
                onChange={(e) => setJoined(e.target.checked)} 
              />
              <span>I have joined the Facebook group</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center gap-3 flex-wrap">
            <button 
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                formValid && playsLeft > 0 
                  ? "bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl" 
                  : "bg-gray-400 text-gray-600 cursor-not-allowed"
              }`} 
              onClick={onStart} 
              disabled={!formValid || playsLeft <= 0}
            >
              {playsLeft > 0 ? `🚀 Start Enhanced Game (${playsLeft} left)` : "Play limit reached"}
            </button>
            
            <a 
              className="px-4 py-3 rounded-xl border-2 border-red-600 text-red-600 hover:bg-red-50 transition text-sm" 
              href={URLS.FB_GROUP} 
              target="_blank" 
              rel="noreferrer"
            >
              Join FB Group
            </a>
            
            {playsUsed > 0 && (
              <span className="text-xs text-gray-500">
                Played {playsUsed}/{GAME_CONFIG.MAX_PLAYS}
              </span>
            )}
          </div>
        </div>

        {/* Right side - Game Info & Features */}
        <div className="relative rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 p-6 overflow-hidden border border-gray-200">
          <img 
            src={URLS.LOGO} 
            alt="CM" 
            className="absolute right-3 bottom-3 h-16 w-16 opacity-20" 
          />
          
          <h3 className="font-bold text-lg mb-3 text-purple-800">🎮 Enhanced Game Features</h3>
          
          <ul className="text-sm space-y-2 text-gray-700">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span><strong>Enhanced Visuals:</strong> Dynamic backgrounds and effects</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span><strong>Power-ups:</strong> Special glowing items worth extra points</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              <span><strong>Combo System:</strong> Chain clicks for multiplier bonuses</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span><strong>Screen Effects:</strong> Shake feedback and particles</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span><strong>Time Pressure:</strong> Visual intensity increases over time</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              <span><strong>Sound Effects:</strong> Immersive audio feedback</span>
            </li>
          </ul>
          
          {/* Prize Information */}
          <div className="mt-4 p-3 bg-white rounded-lg border">
            <h4 className="font-semibold text-sm mb-2">🏆 Prize Tiers:</h4>
            <div className="text-xs space-y-1">
              {PRIZE_TIERS.map((tier, index) => (
                <div key={index}>
                  {tier.min}+ points → {tier.label.replace('🎁 ', '')}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlayerForm;