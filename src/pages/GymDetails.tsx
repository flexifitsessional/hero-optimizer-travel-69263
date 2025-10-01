import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MapPin, Star, Calendar, CreditCard, Wallet } from "lucide-react";
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
  contact_email: string;
  contact_phone: string;
}

const GymDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [gym, setGym] = useState<Gym | null>(null);
  const [user, setUser] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    checkAuth();
    if (id) {
      fetchGymDetails();
    }
  }, [id]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
  };

  const fetchGymDetails = async () => {
    const { data, error } = await supabase
      .from("gyms")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load gym details",
        variant: "destructive",
      });
      return;
    }

    setGym(data);
  };

  const handleBooking = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book a session",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!bookingDate) {
      toast({
        title: "Date Required",
        description: "Please select a booking date",
        variant: "destructive",
      });
      return;
    }

    setShowPayment(true);
  };

  const handlePayment = async () => {
    if (!paymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method",
        variant: "destructive",
      });
      return;
    }

    // Create booking
    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      gym_id: id,
      booking_date: bookingDate,
      payment_status: "pending",
      status: "confirmed",
    });

    if (error) {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Booking Successful!",
      description: "Your session has been booked. Payment pending.",
    });

    setShowPayment(false);
    navigate("/bookings");
  };

  if (!gym) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/search")}
            className="mb-4 text-primary-foreground hover:bg-primary/80"
          >
            <ArrowLeft className="mr-2" size={20} />
            Back to Search
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <img
            src={gym.image_url || "/placeholder.svg"}
            alt={gym.name}
            className="w-full h-80 object-cover rounded-lg"
          />
          <div>
            <h1 className="text-3xl font-bold mb-2">{gym.name}</h1>
            <div className="flex items-center text-muted-foreground mb-4">
              <MapPin size={18} className="mr-2" />
              {gym.location}
            </div>
            <div className="flex items-center mb-4">
              <Star className="text-yellow-500 mr-2" size={20} />
              <span className="text-xl font-medium">{gym.rating}</span>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-bold text-primary">
                ₹{gym.price_per_session}
              </span>
              <span className="text-muted-foreground"> per session</span>
            </div>
            <p className="text-muted-foreground mb-6">{gym.description}</p>
          </div>
        </div>

        {/* Amenities */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {gym.amenities?.map((amenity, index) => (
                <span
                  key={index}
                  className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Email: {gym.contact_email}</p>
            <p>Phone: {gym.contact_phone}</p>
          </CardContent>
        </Card>

        {/* Booking Section */}
        <Card>
          <CardHeader>
            <CardTitle>Book a Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="date">Select Date</Label>
                <div className="relative mt-2">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="date"
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="pl-10"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <Dialog open={showPayment} onOpenChange={setShowPayment}>
                <DialogTrigger asChild>
                  <Button onClick={handleBooking} className="w-full" size="lg">
                    Book Now - ₹{gym.price_per_session}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Select Payment Method</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Button
                      variant={paymentMethod === "card" ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setPaymentMethod("card")}
                    >
                      <CreditCard className="mr-2" size={20} />
                      Credit/Debit Card
                    </Button>
                    <Button
                      variant={paymentMethod === "upi" ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setPaymentMethod("upi")}
                    >
                      <Wallet className="mr-2" size={20} />
                      UPI
                    </Button>
                    <Button
                      variant={paymentMethod === "netbanking" ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setPaymentMethod("netbanking")}
                    >
                      <CreditCard className="mr-2" size={20} />
                      Net Banking
                    </Button>
                    <Button
                      onClick={handlePayment}
                      className="w-full"
                      disabled={!paymentMethod}
                    >
                      Proceed to Payment
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GymDetails;
