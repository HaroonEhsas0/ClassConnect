// Stable prediction caching system to prevent fluctuating recommendations
// Predictions are cached for 30 minutes to ensure stable trading signals

interface CachedPrediction {
  prediction: any;
  timestamp: Date;
  expiresAt: Date;
}

class PredictionCache {
  private static instance: PredictionCache;
  private cache = new Map<string, CachedPrediction>();
  private readonly CACHE_DURATION_MINUTES = 30; // 30 minutes for stable predictions

  static getInstance(): PredictionCache {
    if (!PredictionCache.instance) {
      PredictionCache.instance = new PredictionCache();
    }
    return PredictionCache.instance;
  }

  getCachedPrediction(symbol: string): any | null {
    const cached = this.cache.get(symbol);
    if (!cached) {
      return null;
    }

    // Check if cache is still valid
    if (new Date() > cached.expiresAt) {
      this.cache.delete(symbol);
      return null;
    }

    console.log(`📋 Using cached prediction for ${symbol} (expires in ${Math.round((cached.expiresAt.getTime() - Date.now()) / 60000)} minutes)`);
    return cached.prediction;
  }

  setCachedPrediction(symbol: string, prediction: any): void {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.CACHE_DURATION_MINUTES * 60 * 1000);
    
    this.cache.set(symbol, {
      prediction,
      timestamp: now,
      expiresAt
    });

    console.log(`✅ Cached stable prediction for ${symbol} (valid for ${this.CACHE_DURATION_MINUTES} minutes)`);
  }

  clearCache(symbol?: string): void {
    if (symbol) {
      this.cache.delete(symbol);
      console.log(`🗑️ Cleared prediction cache for ${symbol}`);
    } else {
      this.cache.clear();
      console.log('🗑️ Cleared all prediction cache');
    }
  }

  getCacheInfo(): { [key: string]: { age: number; expiresIn: number } } {
    const info: { [key: string]: { age: number; expiresIn: number } } = {};
    const now = Date.now();
    
    for (const [symbol, cached] of this.cache.entries()) {
      info[symbol] = {
        age: Math.round((now - cached.timestamp.getTime()) / 60000),
        expiresIn: Math.round((cached.expiresAt.getTime() - now) / 60000)
      };
    }
    
    return info;
  }
}

export default PredictionCache;