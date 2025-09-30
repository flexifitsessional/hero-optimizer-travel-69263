
import { Shield, Clock, Award } from "lucide-react";

const TrustBadges = () => {
  return (
    <div className="flex flex-wrap justify-center gap-8 mt-8 animate-fade-up [animation-delay:600ms]">
      {[
        { icon: Shield, text: "Secure Booking" },
        { icon: Clock, text: "24/7 Support" },
        { icon: Award, text: "Best Price Guarantee" },
      ].map((badge, index) => (
        <div key={index} className="flex items-center text-white/90">
          <badge.icon className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">{badge.text}</span>
        </div>
      ))}
    </div>
  );
};

export default TrustBadges;
