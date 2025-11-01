import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, UserCheck } from "lucide-react";

interface Trainer {
  id: string;
  name: string;
  speciality: string;
}

interface TrainerManagerProps {
  gymId: string;
  canEdit?: boolean;
}

export const TrainerManager = ({ gymId, canEdit = false }: TrainerManagerProps) => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [newTrainer, setNewTrainer] = useState({ name: "", speciality: "" });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTrainers();
  }, [gymId]);

  const fetchTrainers = async () => {
    const { data, error } = await supabase
      .from("trainers")
      .select("*")
      .eq("gym_id", gymId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setTrainers(data);
    }
  };

  const handleAddTrainer = async () => {
    if (!newTrainer.name.trim() || !newTrainer.speciality.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter trainer name and speciality",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("trainers").insert({
      gym_id: gymId,
      name: newTrainer.name.trim(),
      speciality: newTrainer.speciality.trim(),
    });

    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add trainer",
      });
      return;
    }

    toast({
      title: "Trainer Added",
      description: "The trainer has been added successfully",
    });

    setNewTrainer({ name: "", speciality: "" });
    fetchTrainers();
  };

  const handleDeleteTrainer = async (trainerId: string) => {
    const { error } = await supabase
      .from("trainers")
      .delete()
      .eq("id", trainerId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove trainer",
      });
      return;
    }

    toast({
      title: "Trainer Removed",
      description: "The trainer has been removed successfully",
    });

    fetchTrainers();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="w-5 h-5" />
          Trainers
        </CardTitle>
      </CardHeader>
      <CardContent>
        {trainers.length > 0 ? (
          <div className="space-y-3 mb-4">
            {trainers.map((trainer) => (
              <div
                key={trainer.id}
                className="flex items-center justify-between p-3 bg-accent/50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{trainer.name}</p>
                  <p className="text-sm text-muted-foreground">{trainer.speciality}</p>
                </div>
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTrainer(trainer.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm mb-4">No trainers added yet</p>
        )}

        {canEdit && (
          <div className="space-y-3 pt-3 border-t">
            <h4 className="font-medium text-sm">Add New Trainer</h4>
            <div className="grid gap-3">
              <div>
                <Label htmlFor="trainer-name">Trainer Name</Label>
                <Input
                  id="trainer-name"
                  value={newTrainer.name}
                  onChange={(e) =>
                    setNewTrainer({ ...newTrainer, name: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="trainer-speciality">Speciality</Label>
                <Input
                  id="trainer-speciality"
                  value={newTrainer.speciality}
                  onChange={(e) =>
                    setNewTrainer({ ...newTrainer, speciality: e.target.value })
                  }
                  placeholder="Strength Training, Yoga, Cardio"
                />
              </div>
              <Button
                onClick={handleAddTrainer}
                disabled={loading}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                {loading ? "Adding..." : "Add Trainer"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
