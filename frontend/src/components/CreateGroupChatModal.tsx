import React, { useState, useEffect } from 'react';
import { Search, Users, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UserInterface as User } from '@/types/chat';
import { getAllUsers } from '@/services/userService';

interface CreateGroupChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateGroupChatModal: React.FC<CreateGroupChatModalProps> = ({ isOpen, onClose }) => {
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const { createGroupChat } = useChat();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data);
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const notCurrentUser = user._id !== currentUser?._id;
    
    return matchesSearch && notCurrentUser;
  });

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCheckboxChange = (userId: string, checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedUsers(prev => (prev.includes(userId) ? prev : [...prev, userId]));
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast({
        title: 'Group name required',
        description: 'Please enter a name for your group',
        variant: 'destructive',
      });
      return;
    }

    if (selectedUsers.length < 2) {
      toast({
        title: 'Select users',
        description: 'Please select at least 2 users for the group',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await createGroupChat(selectedUsers, groupName.trim());
      toast({
        title: 'Group created',
        description: 'Group chat created successfully',
      });
      setGroupName('');
      setSelectedUsers([]);
      setSearchQuery('');
      onClose();
    } catch (error) {
      toast({
        title: 'Failed to create group',
        description: 'Could not create group chat. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedUserObjects = users.filter(user => selectedUsers.includes(user._id));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Create Group Chat
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4">
          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="groupName">Group Name *</Label>
            <Input
              id="groupName"
              placeholder="Enter group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="bg-input border-border"
            />
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Users ({selectedUsers.length})</Label>
              <div className="flex flex-wrap gap-2 p-2 bg-surface rounded-lg border border-border max-h-24 overflow-y-auto custom-scrollbar">
                {selectedUserObjects.map((user) => (
                  <Badge
                    key={user._id}
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1"
                  >
                    <Avatar className="w-4 h-4">
                      <AvatarImage src={user.profilePicture} alt={user.name} />
                      <AvatarFallback className="text-xs bg-primary/20 text-primary">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs">{user.name}</span>
                    <button
                      onClick={() => handleUserToggle(user._id)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

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
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No users found</p>
                <p className="text-sm">Try a different search term</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-surface transition-colors cursor-pointer"
                  onClick={() => handleUserToggle(user._id)}
                >
                  <Checkbox
                    checked={selectedUsers.includes(user._id)}
                    onCheckedChange={(checked) => handleCheckboxChange(user._id, checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.profilePicture} alt={user.name} />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateGroup} 
            disabled={isLoading || !groupName.trim() || selectedUsers.length < 2}
          >
            Create Group ({selectedUsers.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};