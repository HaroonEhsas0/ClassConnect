import { Star, Heart, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ClassWithDetails } from "@shared/schema";
import { Link } from "wouter";

interface ClassCardProps {
  classData: ClassWithDetails;
}

export default function ClassCard({ classData }: ClassCardProps) {
  const nextSession = classData.sessions
    .filter(session => session.isActive && new Date(session.startTime) > new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];

  const formatTime = (date: Date) => {
    const now = new Date();
    const sessionDate = new Date(date);
    const diffTime = sessionDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return `Today ${sessionDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    if (diffDays === 1) return `Tomorrow ${sessionDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    return sessionDate.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getAvailabilityBadge = (spots: number) => {
    if (spots <= 1) return { color: "bg-accent", text: `${spots} spot${spots === 1 ? '' : 's'} left` };
    if (spots <= 3) return { color: "bg-secondary availability-pulse", text: `${spots} spots available` };
    return { color: "bg-secondary availability-pulse", text: `${spots} spots available` };
  };

  const availabilityBadge = nextSession ? getAvailabilityBadge(nextSession.availableSpots) : null;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      <Link href={`/class/${classData.id}`}>
        <img 
          src={classData.imageUrl} 
          alt={classData.title}
          className="w-full h-48 object-cover"
        />
      </Link>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <Link href={`/class/${classData.id}`}>
            <h3 className="text-lg font-semibold text-gray-900 hover:text-primary transition-colors">
              {classData.title}
            </h3>
          </Link>
          <Button variant="ghost" size="sm">
            <Heart className="h-4 w-4 text-gray-300 hover:text-red-500" />
          </Button>
        </div>
        
        <div className="flex items-center text-gray-600 text-sm mb-3">
          <span>{classData.location.name}</span>
          <span className="mx-2">•</span>
          <MapPin className="h-3 w-3 mr-1" />
          <span>0.8 miles away</span>
        </div>
        
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">{classData.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-yellow-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="ml-1 text-sm font-medium">{classData.rating}</span>
              <span className="text-gray-500 text-sm ml-1">({classData.reviewCount})</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-gray-900">${classData.price}</span>
            <span className="text-gray-600 text-sm">/class</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          {availabilityBadge && (
            <Badge className={`${availabilityBadge.color} text-white text-xs`}>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
                {availabilityBadge.text}
              </div>
            </Badge>
          )}
          {nextSession && (
            <span className="text-sm text-gray-600">
              Next: {formatTime(nextSession.startTime)}
            </span>
          )}
        </div>

        <Link href={`/class/${classData.id}`}>
          <Button className="w-full">
            View Details & Book
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
