import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface CreateChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onChatCreated: (chat: any) => void; // Changed to pass full chat object
}

interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

const CreateChatDialog: React.FC<CreateChatDialogProps> = ({ isOpen, onClose, onChatCreated }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      const fetchUsers = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get('http://localhost:5000/api/v1/', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUsers(response.data.filter((u: User) => u._id !== user._id));
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Failed to fetch users');
        }
      };
      fetchUsers();
    }
  }, [isOpen, user]);

  const handleCreateChat = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user to start a chat.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5002/api/v1/chat/create',
        { otherUserId: selectedUserId },
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
      toast.error(error.response?.data?.message || 'Failed to create chat');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Chat</DialogTitle>
          <DialogDescription>
            Select a user to start a new direct chat.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="user" className="text-right">
              User
            </Label>
            <select
              id="user"
              className="col-span-3 p-2 border rounded-md"
              value={selectedUserId || ''}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="" disabled>Select a user</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreateChat}>Create Chat</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChatDialog;