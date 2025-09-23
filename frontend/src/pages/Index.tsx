import React from 'react';
import { ChatProvider } from '@/contexts/ChatContext';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { ChatPanel } from '@/components/ChatPanel';

const Index = () => {
  return (
    <ChatProvider>
      <div className="flex flex-col h-screen bg-background">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <ChatPanel />
        </div>
      </div>
    </ChatProvider>
  );
};

export default Index;
