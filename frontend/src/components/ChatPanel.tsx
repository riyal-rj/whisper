import React, { useEffect, useRef, useState } from 'react';
import { Phone, Video, MoreVertical, Users, MessageCircle, Trash2, Info, Crown, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { MessageInput } from '@/components/MessageInput';
import { MessageBubble } from '@/components/MessageBubble';
import { MessageInterface, UserInterface } from '@/types/chat';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { getAllUsers } from '@/services/userService';

export const ChatPanel: React.FC = () => {
  const { activeChat, messages, onlineUsers, deleteChat, addUserToGroup, removeUserFromGroup } = useChat();
  const { user: currentUser } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [openInfo, setOpenInfo] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [adding, setAdding] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [allUsers, setAllUsers] = useState<UserInterface[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChat]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const users = await getAllUsers();
        setAllUsers(users);
      } catch (e) {
        console.error('Failed to load users', e);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    if (openInfo && adding) {
      loadUsers();
    }
  }, [openInfo, adding]);

  if (!activeChat) {
    return (
      <div className="flex-1 bg-background flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <h2 className="text-lg font-medium mb-1">Select a conversation</h2>
          <p className="text-sm">Choose a chat to start messaging</p>
        </div>
      </div>
    );
  }

  const otherParticipant = (activeChat.members || []).find((p: any) => p?._id !== currentUser?._id);
  const chatName = activeChat.isGroupChat ? activeChat.groupName || 'Group Chat' : otherParticipant?.name || 'Unknown';
  const isOnline = activeChat.isGroupChat ? 
    (activeChat.members || []).some((p: any) => p?._id !== currentUser?._id && onlineUsers.has(p._id)) :
    (otherParticipant && onlineUsers.has(otherParticipant._id));

  const chatMessages = messages[activeChat._id] || [];

  const handleDeleteChat = async () => {
    if (!activeChat) return;
    await deleteChat(activeChat._id);
    setOpenDelete(false);
  };

  const getSenderId = (m: MessageInterface): string | undefined => {
    const sender: any = (m as any).sender;
    if (!sender) return undefined;
    return typeof sender === 'string' ? sender : sender._id;
  };

  return (
    <div className="flex-1 bg-background flex flex-col">
      {/* Chat header */}
      <div className="h-14 bg-background border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage 
              src={activeChat.isGroupChat ? undefined : otherParticipant?.profilePicture} 
              alt={chatName} 
            />
            <AvatarFallback className="bg-muted text-foreground text-sm">
              {activeChat.isGroupChat ? <Users className="w-4 h-4" /> : chatName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="cursor-pointer select-none" onClick={() => setOpenInfo(true)}>
            <h2 className="text-sm font-medium text-foreground flex items-center gap-1">
              {chatName}
              {activeChat.isGroupChat && currentUser?._id === (activeChat as any).groupAdmin && (
                <Crown className="w-3 h-3 text-yellow-500" aria-label="Group admin" />
              )}
            </h2>
            <p className="text-xs text-muted-foreground">
              {activeChat.isGroupChat ? 
                `${(activeChat.members || []).length} members` :
                (isOnline ? 'Online' : 'Offline')
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Video className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setOpenDelete(true)} title="Delete chat" className="h-8 w-8">
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Dialog open={openInfo} onOpenChange={setOpenInfo}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{activeChat.isGroupChat ? (activeChat.groupName || 'Group') : (otherParticipant?.name || 'User')}</DialogTitle>
          </DialogHeader>
          {activeChat.isGroupChat ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Members ({(activeChat.members || []).length})</div>
                {currentUser?._id === (activeChat as any).groupAdmin && (
                  <Button variant="ghost" size="sm" onClick={() => setAdding(v => !v)} className="gap-1">
                    <Plus className="w-4 h-4" /> {adding ? 'Close' : 'Add user'}
                  </Button>
                )}
              </div>

              {adding && currentUser?._id === (activeChat as any).groupAdmin && (
                <div className="space-y-2">
                  <Input
                    placeholder="Search user by name/email"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="bg-input border-border"
                  />
                  {isLoadingUsers ? (
                    <div className="text-sm text-muted-foreground">Loading users...</div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {(() => {
                        const memberIds = new Set((activeChat.members || []).map((m: any) => m?._id || m?.id));
                        const filtered = allUsers.filter(u =>
                          u._id !== currentUser?._id &&
                          !memberIds.has(u._id) &&
                          (u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))
                        );
                        if (filtered.length === 0) {
                          return <div className="text-sm text-muted-foreground">No users found</div>;
                        }
                        return filtered.map(u => (
                          <div key={u._id} className="flex items-center justify-between p-2 rounded-md hover:bg-surface">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={u.profilePicture} alt={u.name} />
                                <AvatarFallback className="bg-primary/20 text-primary">{u.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-sm font-medium">{u.name}</div>
                                <div className="text-xs text-muted-foreground">{u.email}</div>
                              </div>
                            </div>
                            <Button size="sm" onClick={async () => { await addUserToGroup(activeChat._id, u._id); }}>
                              Add
                            </Button>
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {(activeChat.members || []).map((m: any) => (
                  <div key={m?._id || m?.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-surface">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={m?.profilePicture} alt={m?.name} />
                      <AvatarFallback className="bg-primary/20 text-primary">{(m?.name || '?').charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex flex-col">
                      <span className="text-sm font-medium flex items-center gap-1">
                        {m?.name || m?._id}
                        {(activeChat as any).groupAdmin === (m?._id || m?.id) && (
                          <Crown className="w-3 h-3 text-yellow-500" aria-label="Admin" />
                        )}
                      </span>
                      {m?.email && <span className="text-xs text-muted-foreground">{m.email}</span>}
                    </div>
                    {currentUser?._id === (activeChat as any).groupAdmin && (m?._id || m?.id) !== (activeChat as any).groupAdmin && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-1"
                        onClick={() => removeUserFromGroup(activeChat._id, m?._id || m?.id)}
                      >
                        <X className="w-4 h-4" /> Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>

                          </div>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={otherParticipant?.profilePicture} alt={otherParticipant?.name} />
                <AvatarFallback className="bg-primary/20 text-primary">{(otherParticipant?.name || '?').charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{otherParticipant?.name || 'Unknown'}</span>
                {otherParticipant?.email && <span className="text-xs text-muted-foreground">{otherParticipant.email}</span>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this chat?</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            Are you sure you want to delete this chat? All messages and media will be permanently deleted.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDelete(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteChat}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {chatMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-2">No messages yet</p>
              <p>Send a message to start the conversation</p>
            </div>
          </div>
        ) : (
          <>
            {chatMessages.map((message, index) => {
              const prevMessage = index > 0 ? chatMessages[index - 1] : null;
              const showSender = activeChat.isGroupChat && 
                getSenderId(message) !== currentUser?._id && 
                (!prevMessage || getSenderId(prevMessage) !== getSenderId(message));

              return (
                <MessageBubble 
                  key={message._id} 
                  message={message} 
                  showSender={showSender}
                  chat={activeChat}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message input */}
      <MessageInput />
    </div>
  );
};
