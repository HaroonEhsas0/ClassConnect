import { 
  type Instructor, 
  type InsertInstructor,
  type Location,
  type InsertLocation,
  type Class,
  type InsertClass,
  type ClassSession,
  type InsertClassSession,
  type Review,
  type InsertReview,
  type ChatMessage,
  type InsertChatMessage,
  type ClassWithDetails,
  type SearchFilters
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Instructors
  getInstructor(id: string): Promise<Instructor | undefined>;
  createInstructor(instructor: InsertInstructor): Promise<Instructor>;
  
  // Locations
  getLocation(id: string): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  
  // Classes
  getClass(id: string): Promise<Class | undefined>;
  getClassWithDetails(id: string): Promise<ClassWithDetails | undefined>;
  searchClasses(filters: SearchFilters): Promise<ClassWithDetails[]>;
  createClass(classData: InsertClass): Promise<Class>;
  
  // Class Sessions
  getClassSessions(classId: string): Promise<ClassSession[]>;
  createClassSession(session: InsertClassSession): Promise<ClassSession>;
  
  // Reviews
  getClassReviews(classId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Chat
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
}

export class MemStorage implements IStorage {
  private instructors: Map<string, Instructor>;
  private locations: Map<string, Location>;
  private classes: Map<string, Class>;
  private classSessions: Map<string, ClassSession>;
  private reviews: Map<string, Review>;
  private chatMessages: Map<string, ChatMessage>;

  constructor() {
    this.instructors = new Map();
    this.locations = new Map();
    this.classes = new Map();
    this.classSessions = new Map();
    this.reviews = new Map();
    this.chatMessages = new Map();
    
    // Initialize with mock data
    this.initializeMockData();
  }

  private initializeMockData() {
    // Create instructors
    const instructor1: Instructor = {
      id: "inst1",
      name: "Sarah Johnson",
      email: "sarah@mindfulwellness.com",
      bio: "Sarah is a passionate yoga instructor with over 500 hours of training. She specializes in Vinyasa flow and mindfulness practices.",
      experience: "Certified Yoga Instructor • 8 years experience",
      imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
      rating: "4.9",
      reviewCount: 127
    };

    const instructor2: Instructor = {
      id: "inst2",
      name: "Chef Marco Romano",
      email: "marco@culinaryarts.com",
      bio: "Chef Marco brings authentic Italian cooking techniques with over 15 years of professional kitchen experience.",
      experience: "Professional Chef • 15 years experience",
      imageUrl: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400&h=400&fit=crop&crop=face",
      rating: "4.8",
      reviewCount: 89
    };

    const instructor3: Instructor = {
      id: "inst3",
      name: "Elena Martinez",
      email: "elena@claystudio.com",
      bio: "Elena is a ceramic artist and instructor who loves sharing the therapeutic art of pottery with students of all levels.",
      experience: "Master Potter • 12 years experience",
      imageUrl: "https://images.unsplash.com/photo-1494790108755-2616c9d2fa82?w=400&h=400&fit=crop&crop=face",
      rating: "4.7",
      reviewCount: 156
    };

    const instructor4: Instructor = {
      id: "inst4",
      name: "David Chen",
      email: "david@focusphoto.com",
      bio: "Professional photographer specializing in portrait and commercial photography with a passion for teaching.",
      experience: "Professional Photographer • 10 years experience",
      imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      rating: "4.9",
      reviewCount: 203
    };

    [instructor1, instructor2, instructor3, instructor4].forEach(inst => {
      this.instructors.set(inst.id, inst);
    });

    // Create locations
    const location1: Location = {
      id: "loc1",
      name: "Mindful Wellness Studio",
      address: "123 Wellness Ave",
      city: "San Francisco",
      state: "CA",
      zipCode: "94102",
      latitude: "37.7749",
      longitude: "-122.4194"
    };

    const location2: Location = {
      id: "loc2",
      name: "Culinary Arts Academy",
      address: "456 Chef Street",
      city: "San Francisco",
      state: "CA",
      zipCode: "94103",
      latitude: "37.7849",
      longitude: "-122.4094"
    };

    const location3: Location = {
      id: "loc3",
      name: "Clay Studio Downtown",
      address: "789 Art Lane",
      city: "San Francisco",
      state: "CA",
      zipCode: "94104",
      latitude: "37.7949",
      longitude: "-122.3994"
    };

    const location4: Location = {
      id: "loc4",
      name: "Focus Photography School",
      address: "321 Camera Blvd",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105",
      latitude: "37.8049",
      longitude: "-122.3894"
    };

    [location1, location2, location3, location4].forEach(loc => {
      this.locations.set(loc.id, loc);
    });

    // Create classes
    const class1: Class = {
      id: "class1",
      title: "Vinyasa Flow Yoga",
      description: "Flow through dynamic sequences connecting breath and movement in this energizing yoga class. Perfect for intermediate practitioners looking to deepen their practice.",
      category: "Fitness & Wellness",
      price: "28.00",
      duration: 75,
      imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop",
      instructorId: "inst1",
      locationId: "loc1",
      rating: "4.9",
      reviewCount: 127,
      whatYouLearn: [
        "Breath-synchronized movement sequences",
        "Proper alignment in foundational poses",
        "Mindfulness and meditation techniques",
        "Modifications for all skill levels"
      ],
      whatToBring: "Yoga mat (or rent one for $3), water bottle, and comfortable clothing that allows for movement.",
      skillLevel: "Intermediate",
      maxParticipants: 15
    };

    const class2: Class = {
      id: "class2",
      title: "Italian Pasta Making",
      description: "Learn to make fresh pasta from scratch with traditional Italian techniques and family recipes.",
      category: "Cooking",
      price: "65.00",
      duration: 120,
      imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
      instructorId: "inst2",
      locationId: "loc2",
      rating: "4.8",
      reviewCount: 89,
      whatYouLearn: [
        "Traditional pasta making techniques",
        "How to make different pasta shapes",
        "Authentic Italian sauce recipes",
        "Proper cooking and serving methods"
      ],
      whatToBring: "Apron provided. Just bring your appetite for learning!",
      skillLevel: "Beginner",
      maxParticipants: 12
    };

    const class3: Class = {
      id: "class3",
      title: "Beginner Pottery Wheel",
      description: "Get your hands dirty and create beautiful ceramic pieces on the potter's wheel.",
      category: "Arts & Crafts",
      price: "45.00",
      duration: 90,
      imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
      instructorId: "inst3",
      locationId: "loc3",
      rating: "4.7",
      reviewCount: 156,
      whatYouLearn: [
        "Basic pottery wheel techniques",
        "Centering and shaping clay",
        "Creating bowls and simple forms",
        "Glazing and finishing techniques"
      ],
      whatToBring: "All materials provided. Wear clothes you don't mind getting dirty.",
      skillLevel: "Beginner",
      maxParticipants: 8
    };

    const class4: Class = {
      id: "class4",
      title: "Portrait Photography",
      description: "Master the art of portrait photography with professional lighting and composition techniques.",
      category: "Technology",
      price: "85.00",
      duration: 180,
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop",
      instructorId: "inst4",
      locationId: "loc4",
      rating: "4.9",
      reviewCount: 203,
      whatYouLearn: [
        "Professional lighting setup",
        "Composition and framing techniques",
        "Working with portrait subjects",
        "Post-processing basics"
      ],
      whatToBring: "DSLR camera recommended. Equipment available to borrow if needed.",
      skillLevel: "Intermediate",
      maxParticipants: 10
    };

    [class1, class2, class3, class4].forEach(cls => {
      this.classes.set(cls.id, cls);
    });

    // Create class sessions
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const sessions = [
      // Yoga sessions
      {
        id: "session1",
        classId: "class1",
        startTime: new Date(today.getTime() + 18 * 60 * 60 * 1000), // Today 6 PM
        endTime: new Date(today.getTime() + 19.25 * 60 * 60 * 1000),
        availableSpots: 3,
        isActive: true
      },
      {
        id: "session2",
        classId: "class1",
        startTime: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000), // Tomorrow 6 PM
        endTime: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 19.25 * 60 * 60 * 1000),
        availableSpots: 5,
        isActive: true
      },
      // Cooking sessions
      {
        id: "session3",
        classId: "class2",
        startTime: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000), // Tomorrow 2 PM
        endTime: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000),
        availableSpots: 1,
        isActive: true
      },
      // Pottery sessions
      {
        id: "session4",
        classId: "class3",
        startTime: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000), // Day after tomorrow 7 PM
        endTime: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000 + 20.5 * 60 * 60 * 1000),
        availableSpots: 5,
        isActive: true
      },
      // Photography sessions
      {
        id: "session5",
        classId: "class4",
        startTime: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // Saturday 10 AM
        endTime: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000),
        availableSpots: 7,
        isActive: true
      }
    ];

    sessions.forEach(session => {
      this.classSessions.set(session.id, session);
    });

    // Create reviews
    const reviewsData = [
      {
        id: "review1",
        classId: "class1",
        authorName: "Emma K.",
        rating: 5,
        comment: "Amazing class! Sarah's instruction was clear and encouraging. The studio has a great atmosphere and I left feeling completely relaxed.",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        id: "review2",
        classId: "class1",
        authorName: "Michael R.",
        rating: 5,
        comment: "Perfect for intermediate practitioners. Great modifications offered for different skill levels. Highly recommend!",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 1 week ago
      }
    ];

    reviewsData.forEach(review => {
      this.reviews.set(review.id, review);
    });
  }

  async getInstructor(id: string): Promise<Instructor | undefined> {
    return this.instructors.get(id);
  }

  async createInstructor(instructor: InsertInstructor): Promise<Instructor> {
    const id = randomUUID();
    const newInstructor: Instructor = { 
      ...instructor, 
      id,
      rating: "0",
      reviewCount: 0
    };
    this.instructors.set(id, newInstructor);
    return newInstructor;
  }

  async getLocation(id: string): Promise<Location | undefined> {
    return this.locations.get(id);
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const id = randomUUID();
    const newLocation: Location = { ...location, id };
    this.locations.set(id, newLocation);
    return newLocation;
  }

  async getClass(id: string): Promise<Class | undefined> {
    return this.classes.get(id);
  }

  async getClassWithDetails(id: string): Promise<ClassWithDetails | undefined> {
    const classData = this.classes.get(id);
    if (!classData) return undefined;

    const instructor = this.instructors.get(classData.instructorId);
    const location = this.locations.get(classData.locationId);
    const sessions = Array.from(this.classSessions.values()).filter(s => s.classId === id);
    const reviews = Array.from(this.reviews.values()).filter(r => r.classId === id);

    if (!instructor || !location) return undefined;

    return {
      ...classData,
      instructor,
      location,
      sessions,
      reviews
    };
  }

  async searchClasses(filters: SearchFilters): Promise<ClassWithDetails[]> {
    const allClasses = Array.from(this.classes.values());
    
    let filteredClasses = allClasses.filter(cls => {
      // Text search
      if (filters.query) {
        const query = filters.query.toLowerCase();
        if (!cls.title.toLowerCase().includes(query) && 
            !cls.description.toLowerCase().includes(query) &&
            !cls.category.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Category filter
      if (filters.category && cls.category !== filters.category) {
        return false;
      }

      // Price filter
      const price = parseFloat(cls.price);
      if (filters.priceMin && price < filters.priceMin) {
        return false;
      }
      if (filters.priceMax && price > filters.priceMax) {
        return false;
      }

      return true;
    });

    // Get detailed class information
    const detailedClasses = await Promise.all(
      filteredClasses.map(async (cls) => {
        const details = await this.getClassWithDetails(cls.id);
        return details;
      })
    );

    return detailedClasses.filter((cls): cls is ClassWithDetails => cls !== undefined);
  }

  async createClass(classData: InsertClass): Promise<Class> {
    const id = randomUUID();
    const newClass: Class = { 
      ...classData, 
      id,
      rating: "0",
      reviewCount: 0
    };
    this.classes.set(id, newClass);
    return newClass;
  }

  async getClassSessions(classId: string): Promise<ClassSession[]> {
    return Array.from(this.classSessions.values()).filter(s => s.classId === classId);
  }

  async createClassSession(session: InsertClassSession): Promise<ClassSession> {
    const id = randomUUID();
    const newSession: ClassSession = { ...session, id };
    this.classSessions.set(id, newSession);
    return newSession;
  }

  async getClassReviews(classId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(r => r.classId === classId);
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = randomUUID();
    const newReview: Review = { 
      ...review, 
      id,
      createdAt: new Date()
    };
    this.reviews.set(id, newReview);
    return newReview;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(m => m.sessionId === sessionId)
      .sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0));
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const newMessage: ChatMessage = { 
      ...message, 
      id,
      timestamp: new Date()
    };
    this.chatMessages.set(id, newMessage);
    return newMessage;
  }
}

export const storage = new MemStorage();
