import { IUser } from "../models/user.model";
import {
  IAllUsersResponse,
  IUserResponse,
} from "../../../shared/types/user.types";

interface IAllUsers {
  users: IUser[];
  lastMonthsUsers: number;
  totalUsers: number;
}
export const mapUserToResponse = (user: IUser): IUserResponse => {
  return {
    _id: user._id.toString(),
    username: user.username,
    email: user.email,
    profilePicture: user.profilePicture,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt?.toISOString() || "",
    updatedAt: user.updatedAt?.toISOString() || "",
  };
};

export const mapAllUsersToResponse = (
  allUsers: IAllUsers
): IAllUsersResponse => {
  const mappedUsers = allUsers.users.map((user) => mapUserToResponse(user));
  return {
    users: mappedUsers,
    lastMonthsUsers: allUsers.lastMonthsUsers,
    totalUsers: allUsers.totalUsers,
  };
};
