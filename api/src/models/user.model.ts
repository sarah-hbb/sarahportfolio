import { Schema, model, Types, Document } from "mongoose";

// Backend-only User interface (Mongoose model)
export interface IUser extends Document {
  _id: Types.ObjectId; // Explicit ObjectId for clarity
  username: string;
  email: string;
  password: string;
  profilePicture?: string;
  isAdmin: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2013/07/13/12/33/man-159847_1280.png",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Create model
const User = model<IUser>("User", userSchema);

export default User;
