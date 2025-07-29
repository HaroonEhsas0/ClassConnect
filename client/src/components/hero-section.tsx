import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface HeroSectionProps {
  onSearch: (searchData: { query: string; location: string }) => void;
}

export default function HeroSection({ onSearch }: HeroSectionProps) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ query, location });
  };

  return (
    <section className="bg-gradient-to-r from-primary to-blue-600 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Discover Amazing Classes Near You</h1>
          <p className="text-xl mb-8 text-blue-100">Find local workshops, fitness classes, and learning experiences with real-time availability</p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
                  What do you want to learn?
                </Label>
                <Input
                  id="query"
                  type="text"
                  placeholder="Yoga, Cooking, Art..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="City or ZIP code"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
