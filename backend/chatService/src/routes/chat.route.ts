import { Router } from "express";
import { createNewChat, getAllChats, getMessagesByChat, sendMessage, createGroupChat, deleteChat, deleteMessage } from "../controllers/chat.controller";
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
export default chatRouter;