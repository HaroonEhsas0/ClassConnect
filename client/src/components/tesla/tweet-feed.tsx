import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { TweetSentiment } from '../../../../shared/tesla-schema';

interface TweetFeedProps {
  tweets: TweetSentiment[];
}

export function TweetFeed({ tweets }: TweetFeedProps) {
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <ThumbsUp className="h-4 w-4" />;
      case 'negative': return <ThumbsDown className="h-4 w-4" />;
      default: return <Minus className="h-4 w-4" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-500';
      case 'negative': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Elon Musk Tweets
          </div>
          <Badge className="bg-blue-500 text-white">
            {tweets.length} recent
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tweets.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No recent tweets available
          </div>
        ) : (
          tweets.slice(0, 5).map((tweet) => (
            <div key={tweet.id} className="bg-gray-700/50 p-4 rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Badge className={`${getSentimentColor(tweet.sentimentLabel)} text-white text-xs`}>
                    {getSentimentIcon(tweet.sentimentLabel)}
                    <span className="ml-1">{tweet.sentimentLabel.toUpperCase()}</span>
                  </Badge>
                  <Badge variant="outline" className="text-xs text-gray-300 border-gray-500">
                    Impact: {parseFloat(tweet.impactScore || '0').toFixed(1)}/10
                  </Badge>
                </div>
                <div className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(tweet.tweetDate), { addSuffix: true })}
                </div>
              </div>
              
              <p className="text-white text-sm leading-relaxed">
                "{tweet.tweetText}"
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div>
                  Sentiment Score: {parseFloat(tweet.sentimentScore).toFixed(2)}
                </div>
                <div className="flex items-center">
                  <span className="mr-2">📈</span>
                  Projected Impact: +{(parseFloat(tweet.impactScore || '0') * 0.5).toFixed(1)}%
                </div>
              </div>
            </div>
          ))
        )}
        
        {tweets.length > 5 && (
          <div className="text-center text-gray-400 text-sm">
            +{tweets.length - 5} more tweets available
          </div>
        )}
      </CardContent>
    </Card>
  );
}