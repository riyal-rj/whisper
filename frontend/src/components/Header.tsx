import React from 'react';
import { MessageCircle, ChevronDown, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileModal } from '@/components/ProfileModal';

export const Header: React.FC = () => {
  const { user: currentUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [showProfileModal, setShowProfileModal] = React.useState(false);

  if (!currentUser) return null;

  return (
    <>
      <header className="h-14 bg-background border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-foreground rounded-md flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-background" />
          </div>
          <h1 className="text-lg font-medium text-foreground">Whispr</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-8 h-8"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 p-1 h-auto">
                <Avatar className="w-7 h-7">
                  <AvatarImage src={currentUser.profilePicture} alt={currentUser.name} />
                  <AvatarFallback className="text-xs">{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 clean-card">
            <div className="p-3 border-b border-border">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={currentUser.profilePicture} alt={currentUser.name} />
                  <AvatarFallback className="text-sm">{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {currentUser.email}
                  </p>
                </div>
              </div>
            </div>
            <DropdownMenuItem onClick={() => setShowProfileModal(true)} className="text-sm">
              Update Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive text-sm">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
    </>
  );
};