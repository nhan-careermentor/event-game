// Supabase client for database operations
import { SUPABASE_CONFIG } from './constants';

class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
    this.headers = {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${key}`
    };
  }

  // Insert a new game submission
  async insertGameSubmission(data) {
    try {
      const response = await fetch(`${this.url}/rest/v1/game_submissions`, {
        method: 'POST',
        headers: {
          ...this.headers,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          university: data.university,
          event: data.event,
          score: data.score,
          booth_code: data.boothCode,
          achievements: data.achievements || '',
          good_clicks: data.goodClicks || 0,
          bad_clicks: data.badClicks || 0,
          accuracy: data.accuracy || 0,
          level: data.level || 'Student'
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      return { success: true, data: null };
    } catch (error) {
      console.error('Supabase insert error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all game submissions (for admin panel)
  async getGameSubmissions() {
    try {
      const response = await fetch(`${this.url}/rest/v1/game_submissions?select=*&order=created_at.desc`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Supabase fetch error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get submission count and stats
  async getStats() {
    try {
      const response = await fetch(`${this.url}/rest/v1/game_submissions?select=score,university&order=created_at.desc`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      const stats = {
        total: data.length,
        universities: [...new Set(data.map(item => item.university))].length,
        averageScore: data.length > 0 ? Math.round(data.reduce((sum, item) => sum + item.score, 0) / data.length) : 0,
        topScore: data.length > 0 ? Math.max(...data.map(item => item.score)) : 0
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Supabase stats error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create and export the client instance
export const supabase = new SupabaseClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY);