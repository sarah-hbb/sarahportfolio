import User from "../models/user.model";
import { IUser } from "../models/user.model";
import { Request, Response, NextFunction } from "express";
import bcryptjs from "bcryptjs";
import errorHandler from "../utils/error";
import jwt from "jsonwebtoken";
import { SigninDTO, GoogleSignupDTO } from "../../../shared/types/auth.types";
import { mapUserToResponse } from "../mappers/user.mapper";

interface SignupRequestBody {
  username: string;
  email: string;
  password: string;
}

// Signup
export const signup = async (
  req: Request<{}, {}, SignupRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const { username, email, password } = req.body;
  if (
    !username ||
    !email ||
    !password ||
    username === "" ||
    email === "" ||
    password === ""
  ) {
    // return new error
    next(errorHandler(400, "All fields are required"));
  }

  // how to hide the passwords on database using bcryptjs
  const hashedpassword = bcryptjs.hashSync(password, 10);

  // using created mongoose model
  const newUser: IUser = new User({
    username,
    email,
    password: hashedpassword,
  });
  try {
    // saving user in database
    await newUser.save();
    res.json("Successful Signup");
  } catch (err) {
    next(err);
  }
};

// Signin
export const signin = async (
  req: Request<{}, {}, SigninDTO>,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  if (!email || !password || email === "" || password === "") {
    next(errorHandler(400, "All fields are required!"));
  }
  try {
    const validUser = await User.findOne({ email });

    if (!validUser) {
      return next(errorHandler(400, "User not found!"));
    }

    const validPassword = bcryptjs.compareSync(password, validUser.password);

    if (!validPassword) {
      return next(errorHandler(400, "Invalid username or password!"));
    }

    // create jwt token and send it to cookie
    const payload = { id: validUser._id, isAdmin: validUser.isAdmin };
    const secretKey = process.env.JWT_SECRET_KEY;
    if (!secretKey) {
      return next(errorHandler(500, "Internal server error"));
    }
    const token = jwt.sign(payload, secretKey);
    const validUserObj = validUser.toObject();
    res
      .status(200)
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .json(mapUserToResponse(validUserObj));
  } catch (err) {
    next(err);
  }
};

// Google Auth
export const google = async (
  req: Request<{}, {}, GoogleSignupDTO>,
  res: Response,
  next: NextFunction
) => {
  const { username, email, googlePhotoURL } = req.body;
  const secretKey = process.env.JWT_SECRET_KEY;
  if (!secretKey) {
    return next(errorHandler(500, "Internal server error"));
  }
  try {
    const user = await User.findOne({ email });
    if (user) {
      // if the user exists signin user
      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        secretKey
      );
      const userObj = user.toObject();
      res
        .status(200)
        .cookie("access_token", token, {
          httpOnly: true,
        })
        .json(mapUserToResponse(userObj));
    } else {
      // if the user does not exist create new user with randomly generated password
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedpassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        username:
          username.toLowerCase().split(" ").join("") +
          Math.random().toString(9).slice(-4),
        email,
        password: hashedpassword,
        profilePicture: googlePhotoURL,
      });
      await newUser.save();
      const token = jwt.sign(
        { id: newUser._id, isAdmin: newUser.isAdmin },
        secretKey
      );
      const newUserObj = newUser.toObject();
      res
        .status(200)
        .cookie("access_token", token, {
          httpOnly: true,
        })
        .json(mapUserToResponse(newUserObj));
    }
  } catch (err) {
    next(err);
  }
};
