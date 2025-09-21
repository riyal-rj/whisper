import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface CreateGroupChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onChatCreated: (chat: any) => void; // Changed to pass full chat object
}

interface User {
  _id: string;
  name: string;
  email: string;
}

const CreateGroupChatDialog: React.FC<CreateGroupChatDialogProps> = ({ isOpen, onClose, onChatCreated }) => {
  const { user } = useAuth();
  const [groupName, setGroupName] = useState<string>('');
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && user) {
      const fetchUsers = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get('http://localhost:5000/api/v1/users', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setAvailableUsers(response.data.filter((u: User) => u._id !== user._id));
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Failed to fetch users');
        }
      };
      fetchUsers();
    }
  }, [isOpen, user]);

  const handleMemberToggle = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreateGroupChat = async () => {
    if (!groupName.trim()) {
      toast.error("Group name is required.");
      return;
    }
    if (selectedMembers.length < 2) {
      toast.error("Please select at least 2 members for the group.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5002/api/v1/chat/group',
        { name: groupName, members: selectedMembers },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(response.data.message);
      onChatCreated(response.data.chat); // Pass the full chat object
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create group chat');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Group Chat</DialogTitle>
          <DialogDescription>
            Enter group name and select members.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Select Members</Label>
            <div className="border rounded-md p-2 h-32 overflow-y-auto">
              {availableUsers.map((u) => (
                <div key={u._id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={u._id}
                    checked={selectedMembers.includes(u._id)}
                    onChange={() => handleMemberToggle(u._id)}
                  />
                  <Label htmlFor={u._id}>{u.name} ({u.email})</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreateGroupChat}>Create Group Chat</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupChatDialog;