import { Search, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const GymSearch = () => {
  const [location, setLocation] = useState("Indore");
  const [date, setDate] = useState("");

  const handleSearch = () => {
    console.log("Searching for gyms:", { location, date });
    // TODO: Implement search functionality
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg w-full max-w-3xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 md:col-span-1">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" size={20} />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/20 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-white placeholder:text-white/70"
            />
          </div>
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" size={20} />
          <input
            type="date"
            placeholder="Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/20 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-white placeholder:text-white/70"
          />
        </div>
        <div>
          <Button onClick={handleSearch} className="w-full text-white py-3 h-[46px] bg-primary hover:bg-primary/90">
            <Search className="mr-2" size={20} />
            Find Gyms
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GymSearch;
