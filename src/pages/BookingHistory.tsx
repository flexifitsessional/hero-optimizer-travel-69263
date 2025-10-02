import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Booking {
  id: string;
  booking_date: string;
  payment_status: string;
  status: string;
  gym: {
    name: string;
    location: string;
    price_per_session: number;
  };
}

const BookingHistory = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuthAndFetchBookings();
  }, []);

  const checkAuthAndFetchBookings = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to view booking history",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setUser(session.user);
    fetchBookings(session.user.id);
  };

  const fetchBookings = async (userId: string) => {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id,
        booking_date,
        payment_status,
        status,
        gym:gyms (
          name,
          location,
          price_per_session
        )
      `)
      .eq("user_id", userId)
      .order("booking_date", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load booking history",
        variant: "destructive",
      });
      return;
    }

    const transformedData = data?.map((booking: any) => ({
      ...booking,
      gym: Array.isArray(booking.gym) ? booking.gym[0] : booking.gym
    })) || [];

    setBookings(transformedData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      case "completed":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
          <h1 className="text-3xl font-bold mb-2">Booking History</h1>
          <p className="text-navbar-foreground/80">
            View all your past and current bookings
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No booking history found</p>
              <Button onClick={() => navigate("/search")}>
                Search for Gyms
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{booking.gym.name}</CardTitle>
                      <div className="flex items-center text-muted-foreground mt-2">
                        <MapPin size={14} className="mr-1" />
                        {booking.gym.location}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                      <Badge className={getPaymentStatusColor(booking.payment_status)}>
                        {booking.payment_status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center text-sm mb-2">
                        <Calendar size={14} className="mr-2" />
                        {new Date(booking.booking_date).toLocaleDateString()}
                      </div>
                      <p className="font-bold text-primary">
                        ₹{booking.gym.price_per_session}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;
