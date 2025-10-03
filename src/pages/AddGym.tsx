import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AddGym = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    price_per_session: "",
    image_url: "",
    contact_email: "",
    contact_phone: "",
    amenities: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add a gym",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setUser(session.user);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    const amenitiesArray = formData.amenities
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a);

    const { error } = await supabase.from("gyms").insert({
      owner_id: user.id,
      name: formData.name,
      city: formData.location.split(",")[0].trim(),
      state: formData.location.split(",")[1]?.trim() || "",
      location: formData.location,
      description: formData.description,
      price_per_session: parseFloat(formData.price_per_session),
      image_url: formData.image_url || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
      contact_email: formData.contact_email,
      contact_phone: formData.contact_phone,
      amenities: amenitiesArray,
      rating: 4.0,
      is_active: true,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add gym. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Your gym has been added successfully!",
    });
    navigate("/gym-owner");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `gym-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("gym_images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("gym_images")
        .getPublicUrl(filePath);

      setFormData({
        ...formData,
        image_url: publicUrl,
      });

      toast({
        title: "Image Uploaded",
        description: "Your gym image has been uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

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
          <h1 className="text-3xl font-bold mb-2">Add New Gym</h1>
          <p className="text-navbar-foreground/80">
            Fill in the details to list your gym on FlexiFit
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Gym Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Gym Name *
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter gym name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Location *
                  </label>
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, State"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description *
                </label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your gym facilities and features"
                  rows={4}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Price per Session (₹) *
                  </label>
                  <Input
                    name="price_per_session"
                    type="number"
                    value={formData.price_per_session}
                    onChange={handleChange}
                    placeholder="200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Gym Image
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center justify-center gap-2 px-4 py-2 border border-input rounded-md hover:bg-accent transition-colors">
                          {uploading ? (
                            <Loader2 className="animate-spin" size={18} />
                          ) : (
                            <Upload size={18} />
                          )}
                          <span className="text-sm">
                            {uploading ? "Uploading..." : "Upload Image"}
                          </span>
                        </div>
                      </label>
                    </div>
                    <Input
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleChange}
                      placeholder="Or paste image URL"
                    />
                    {formData.image_url && (
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-md"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Contact Email *
                  </label>
                  <Input
                    name="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={handleChange}
                    placeholder="contact@gym.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Contact Phone *
                  </label>
                  <Input
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleChange}
                    placeholder="+91-9876543210"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Amenities (comma-separated)
                </label>
                <Input
                  name="amenities"
                  value={formData.amenities}
                  onChange={handleChange}
                  placeholder="Cardio Equipment, Weight Training, Personal Training"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enter amenities separated by commas
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? "Adding Gym..." : "Add Gym"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddGym;
