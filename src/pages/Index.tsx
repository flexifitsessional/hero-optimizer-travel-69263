
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
      <nav className="absolute top-0 left-0 right-0 z-20 p-4 sm:p-6 bg-navbar/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-2">
              <Dumbbell className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-navbar-foreground font-bold text-xl">FlexiFit</span>
          </div>
          <div className="flex gap-3">
            {user ? (
              <>
                <Button onClick={() => navigate("/bookings")} variant="outline" className="bg-navbar-foreground/10 border-navbar-foreground/20 text-navbar-foreground hover:bg-navbar-foreground/20">
                  My Bookings
                </Button>
                <Button onClick={() => navigate("/favorites")} variant="outline" className="bg-navbar-foreground/10 border-navbar-foreground/20 text-navbar-foreground hover:bg-navbar-foreground/20">
                  Favorites
                </Button>
                <Button onClick={() => navigate("/gym-owner")} variant="outline" className="bg-navbar-foreground/10 border-navbar-foreground/20 text-navbar-foreground hover:bg-navbar-foreground/20">
                  My Gyms
                </Button>
                <Button onClick={handleLogout} variant="outline" className="bg-navbar-foreground/10 border-navbar-foreground/20 text-navbar-foreground hover:bg-navbar-foreground/20">
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

      {/* About Us Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">About FlexiFit</h2>
          <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto mb-12">
            FlexiFit revolutionizes the way you experience fitness. We believe in flexibility, affordability, and accessibility. 
            No more long-term commitments or expensive memberships. Just pay per session and enjoy world-class gym facilities 
            whenever and wherever you want.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg bg-card border">
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Partner Gyms</div>
            </div>
            <div className="text-center p-6 rounded-lg bg-card border">
              <div className="text-4xl font-bold text-primary mb-2">10k+</div>
              <div className="text-muted-foreground">Happy Members</div>
            </div>
            <div className="text-center p-6 rounded-lg bg-card border">
              <div className="text-4xl font-bold text-primary mb-2">50k+</div>
              <div className="text-muted-foreground">Sessions Booked</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What Our Users Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "FlexiFit changed my fitness journey completely! I can now workout at different gyms based on my location. 
                The flexibility is unmatched!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">Rahul Sharma</div>
                  <div className="text-sm text-muted-foreground">Software Engineer</div>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "No more long-term commitments! I love how I can try different gyms and only pay for what I use. 
                This is the future of fitness!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">Priya Patel</div>
                  <div className="text-sm text-muted-foreground">Entrepreneur</div>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "As someone who travels frequently, FlexiFit is a blessing. I can maintain my fitness routine 
                no matter which city I'm in!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">Arjun Mehta</div>
                  <div className="text-sm text-muted-foreground">Digital Marketer</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
