import { Router } from "express";
import {
  changeProfilePicture,
  getAUser,
  getAllUsers,
  loginUserController,
  myProfile,
  updateName,
  verifyUserController,
} from "../controller/user.controller";
import { isAuth } from "../middleware/auth.middleware";

import { upload } from "../config/multer.config";

const userRouter = Router();
userRouter.post("/login", loginUserController);
userRouter.post("/verify", verifyUserController);

userRouter.get("/me", isAuth, myProfile);
userRouter.put("/update-name", isAuth, updateName);
userRouter.put(
  "/update-profile-picture",
  isAuth,
  upload.single("profilePicture"),
  changeProfilePicture
);

userRouter.get("/", getAllUsers);
userRouter.get("/:id", getAUser);

export default userRouter;