import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Brain, 
  AlertTriangle,
  Activity,
  Zap
} from 'lucide-react';

interface PredictionData {
  id: string;
  symbol: string;
  currentPrice: string;
  predictedPrice: string;
  predictionDays: number;
  confidence: string;
  aiRating: number;
  recommendation: string;
  riskLevel: string;
  reasoning: string;
  modelUsed: string;
  timestamp: string;
}

interface PredictionPanelProps {
  prediction: PredictionData | null;
}

export function PredictionPanel({ prediction }: PredictionPanelProps) {
  if (!prediction) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-400" />
            AI Prediction Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-pulse">
              <Zap className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            </div>
            <p className="text-gray-400">Generating AI prediction...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentPrice = parseFloat(prediction.currentPrice);
  const predictedPrice = parseFloat(prediction.predictedPrice);
  const priceChange = predictedPrice - currentPrice;
  const priceChangePercent = (priceChange / currentPrice) * 100;
  const isPositive = priceChange > 0;

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'strong_buy': return 'bg-green-600';
      case 'buy': return 'bg-green-500';
      case 'hold': return 'bg-yellow-500';
      case 'sell': return 'bg-red-500';
      case 'strong_sell': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const getRecommendationLabel = (recommendation: string) => {
    switch (recommendation) {
      case 'strong_buy': return 'Strong Buy';
      case 'buy': return 'Buy Signal';
      case 'hold': return 'Hold';
      case 'sell': return 'Sell Signal';
      case 'strong_sell': return 'Strong Sell';
      default: return 'Hold';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-400" />
          AI Prediction Analysis
          <Badge className={`ml-auto ${getRecommendationColor(prediction.recommendation)}`}>
            {getRecommendationLabel(prediction.recommendation)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Prediction */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Current Price</div>
            <div className="text-2xl font-bold text-white">${currentPrice.toFixed(2)}</div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">5-Day Prediction</div>
            <div className={`text-2xl font-bold flex items-center gap-2 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              ${predictedPrice.toFixed(2)}
              {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
            </div>
            <div className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}% ({isPositive ? '+' : ''}${priceChange.toFixed(2)})
            </div>
          </div>
        </div>

        {/* AI Confidence & Rating */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">AI Confidence</span>
              <span className="text-sm font-semibold text-white">{prediction.confidence}%</span>
            </div>
            <Progress value={parseInt(prediction.confidence)} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">AI Rating</span>
              <span className="text-sm font-semibold text-white">{prediction.aiRating}/100</span>
            </div>
            <Progress value={prediction.aiRating} className="h-2" />
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-semibold text-white">Risk Assessment</span>
          </div>
          <div className={`text-lg font-bold capitalize ${getRiskColor(prediction.riskLevel)}`}>
            {prediction.riskLevel} Risk
          </div>
        </div>

        {/* AI Reasoning */}
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-semibold text-white">AI Analysis</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            {prediction.reasoning}
          </p>
        </div>

        {/* Model Info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Model: {prediction.modelUsed}</span>
          <span>{prediction.predictionDays}-day forecast</span>
        </div>
      </CardContent>
    </Card>
  );
}