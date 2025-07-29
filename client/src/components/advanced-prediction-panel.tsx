import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface AdvancedPrediction {
  currentPrice: number;
  predictedClosePrice: number;
  confidence: number;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  reasoning: string[];
  dataQuality: number;
  stabilityScore: number;
  lastUpdated: string;
  marketHours: {
    isOpen: boolean;
    nextOpen: string;
    nextClose: string;
  };
}

export function AdvancedPredictionPanel() {
  const [showDetails, setShowDetails] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const { data: prediction, isLoading, error } = useQuery<AdvancedPrediction>({
    queryKey: ['/api/amd/market-close-prediction'],
    refetchInterval: 30 * 60 * 1000, // Refresh every 30 minutes (stable predictions)
    staleTime: 25 * 60 * 1000, // Consider stale after 25 minutes
  });

  const { data: marketForecast } = useQuery({
    queryKey: ['/api/amd/market-close-forecast'],
    refetchInterval: 30 * 60 * 1000, // Refresh every 30 minutes (very stable)
    staleTime: 25 * 60 * 1000, // Consider stale after 25 minutes
  });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-300">
            <Brain className="h-5 w-5 animate-pulse" />
            Advanced AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin text-purple-400">🧠</div>
            <span className="ml-2 text-purple-300">Analyzing market conditions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !prediction) {
    return (
      <Card className="bg-gradient-to-br from-red-900/20 to-gray-900/20 border-red-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-300">
            <AlertTriangle className="h-5 w-5" />
            Advanced AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-300">Unable to generate advanced prediction</p>
        </CardContent>
      </Card>
    );
  }

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'STRONG_BUY': return 'bg-green-600 text-white';
      case 'BUY': return 'bg-green-500 text-white';
      case 'HOLD': return 'bg-yellow-500 text-black';
      case 'SELL': return 'bg-red-500 text-white';
      case 'STRONG_SELL': return 'bg-red-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'text-green-400';
      case 'MEDIUM': return 'text-yellow-400';
      case 'HIGH': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const priceDirection = prediction.predictedClosePrice > prediction.currentPrice;
  const priceChange = prediction.predictedClosePrice - prediction.currentPrice;
  const priceChangePercent = ((priceChange / prediction.currentPrice) * 100);
  
  const timeSinceUpdate = new Date().getTime() - new Date(prediction.lastUpdated).getTime();
  const minutesSinceUpdate = Math.floor(timeSinceUpdate / (1000 * 60));
  
  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['/api/amd/market-close-prediction'] });
      await queryClient.refetchQueries({ queryKey: ['/api/amd/market-close-prediction'] });
    } finally {
      setTimeout(() => setRefreshing(false), 1000);
    }
  };
  
  const isStable = minutesSinceUpdate < 30; // Stable if updated within 30 minutes
  const nextUpdateIn = 30 - minutesSinceUpdate;

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-purple-300">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Professional AI Prediction
          </div>
          <Badge className={getRecommendationColor(prediction.recommendation)}>
            {prediction.recommendation.replace('_', ' ')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Market Close Prediction */}
        <div className="bg-black/20 rounded-lg p-4 border border-purple-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">Next Market Close Prediction</span>
            </div>
            <div className="text-xs text-gray-400">
              Updated {minutesSinceUpdate}m ago
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400">Current Price</p>
              <p className="text-lg font-bold text-white">${prediction.currentPrice.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Predicted Close</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-white">${prediction.predictedClosePrice.toFixed(2)}</p>
                {priceDirection ? (
                  <TrendingUp className="h-4 w-4 text-green-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-400" />
                )}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-300">
                Market {prediction.marketHours.isOpen ? 'Open' : 'Closed'}
              </span>
            </div>
            <div className={`text-sm font-medium ${priceDirection ? 'text-green-400' : 'text-red-400'}`}>
              {priceDirection ? '+' : ''}${Math.abs(priceChange).toFixed(2)} ({priceDirection ? '+' : ''}{priceChangePercent.toFixed(2)}%)
            </div>
          </div>
          
          {/* Expected Profit/Loss */}
          <div className="mt-3 pt-3 border-t border-gray-700/50">
            <div className="text-xs text-gray-400 mb-1">Expected Return (1000 shares)</div>
            <div className={`text-sm font-bold ${priceDirection ? 'text-green-400' : 'text-red-400'}`}>
              {priceDirection ? '+' : ''}${(priceChange * 1000).toFixed(0)} 
              <span className="text-xs ml-1">({priceDirection ? 'Profit' : 'Loss'})</span>
            </div>
          </div>
        </div>

        {/* Confidence & Stability */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-black/20 rounded-lg p-3 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-blue-400" />
              <span className="text-xs text-blue-300">Confidence</span>
            </div>
            <p className="text-xl font-bold text-white">{prediction.confidence.toFixed(0)}%</p>
          </div>
          
          <div className="bg-black/20 rounded-lg p-3 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-green-400" />
              <span className="text-xs text-green-300">Stability</span>
            </div>
            <p className="text-xl font-bold text-white">{prediction.stabilityScore.toFixed(0)}%</p>
          </div>
          
          <div className="bg-black/20 rounded-lg p-3 border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-yellow-400" />
              <span className="text-xs text-yellow-300">Data Quality</span>
            </div>
            <p className="text-xl font-bold text-white">{prediction.dataQuality.toFixed(0)}%</p>
          </div>
        </div>

        {/* AI Reasoning */}
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
          >
            {showDetails ? 'Hide Analysis' : 'Show AI Reasoning'}
          </Button>
          
          {showDetails && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-gray-400 uppercase tracking-wide">AI Analysis Points:</p>
              {prediction.reasoning.slice(0, 6).map((reason, index) => (
                <div key={index} className="text-xs text-gray-300 bg-black/20 rounded p-2 border border-gray-700/30">
                  • {reason}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pro Trader Badge */}
        <div className="text-center pt-2 border-t border-purple-500/20">
          <Badge variant="outline" className="border-purple-500/50 text-purple-300 text-xs">
            🔥 Professional Trader-Grade Analysis
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}