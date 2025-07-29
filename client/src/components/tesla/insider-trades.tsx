import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, TrendingDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { InsiderTrade } from '../../../../shared/tesla-schema';

interface InsiderTradesProps {
  trades: InsiderTrade[];
}

export function InsiderTrades({ trades }: InsiderTradesProps) {
  const getTransactionIcon = (type: string) => {
    return type === 'buy' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  const getTransactionColor = (type: string) => {
    return type === 'buy' ? 'bg-green-500' : 'bg-red-500';
  };

  // Calculate summary stats
  const buyTrades = trades.filter(t => t.transactionType === 'buy');
  const sellTrades = trades.filter(t => t.transactionType === 'sell');
  const totalBuyShares = buyTrades.reduce((sum, t) => sum + t.shares, 0);
  const totalSellShares = sellTrades.reduce((sum, t) => sum + t.shares, 0);
  const netShares = totalBuyShares - totalSellShares;

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Insider Trading Activity (30 days)
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <Badge className="bg-green-600 text-white">
              {buyTrades.length} Buys
            </Badge>
            <Badge className="bg-red-600 text-white">
              {sellTrades.length} Sells
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {trades.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No insider trading activity in the last 30 days
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-700/30 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{totalBuyShares.toLocaleString()}</div>
                <div className="text-xs text-gray-400">Shares Bought</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{totalSellShares.toLocaleString()}</div>
                <div className="text-xs text-gray-400">Shares Sold</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${netShares >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {netShares >= 0 ? '+' : ''}{netShares.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">Net Position</div>
              </div>
            </div>

            {/* Individual Trades */}
            <div className="space-y-3">
              <h4 className="text-white font-medium">Recent Transactions</h4>
              {trades.slice(0, 10).map((trade) => (
                <div key={trade.id} className="bg-gray-700/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Badge className={`${getTransactionColor(trade.transactionType)} text-white flex items-center`}>
                        {getTransactionIcon(trade.transactionType)}
                        <span className="ml-1">{trade.transactionType.toUpperCase()}</span>
                      </Badge>
                      <span className="text-white font-medium">{trade.insiderName}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(trade.transactionDate), { addSuffix: true })}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Shares</div>
                      <div className="text-white font-medium">{trade.shares.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Price</div>
                      <div className="text-white font-medium">${parseFloat(trade.price).toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Total Value</div>
                      <div className="text-white font-medium">
                        ${(trade.shares * parseFloat(trade.price)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-400 flex justify-between">
                    <span>Transaction: {new Date(trade.transactionDate).toLocaleDateString()}</span>
                    <span>Filed: {new Date(trade.filingDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              
              {trades.length > 10 && (
                <div className="text-center text-gray-400 text-sm">
                  +{trades.length - 10} more transactions available
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}