import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { SearchFilters } from "@shared/schema";

interface FilterSidebarProps {
  filters: SearchFilters;
  onFilterChange: (filters: Partial<SearchFilters>) => void;
  onClearFilters: () => void;
}

export default function FilterSidebar({ filters, onFilterChange, onClearFilters }: FilterSidebarProps) {
  const categories = [
    "Fitness & Wellness",
    "Arts & Crafts", 
    "Cooking",
    "Music",
    "Technology"
  ];

  const handleCategoryChange = (category: string, checked: boolean) => {
    onFilterChange({ category: checked ? category : undefined });
  };

  const handlePriceChange = (priceRange: string) => {
    switch (priceRange) {
      case "under-25":
        onFilterChange({ priceMin: undefined, priceMax: 25 });
        break;
      case "25-50":
        onFilterChange({ priceMin: 25, priceMax: 50 });
        break;
      case "50-100":
        onFilterChange({ priceMin: 50, priceMax: 100 });
        break;
      case "100-plus":
        onFilterChange({ priceMin: 100, priceMax: undefined });
        break;
      default:
        onFilterChange({ priceMin: undefined, priceMax: undefined });
    }
  };

  const handleAvailabilityChange = (type: string, checked: boolean) => {
    switch (type) {
      case "today":
        onFilterChange({ availableToday: checked });
        break;
      case "week":
        onFilterChange({ availableThisWeek: checked });
        break;
      case "weekends":
        onFilterChange({ weekendsOnly: checked });
        break;
    }
  };

  const getCurrentPriceRange = () => {
    if (filters.priceMax === 25) return "under-25";
    if (filters.priceMin === 25 && filters.priceMax === 50) return "25-50";
    if (filters.priceMin === 50 && filters.priceMax === 100) return "50-100";
    if (filters.priceMin === 100) return "100-plus";
    return "";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Filters</h3>
      
      {/* Category Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Category</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={filters.category === category}
                onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
              />
              <Label htmlFor={category} className="text-sm text-gray-600">
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Price Range</h4>
        <RadioGroup value={getCurrentPriceRange()} onValueChange={handlePriceChange}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="under-25" id="under-25" />
            <Label htmlFor="under-25" className="text-sm text-gray-600">
              Under $25
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="25-50" id="25-50" />
            <Label htmlFor="25-50" className="text-sm text-gray-600">
              $25 - $50
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="50-100" id="50-100" />
            <Label htmlFor="50-100" className="text-sm text-gray-600">
              $50 - $100
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="100-plus" id="100-plus" />
            <Label htmlFor="100-plus" className="text-sm text-gray-600">
              $100+
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Availability */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Availability</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="today"
              checked={filters.availableToday || false}
              onCheckedChange={(checked) => handleAvailabilityChange("today", checked as boolean)}
            />
            <Label htmlFor="today" className="text-sm text-gray-600">
              Available today
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="week"
              checked={filters.availableThisWeek || false}
              onCheckedChange={(checked) => handleAvailabilityChange("week", checked as boolean)}
            />
            <Label htmlFor="week" className="text-sm text-gray-600">
              This week
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="weekends"
              checked={filters.weekendsOnly || false}
              onCheckedChange={(checked) => handleAvailabilityChange("weekends", checked as boolean)}
            />
            <Label htmlFor="weekends" className="text-sm text-gray-600">
              Weekends only
            </Label>
          </div>
        </div>
      </div>

      <Button variant="outline" onClick={onClearFilters} className="w-full">
        Clear All Filters
      </Button>
    </div>
  );
}
