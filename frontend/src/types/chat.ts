export interface UserInterface {
  _id: string;
  name: string;
  email: string;
  profilePicture: string;
}

export interface MessageInterface {
  _id: string;
  chatId: string;
  sender: UserInterface;
  text?: string;
  image?: {
    url: string;
    publicId: string;
  };
  video?: {
    url: string;
    publicId: string;
  };
  messageType: "text" | "image" | "video";
  seen: boolean;
  seenAt?: Date;
  createdAt: Date;
}

export interface ChatUser {
  _id: string;
  name: string;
  email?: string;
  profilePicture?: string;
}

export interface Chat {
  _id: string;
  users: string[];
  isGroupChat: boolean;
  groupName?: string;
  groupAdmin?: string;
  members?: any[];
  latestMessage?: MessageInterface; // Changed this line
  unreadCount?: number;
}

export interface ChatResponse {
  user: ChatUser;
  chat: Chat;
}