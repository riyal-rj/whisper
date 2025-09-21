import React, { useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is logged in, ensure they are on the /home path
    if (user && window.location.pathname === '/') {
      navigate('/home');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Main Content */}
      <main className="flex-1 p-6 flex items-center justify-center">
        {user ? (
          <Card className="h-full w-full flex items-center justify-center text-gray-600 dark:text-gray-400 text-xl">
            Welcome to Whisper! Start chatting.
          </Card>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Join the conversation!</h2>
            <Button onClick={handleLoginRedirect} className="px-8 py-4 text-lg">Login to get started</Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;