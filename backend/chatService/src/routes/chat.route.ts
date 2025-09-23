import { Router } from "express";
import { createNewChat, getAllChats, getMessagesByChat, sendMessage, createGroupChat, deleteChat, deleteMessage, addMemberToGroup, removeMemberFromGroup, updateGroupName } from "../controllers/chat.controller";
import { isAuth } from "../middleware/auth.middleware";
import { upload } from "../config/multer.config";

const chatRouter = Router();

chatRouter.post("/create", isAuth, createNewChat);
chatRouter.post("/group", isAuth, createGroupChat);
chatRouter.get("/all", isAuth, getAllChats);
chatRouter.post("/send", isAuth, upload.single("file"), sendMessage);
chatRouter.get("/:chatId", isAuth, getMessagesByChat);
chatRouter.delete("/:chatId", isAuth, deleteChat);
chatRouter.delete("/msg/:msgId", isAuth, deleteMessage);
chatRouter.post("/:chatId/members", isAuth, addMemberToGroup);
chatRouter.delete("/:chatId/members", isAuth, removeMemberFromGroup);
chatRouter.patch("/:chatId/name", isAuth, updateGroupName);
export default chatRouter;