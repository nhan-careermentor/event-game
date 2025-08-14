import React, { useMemo } from 'react';
import { URLS, GAME_CONFIG, PRIZE_TIERS } from '../utils/constants';

const ResultsScreen = ({ 
  name,
  email,
  university,
  score,
  stats,
  combo,
  achievement,
  endedAt,
  boothCode,
  playsLeft,
  onStart,
  onGoHome
}) => {
  
  // Calculate which prize the player earned
  const prize = useMemo(() => {
    if (score < 10) return null;
    
    for (const tier of PRIZE_TIERS) {
      if (score >= tier.min) return tier;
    }
    return null;
  }, [score]);

  // Calculate best combo achieved
  const bestCombo = Math.max(...[combo, 0]);

  // Calculate accuracy percentage
  const accuracy = stats.goodClicks + stats.badClicks > 0 
    ? Math.round((stats.goodClicks / (stats.goodClicks + stats.badClicks)) * 100) 
    : 0;

  return (
    <section className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
      
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-red-600 mb-2">🎉 Game Complete!</h2>
        <p className="text-gray-600">Screenshot this screen and bring it to our booth</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Left Side - Score and Stats */}
        <div className="text-center p-6 bg-gradient-to-br from-red-50 to-purple-50 rounded-2xl border">
          
          {/* Final Score */}
          <div className="text-6xl font-extrabold text-red-600 mb-2">{score}</div>
          <div className="text-lg text-gray-600 mb-4">Final Score</div>
          
          {/* Detailed Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="bg-white p-3 rounded-lg">
              <div className="font-semibold text-green-600">{stats.goodClicks}</div>
              <div className="text-gray-600">Good Clicks</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="font-semibold text-red-600">{stats.badClicks}</div>
              <div className="text-gray-600">Bad Clicks</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="font-semibold text-blue-600">{bestCombo}x</div>
              <div className="text-gray-600">Best Combo</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="font-semibold text-purple-600">{accuracy}%</div>
              <div className="text-gray-600">Accuracy</div>
            </div>
          </div>

          {/* Prize Display */}
          <div className="mb-6">
            {prize ? (
              <div className={`inline-block px-6 py-3 rounded-xl text-lg font-bold ${prize.css} shadow-lg`}>
                {prize.label}
              </div>
            ) : (
              <div className="inline-block px-6 py-3 rounded-xl text-lg font-bold bg-gray-200 text-gray-600">
                Keep practicing! 💪
              </div>
            )}
          </div>

          {/* Instructions to Claim Prize */}
          <div className="bg-white p-4 rounded-lg border text-left text-sm">
            <h3 className="font-semibold mb-2">📋 To Claim Your Prize:</h3>
            <ol className="list-decimal pl-5 space-y-1 text-gray-700">
              <li>Screenshot this results screen</li>
              <li>Show proof you joined our FB Group</li>
              <li>Present both to our booth staff</li>
              <li>Staff will verify your Booth Code & timestamp</li>
            </ol>
          </div>
        </div>

        {/* Right Side - Player Info and Additional Details */}
        <div className="space-y-4">
          
          {/* Player Information */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="font-semibold mb-3 text-gray-800">Player Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">University:</span>
                <span className="font-medium">{university}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Event:</span>
                <span className="font-medium">{GAME_CONFIG.EVENT_ID}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Timestamp:</span>
                <span className="font-medium">
                  {endedAt ? new Date(endedAt).toLocaleString() : "-"}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-3">
                <span className="text-gray-600">Booth Code:</span>
                <span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                  {boothCode || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Achievement Display */}
          {achievement && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-semibold mb-2 text-yellow-800">🏆 Achievement Unlocked!</h3>
              <div className="text-sm">
                <div className="font-medium text-yellow-900">{achievement.title}</div>
                <div className="text-yellow-700">{achievement.description}</div>
              </div>
            </div>
          )}

          {/* Prize Tiers Reference */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold mb-3 text-blue-800">🎁 Prize Tiers</h3>
            <div className="text-sm space-y-2">
              {PRIZE_TIERS.map((tier, index) => (
                <div key={index} className="flex justify-between">
                  <span>{tier.min}+ points</span>
                  <span className="font-medium">{tier.label.replace('🎁 ', '')}</span>
                </div>
              ))}
              <div className="flex justify-between text-gray-600">
                <span>Below 10</span>
                <span>Try again! 😊</span>
              </div>
            </div>
            <div className="mt-3 text-xs text-blue-700 bg-blue-100 p-2 rounded">
              *Prizes while stocks last. Show this screen + FB group proof to staff.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <a 
              className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white text-center hover:bg-blue-700 transition text-sm font-medium" 
              href={URLS.FB_GROUP} 
              target="_blank" 
              rel="noreferrer"
            >
              📱 Open FB Group
            </a>
            
            {playsLeft > 0 ? (
              <button 
                className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition text-sm font-medium" 
                onClick={onStart}
              >
                🎮 Play Again ({playsLeft} left)
              </button>
            ) : (
              <button 
                className="flex-1 px-4 py-3 rounded-xl bg-gray-400 text-gray-600 cursor-not-allowed text-sm font-medium" 
                disabled
              >
                🚫 Play limit reached
              </button>
            )}
          </div>

          {/* Additional Action Buttons */}
          <div className="flex gap-2 text-xs">
            <button 
              className="flex-1 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              onClick={() => {
                // Share functionality for mobile devices
                if (navigator.share) {
                  navigator.share({
                    title: 'Career Mentor Game Results',
                    text: `I scored ${score} points in the Career Mentor game! 🎉`,
                    url: window.location.href
                  });
                } else {
                  // Fallback: copy to clipboard
                  const shareText = `I scored ${score} points in the Career Mentor game! 🎉 ${window.location.href}`;
                  navigator.clipboard.writeText(shareText).then(() => {
                    alert('Results copied to clipboard!');
                  }).catch(() => {
                    alert('Unable to share. Please screenshot your results.');
                  });
                }
              }}
            >
              📤 Share Result
            </button>
            <button 
              className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              onClick={onGoHome}
            >
              🏠 Home
            </button>
          </div>

          {/* Performance Insights */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold mb-2 text-green-800">📊 Performance Insights</h3>
            <div className="text-sm space-y-1 text-green-700">
              {accuracy >= 90 && <div>• Excellent accuracy! You're very focused.</div>}
              {bestCombo >= 5 && <div>• Great combo skills! You work well under pressure.</div>}
              {stats.badClicks === 0 && score > 5 && <div>• Perfect game! No distractions affected you.</div>}
              {score >= 20 && <div>• Outstanding performance! You're career-ready.</div>}
              {score < 10 && <div>• Keep practicing! Focus on career-related items.</div>}
              {stats.badClicks > stats.goodClicks && <div>• Try to avoid distractions next time!</div>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResultsScreen;