import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  MessageSquare, 
  Newspaper,
  RefreshCw,
  AlertTriangle,
  Target,
  Activity
} from 'lucide-react';
import { useState } from 'react';

import { PriceChart } from '@/components/tesla/price-chart';
import { AdvancedPredictionPanel } from '@/components/advanced-prediction-panel';

// News functionality removed
import { InsiderTrades } from '@/components/tesla/insider-trades';
import type { AmdDashboardData } from '../../../shared/tesla-schema';

export default function AmdDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const { data: dashboardData, isLoading, error } = useQuery<AmdDashboardData>({
    queryKey: ['/api/amd/dashboard'],
    refetchInterval: 2000, // Refresh every 2 seconds for real-time price updates
    staleTime: 500, // Consider data stale after 0.5 seconds
    refetchIntervalInBackground: true, // Keep updating even when tab is not active
  });

  const refreshMutation = useMutation({
    mutationFn: () => fetch('/api/amd/refresh', { method: 'POST' }),
    onSuccess: () => {
      setRefreshing(true);
      // Invalidate all queries after a short delay to allow server to update
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/amd'] });
        setRefreshing(false);
      }, 2000);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin text-6xl mb-4">⚡</div>
            <h2 className="text-2xl font-bold text-white mb-2">AMD Prediction System</h2>
            <p className="text-gray-300">Loading semiconductor market data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Alert className="max-w-md mx-auto mt-20">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load AMD data. Please try refreshing or contact support.
            </AlertDescription>
          </Alert>
          <div className="text-center mt-6">
            <Button
              onClick={() => refreshMutation.mutate()}
              disabled={refreshMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
              Retry Loading Data
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { currentPrice, technicalIndicators, prediction: latestPrediction, insiderTrades: recentInsiderTrades } = dashboardData;
  const recentTweets = []; // Twitter functionality removed per user request

  // Show loading state if critical data is missing
  if (!currentPrice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin text-6xl mb-4">⚡</div>
            <h2 className="text-2xl font-bold text-white mb-2">AMD Prediction System</h2>
            <p className="text-gray-300">Loading AMD stock data...</p>
            <div className="mt-6">
              <Button
                onClick={() => refreshMutation.mutate()}
                disabled={refreshMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'strong_buy': return '📈';
      case 'buy': return '📊';
      case 'hold': return '⚪';
      case 'sell': return '🔻';
      case 'strong_sell': return '🔴';
      default: return '⚪';
    }
  };

  const getRecommendationLabel = (recommendation: string) => {
    switch (recommendation) {
      case 'strong_buy': return 'Strong Buy';
      case 'buy': return 'Buy';
      case 'hold': return 'Hold';
      case 'sell': return 'Sell';
      case 'strong_sell': return 'Strong Sell';
      default: return 'Hold';
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AMD Prediction System
            </h1>
            <p className="text-gray-300 mt-2">AI-Powered AMD Stock Analysis & Forecasting</p>
          </div>
          <Button
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending || refreshing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(refreshMutation.isPending || refreshing) ? 'animate-spin' : ''}`} />
            {refreshing ? 'Updating...' : 'Refresh Data'}
          </Button>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Stock Price Card */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                AMD Stock Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-bold text-white">
                    ${parseFloat(currentPrice.price).toFixed(2)}
                  </span>
                  <div className={`flex items-center text-sm ${parseFloat(currentPrice.change) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {parseFloat(currentPrice.change) >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                    ${parseFloat(currentPrice.change).toFixed(2)} ({parseFloat(currentPrice.changePercent).toFixed(2)}%)
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  Volume: {currentPrice.volume.toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Prediction Card */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center">
                <Target className="h-5 w-5 mr-2" />
                AI Prediction (1 Day)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {latestPrediction ? (
                  <>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-bold text-blue-400">
                        ${parseFloat(latestPrediction.predictedPrice).toFixed(2)}
                      </span>
                      <Badge className={`${getRiskBadgeColor(latestPrediction.riskLevel || 'medium')} text-white`}>
                        {(latestPrediction.riskLevel || 'medium').toUpperCase()} RISK
                      </Badge>
                    </div>
                    <div className="text-xs text-green-400 mt-1">
                      vs Current: ${parseFloat(currentPrice.price).toFixed(2)} 
                      ({((parseFloat(latestPrediction.predictedPrice) - parseFloat(currentPrice.price)) / parseFloat(currentPrice.price) * 100).toFixed(2)}%)
                    </div>
                    <div className="text-sm text-gray-400">
                      Confidence: {parseFloat(latestPrediction.confidence).toFixed(1)}%
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="animate-pulse text-gray-400">Generating prediction...</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Rating Card */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                AI Rating & Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {latestPrediction ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-white">
                        {latestPrediction.aiRating}%
                      </span>
                      <div className="text-right">
                        <div className="text-2xl">{getRecommendationIcon(latestPrediction.recommendation || 'hold')}</div>
                        <span className="text-sm font-medium">{getRecommendationLabel(latestPrediction.recommendation || 'hold')}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {latestPrediction.reasoning}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="animate-pulse text-gray-400">Analyzing data...</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Data Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {/* Technical Indicators */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm">Technical Indicators</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {technicalIndicators ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">RSI:</span>
                    <span className="text-white">{technicalIndicators.rsi || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">MACD:</span>
                    <span className="text-white">{technicalIndicators.macd || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">SMA 20:</span>
                    <span className="text-white">{technicalIndicators.sma20 ? `$${parseFloat(technicalIndicators.sma20).toFixed(2)}` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">SMA 50:</span>
                    <span className="text-white">{technicalIndicators.sma50 ? `$${parseFloat(technicalIndicators.sma50).toFixed(2)}` : 'N/A'}</span>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="animate-pulse text-gray-400 text-sm">Loading indicators...</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Insider Activity */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Insider Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{recentInsiderTrades.length}</div>
                <div className="text-xs text-gray-400">Recent Trades (30d)</div>
                {recentInsiderTrades.length > 0 && (
                  <div className="mt-2 text-xs">
                    <span className={`${recentInsiderTrades[0].transactionType === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                      Latest: {(recentInsiderTrades[0].transactionType || 'buy').toUpperCase()} by {recentInsiderTrades[0].insiderName || 'Unknown'}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Social Media Analysis - Twitter Removed */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Social Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-sm text-gray-400">Twitter Disabled</div>
                <div className="text-xs text-gray-500 mt-1">Focus on News & Fundamentals</div>
                <div className="mt-2">
                  <Badge className="bg-blue-500 text-white text-xs">
                    NEWS-FOCUSED
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* News functionality removed per user request */}
        </div>

        {/* Detailed Information Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PriceChart />
          {/* News functionality removed per user request */}
        </div>

        {/* Insider Trades Detail */}
        <div className="mt-6">
          <InsiderTrades trades={recentInsiderTrades} />
        </div>
      </div>
    </div>
  );
}