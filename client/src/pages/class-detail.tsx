import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Star, Heart, MapPin, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/header";
import Footer from "@/components/footer";
import LiveChat from "@/components/live-chat";
import type { ClassWithDetails } from "@shared/schema";
import { Link } from "wouter";

export default function ClassDetail() {
  const [, params] = useRoute("/class/:id");
  const classId = params?.id;

  const { data: classData, isLoading } = useQuery<ClassWithDetails>({
    queryKey: ['/api/classes', classId],
    queryFn: async () => {
      const response = await fetch(`/api/classes/${classId}`);
      if (!response.ok) throw new Error('Failed to fetch class details');
      return response.json();
    },
    enabled: !!classId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-2xl mb-8"></div>
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded mb-8 w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Class not found</h1>
          <Link href="/">
            <Button>Back to classes</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(new Date(date));
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const classDate = new Date(date);
    const diffTime = classDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return classDate.toLocaleDateString('en-US', { weekday: 'long' });
    return classDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to classes
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="relative">
            <img 
              src={classData.imageUrl} 
              alt={classData.title}
              className="w-full h-64 object-cover"
            />
          </div>
          
          <div className="p-8">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{classData.title}</h1>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center text-yellow-500">
                    <Star className="h-5 w-5 fill-current" />
                    <span className="ml-1 font-medium">{classData.rating}</span>
                    <span className="text-gray-500 ml-1">({classData.reviewCount} reviews)</span>
                  </div>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600">{classData.location.name}</span>
                  <span className="text-gray-500">•</span>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    0.8 miles away
                  </div>
                </div>

                <div className="prose max-w-none mb-8">
                  <p className="text-gray-700 mb-4">{classData.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-6 my-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Class Details</h3>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          {classData.duration} minutes
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          Max {classData.maxParticipants} participants
                        </div>
                        <div className="text-gray-600">
                          <span className="font-medium">Skill Level:</span> {classData.skillLevel}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Location</h3>
                      <div className="text-gray-600">
                        <p className="font-medium">{classData.location.name}</p>
                        <p>{classData.location.address}</p>
                        <p>{classData.location.city}, {classData.location.state} {classData.location.zipCode}</p>
                      </div>
                    </div>
                  </div>
                  
                  {classData.whatYouLearn && classData.whatYouLearn.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">What you'll learn:</h3>
                      <ul className="text-gray-700 space-y-1">
                        {classData.whatYouLearn.map((item, index) => (
                          <li key={index}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {classData.whatToBring && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">What to bring:</h3>
                      <p className="text-gray-700">{classData.whatToBring}</p>
                    </div>
                  )}
                </div>

                {/* Instructor Profile */}
                <Card className="mb-8">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Meet Your Instructor</h3>
                    <div className="flex items-start space-x-4">
                      <img 
                        src={classData.instructor.imageUrl} 
                        alt={classData.instructor.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{classData.instructor.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{classData.instructor.experience}</p>
                        <p className="text-sm text-gray-700">{classData.instructor.bio}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Reviews */}
                {classData.reviews.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h3>
                    <div className="space-y-4">
                      {classData.reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex text-yellow-500">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${i < review.rating ? 'fill-current' : ''}`} 
                                />
                              ))}
                            </div>
                            <span className="font-medium text-gray-900">{review.authorName}</span>
                            <span className="text-gray-500 text-sm">
                              {review.createdAt ? new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
                                Math.floor((new Date(review.createdAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)), 
                                'day'
                              ) : 'Recently'}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Booking Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-6">
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <span className="text-3xl font-bold text-gray-900">${classData.price}</span>
                      <span className="text-gray-600">/class</span>
                    </div>

                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Upcoming Sessions</h4>
                      <div className="space-y-3">
                        {classData.sessions.filter(session => session.isActive).map((session) => (
                          <div 
                            key={session.id} 
                            className="border border-gray-200 rounded-lg p-3 hover:border-primary cursor-pointer transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {formatDate(session.startTime)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {formatTime(session.startTime)}
                                </p>
                              </div>
                              <span className="text-xs bg-secondary text-white px-2 py-1 rounded-full">
                                {session.availableSpots} spots
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button className="w-full mb-3">
                      Book Now
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Heart className="h-4 w-4 mr-2" />
                      Add to Favorites
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <LiveChat />
    </div>
  );
}
