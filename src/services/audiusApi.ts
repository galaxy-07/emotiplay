import { Track } from '@/hooks/useMusicPlayer';

const AUDIUS_API_BASE = 'https://discoveryprovider.audius.co';

interface AudiusTrack {
  id: string;
  title: string;
  user: {
    name: string;
  };
  artwork?: {
    '480x480'?: string;
  };
  duration: number;
}

interface AudiusSearchResponse {
  data: AudiusTrack[];
}

// Enhanced emotion to genre mapping for better variety
const EMOTION_GENRES = {
  neutral: ['chill', 'ambient', 'soft pop', 'indie', 'lo-fi', 'jazz', 'acoustic'],
  happy: ['pop', 'upbeat', 'dance', 'feel good', 'funk', 'disco', 'reggae', 'afrobeat'],
  sad: ['sad', 'melancholy', 'emotional', 'acoustic', 'blues', 'ballad', 'folk'],
  angry: ['rock', 'metal', 'intense', 'aggressive', 'punk', 'hardcore', 'rap'],
  surprised: ['electronic', 'experimental', 'energetic', 'synthwave', 'drum and bass'],
  fearful: ['dark ambient', 'cinematic', 'atmospheric', 'horror', 'darkwave'],
  disgusted: ['alternative', 'grunge', 'punk', 'industrial', 'noise']
};

class AudiusService {
  private async makeRequest(endpoint: string): Promise<any> {
    try {
      const response = await fetch(`${AUDIUS_API_BASE}${endpoint}`);
      if (!response.ok) {
        throw new Error(`Audius API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Audius API request failed:', error);
      throw error;
    }
  }

  async searchTracksByEmotion(emotion: string, limit: number = 10): Promise<Track[]> {
    const genres = EMOTION_GENRES[emotion as keyof typeof EMOTION_GENRES] || EMOTION_GENRES.neutral;
    const randomGenre = genres[Math.floor(Math.random() * genres.length)];
    
    try {
      const searchResponse: AudiusSearchResponse = await this.makeRequest(
        `/v1/tracks/search?query=${encodeURIComponent(randomGenre)}&limit=${limit}`
      );

      return searchResponse.data.map(track => ({
        id: track.id,
        title: track.title,
        artist: track.user.name,
        artwork: track.artwork?.['480x480'],
        streamUrl: `${AUDIUS_API_BASE}/v1/tracks/${track.id}/stream`,
        duration: track.duration
      }));
    } catch (error) {
      console.error(`Failed to search tracks for emotion ${emotion}:`, error);
      return [];
    }
  }

  async getTrendingTracks(genre?: string, limit: number = 20): Promise<Track[]> {
    try {
      const endpoint = genre 
        ? `/v1/tracks/trending?genre=${encodeURIComponent(genre)}&limit=${limit}`
        : `/v1/tracks/trending?limit=${limit}`;
      
      const response: AudiusSearchResponse = await this.makeRequest(endpoint);

      return response.data.map(track => ({
        id: track.id,
        title: track.title,
        artist: track.user.name,
        artwork: track.artwork?.['480x480'],
        streamUrl: `${AUDIUS_API_BASE}/v1/tracks/${track.id}/stream`,
        duration: track.duration
      }));
    } catch (error) {
      console.error('Failed to fetch trending tracks:', error);
      return [];
    }
  }

  async getRandomTracksByMood(emotion: string, count: number = 8): Promise<Track[]> {
    try {
      // Get multiple searches with different keywords for better variety
      const genres = EMOTION_GENRES[emotion as keyof typeof EMOTION_GENRES] || EMOTION_GENRES.neutral;
      const allTracks: Track[] = [];
      
      // Search multiple genres for better variety
      for (const genre of genres.slice(0, 3)) {
        try {
          const response: AudiusSearchResponse = await this.makeRequest(
            `/v1/tracks/search?query=${encodeURIComponent(genre)}&limit=${Math.ceil(count / 2)}`
          );
          
          const tracks = response.data.map(track => ({
            id: track.id,
            title: track.title,
            artist: track.user.name,
            artwork: track.artwork?.['480x480'],
            streamUrl: `${AUDIUS_API_BASE}/v1/tracks/${track.id}/stream`,
            duration: track.duration
          }));
          
          allTracks.push(...tracks);
        } catch (genreError) {
          console.warn(`Failed to get tracks for genre ${genre}:`, genreError);
        }
      }
      
      // Also try to get some trending tracks for the emotion
      try {
        const trendingTracks = await this.getTrendingTracks(genres[0], 10);
        allTracks.push(...trendingTracks);
      } catch (trendingError) {
        console.warn('Failed to get trending tracks:', trendingError);
      }
      
      // Remove duplicates and shuffle
      const uniqueTracks = allTracks.filter((track, index, self) => 
        index === self.findIndex(t => t.id === track.id)
      );
      
      const shuffled = uniqueTracks.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    } catch (error) {
      console.error(`Failed to get random tracks for mood ${emotion}:`, error);
      return [];
    }
  }
}

export const audiusService = new AudiusService();