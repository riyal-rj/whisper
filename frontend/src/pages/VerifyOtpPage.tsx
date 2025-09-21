import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const VerifyOtpPage: React.FC = () => {
  const [otp, setOtp] = useState<string>('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = localStorage.getItem('userEmail'); // Retrieve email from local storage

    if (!email) {
      toast.error('Email not found. Please go back to the login page.');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/v1/verify', { email, otp });
      toast.success(response.data.message);
      
      const { user, token, expiresAt } = response.data;
      login(user); // Store user data in AuthContext
      localStorage.setItem('token', token); // Store token
      localStorage.setItem('expiresAt', expiresAt); // Store token expiration

      localStorage.removeItem('userEmail'); // Clear email from local storage
      navigate('/dashboard'); // Redirect to dashboard page
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 pt-16">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Verify OTP for Whisper</CardTitle>
          <CardDescription>Enter the 6-digit OTP sent to your email.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="otp">OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full mt-4">Verify OTP</Button>
          </form>
        </CardContent>
        <CardFooter>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyOtpPage;