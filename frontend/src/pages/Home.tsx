import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <MessageCircle className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            Welcome to Whisper
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Connect, chat, and share moments with friends and family in real-time.
          </p>
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