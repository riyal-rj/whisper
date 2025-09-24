import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { MessageCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your email address.",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid email address.",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await login(email);
      toast({
        title: "OTP Sent",
        description: "OTP sent to your email",
      });
      navigate('/verify-otp', { state: { email } });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send OTP. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-sm w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-foreground rounded-lg mx-auto flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-background" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-medium text-foreground">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Enter your email to continue</p>
          </div>
        </div>

        <div className="clean-card p-6 space-y-4">
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoFocus
                className="border-border"
              />
            </div>

            <Button 
              type="submit" 
              disabled={!email || isLoading}
              className="w-full"
              variant="default"
            >
              {isLoading ? 'Sending...' : 'Send OTP'}
            </Button>
          </form>
        </div>

        <div className="text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;