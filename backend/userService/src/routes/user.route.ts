import { Router } from "express";
import { loginUserController, verifyUserController } from "../controller/user.controller";

const userRouter=Router();
userRouter.post("/login", loginUserController);
userRouter.post("/verify", verifyUserController);
export default userRouter;