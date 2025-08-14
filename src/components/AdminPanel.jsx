import React, { useState } from 'react';
import { GAME_CONFIG } from '../utils/constants';
import { SoundControl } from '../hooks/useSoundManager';
import { supabase } from '../utils/supabase';

const AdminPanel = ({ soundEnabled, toggleSound, soundsLoaded }) => {
  const [onlineData, setOnlineData] = useState([]);
  const [dataSource, setDataSource] = useState('local');
  const [loading, setLoading] = useState(false);

  // Load data from Supabase
  const loadSupabaseData = async () => {
    setLoading(true);
    try {
      console.log('📊 Loading data from Supabase...');
      const result = await supabase.getGameSubmissions();
      
      if (result.success) {
        // Transform Supabase data to match our expected format
        const transformedData = result.data.map(item => ({
          id: item.id,
          name: item.name,
          email: item.email,
          university: item.university,
          event: item.event,
          score: item.score,
          boothCode: item.booth_code, // Note: Supabase uses booth_code
          achievements: item.achievements,
          goodClicks: item.good_clicks,
          badClicks: item.bad_clicks,
          accuracy: item.accuracy,
          level: item.level,
          timestamp: item.created_at // Supabase auto-generated timestamp
        }));
        
        setOnlineData(transformedData);
        setDataSource('supabase');
        console.log('✅ Loaded', transformedData.length, 'records from Supabase');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Failed to load Supabase data:', error);
      alert('Failed to load Supabase data. Showing local data instead.');
      setDataSource('local');
    }
    setLoading(false);
  };

  // Test Supabase connection
  const testSupabaseConnection = async () => {
    const testData = {
      name: "Supabase Test Player",
      email: "supabase@test.com",
      university: "Test University",
      event: "Adelaide-Career-Fair-2025",
      score: 75,
      boothCode: "SUPA-TEST-123",
      achievements: "Database Master",
      goodClicks: 15,
      badClicks: 3,
      accuracy: 83,
      level: "Professional"
    };
    
    console.log('🧪 Testing Supabase connection...');
    
    try {
      const result = await supabase.insertGameSubmission(testData);
      
      if (result.success) {
        alert('✅ Supabase test successful! Check your database. Refreshing data...');
        // Refresh the data to show the new test entry
        await loadSupabaseData();
      } else {
        alert(`❌ Supabase test failed: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Supabase test failed: ${error.message}`);
    }
  };

  // CSV download function (updated to handle both local and Supabase data)
  const toCSV = (rows) => {
    if (!rows.length) return "";
    const headers = Object.keys(rows[0]);
    const esc = (v) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const body = rows.map((r) => headers.map((h) => esc(r[h])).join(",")).join("\n");
    return headers.join(",") + "\n" + body;
  };

  const handleDownloadCSV = () => {
    try {
      const dataToDownload = dataSource === 'supabase' ? onlineData : 
                            JSON.parse(localStorage.getItem("cm_submissions") || "[]");
      
      if (dataToDownload.length === 0) {
        alert('No data to download!');
        return;
      }
      
      const csv = toCSV(dataToDownload);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      const timestamp = new Date().toISOString().split('T')[0];
      a.download = `career_mentor_game_${dataSource}_${timestamp}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      console.log(`✅ Downloaded ${dataToDownload.length} records from ${dataSource}`);
    } catch (error) {
      console.error('❌ CSV download failed:', error);
      alert('Failed to download CSV');
    }
  };

  // Get current data based on source
  const getCurrentData = () => {
    if (dataSource === 'supabase') return onlineData;
    return JSON.parse(localStorage.getItem("cm_submissions") || "[]");
  };

  const rows = getCurrentData();
  const uniqueEmails = new Set(rows.map(r => r.email)).size;
  const total = rows.length;
  const scores = rows.map(r => Number(r.score) || 0);
  const max = scores.length ? Math.max(...scores) : 0;
  const avg = scores.length ? (scores.reduce((a,b)=>a+b,0) / scores.length) : 0;
  const tier = (s)=> s>=20 ? "20+" : s>=15 ? "15-19" : s>=10 ? "10-14" : "<10";
  const byTier = rows.reduce((acc,r)=>{ const t=tier(Number(r.score)||0); acc[t]=(acc[t]||0)+1; return acc; }, {});

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">🛠️ Admin Panel</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setDataSource('local')}
                  className={`px-3 py-1 text-xs rounded ${dataSource === 'local' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  📱 Local Data
                </button>
                <button
                  onClick={loadSupabaseData}
                  disabled={loading}
                  className={`px-3 py-1 text-xs rounded ${dataSource === 'supabase' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'} ${loading ? 'opacity-50' : ''}`}
                >
                  {loading ? '⏳' : '🗄️'} Supabase
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <SoundControl soundEnabled={soundEnabled} onToggle={toggleSound} soundsLoaded={soundsLoaded}/>
              
              {/* Test Supabase Connection */}
              <button 
                onClick={testSupabaseConnection}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                🧪 Test Supabase
              </button>
              
              {/* Download CSV */}
              <button 
                onClick={handleDownloadCSV} 
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                disabled={rows.length === 0}
              >
                📊 Download CSV ({rows.length})
              </button>
              
              {/* Clear Local Data */}
              <button
                onClick={() => {
                  if (window.confirm("Clear all local stored submissions?")) {
                    localStorage.removeItem("cm_submissions");
                    if (dataSource === 'local') {
                      window.location.reload();
                    } else {
                      alert('Local data cleared. Current view shows Supabase data.');
                    }
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                🗑️ Clear Local
              </button>
              
              {/* Exit Admin */}
              <a 
                href={window.location.pathname} 
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                🚪 Exit Admin
              </a>
            </div>
          </div>

          {/* Data Source Indicator */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="text-blue-800 font-medium">
                📊 Currently viewing: <span className="capitalize font-bold">{dataSource}</span> data
              </div>
              <div className="text-blue-600 text-sm">
                {dataSource === 'supabase' ? 'Real-time database' : 'Browser storage'}
              </div>
            </div>
          </div>

          {/* Stats overview */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-blue-600 text-sm font-medium">Total Submissions</div>
              <div className="text-2xl font-bold text-blue-900">{total}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-green-600 text-sm font-medium">Unique Players</div>
              <div className="text-2xl font-bold text-green-900">{uniqueEmails}</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="text-yellow-600 text-sm font-medium">Average Score</div>
              <div className="text-2xl font-bold text-yellow-900">{avg.toFixed(1)}</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-red-600 text-sm font-medium">Top Score</div>
              <div className="text-2xl font-bold text-red-900">{max}</div>
            </div>
          </div>

          {/* Prize tier breakdown */}
          <div className="grid sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-red-100 p-4 rounded-lg border border-red-300">
              <div className="text-red-700 text-sm font-medium">🎁 Tier 20+</div>
              <div className="text-xl font-bold text-red-900">{byTier["20+"] || 0}</div>
              <div className="text-xs text-red-600">Tote/Voucher</div>
            </div>
            <div className="bg-orange-100 p-4 rounded-lg border border-orange-300">
              <div className="text-orange-700 text-sm font-medium">📓 Tier 15-19</div>
              <div className="text-xl font-bold text-orange-900">{byTier["15-19"] || 0}</div>
              <div className="text-xs text-orange-600">Notebook</div>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg border border-yellow-300">
              <div className="text-yellow-700 text-sm font-medium">✏️ Tier 10-14</div>
              <div className="text-xl font-bold text-yellow-900">{byTier["10-14"] || 0}</div>
              <div className="text-xs text-yellow-600">Pen</div>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
              <div className="text-gray-700 text-sm font-medium">📚 Below 10</div>
              <div className="text-xl font-bold text-gray-900">{byTier["<10"] || 0}</div>
              <div className="text-xs text-gray-600">No prize</div>
            </div>
          </div>

          {/* Submissions table */}
          {rows.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-gray-400 text-lg mb-2">📊</div>
              <p className="text-gray-600">
                No submissions yet in {dataSource} storage. 
                {dataSource === 'local' && ' Try switching to Supabase or '}
                Share the game to start collecting data!
              </p>
              {dataSource === 'supabase' && (
                <button 
                  onClick={testSupabaseConnection}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  🧪 Add Test Data
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">University</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booth Code</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rows.map((r, i) => (
                      <tr key={r.id || i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{i+1}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{r.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{r.university}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            r.score >= 20 ? 'bg-red-100 text-red-800' :
                            r.score >= 15 ? 'bg-orange-100 text-orange-800' :
                            r.score >= 10 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {r.score}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            r.level === 'Professional' ? 'bg-purple-100 text-purple-800' :
                            r.level === 'Intern' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {r.level}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(r.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-900 bg-gray-50">
                          {r.boothCode}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;