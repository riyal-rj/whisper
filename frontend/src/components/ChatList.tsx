import { Button } from '@/components/ui/button';
import { AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash2 } from 'lucide-react';
import { Avatar } from './ui/avatar';
import { Card } from './ui/card';

interface Chat {
  _id: string;
  users: string[];
  latestMessage?: {
    text: string;
    sender: string;
  };
  isGroupChat: boolean;
  groupName?: string;
  groupAdmin?: string;
  members?: string[];
  unseenCount?: number;
  user?: { // This will be the other user's data for direct chats
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
}

interface ChatListProps {
  chats: Chat[];
  onSelectChat: (chat: Chat) => void;
  onDeleteChat: (chatId: string) => void; // New prop for delete functionality
  currentUserId: string;
}

const ChatList: React.FC<ChatListProps> = ({ chats, onSelectChat, onDeleteChat, currentUserId }) => {
  return (
    <div className="space-y-2">
      {chats.map((chat) => (
        <Card
          key={chat._id}
          className="p-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <div className="flex items-center flex-1" onClick={() => onSelectChat(chat)}>
            <Avatar className="h-9 w-9">
              {chat.isGroupChat ? (
                <AvatarFallback>GR</AvatarFallback>
              ) : (
                <>
                  <AvatarImage src={chat.user?.profilePicture} alt={chat.user?.name} />
                  <AvatarFallback>{chat.user?.name?.charAt(0)}</AvatarFallback>
                </>
              )}
            </Avatar>
            <div className="flex-1 ml-3">
              <p className="font-medium">{chat.isGroupChat ? chat.groupName : chat.user?.name}</p>
              {chat.latestMessage && (
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {chat.latestMessage.sender === currentUserId ? "You: " : ""}
                  {chat.latestMessage.text}
                </p>
              )}
            </div>
          </div>
          {chat.unseenCount && chat.unseenCount > 0 && (
            <span className="ml-auto px-2 py-1 bg-blue-500 text-white rounded-full text-xs">
              {chat.unseenCount}
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-700 ml-2"
            onClick={(e) => {
              e.stopPropagation(); // Prevent onSelectChat from firin
              console.log("Deleting chat with ID:", chat._id);
              onDeleteChat(chat._id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </Card>
      ))}
    </div>
  );
};

export default ChatList;