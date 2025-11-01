import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dumbbell, KeyRound } from "lucide-react";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  
  const [step, setStep] = useState<"otp" | "password">("otp");
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
      });
      return;
    }

    setLoading(true);

    try {
      // Check if OTP is valid and not expired
      const { data, error } = await supabase
        .from("password_reset_otps")
        .select("*")
        .eq("email", email)
        .eq("otp", otp)
        .eq("used", false)
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        toast({
          variant: "destructive",
          title: "Invalid OTP",
          description: "The OTP you entered is invalid or has expired",
        });
        return;
      }

      // Mark OTP as used
      await supabase
        .from("password_reset_otps")
        .update({ used: true })
        .eq("id", data.id);

      toast({
        title: "OTP Verified!",
        description: "Please enter your new password",
      });
      setStep("password");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password must be at least 6 characters long",
      });
      return;
    }

    setLoading(true);

    try {
      // Get user by email
      const { data: users, error: userError } = await supabase.rpc(
        'get_user_by_email',
        { user_email: email }
      );

      if (userError) {
        // If RPC doesn't exist, we need to sign in temporarily to update password
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: newPassword, // This will fail, but we just need the session
        });

        // Use the admin API through edge function instead
        toast({
          variant: "destructive",
          title: "Reset Method Not Available",
          description: "Please contact support to reset your password",
        });
        return;
      }

      // Update password using Supabase auth API
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Unable to update password. Please try requesting a new OTP.",
        });
        return;
      }

      toast({
        title: "Password Updated!",
        description: "Your password has been successfully reset. Please sign in.",
      });
      navigate("/auth");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fitness-dark via-gray-900 to-fitness-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-2xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-primary rounded-full p-3 mb-4">
              <KeyRound className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Reset Password</h1>
            <p className="text-muted-foreground mt-2 text-center">
              {step === "otp" 
                ? "Enter the OTP sent to your email" 
                : "Create your new password"}
            </p>
          </div>

          {step === "otp" ? (
            <form onSubmit={verifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  required
                  className="text-center text-2xl tracking-widest font-bold"
                />
                <p className="text-sm text-muted-foreground text-center">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Updating..." : "Reset Password"}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate("/auth")}
              className="text-primary hover:underline text-sm"
            >
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
