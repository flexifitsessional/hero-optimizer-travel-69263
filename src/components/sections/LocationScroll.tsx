import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const locations = [
  {
    title: "Paris, France",
    description: "The City of Light beckons with its iconic architecture and timeless romance.",
    image: "/lovable-uploads/e6764045-1a5d-4f3d-80b8-d6ba711e528d.png",
    flag: "🇫🇷",
    extendedInfo: "Experience the magic of Paris with its world-renowned cuisine, historic landmarks like the Eiffel Tower and Notre-Dame, and charming neighborhoods filled with cafés and boutiques. Perfect for romantic getaways, art enthusiasts, and food lovers.",
    price: "From $1,299"
  },
  {
    title: "Santorini, Greece",
    description: "White-washed buildings cascade down volcanic cliffs into the crystal-clear Aegean Sea.",
    image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=2073&auto=format&fit=crop",
    flag: "🇬🇷",
    extendedInfo: "Discover the stunning beauty of Santorini's caldera views, famous sunsets, and traditional Greek hospitality. Explore ancient ruins, visit local wineries, and relax on unique volcanic beaches.",
    price: "From $1,499"
  },
  {
    title: "Kyoto, Japan",
    description: "Ancient temples and traditional gardens preserve Japan's cultural heart.",
    image: "https://images.unsplash.com/photo-1624253321171-1be53e12f5f4?q=80&w=2073&auto=format&fit=crop",
    flag: "🇯🇵",
    extendedInfo: "Immerse yourself in Japanese culture with visits to historic temples, traditional tea ceremonies, and peaceful Zen gardens. Experience the beauty of cherry blossoms in spring and vibrant autumn colors.",
    price: "From $1,899"
  },
  {
    title: "Machu Picchu, Peru",
    description: "This ancient Incan citadel sits among the clouds in the Andes Mountains.",
    image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=2073&auto=format&fit=crop",
    flag: "🇵🇪",
    extendedInfo: "Journey through time to explore this UNESCO World Heritage site. Trek the famous Inca Trail, discover ancient ruins, and experience the rich cultural heritage of the Andean people.",
    price: "From $1,699"
  }
];

const LocationScroll = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const sections = containerRef.current.children[1].children;
      const scrollPosition = window.scrollY - containerRef.current.offsetTop;

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i] as HTMLElement;
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (
          scrollPosition >= sectionTop - sectionHeight / 2 &&
          scrollPosition < sectionTop + sectionHeight / 2
        ) {
          setActiveIndex(i);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-black" ref={containerRef}>
      {/* Center Line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20">
        <div className="sticky top-1/2 -translate-y-1/2">
          <div className="w-8 h-8 -ml-4 flex items-center justify-center text-2xl transition-all duration-300 transform">
            {locations[activeIndex].flag}
          </div>
        </div>
      </div>

      {/* Location Panels */}
      <div className="relative max-w-7xl mx-auto">
        {locations.map((location, index) => (
          <div
            key={location.title}
            className={`flex items-center min-h-screen ${
              index % 2 === 0 ? "justify-start" : "justify-end"
            }`}
          >
            <div className="w-full max-w-xl p-8">
              <div 
                className={`group relative rounded-2xl overflow-hidden transition-all duration-500 ${
                  activeIndex === index ? "scale-110" : ""
                }`}
                style={{
                  transformOrigin: index % 2 === 0 ? "left center" : "right center",
                  transform: `${
                    activeIndex === index 
                      ? `scale(1.1) ${index % 2 === 0 ? "rotateY(0deg)" : "rotateY(0deg)"}` 
                      : `scale(1) ${index % 2 === 0 ? "rotateY(0deg)" : "rotateY(0deg)"}` 
                  }`,
                  perspective: "1000px"
                }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300 group-hover:bg-black/40" />
                  <img
                    src={location.image}
                    alt={location.title}
                    className="w-full h-[400px] object-cover"
                  />
                  <div className="absolute inset-0 p-8 flex flex-col justify-end">
                    <h3 className="text-3xl font-bold text-white mb-3">
                      {location.title}
                    </h3>
                    <p className="text-white/90">
                      {location.description}
                    </p>
                  </div>
                </div>

                {/* Expanded Content */}
                {activeIndex === index && (
                  <div 
                    className="absolute inset-0 bg-black/90 backdrop-blur-md p-8 animate-fade-in"
                    style={{
                      transformOrigin: index % 2 === 0 ? "left center" : "right center"
                    }}
                  >
                    <div className="h-full flex flex-col justify-between">
                      <div>
                        <h3 className="text-3xl font-bold text-white mb-4">
                          {location.title} {location.flag}
                        </h3>
                        <p className="text-white/90 mb-6">
                          {location.extendedInfo}
                        </p>
                      </div>
                      <div className="space-y-4">
                        <p className="text-2xl font-bold text-white">
                          {location.price}
                        </p>
                        <Button 
                          className="w-full"
                          size="lg"
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocationScroll;
