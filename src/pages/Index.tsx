
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dumbbell, MapPin, Star, Users } from "lucide-react";
import ChromaticSmoke from "@/components/hero/ChromaticSmoke";

const Index = () => {
  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoaded(true);
    
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="relative">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-20 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-2">
              <Dumbbell className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-white font-bold text-xl">FlexiFit</span>
          </div>
          <div className="flex gap-3">
            {user ? (
              <>
                <Button onClick={() => navigate("/bookings")} variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  My Bookings
                </Button>
                <Button onClick={() => navigate("/favorites")} variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Favorites
                </Button>
                <Button onClick={handleLogout} variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Logout
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate("/auth")} className="bg-primary hover:bg-primary/90">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-screen bg-gradient-to-b from-transparent to-fitness-dark overflow-hidden">
        <ChromaticSmoke />
        
        {/* Content Container */}
        <div className="relative z-10 min-h-screen w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Badge */}
            <div className={`transform transition-all duration-700 ${
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}>
              <span className="inline-block px-4 py-1 rounded-full bg-primary/20 backdrop-blur-sm text-white text-sm font-medium border border-primary/30">
                🏋️ 500+ Gyms Available
              </span>
            </div>
            
            {/* Main Heading */}
            <h1 
              className={`text-4xl sm:text-5xl md:text-6xl font-bold text-white transform transition-all duration-700 delay-100 ${
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}
            >
              Book Your Gym Session Today
            </h1>
            
            {/* Description */}
            <p 
              className={`text-lg sm:text-xl text-white/90 transform transition-all duration-700 delay-200 ${
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.1)" }}
            >
              No commitments. No long-term memberships. Just pay per session and enjoy flexible fitness.
            </p>
            
            {/* Search Button */}
            <div className={`transform transition-all duration-700 delay-300 ${
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}>
              <Button 
                onClick={() => navigate("/search")}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-6 text-lg font-semibold rounded-xl shadow-lg"
              >
                Search for Gyms
              </Button>
            </div>
            
            {/* Features */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 transform transition-all duration-700 delay-400 ${
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                <MapPin className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Find Nearby Gyms</h3>
                <p className="text-white/80 text-sm">Discover gyms in your area with real-time availability</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                <Star className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Rate & Review</h3>
                <p className="text-white/80 text-sm">Share your experience and help others choose</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                <Users className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Expert Trainers</h3>
                <p className="text-white/80 text-sm">Access certified trainers at every location</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
