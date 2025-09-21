import { Response } from "express";
import axios from "axios";
import { asyncHandler } from "../middleware/asyncHandler.middleware";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { Chat } from "../models/chat.model";
import { Message } from "../models/message.model";
import { BadRequestException, NotFoundException } from "../utils/appError";
import { HTTP_STATUS } from "../config/http.config";
import { ENV_VARS } from "../config/env.config";
import { getReceiverSocketId, io } from "../config/socket.config";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/s3.config";

export const deleteChat = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { chatId } = req.params;
    const userId = req.user?._id;

    if (!chatId) {
      throw new BadRequestException("Chat ID is required");
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      throw new NotFoundException("Chat not found");
    }

    // Check if the user is a participant of the chat or the group admin
    const isUserParticipant = chat.users.some(
      (id) => id.toString() === userId.toString()
    );

    const isGroupAdmin = chat.isGroupChat && chat.groupAdmin?.toString() === userId.toString();

    if (!isUserParticipant && !isGroupAdmin) {
      throw new BadRequestException("You are not authorized to delete this chat");
    }

    // Delete associated media from S3
    const messages = await Message.find({ chatId });
    for (const message of messages) {
      if (message.image && message.image.publicId) {
        const deleteParams = {
          Bucket: ENV_VARS.AWS_S3_BUCKET_NAME,
          Key: message.image.publicId,
        };
        await s3.send(new DeleteObjectCommand(deleteParams));
      }
      if (message.video && message.video.publicId) {
        const deleteParams = {
          Bucket: ENV_VARS.AWS_S3_BUCKET_NAME,
          Key: message.video.publicId,
        };
        await s3.send(new DeleteObjectCommand(deleteParams));
      }
    }

    // Delete all messages in the chat
    await Message.deleteMany({ chatId });

    // Delete the chat itself
    await Chat.deleteOne({ _id: chatId });

    res.status(HTTP_STATUS.OK).json({
      message: "Chat and associated media/messages deleted successfully",
    });
  }
);
export const createGroupChat = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    const { name, members } = req.body;

    if (!name || !members || members.length < 2) {
      throw new BadRequestException("Group name and at least 2 members are required");
    }

    const newChat = await Chat.create({
      users: [userId, ...members],
      isGroupChat: true,
      groupName: name,
      groupAdmin: userId,
      members: [userId, ...members],
    });

    res.status(HTTP_STATUS.CREATED).json({
      message: "Group chat created",
      chatId: newChat._id,
    });
  }
);

export const sendMessage = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const senderId = req.user?._id;
    const { chatId, text } = req.body;
    const file = req.file;

    if (!chatId) {
      throw new BadRequestException("Chat id is required");
    }

    if (!text && !file) {
      throw new BadRequestException("Either text or file is required");
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      throw new NotFoundException("Chat not found");
    }

    const isUserInChat = chat.users.some(
      (userId) => userId.toString() === senderId.toString()
    );

    if (!isUserInChat) {
      throw new BadRequestException("You are not a participant of this chat");
    }

    let messageData: any = {
      chatId: chatId,
      sender: senderId,
      seen: false,
      seenAt: undefined,
    };

    if (file) {
      if (file.mimetype.startsWith("image")) {
        messageData.image = {
          url: (file as any).location,
          publicId: (file as any).key,
        };
        messageData.messageType = "image";
      } else if (file.mimetype.startsWith("video")) {
        messageData.video = {
          url: (file as any).location,
          publicId: (file as any).key,
        };
        messageData.messageType = "video";
      }
      messageData.text = text || "";
    } else {
      messageData.text = text;
      messageData.messageType = "text";
    }

    const message = new Message(messageData);

    const savedMessage = await message.save();

    const latestMessageText = file
      ? file.mimetype.startsWith("image")
        ? "📷 Image"
        : "📹 Video"
      : text;

    await Chat.findByIdAndUpdate(
      chatId,
      {
        latestMessage: {
          text: latestMessageText,
          sender: senderId,
        },
      },
      { new: true }
    );

    io.to(chatId).emit("newMessage", savedMessage);

    if (chat.isGroupChat) {
      // For group chats, all members except the sender should receive the message
      chat.members?.forEach((memberId) => {
        if (memberId.toString() !== senderId.toString()) {
          const receiverSocketId = getReceiverSocketId(memberId.toString());
          if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", savedMessage);
          }
        }
      });
    } else {
      // For direct chats, only the other user should receive the message
      const otherUserId = chat.users.find(
        (userId) => userId.toString() !== senderId.toString()
      );
      if (otherUserId) {
        const receiverSocketId = getReceiverSocketId(otherUserId.toString());
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newMessage", savedMessage);
        }
      }
    }

    res.status(HTTP_STATUS.CREATED).json({
      message: savedMessage,
      sender: senderId,
    });
  }
);

export const getMessagesByChat = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    const { chatId } = req.params;

    if (!chatId) {
      throw new BadRequestException("Chat id is required");
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      throw new NotFoundException("Chat not found");
    }

    const isUserInChat = chat.users.some(
      (id) => id.toString() === userId.toString()
    );

    if (!isUserInChat) {
      throw new BadRequestException("You are not a participant of this chat");
    }

    const messagesToMarkSeen = await Message.find({
      chatId: chatId,
      sender: { $ne: userId },
      seen: false,
    });

    await Message.updateMany(
      {
        chatId: chatId,
        sender: { $ne: userId },
        seen: false,
      },
      {
        seen: true,
        seenAt: new Date(),
      }
    );

    const messages = await Message.find({ chatId }).sort({ createdAt: 1 });

    const otherUserId = chat.users.find((id) => id.toString() !== userId.toString());

    try {
      const { data } = await axios.get(
        `${ENV_VARS.USER_SERVICE_URL}/api/v1/${otherUserId}`
      );

      if (!otherUserId) {
        throw new BadRequestException("No other user in this chat");
      }

      if (messagesToMarkSeen.length > 0) {
        const otherUserSocketId = getReceiverSocketId(otherUserId.toString());
        if (otherUserSocketId) {
          io.to(otherUserSocketId).emit("messagesSeen", {
            chatId: chatId,
            seenBy: userId,
            messageIds: messagesToMarkSeen.map((msg) => msg._id),
          });
        }
      }

      res.status(HTTP_STATUS.OK).json({
        messages,
        user: data,
      });
    } catch (error) {
      console.log(error);
      res.status(HTTP_STATUS.OK).json({
        messages,
        user: { _id: otherUserId, name: "Unknown User" },
      });
    }
  }
);

export const createNewChat = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    const { otherUserId } = req.body;
    
    if (!otherUserId) {
      throw new BadRequestException("Other user id is required");
    }

    const existingChat = await Chat.findOne({
      users: { $all: [userId, otherUserId], $size: 2 },
    });

    if (existingChat) {
      return res.status(HTTP_STATUS.OK).json({
        message: "Chat already exists",
        chatId: existingChat._id,
      });
    }

    const newChat = await Chat.create({
      users: [userId, otherUserId],
    });

    res.status(HTTP_STATUS.CREATED).json({
      message: "New chat created",
      chatId: newChat._id,
    });
  }
);

export const getAllChats = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;

    const chats = await Chat.find({ users: userId }).sort({ updatedAt: -1 });

    const chatWithUserData = await Promise.all(
      chats.map(async (chat) => {
        const otherUserId = chat.users.find((id) => id !== userId);

        const unseenCount = await Message.countDocuments({
          chatId: chat._id,
          sender: { $ne: userId },
          seen: false,
        });

        try {
          const { data } = await axios.get(
            `${ENV_VARS.USER_SERVICE_URL}/api/v1/${otherUserId}`
          );

          return {
            user: data,
            chat: {
              ...chat.toObject(),
              latestMessage: chat.latestMessage || null,
              unseenCount,
            },
          };
        } catch (error) {
          console.log(error);
          return {
            user: { _id: otherUserId, name: "Unknown User" },
            chat: {
              ...chat.toObject(),
              latestMessage: chat.latestMessage || null,
              unseenCount,
            },
          };
        }
      })
    );

    res.status(HTTP_STATUS.OK).json({ chats: chatWithUserData });
  }
);