import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, TrendingUp, DollarSign, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface GymDetails {
  name: string;
  location: string;
  price_per_session: number;
}

interface BookingStats {
  total_bookings: number;
  today_bookings: number;
  week_bookings: number;
  total_revenue: number;
  status_breakdown: { status: string; count: number }[];
}

const GymStats = () => {
  const { id } = useParams();
  const [gym, setGym] = useState<GymDetails | null>(null);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchGymAndStats(id);
    }
  }, [id]);

  const fetchGymAndStats = async (gymId: string) => {
    // Fetch gym details
    const { data: gymData, error: gymError } = await supabase
      .from("gyms")
      .select("name, location, price_per_session")
      .eq("id", gymId)
      .single();

    if (gymError) {
      toast({
        title: "Error",
        description: "Failed to load gym details",
        variant: "destructive",
      });
      return;
    }

    setGym(gymData);

    // Fetch booking stats
    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const { data: bookingsData, error: bookingsError } = await supabase
      .from("bookings")
      .select("status, booking_date")
      .eq("gym_id", gymId);

    if (bookingsError) {
      toast({
        title: "Error",
        description: "Failed to load booking stats",
        variant: "destructive",
      });
      return;
    }

    const todayBookings = bookingsData.filter(
      (b: any) => b.booking_date?.split("T")[0] === today
    ).length;

    const weekBookings = bookingsData.filter(
      (b: any) => b.booking_date && b.booking_date.split("T")[0] >= weekAgo
    ).length;

    const statusCounts = bookingsData.reduce((acc: any, booking) => {
      const status = booking.status || "pending";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const statusBreakdown = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count: count as number,
    }));

    setStats({
      total_bookings: bookingsData.length,
      today_bookings: todayBookings,
      week_bookings: weekBookings,
      total_revenue: bookingsData.length * (gymData.price_per_session || 0),
      status_breakdown: statusBreakdown,
    });
  };

  const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6366f1"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-navbar text-navbar-foreground p-6">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/gym-owner")}
            className="mb-4 text-navbar-foreground hover:bg-navbar/80"
          >
            <ArrowLeft className="mr-2" size={20} />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold mb-2">{gym?.name}</h1>
          <p className="text-navbar-foreground/80">{gym?.location}</p>
        </div>
      </div>

      {/* Stats Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.today_bookings || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.week_bookings || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_bookings || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats?.total_revenue || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {stats && stats.status_breakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.status_breakdown}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.status}: ${entry.count}`}
                  >
                    {stats.status_breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No booking data available yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GymStats;
