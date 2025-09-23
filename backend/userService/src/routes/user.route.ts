import { Router } from "express";
import {
  getAUserController,
  getAllUsersController,
  loginUserController,
  myProfileController,
  updateProfileController,
  verifyUserController,
} from "../controller/user.controller";
import { isAuth } from "../middleware/auth.middleware";

import { upload } from "../config/multer.config";

const userRouter = Router();
userRouter.post("/login", loginUserController);
userRouter.post("/verify", verifyUserController);

userRouter.get("/me", isAuth, myProfileController);
userRouter.put(
  "/update-profile",
  isAuth,
  upload.single("profilePicture"),
  updateProfileController
);

userRouter.get("/", getAllUsersController);
userRouter.get("/:id", getAUserController);

export default userRouter;