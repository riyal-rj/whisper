import { Router } from "express";
import {
  changeProfilePictureController,
  getAUserController,
  getAllUsersController,
  loginUserController,
  myProfileController,
  updateNameController,
  verifyUserController,
} from "../controller/user.controller";
import { isAuth } from "../middleware/auth.middleware";

import { upload } from "../config/multer.config";

const userRouter = Router();
userRouter.post("/login", loginUserController);
userRouter.post("/verify", verifyUserController);

userRouter.get("/me", isAuth, myProfileController);
userRouter.put("/update-name", isAuth, updateNameController);
userRouter.put(
  "/update-profile-picture",
  isAuth,
  upload.single("profilePicture"),
  changeProfilePictureController
);

userRouter.get("/", getAllUsersController);
userRouter.get("/:id", getAUserController);

export default userRouter;