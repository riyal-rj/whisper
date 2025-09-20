import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler.middleware";
import { redisClient } from "../config/redis.config";
import { publishToQueue } from "../config/rabbitmq.config";
import { User } from "../models/user.models";
import { signJwtToken } from "../utils/jwt";
import { BadRequestException, NotFoundException } from "../utils/appError";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { otpEMailTemplate, verfiedEmailTemplate } from "../templates/html";
import { ENV_VARS } from "../config/env.config";
import { HTTP_STATUS } from "../config/http.config";
import { s3 } from "../config/s3.config";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export const loginUserController = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw new BadRequestException("Email is required");
  }

  const rateLimitKey = `otp:ratelimit:${email}`;
  const rateLimit = await redisClient.get(rateLimitKey);
  if (rateLimit) {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      message: "Too many requests. Please wait before requesting a new OTP.",
    });
    return;
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const otpKey = `otp:${email}`;
  await redisClient.set(otpKey, otp, {
    EX: 300, // 5 minutes
  });

  await redisClient.set(rateLimitKey, "true", {
    EX: 60, // 1 minute
  });

  const message = {
    to: email,
    subject: "Your OTP Code",
    body: otpEMailTemplate,
    templateData: {
      userName: email.split("@")[0],
      otpCode: otp,
    },
  };

  await publishToQueue("send-otp", message);

  res.status(HTTP_STATUS.OK).json({
    message: "OTP sent to your email",
  });
});

export const verifyUserController = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new BadRequestException("Email and OTP are required");
  }

  const otpKey = `otp:${email}`;
  const storedOtp = await redisClient.get(otpKey);

  if (!storedOtp || storedOtp !== otp) {
    throw new BadRequestException("Invalid or expired OTP");
  }

  await redisClient.del(otpKey);

  let user = await User.findOne({ email });

  if (!user) {
    const name = email.split("@")[0];
    user = await User.create({ name, email });
  }

  const verificationMessage = {
    to: email,
    subject: "Welcome! Verification Successful",
    body: verfiedEmailTemplate,
    templateData: {
      userName: user.name,
      loginUrl: `${ENV_VARS.FRONTEND_URL}/login`,
    },
  };
  await publishToQueue("send-verification-success", verificationMessage);

  const { token, expiresAt } = signJwtToken({ userId: user._id.toString() });

  res.status(HTTP_STATUS.OK).json({
    message: "User Verified",
    user,
    token,
    expiresAt,
  });
});

export const myProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    res.json(req.user);
  }
);

export const updateName = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = await User.findById(req.user?._id);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    user.name = req.body.name;
    await user.save();

    const { token, expiresAt } = signJwtToken({ userId: user._id.toString() });

  res.status(HTTP_STATUS.OK).json({
      message: "User Updated",
      user,
      token,
      expiresAt,
    });
  }
);

export const changeProfilePicture = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = await User.findById(req.user?._id);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.profilePicture) {
      const oldKey = user.profilePicture.split(".com/")[1];
      const deleteParams = {
        Bucket: ENV_VARS.AWS_S3_BUCKET_NAME,
        Key: oldKey,
      };
      await s3.send(new DeleteObjectCommand(deleteParams));
    }

    if (!req.file) {
      throw new BadRequestException("Please upload a file");
    }

    user.profilePicture = (req.file as any).location;
    await user.save();

    const { token, expiresAt } = signJwtToken({ userId: user._id.toString() });

    res.status(HTTP_STATUS.OK).json({
      message: "Profile picture updated",
      user,
      token,
      expiresAt,
    });
  }
);

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find();
  res.json(users);
});

export const getAUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new NotFoundException("User not found");
  }
  res.status(HTTP_STATUS.OK).json(user);
});