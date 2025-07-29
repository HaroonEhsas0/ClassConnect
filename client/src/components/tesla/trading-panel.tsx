import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { StockPrice, AiPrediction } from '../../../../shared/tesla-schema';

interface TradingPanelProps {
  currentPrice: StockPrice;
  prediction: AiPrediction;
}

export function TradingPanel({ currentPrice, prediction }: TradingPanelProps) {
  const [action, setAction] = useState<'buy' | 'sell'>('buy');
  const [shares, setShares] = useState<string>('100');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState<string>(currentPrice.price);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const tradeMutation = useMutation({
    mutationFn: async (tradeData: any) => {
      const response = await fetch('/api/tesla/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tradeData),
      });
      
      if (!response.ok) {
        throw new Error('Trade execution failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Trade Executed Successfully! 🎉",
        description: data.message,
      });
      
      // Reset form
      setShares('100');
      setLimitPrice(currentPrice.price);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Trade Failed",
        description: (error as Error).message,
      });
    },
  });

  const handleTrade = () => {
    const sharesNum = parseInt(shares);
    const limitPriceNum = orderType === 'limit' ? parseFloat(limitPrice) : undefined;

    if (isNaN(sharesNum) || sharesNum <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Shares",
        description: "Please enter a valid number of shares",
      });
      return;
    }

    if (orderType === 'limit' && (isNaN(limitPriceNum!) || limitPriceNum! <= 0)) {
      toast({
        variant: "destructive",
        title: "Invalid Limit Price",
        description: "Please enter a valid limit price",
      });
      return;
    }

    tradeMutation.mutate({
      action,
      shares: sharesNum,
      orderType,
      limitPrice: limitPriceNum,
    });
  };

  const executionPrice = orderType === 'limit' ? parseFloat(limitPrice) : parseFloat(currentPrice.price);
  const totalValue = parseInt(shares || '0') * executionPrice;

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'strong_buy': return 'bg-green-600';
      case 'buy': return 'bg-green-500';
      case 'hold': return 'bg-yellow-500';
      case 'sell': return 'bg-red-500';
      case 'strong_sell': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const shouldHighlightAction = () => {
    if (prediction.recommendation === 'strong_buy' || prediction.recommendation === 'buy') {
      return action === 'buy';
    }
    if (prediction.recommendation === 'sell' || prediction.recommendation === 'strong_sell') {
      return action === 'sell';
    }
    return false;
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Trading Panel
          </div>
          <Badge className={`${getRecommendationColor(prediction.recommendation)} text-white`}>
            AI: {prediction.recommendation.replace('_', ' ').toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Recommendation Alert */}
        <Alert className={`border-2 ${shouldHighlightAction() ? 'border-green-500 bg-green-500/10' : 'border-yellow-500 bg-yellow-500/10'}`}>
          <div className="flex items-center">
            {shouldHighlightAction() ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertDescription className="ml-2 text-white">
              <strong>AI Recommendation:</strong> {prediction.recommendation.replace('_', ' ').toUpperCase()} 
              (Rating: {prediction.aiRating}%, Risk: {prediction.riskLevel})
              {shouldHighlightAction() && ' - Your selection aligns with AI recommendation!'}
            </AlertDescription>
          </div>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Trade Configuration */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={action === 'buy' ? 'default' : 'outline'}
                onClick={() => setAction('buy')}
                className={`${action === 'buy' 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Buy
              </Button>
              <Button
                variant={action === 'sell' ? 'default' : 'outline'}
                onClick={() => setAction('sell')}
                className={`${action === 'sell' 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <TrendingDown className="h-4 w-4 mr-2" />
                Sell
              </Button>
            </div>

            <div>
              <Label htmlFor="shares" className="text-gray-300">Number of Shares</Label>
              <Input
                id="shares"
                type="number"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                placeholder="100"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="orderType" className="text-gray-300">Order Type</Label>
              <Select value={orderType} onValueChange={(value: 'market' | 'limit') => setOrderType(value)}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="market">Market Order</SelectItem>
                  <SelectItem value="limit">Limit Order</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {orderType === 'limit' && (
              <div>
                <Label htmlFor="limitPrice" className="text-gray-300">Limit Price</Label>
                <Input
                  id="limitPrice"
                  type="number"
                  step="0.01"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h4 className="font-semibold text-white mb-3">Order Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Action:</span>
                  <span className={`font-medium ${action === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                    {action.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Shares:</span>
                  <span className="text-white">{shares || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Price:</span>
                  <span className="text-white">
                    ${executionPrice.toFixed(2)} {orderType === 'market' ? '(Market)' : '(Limit)'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-600">
                  <span className="text-gray-400">Total Value:</span>
                  <span className="text-white font-bold">${totalValue.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleTrade}
              disabled={tradeMutation.isPending || !shares}
              className={`w-full ${action === 'buy' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
              } text-white`}
            >
              {tradeMutation.isPending ? 'Executing...' : `${action.toUpperCase()} ${shares || '0'} Shares`}
            </Button>

            <div className="text-xs text-gray-400 text-center">
              This is a simulation for demonstration purposes only.
              No real trades are executed.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}