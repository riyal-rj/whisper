import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 pt-16">
      <main className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Welcome to Whisper!</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">Connect with your friends and family.</p>
          <Button onClick={handleLoginRedirect} className="px-8 py-4 text-lg">Login to get started</Button>
        </div>
      </main>
    </div>
  );
};

export default HomePage;