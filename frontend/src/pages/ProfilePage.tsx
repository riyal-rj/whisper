import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';

const ProfilePage: React.FC = () => {
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  const handleNameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:5000/api/v1/update-name',
        { name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(response.data.message);
      login(response.data.user); // Update user in context
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update name');
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };

  const handleProfilePictureUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profilePicture) {
      toast.error("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("profilePicture", profilePicture);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:5000/api/v1/update-profile-picture',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      toast.success(response.data.message);
      login(response.data.user); // Update user in context
      setProfilePicture(null); // Clear selected file
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload profile picture');
    }
  };

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading user data...</div>; // Or redirect to login
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 pt-16">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Profile Management</CardTitle>
          <CardDescription>Manage your profile details and picture.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Details */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.profilePicture} alt={user.name} />
              <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{user.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
          </div>

          {/* Update Name */}
          <form onSubmit={handleNameChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <Button type="submit">Update Name</Button>
          </form>

          {/* Update Profile Picture */}
          <form onSubmit={handleProfilePictureUpload} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profilePicture">Profile Picture</Label>
              <Input
                id="profilePicture"
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
              />
            </div>
            <Button type="submit" disabled={!profilePicture}>Upload Picture</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;