import React, { useState, useEffect } from 'react';
import { Search, UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UserInterface } from '@/types/chat';
import { getAllUsers } from '@/services/userService';

interface CreateChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateChatModal: React.FC<CreateChatModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<UserInterface[]>([]);
  const { createChat, chats } = useChat();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data);
        console.log("Fetched users from CreatechatModal:", data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch users. Please try again later.',
          variant: 'destructive',
        });
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, toast]);

  // Filter users that don't already have chats with current user
   console.log("Chats from CreatechatModal:",chats);
  const existingChatUserIds = new Set(
    chats
      .filter(chat => !chat.isGroupChat)
      .flatMap(chat => (chat.members || []).map((p: any) => p?._id))
      .filter((id: string | undefined) => !!id && id !== currentUser?._id)
  );

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const notCurrentUser = user._id !== currentUser?._id;
    const noExistingChat = !existingChatUserIds.has(user._id);
    
    return matchesSearch && notCurrentUser && noExistingChat;
  });

  const handleCreateChat = async (userId: string) => {
    setIsLoading(true);
    try {
      await createChat(userId);
      toast({
        title: 'Chat created',
        description: 'New chat created successfully',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Failed to create chat',
        description: 'Could not create chat. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Create New Chat
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input border-border"
            />
          </div>

          {/* User list */}
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No users found</p>
                <p className="text-sm">Try a different search term</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-surface transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.profilePicture} alt={user.name} />
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleCreateChat(user._id)}
                    disabled={isLoading}
                  >
                    Chat
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};