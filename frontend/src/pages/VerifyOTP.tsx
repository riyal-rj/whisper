import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { MessageCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP } = useAuth();
  
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter the OTP.",
      });
      return;
    }

    if (otp.length !== 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "OTP must be 6 digits.",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await verifyOTP(email, otp);
      toast({
        title: "Success",
        description: "Login successful!",
      });
      navigate('/chat');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid OTP. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    // You can implement resend OTP functionality here
    toast({
      title: "OTP Resent",
      description: "A new OTP has been sent to your email.",
    });
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-sm w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-foreground rounded-lg mx-auto flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-background" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-medium text-foreground">Enter verification code</h1>
            <p className="text-sm text-muted-foreground">
              We sent a 6-digit code to {email}
            </p>
          </div>
        </div>

        <div className="clean-card p-6 space-y-4">
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-sm font-medium">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={isLoading}
                autoFocus
                maxLength={6}
                className="border-border text-center text-lg tracking-widest"
              />
            </div>

            <Button 
              type="submit" 
              disabled={!otp || isLoading}
              className="w-full"
              variant="default"
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </Button>

            <Button 
              type="button"
              variant="ghost" 
              onClick={handleResendOTP}
              disabled={isLoading}
              className="w-full text-sm"
            >
              Didn't receive the code? Resend
            </Button>
          </form>
        </div>

        <div className="text-center">
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;