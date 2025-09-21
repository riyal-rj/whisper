import mongoose, { Document, Schema } from "mongoose";

export interface ChatInterface extends Document {
  users: string[];
  latestMessage: {
    text: string;
    sender: string;
  };
  isGroupChat: boolean;
  groupName?: string;
  groupAdmin?: string;
  members?: string[];
}

const chatSchema: Schema<ChatInterface> = new Schema(
  {
    users: [{ type: String, required: true }],
    latestMessage: {
      text: String,
      sender: String,
    },
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    groupName: {
      type: String,
    },
    groupAdmin: {
      type: String,
    },
    members: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Chat = mongoose.model<ChatInterface>("Chat", chatSchema);