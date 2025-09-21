import mongoose, { Document, Schema, Types } from "mongoose";

export interface MessageInterface extends Document {
  chatId: Types.ObjectId;
  sender: string;
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
}

const messageSchema: Schema<MessageInterface> = new Schema(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    sender: {
      type: String,
      required: true,
    },
    text: String,
    image: {
      url: String,
      publicId: String,
    },
    video: {
      url: String,
      publicId: String,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "video"],
      default: "text",
    },
    seen: {
      type: Boolean,
      default: false,
    },
    seenAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const Message = mongoose.model<MessageInterface>("Message", messageSchema);