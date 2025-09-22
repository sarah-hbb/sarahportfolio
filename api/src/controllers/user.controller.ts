import { Response, NextFunction } from "express";
import errorHandler from "../utils/error";
import bcryptjs from "bcryptjs";
import User, { IUser } from "../models/user.model";
import { AuthenticatedRequest } from "../utils/AuthenticatedRequest.types";
import {
  mapAllUsersToResponse,
  mapUserToResponse,
} from "../mappers/user.mapper";

interface UserParams {
  userId?: string;
}

interface UserUpdateReqBody {
  username: string;
  password: string;
  email: string;
  profilePicture: string;
}
// Update user
const updateUser = async (
  req: AuthenticatedRequest<UserParams, {}, UserUpdateReqBody, {}>,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.id !== req.params.userId) {
    return next(errorHandler(403, "You are not allowed to update this user"));
  }
  if (req.body.password) {
    if (req.body.password.length < 6) {
      return next(errorHandler(400, "Password must be at least 6 characters"));
    }
    req.body.password = bcryptjs.hashSync(req.body.password, 10);
  }
  if (req.body.username) {
    if (req.body.username.length < 7 || req.body.username.length > 20) {
      return next(
        errorHandler(400, "Username must be between 7 and 20 characters")
      );
    }
    if (req.body.username.includes(" ")) {
      return next(errorHandler(400, "User can not contain spaces"));
    }
    if (req.body.username !== req.body.username.toLowerCase()) {
      return next(errorHandler(400, "Username must be lowercase"));
    }
    if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
      return next(
        errorHandler(400, "User can only contain letters and numbers")
      );
    }
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          profilePicture: req.body.profilePicture,
          password: req.body.password,
        },
      },
      { new: true }
    );
    if (!updatedUser) {
      return next(errorHandler(400, "User to be updated not found!"));
    }
    const userObject = updatedUser.toObject<IUser>();
    res.status(200).json(mapUserToResponse(userObject));
  } catch (error) {
    next(error);
  }
};

// Delete account
const deleteAccount = async (
  req: AuthenticatedRequest<UserParams, {}, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.id !== req.params.userId) {
    return next(
      errorHandler(400, "You are not allowed to delete this account!")
    );
  }
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.status(200).json({ message: "Account deleted!" });
  } catch (error) {
    next(error);
  }
};

// Signout
const signout = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    res
      .clearCookie("access_token")
      .status(200)
      .json("User has been signed out");
  } catch (error) {
    next(error);
  }
};

// get all the users
const getUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.isAdmin) {
    return next(errorHandler(403, "You are not allowed to see all users"));
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === "asc" ? 1 : -1;
    const users = await User.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const usersObjectArr = users.map((user) => {
      const userObject = user.toObject<IUser>();
      return userObject;
    });

    const totalUsers = await User.countDocuments();

    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthsUsers = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json(
      mapAllUsersToResponse({
        users: usersObjectArr,
        lastMonthsUsers,
        totalUsers,
      })
    );
  } catch (error) {
    next(error);
  }
};

// Delete a user by admin
const deleteUser = async (
  req: AuthenticatedRequest<UserParams>,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.isAdmin) {
    return next(errorHandler(403, "You are not allowed to delete users"));
  }
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.status(200).json("User has been deleted");
  } catch (error) {
    next(error);
  }
};

// get one user
const getUser = async (
  req: AuthenticatedRequest<UserParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    const userResponse = user.toObject();
    res.status(200).json(mapUserToResponse(userResponse));
  } catch (error) {
    next(error);
  }
};

export { updateUser, deleteAccount, signout, getUsers, deleteUser, getUser };
