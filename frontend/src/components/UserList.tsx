import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface User { 
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

interface UserListProps {
  users: User[];
  onSelectUser: (user: User) => void;
}

const UserList: React.FC<UserListProps> = ({ users, onSelectUser }) => {
  return (
    <div className="space-y-2">
      {users.map((user) => (
        <Card
          key={user._id}
          className="p-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => onSelectUser(user)}
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.profilePicture} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default UserList;