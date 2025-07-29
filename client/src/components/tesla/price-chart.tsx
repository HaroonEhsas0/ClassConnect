import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';
import type { StockPrice } from '../../../../shared/tesla-schema';

export function PriceChart() {
  const { data: priceHistory, isLoading } = useQuery<StockPrice[]>({
    queryKey: ['/api/tesla/price/history', 24],
    refetchInterval: 2000, // Refresh every 2 seconds for real-time chart updates
    staleTime: 1000, // Consider data stale after 1 second
    refetchIntervalInBackground: true, // Keep updating even when tab is not active
  });

  if (isLoading || !priceHistory) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Price Chart (24h)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-400">
            Loading chart data...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data (reverse to show chronological order)
  const chartData = (priceHistory || [])
    .slice()
    .reverse()
    .map((price: StockPrice) => ({
      time: new Date(price.timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      price: parseFloat(price.price),
      volume: price.volume,
    }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-600">
          <p className="text-white font-medium">{label}</p>
          <p className="text-green-400">
            Price: ${payload[0].value.toFixed(2)}
          </p>
          <p className="text-blue-400">
            Volume: {payload[0].payload.volume.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Price Chart (24h)
          </div>
          <div className="text-sm text-gray-400">
            {chartData.length} data points
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                fontSize={12}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                domain={['dataMin - 1', 'dataMax + 1']}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: '#10B981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {chartData.length > 0 && (
          <div className="mt-4 flex justify-between text-sm text-gray-400">
            <div>
              24h Low: ${Math.min(...chartData.map((d: any) => d.price)).toFixed(2)}
            </div>
            <div>
              24h High: ${Math.max(...chartData.map((d: any) => d.price)).toFixed(2)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}