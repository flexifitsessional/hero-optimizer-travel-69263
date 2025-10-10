import { useState, useEffect } from "react";
import { Menu, X, Heart, Calendar, Dumbbell, Info, History, User } from "lucide-react";
import { Button } from "./button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface HamburgerMenuProps {
  user: any;
}

export function HamburgerMenu({ user }: HamburgerMenuProps) {
  const [open, setOpen] = useState(false);
  const [isGymOwner, setIsGymOwner] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkIfGymOwner();
  }, [user]);

  const checkIfGymOwner = async () => {
    if (!user) {
      console.log("No user found in checkIfGymOwner");
      return;
    }
    
    console.log("Checking if user is gym owner:", user.id);
    
    const { data, error } = await supabase
      .from("gyms")
      .select("id")
      .eq("owner_id", user.id)
      .limit(1);

    console.log("Gym owner check result:", { data, error, isOwner: data && data.length > 0 });

    if (!error && data && data.length > 0) {
      setIsGymOwner(true);
    } else {
      setIsGymOwner(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    navigate("/auth");
  };

  const handleProfileClick = async () => {
    setOpen(false);
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      
      setProfileData({
        email: user.email,
        name: profile?.first_name && profile?.last_name 
          ? `${profile.first_name} ${profile.last_name}` 
          : user.user_metadata?.full_name || "N/A",
        phone: user.phone || "N/A",
        createdAt: new Date(user.created_at).toLocaleDateString(),
        lastSignIn: user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : "N/A"
      });
      setProfileOpen(true);
    }
  };

  const menuItems = [
    { icon: User, label: "My Profile", action: handleProfileClick },
    { icon: Calendar, label: "My Bookings", path: "/bookings" },
    { icon: Heart, label: "Favorites", path: "/favorites" },
    ...(user ? [{ icon: Dumbbell, label: "My Gyms", path: "/gym-owner" }] : []),
    { icon: History, label: "Booking History", path: "/booking-history" },
    { icon: Info, label: "About Us", action: () => {
      setOpen(false);
      const element = document.getElementById("about-section");
      element?.scrollIntoView({ behavior: "smooth" });
    }},
  ];

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5" />
              FlexiFit Menu
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-2 mt-6">
            {menuItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className="justify-start"
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    navigate(item.path!);
                    setOpen(false);
                  }
                }}
              >
                <item.icon className="mr-2 h-5 w-5" />
                {item.label}
              </Button>
            ))}
            <div className="border-t my-2" />
            <Button
              variant="ghost"
              className="justify-start text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <X className="mr-2 h-5 w-5" />
              Logout
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>My Profile</DialogTitle>
          </DialogHeader>
          {profileData && (
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{profileData.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{profileData.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{profileData.phone}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Account Created</p>
                <p className="font-medium">{profileData.createdAt}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Last Sign In</p>
                <p className="font-medium">{profileData.lastSignIn}</p>
              </div>
              <div className="pt-4">
                <Button 
                  className="w-full" 
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/profile");
                  }}
                >
                  Edit Profile
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
