import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MapPin, Star, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Gym {
  id: string;
  name: string;
  location: string;
  description: string;
  price_per_session: number;
  rating: number;
  image_url: string;
}

const Favorites = () => {
  const [favorites, setFavorites] = useState<Gym[]>([]);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuthAndFetchFavorites();
  }, []);

  const checkAuthAndFetchFavorites = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to view favorites",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setUser(session.user);
    fetchFavorites(session.user.id);
  };

  const fetchFavorites = async (userId: string) => {
    const { data: favs, error: favError } = await supabase
      .from("favorites")
      .select("gym_id")
      .eq("user_id", userId);

    if (favError) {
      toast({
        title: "Error",
        description: "Failed to load favorites",
        variant: "destructive",
      });
      return;
    }

    const ids = (favs || []).map((f: any) => f.gym_id);
    if (ids.length === 0) {
      setFavorites([]);
      return;
    }

    const { data: gyms, error: gymsError } = await supabase
      .from("gyms")
      .select("id, name, location, description, price_per_session, rating, image_url")
      .in("id", ids);

    if (gymsError) {
      toast({
        title: "Error",
        description: "Failed to fetch gyms",
        variant: "destructive",
      });
      return;
    }

    setFavorites(gyms || []);
  };

  const removeFavorite = async (gymId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) return;

    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("gym_id", gymId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove favorite",
        variant: "destructive",
      });
      return;
    }

    setFavorites(favorites.filter((gym) => gym.id !== gymId));
    toast({ title: "Removed from favorites" });
  };

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
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold mb-2">My Favorites</h1>
            <p className="text-navbar-foreground/80">
              Your saved gyms for quick access
            </p>
        </div>
      </div>

      {/* Favorites Grid */}
      <div className="max-w-7xl mx-auto p-6">
        {favorites.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Heart size={48} className="text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No favorites yet</p>
              <Button onClick={() => navigate("/search")}>
                Search for Gyms
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((gym) => (
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
                    onClick={(e) => removeFavorite(gym.id, e)}
                  >
                    <Heart className="fill-red-500 text-red-500" size={20} />
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
        )}
      </div>
    </div>
  );
};

export default Favorites;
