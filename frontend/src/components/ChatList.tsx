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
  user?: ChatUser; // other user for direct chats
}

interface ChatListProps {
  chats: Chat[]; // Array of chats or { chat, user } objects
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
  return (
    <div className="space-y-2">
      {chats.map((item) => {
        // ✅ Support both shapes: either Chat or {chat, user}
        const chat = (item as any).chat || item; // If wrapped as {chat, user}, extract chat
        const user = (item as any).user || chat.user; // If wrapped as {chat, user}, extract user

        // ✅ Log each chat object
        console.log("Chat object:", chat);

        return (
          <Card
            key={chat._id}
            className="p-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {/* When the chat item is clicked */}
            <div
              className="flex items-center flex-1"
              onClick={() => onSelectChat(chat)}
            >
              {/* Avatar */}
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

              {/* Chat Info */}
              <div className="flex-1 ml-3">
                <p className="font-medium">
                  {chat.isGroupChat
                    ? chat.groupName || "Unnamed Group"
                    : user?.name || "Unknown User"}
                </p>
                {chat.latestMessage && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {chat.latestMessage.sender === currentUserId ? "You: " : ""}
                    {chat.latestMessage.text}
                  </p>
                )}
              </div>
            </div>

            {/* Unseen count */}
            {chat.unseenCount && chat.unseenCount > 0 && (
              <span className="ml-auto px-2 py-1 bg-blue-500 text-white rounded-full text-xs">
                {chat.unseenCount}
              </span>
            )}

            {/* Delete button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-700 ml-2"
              onClick={(e) => {
                e.stopPropagation();
                console.log("Deleting chat with ID:", chat._id);
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
