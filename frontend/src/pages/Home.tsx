import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-6">
          <div className="w-12 h-12 bg-foreground rounded-lg mx-auto flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-background" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-medium text-foreground">Whisper</h1>
            <p className="text-muted-foreground">
              Simple, clean messaging
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <Link to="/login">
            <Button size="lg" className="px-12 py-6 text-lg">
              Login
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground">
            New to Whisper? Login with your email to get started.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;