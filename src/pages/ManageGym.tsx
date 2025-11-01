import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TrainerManager } from "@/components/gym/TrainerManager";
import { TimeSlotManager } from "@/components/gym/TimeSlotManager";

interface Gym {
  id: string;
  name: string;
  location: string;
}

const ManageGym = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [gym, setGym] = useState<Gym | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndFetchGym();
  }, [id]);

  const checkAuthAndFetchGym = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to manage your gym",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setUser(session.user);

    // Fetch gym details
    const { data, error } = await supabase
      .from("gyms")
      .select("id, name, location")
      .eq("id", id)
      .eq("owner_id", session.user.id)
      .single();

    if (error || !data) {
      toast({
        title: "Error",
        description: "Gym not found or you don't have permission to manage it",
        variant: "destructive",
      });
      navigate("/gym-owner");
      return;
    }

    setGym(data);
    setLoading(false);
  };

  if (loading) {
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
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/gym-owner")}
            className="mb-4 text-navbar-foreground hover:bg-navbar/80"
          >
            <ArrowLeft className="mr-2" size={20} />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold mb-2">Manage {gym?.name}</h1>
          <p className="text-navbar-foreground/80">{gym?.location}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-6">
          <TrainerManager gymId={id!} canEdit={true} />
          <TimeSlotManager gymId={id!} canEdit={true} />
        </div>
      </div>
    </div>
  );
};

export default ManageGym;
