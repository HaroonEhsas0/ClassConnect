import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-2xl font-bold text-primary cursor-pointer">ClassConnect</h1>
              </Link>
            </div>
          </div>
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="/">
                <a className="text-gray-900 hover:text-primary px-3 py-2 text-sm font-medium">Browse Classes</a>
              </Link>
              <a href="#" className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium">For Instructors</a>
              <a href="#" className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium">Help</a>
            </div>
          </nav>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Heart className="h-5 w-5" />
            </Button>
            <Button>
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
