import React from 'react';
import { Check, CheckCheck, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Chat, MessageInterface } from '@/types/chat';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';

interface MessageBubbleProps {
  message: MessageInterface;
  showSender?: boolean;
  chat: Chat;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, showSender, chat }) => {
  const { user: currentUser } = useAuth();
  const { deleteMessage, activeChat } = useChat();

  const senderAny: any = (message as any).sender;
  const senderId: string | undefined = typeof senderAny === 'string' ? senderAny : senderAny?._id;
  const isOwn = senderId === currentUser?._id;

  const sender = !isOwn && Array.isArray(chat.members)
    ? (chat.members as any[]).find((p: any) => (p?._id || p?.id) === senderId)
    : undefined;

  const formatTime = (dateLike: Date | string) => {
    const d = new Date(dateLike);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const StatusIcon = () => {
    if (!isOwn) return null;
    // We only know read state from backend via message.seen
    return message.seen ? (
      <CheckCheck className="w-3 h-3 text-read" />
    ) : (
      <Check className="w-3 h-3" />
    );
  };

  return (
    <div className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {!isOwn && chat.isGroupChat && (
        <Avatar className="w-8 h-8 mt-1">
          <AvatarImage src={sender?.profilePicture} alt={sender?.name} />
          <AvatarFallback className="text-xs bg-primary/20 text-primary">
            {sender?.name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-xs`}>
        {showSender && (
          <span className="text-xs text-primary font-medium mb-1 px-1">
            {sender?.name || 'Unknown'}
          </span>
        )}
        
        <div className={`message-bubble ${isOwn ? 'message-sent' : 'message-received'}`}>
          {message.messageType === 'text' ? (
            <p className="whitespace-pre-wrap break-words">{message.text}</p>
          ) : message.messageType === 'image' ? (
            <div className="space-y-2">
              {message.image?.url && (
                <img 
                  src={message.image.url} 
                  alt="Shared image" 
                  className="max-w-full rounded-lg"
                />
              )}
              {message.text && (
                <p className="whitespace-pre-wrap break-words">{message.text}</p>
              )}
            </div>
          ) : message.messageType === 'video' ? (
            <div className="space-y-2">
              {message.video?.url && (
                <video 
                  src={message.video.url} 
                  controls 
                  className="max-w-full rounded-lg"
                />
              )}
              {message.text && (
                <p className="whitespace-pre-wrap break-words">{message.text}</p>
              )}
            </div>
          ) : null}
        </div>
        
        <div className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          <span>{formatTime(message.createdAt)}</span>
          <StatusIcon />
          {(isOwn || chat.isGroupChat) && (
            <button
              className="p-1 hover:text-destructive"
              onClick={() => activeChat && deleteMessage(activeChat._id, message._id)}
              title="Delete message"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
