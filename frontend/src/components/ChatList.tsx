import { Button } from "@/components/ui/button";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2 } from "lucide-react";
import { Avatar } from "./ui/avatar";
import { Card } from "./ui/card";

interface ChatUser {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

interface LatestMessage {
  text: string;
  sender: string;
}

interface Chat {
  _id: string;
  users: string[];
  latestMessage?: LatestMessage;
  isGroupChat: boolean;
  groupName?: string;
  groupAdmin?: string;
  members?: string[];
  unseenCount?: number;
  user?: ChatUser;
}

interface ChatListItem {
  chat: Chat;
  user?: ChatUser;
}

interface ChatListProps {
  chats: ChatListItem[];
  onSelectChat: (chat: Chat) => void;
  onDeleteChat: (chatId: string) => void;
  currentUserId: string;
}

const ChatList: React.FC<ChatListProps> = ({
  chats,
  onSelectChat,
  onDeleteChat,
  currentUserId,
}) => {
  const renderLatestMessage = (latestMessage?: LatestMessage) => {
    if (!latestMessage) return null;

    const isImage = latestMessage.text === '📷 Image';
    const isVideo = latestMessage.text === '📹 Video';

    if (isImage) {
      return (
        <span className="flex items-center">
          📷 Image
        </span>
      );
    }

    if (isVideo) {
      return (
        <span className="flex items-center">
          📹 Video
        </span>
      );
    }

    return latestMessage.text;
  };

  return (
    <div className="space-y-2">
      {chats.map((item) => {
        const chat = (item as any).chat || item; 
        const user = (item as any).user || chat.user;

        return (
          <Card
            key={chat._id}
            className="p-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div
              className="flex items-center flex-1"
              onClick={() => onSelectChat(chat)}
            >
              <Avatar className="h-9 w-9">
                {chat.isGroupChat ? (
                  <AvatarFallback>
                    {chat.groupName?.slice(0, 2).toUpperCase() || "GR"}
                  </AvatarFallback>
                ) : (
                  <>
                    <AvatarImage
                      src={user?.profilePicture}
                      alt={user?.name}
                    />
                    <AvatarFallback>
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </>
                )}
              </Avatar>

              <div className="flex-1 ml-3">
                <p className="font-medium">
                  {chat.isGroupChat
                    ? chat.groupName || "Unnamed Group"
                    : user?.name || "Unknown User"}
                </p>
                {chat.latestMessage && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {chat.latestMessage.sender === currentUserId ? "You: " : ""}
                    {renderLatestMessage(chat.latestMessage)}
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
                e.stopPropagation();
                onDeleteChat(chat._id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </Card>
        );
      })}
    </div>
  );
};

export default ChatList;
