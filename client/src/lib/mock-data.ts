// This file contains mock data for development and testing purposes
// In a real application, this would be replaced with actual API calls

export const mockClasses = [
  {
    id: "1",
    title: "Vinyasa Flow Yoga",
    description: "Flow through dynamic sequences connecting breath and movement in this energizing yoga class.",
    category: "Fitness & Wellness",
    price: 28,
    duration: 75,
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop",
    instructor: {
      name: "Sarah Johnson",
      experience: "Certified Yoga Instructor • 8 years experience",
      bio: "Sarah is a passionate yoga instructor with over 500 hours of training.",
      imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face"
    },
    location: {
      name: "Mindful Wellness Studio",
      address: "123 Wellness Ave",
      distance: "0.8 miles away"
    },
    rating: 4.9,
    reviewCount: 127,
    availableSpots: 3,
    nextSession: "Today 6:00 PM"
  },
  // Add more mock classes as needed
];
