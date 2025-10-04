import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, TrendingUp, Users, Calendar, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface OwnedGym {
  id: string;
  name: string;
  location: string;
  bookings_count: number;
}

const GymOwner = () => {
  const [ownedGyms, setOwnedGyms] = useState<OwnedGym[]>([]);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuthAndFetchGyms();
  }, []);

  const checkAuthAndFetchGyms = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to manage gyms",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setUser(session.user);
    fetchOwnedGyms(session.user.id);
  };

  const fetchOwnedGyms = async (userId: string) => {
    const { data, error } = await supabase
      .from("gyms")
      .select(`
        id,
        name,
        location,
        bookings:bookings(count)
      `)
      .eq("owner_id", userId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load your gyms",
        variant: "destructive",
      });
      return;
    }

    const gymsWithCount = data?.map((gym: any) => ({
      id: gym.id,
      name: gym.name,
      location: gym.location,
      bookings_count: gym.bookings?.[0]?.count || 0,
    })) || [];

    setOwnedGyms(gymsWithCount);
  };

  const deleteGym = async (gymId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const { error } = await supabase
      .from("gyms")
      .delete()
      .eq("id", gymId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete gym",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Gym deleted successfully",
    });

    if (user) {
      fetchOwnedGyms(user.id);
    }
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Gyms Dashboard</h1>
              <p className="text-navbar-foreground/80">
                Manage your gym listings and view analytics
              </p>
            </div>
            <Button onClick={() => navigate("/add-gym")} className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2" size={20} />
              Add New Gym
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Gyms</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ownedGyms.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {ownedGyms.reduce((acc, gym) => acc + gym.bookings_count, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ownedGyms.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Gyms List */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Gyms</h2>
          {ownedGyms.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <TrendingUp size={48} className="text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No gyms listed yet</p>
                <Button onClick={() => navigate("/add-gym")}>
                  <Plus className="mr-2" size={20} />
                  Add Your First Gym
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {ownedGyms.map((gym) => (
                <Card
                  key={gym.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/gym-stats/${gym.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className="font-bold text-xl mb-1">{gym.name}</h3>
                        <p className="text-muted-foreground">{gym.location}</p>
                      </div>
                      <div className="text-right mr-4">
                        <div className="text-2xl font-bold text-primary">
                          {gym.bookings_count}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Bookings</div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Gym</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{gym.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={(e) => deleteGym(gym.id, e)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GymOwner;
