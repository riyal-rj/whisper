import React, { useRef, useState } from 'react';
import { Send, Image, Video, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChat } from '@/contexts/ChatContext';
import { useToast } from '@/hooks/use-toast';

export const MessageInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { sendMessage, sendMedia, activeChat } = useChat();
  const { toast } = useToast();

  const handleSend = async () => {
    if (!message.trim() || !activeChat) return;
    try {
      await sendMessage(message.trim());
      setMessage('');
    } catch (e) {
      toast({ title: 'Failed to send', description: 'Please try again', variant: 'destructive' });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFile = async (file: File, type: 'image' | 'video') => {
    if (!activeChat) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max size is 10MB', variant: 'destructive' });
      return;
    }

    try {
      await sendMedia(file);
      toast({ title: 'Sent', description: `${type} shared successfully` });
    } catch (e) {
      toast({ title: 'Upload failed', description: 'Please try again', variant: 'destructive' });
    }
  };

  const onImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f, 'image');
    e.target.value = '';
  };

  const onVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f, 'video');
    e.target.value = '';
  };

  if (!activeChat) return null;

  return (
    <div className="p-4 bg-surface border-t border-border">
      <div className="flex items-end gap-2">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => imageInputRef.current?.click()}
            className="text-muted-foreground hover:text-primary"
          >
            <Image className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => videoInputRef.current?.click()}
            className="text-muted-foreground hover:text-primary"
          >
            <Video className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 relative">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pr-12 bg-input border-border resize-none"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
            tabIndex={-1}
          >
            <Smile className="w-4 h-4" />
          </Button>
        </div>

        <Button
          variant="message"
          size="message"
          onClick={handleSend}
          disabled={!message.trim()}
          className="shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      <input ref={imageInputRef} type="file" accept="image/*" onChange={onImageSelect} className="hidden" />
      <input ref={videoInputRef} type="file" accept="video/*" onChange={onVideoSelect} className="hidden" />
    </div>
  );
};
