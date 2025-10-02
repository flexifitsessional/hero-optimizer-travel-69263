
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dumbbell, MapPin, Star, Users, Clock } from "lucide-react";
import ChromaticSmoke from "@/components/hero/ChromaticSmoke";
import { HamburgerMenu } from "@/components/ui/hamburger-menu";

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
      <nav className="absolute top-0 left-0 right-0 z-20 p-4 sm:p-6 bg-transparent">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-2">
              <Dumbbell className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-white font-bold text-xl">FlexiFit</span>
          </div>
          <div className="flex gap-3">
            {user ? (
              <HamburgerMenu user={user} />
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
            
          </div>
        </div>
      </div>

      {/* We Offer Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Find Nearby Gyms</h3>
              <p className="text-muted-foreground text-sm">Discover gyms in your area with real-time availability</p>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Star className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Rate & Review</h3>
              <p className="text-muted-foreground text-sm">Share your experience and help others choose</p>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Expert Trainers</h3>
              <p className="text-muted-foreground text-sm">Access certified trainers at every location</p>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">24x7 Availability</h3>
              <p className="text-muted-foreground text-sm">Book sessions anytime, anywhere, at your convenience</p>
            </Card>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about-section" className="py-20 px-4 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">About FlexiFit</h2>
          <p className="text-lg text-white/80 text-center max-w-3xl mx-auto mb-12">
            FlexiFit revolutionizes the way you experience fitness. We believe in flexibility, affordability, and accessibility. 
            No more long-term commitments or expensive memberships. Just pay per session and enjoy world-class gym facilities 
            whenever and wherever you want.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg bg-white/5 border border-white/10">
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-white/70">Partner Gyms</div>
            </div>
            <div className="text-center p-6 rounded-lg bg-white/5 border border-white/10">
              <div className="text-4xl font-bold text-primary mb-2">10k+</div>
              <div className="text-white/70">Happy Members</div>
            </div>
            <div className="text-center p-6 rounded-lg bg-white/5 border border-white/10">
              <div className="text-4xl font-bold text-primary mb-2">50k+</div>
              <div className="text-white/70">Sessions Booked</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What Our Users Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 bg-white/5 border-white/10">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <p className="text-white/80 mb-4">
                "FlexiFit changed my fitness journey completely! I can now workout at different gyms based on my location. 
                The flexibility is unmatched!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-white">Rahul Sharma</div>
                  <div className="text-sm text-white/60">Software Engineer</div>
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-white/5 border-white/10">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <p className="text-white/80 mb-4">
                "No more long-term commitments! I love how I can try different gyms and only pay for what I use. 
                This is the future of fitness!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-white">Priya Patel</div>
                  <div className="text-sm text-white/60">Entrepreneur</div>
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-white/5 border-white/10">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <p className="text-white/80 mb-4">
                "As someone who travels frequently, FlexiFit is a blessing. I can maintain my fitness routine 
                no matter which city I'm in!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-white">Arjun Mehta</div>
                  <div className="text-sm text-white/60">Digital Marketer</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary rounded-lg p-2">
                  <Dumbbell className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-white font-bold text-lg">FlexiFit</span>
              </div>
              <p className="text-white/60 text-sm">
                Your flexible fitness partner. Book gym sessions without long-term commitments.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm text-white/60">
                <li><a href="/search" className="hover:text-primary transition-colors">Search Gyms</a></li>
                <li><a href="#about-section" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="/favorites" className="hover:text-primary transition-colors">Favorites</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Contact Support</h3>
              <p className="text-white/60 text-sm mb-2">
                Email: <a href="mailto:flexifitsessional@gmail.com" className="text-primary hover:underline">
                  flexifitsessional@gmail.com
                </a>
              </p>
              <p className="text-white/60 text-sm">
                Available 24/7 for your queries
              </p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center text-white/60 text-sm">
            <p>&copy; {new Date().getFullYear()} FlexiFit. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
