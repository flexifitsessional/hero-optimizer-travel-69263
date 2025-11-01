import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Clock, Users } from "lucide-react";

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
}

interface TimeSlotManagerProps {
  gymId: string;
  canEdit?: boolean;
}

export const TimeSlotManager = ({ gymId, canEdit = false }: TimeSlotManagerProps) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [newSlot, setNewSlot] = useState({
    start_time: "",
    end_time: "",
    max_capacity: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTimeSlots();
  }, [gymId]);

  const fetchTimeSlots = async () => {
    const { data, error } = await supabase
      .from("time_slots")
      .select("*")
      .eq("gym_id", gymId)
      .order("start_time", { ascending: true });

    if (!error && data) {
      setTimeSlots(data);
    }
  };

  const handleAddSlot = async () => {
    if (!newSlot.start_time || !newSlot.end_time || !newSlot.max_capacity) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill all fields",
      });
      return;
    }

    const capacity = parseInt(newSlot.max_capacity);
    if (capacity < 1) {
      toast({
        variant: "destructive",
        title: "Invalid Capacity",
        description: "Capacity must be at least 1",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("time_slots").insert({
      gym_id: gymId,
      start_time: newSlot.start_time,
      end_time: newSlot.end_time,
      max_capacity: capacity,
    });

    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add time slot",
      });
      return;
    }

    toast({
      title: "Time Slot Added",
      description: "The time slot has been added successfully",
    });

    setNewSlot({ start_time: "", end_time: "", max_capacity: "" });
    fetchTimeSlots();
  };

  const handleDeleteSlot = async (slotId: string) => {
    const { error } = await supabase.from("time_slots").delete().eq("id", slotId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove time slot",
      });
      return;
    }

    toast({
      title: "Time Slot Removed",
      description: "The time slot has been removed successfully",
    });

    fetchTimeSlots();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Available Time Slots
        </CardTitle>
      </CardHeader>
      <CardContent>
        {timeSlots.length > 0 ? (
          <div className="space-y-3 mb-4">
            {timeSlots.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between p-3 bg-accent/50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">
                      {slot.start_time} - {slot.end_time}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>Max: {slot.max_capacity}</span>
                  </div>
                </div>
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSlot(slot.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm mb-4">
            No time slots configured yet
          </p>
        )}

        {canEdit && (
          <div className="space-y-3 pt-3 border-t">
            <h4 className="font-medium text-sm">Add New Time Slot</h4>
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={newSlot.start_time}
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, start_time: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="end-time">End Time</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={newSlot.end_time}
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, end_time: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="max-capacity">Maximum Capacity</Label>
                <Input
                  id="max-capacity"
                  type="number"
                  min="1"
                  value={newSlot.max_capacity}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, max_capacity: e.target.value })
                  }
                  placeholder="e.g., 20"
                />
              </div>
              <Button onClick={handleAddSlot} disabled={loading} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                {loading ? "Adding..." : "Add Time Slot"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
