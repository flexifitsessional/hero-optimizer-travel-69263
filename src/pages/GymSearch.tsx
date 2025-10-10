import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, MapPin, DollarSign, Star, Heart, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Gym {
  id: string;
  name: string;
  location: string;
  description: string;
  price_per_session: number;
  rating: number;
  image_url: string;
  amenities: string[];
}

const GymSearch = () => {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [filteredGyms, setFilteredGyms] = useState<Gym[]>([]);
  const [location, setLocation] = useState("");
  const [gymName, setGymName] = useState("");
  const [maxPrice, setMaxPrice] = useState([500]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchGyms();
    checkAuth();
    
    // Update all gym locations to Indore on mount
    const updateLocations = async () => {
      const { data, error } = await supabase
        .from('gyms')
        .update({ location: 'Indore' })
        .neq('location', 'Indore');
      
      if (!error) {
        console.log('Updated gym locations to Indore');
        fetchGyms(); // Refresh the gym list
      }
    };
    updateLocations();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserFavorites();
    }
  }, [user]);

  const fetchUserFavorites = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("favorites")
      .select("gym_id")
      .eq("user_id", user.id);
    
    if (data) {
      setFavorites(data.map(fav => fav.gym_id));
    }
  };

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
  };

  const fetchGyms = async () => {
    const { data, error } = await supabase
      .from("gyms")
      .select("*")
      .order("rating", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load gyms",
        variant: "destructive",
      });
      return;
    }

    setGyms(data || []);
    setFilteredGyms(data || []);
  };

  const handleFilter = () => {
    let filtered = gyms;

    if (gymName) {
      filtered = filtered.filter((gym) =>
        gym.name.toLowerCase().includes(gymName.toLowerCase())
      );
    }

    if (location) {
      filtered = filtered.filter((gym) =>
        gym.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    filtered = filtered.filter((gym) => gym.price_per_session <= maxPrice[0]);

    setFilteredGyms(filtered);
  };

  const toggleFavorite = async (gymId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add favorites",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    const isFavorite = favorites.includes(gymId);

    if (isFavorite) {
      // Remove from favorites
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("gym_id", gymId);

      if (!error) {
        setFavorites(favorites.filter((id) => id !== gymId));
        toast({ title: "Removed from favorites" });
      }
    } else {
      // Add to favorites
      const { error } = await supabase
        .from("favorites")
        .insert({ user_id: user.id, gym_id: gymId });

      if (!error) {
        setFavorites([...favorites, gymId]);
        toast({ title: "Added to favorites" });
      }
    }
  };

  useEffect(() => {
    handleFilter();
  }, [location, gymName, maxPrice]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-navbar text-navbar-foreground p-6">
        <div className="max-w-7xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mb-4 text-navbar-foreground hover:bg-navbar/80"
            >
            <ArrowLeft className="mr-2" size={20} />
            Back
          </Button>
          <h1 className="text-3xl font-bold mb-2">Find Your Perfect Gym</h1>
            <p className="text-navbar-foreground/80">
              Search and filter gyms based on location and price
            </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto p-6">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Search className="inline mr-2" size={16} />
                  Gym Name
                </label>
                <Input
                  placeholder="Search by gym name"
                  value={gymName}
                  onChange={(e) => setGymName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  <MapPin className="inline mr-2" size={16} />
                  Location
                </label>
                <Input
                  placeholder="Enter city or area"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  <DollarSign className="inline mr-2" size={16} />
                  Max Price per Session: ₹{maxPrice[0]}
                </label>
                <Slider
                  value={maxPrice}
                  onValueChange={setMaxPrice}
                  max={1000}
                  min={100}
                  step={50}
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGyms.map((gym) => (
            <Card
              key={gym.id}
              className="overflow-hidden hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer border-2 border-border hover:border-primary/50"
            >
              <div className="relative">
                <img
                  src={gym.image_url || "/placeholder.svg"}
                  alt={gym.name}
                  className="w-full h-48 object-cover"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                  onClick={(e) => toggleFavorite(gym.id, e)}
                >
                  <Heart
                    className={`transition-colors ${favorites.includes(gym.id) ? "fill-red-500 text-red-500" : ""}`}
                    size={20}
                  />
                </Button>
              </div>
              <CardContent
                className="p-4"
                onClick={() => navigate(`/gym/${gym.id}`)}
              >
                <h3 className="font-bold text-lg mb-2">{gym.name}</h3>
                <div className="flex items-center text-muted-foreground text-sm mb-2">
                  <MapPin size={14} className="mr-1" />
                  {gym.location}
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Star className="text-yellow-500 mr-1" size={16} />
                    <span className="font-medium">{gym.rating}</span>
                  </div>
                  <span className="font-bold text-primary">
                    ₹{gym.price_per_session}/session
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {gym.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredGyms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No gyms found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GymSearch;
