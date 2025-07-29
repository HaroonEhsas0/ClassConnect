import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Newspaper, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { NewsArticle } from '../../../../shared/tesla-schema';

interface NewsFeedProps {
  news: NewsArticle[];
}

export function NewsFeed({ news }: NewsFeedProps) {
  const getSentimentIcon = (sentimentScore: string | null) => {
    if (!sentimentScore) return null;
    const score = parseFloat(sentimentScore);
    if (score > 0.1) return <TrendingUp className="h-4 w-4 text-green-400" />;
    if (score < -0.1) return <TrendingDown className="h-4 w-4 text-red-400" />;
    return null;
  };

  const getSentimentColor = (sentimentScore: string | null) => {
    if (!sentimentScore) return 'bg-gray-500';
    const score = parseFloat(sentimentScore);
    if (score > 0.1) return 'bg-green-500';
    if (score < -0.1) return 'bg-red-500';
    return 'bg-gray-500';
  };

  const getSentimentLabel = (sentimentScore: string | null) => {
    if (!sentimentScore) return 'NEUTRAL';
    const score = parseFloat(sentimentScore);
    if (score > 0.1) return 'POSITIVE';
    if (score < -0.1) return 'NEGATIVE';
    return 'NEUTRAL';
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <Newspaper className="h-5 w-5 mr-2" />
            AMD News
          </div>
          <Badge className="bg-purple-500 text-white">
            {news.length} articles
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {news.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No recent news available
          </div>
        ) : (
          news.slice(0, 6).map((article) => (
            <div key={article.id} className="bg-gray-700/50 p-4 rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-600 text-white text-xs">
                    {article.source}
                  </Badge>
                  {article.sentimentScore && (
                    <Badge className={`${getSentimentColor(article.sentimentScore)} text-white text-xs flex items-center`}>
                      {getSentimentIcon(article.sentimentScore)}
                      <span className="ml-1">{getSentimentLabel(article.sentimentScore)}</span>
                    </Badge>
                  )}
                  {article.relevanceScore && (
                    <Badge variant="outline" className="text-xs text-gray-300 border-gray-500">
                      Relevance: {parseFloat(article.relevanceScore).toFixed(1)}/10
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
                </div>
              </div>
              
              <h4 className="text-white font-medium text-sm leading-tight">
                {article.headline}
              </h4>
              
              {article.content && (
                <p className="text-gray-300 text-xs leading-relaxed line-clamp-2">
                  {article.content.length > 150 
                    ? article.content.substring(0, 150) + '...' 
                    : article.content
                  }
                </p>
              )}
              
              <div className="flex items-center justify-between">
                {article.sentimentScore && (
                  <div className="text-xs text-gray-400">
                    Sentiment: {parseFloat(article.sentimentScore).toFixed(2)}
                  </div>
                )}
                
                {article.url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-blue-400 hover:text-blue-300 h-auto p-1"
                  >
                    <a href={article.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Read Full Article
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
        
        {news.length > 6 && (
          <div className="text-center text-gray-400 text-sm">
            +{news.length - 6} more articles available
          </div>
        )}
      </CardContent>
    </Card>
  );
}