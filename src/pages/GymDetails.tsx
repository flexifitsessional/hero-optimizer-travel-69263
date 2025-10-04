import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, MapPin, Star, Calendar, CreditCard, Wallet, MessageSquare, Heart, Hash } from "lucide-react";
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

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviews, setShowReviews] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [paymentCode, setPaymentCode] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    checkAuth();
    if (id) {
      fetchGymDetails();
      fetchReviews();
    }
  }, [id]);

  useEffect(() => {
    if (user && id) {
      checkFavoriteStatus();
    }
  }, [user, id]);

  const checkFavoriteStatus = async () => {
    if (!user || !id) return;
    
    const { data } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("gym_id", id)
      .single();
    
    setIsFavorite(!!data);
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add favorites",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (isFavorite) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("gym_id", id);

      if (!error) {
        setIsFavorite(false);
        toast({ title: "Removed from favorites" });
      }
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert({ user_id: user.id, gym_id: id });

      if (!error) {
        setIsFavorite(true);
        toast({ title: "Added to favorites" });
      }
    }
  };

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

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("gym_id", id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setReviews(data);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to leave a review",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!newReview.comment.trim()) {
      toast({
        title: "Review Required",
        description: "Please write a review before submitting",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("reviews").insert({
      gym_id: id,
      user_id: user.id,
      rating: newReview.rating,
      comment: newReview.comment,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Review Submitted",
      description: "Thank you for your feedback!",
    });

    setNewReview({ rating: 5, comment: "" });
    fetchReviews();
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

    // Verify code payment
    if (paymentMethod === "code") {
      if (paymentCode !== "123456") {
        toast({
          title: "Invalid Code",
          description: "Please enter the correct payment code",
          variant: "destructive",
        });
        return;
      }
    }

    // Create booking
    const { error: bookingError } = await supabase.from("bookings").insert({
      user_id: user.id,
      gym_id: id,
      booking_date: bookingDate,
      status: "confirmed",
    });

    if (bookingError) {
      toast({
        title: "Booking Failed",
        description: bookingError.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Booking Successful!",
      description: paymentMethod === "code" ? "Your session has been booked and paid!" : "Your session has been booked. Payment pending.",
    });

    setShowPayment(false);
    setPaymentCode("");
    setPaymentMethod("");
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
      <div className="bg-navbar text-navbar-foreground p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/search")}
            className="text-navbar-foreground hover:bg-navbar/80"
          >
            <ArrowLeft className="mr-2" size={20} />
            Back to Search
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={toggleFavorite}
              className="bg-navbar-foreground/10 border-navbar-foreground/20 text-navbar-foreground hover:bg-navbar-foreground/20"
            >
              <Heart 
                className={`mr-2 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} 
                size={18} 
              />
              {isFavorite ? "Saved" : "Save"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowReviews(true)}
              className="bg-navbar-foreground/10 border-navbar-foreground/20 text-navbar-foreground hover:bg-navbar-foreground/20"
            >
              <MessageSquare className="mr-2" size={18} />
              Reviews ({reviews.length})
            </Button>
          </div>
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
                      variant={paymentMethod === "code" ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setPaymentMethod("code")}
                    >
                      <Hash className="mr-2" size={20} />
                      Payment Code (Test Mode)
                    </Button>
                    
                    {paymentMethod === "code" && (
                      <div className="space-y-2">
                        <Label htmlFor="payment-code">Enter Payment Code</Label>
                        <Input
                          id="payment-code"
                          type="text"
                          placeholder="Enter code: 123456"
                          value={paymentCode}
                          onChange={(e) => setPaymentCode(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Test code: 123456
                        </p>
                      </div>
                    )}
                    
                    <Button
                      onClick={handlePayment}
                      className="w-full"
                      disabled={!paymentMethod}
                    >
                      {paymentMethod === "code" ? "Verify Code & Book" : "Proceed to Payment"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews Dialog */}
      <Dialog open={showReviews} onOpenChange={setShowReviews}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reviews & Ratings</DialogTitle>
          </DialogHeader>
          
          {/* Submit Review */}
          <Card>
            <CardHeader>
              <CardTitle>Write a Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Rating</Label>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setNewReview({ ...newReview, rating })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          rating <= newReview.rating
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Your Review</Label>
                <Textarea
                  value={newReview.comment}
                  onChange={(e) =>
                    setNewReview({ ...newReview, comment: e.target.value })
                  }
                  placeholder="Share your experience..."
                  rows={4}
                  className="mt-2"
                />
              </div>
              <Button onClick={handleSubmitReview} className="w-full">
                Submit Review
              </Button>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <div className="space-y-4 mt-6">
            <h3 className="font-semibold text-lg">All Reviews</h3>
            {reviews.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No reviews yet. Be the first to review!
              </p>
            ) : (
              reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? "fill-yellow-500 text-yellow-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                    <p>{review.comment}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GymDetails;
