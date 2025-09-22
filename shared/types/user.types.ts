// User response interface (for API responses) to use it in frontend

export interface IUserResponse {
  _id: string; // ObjectId → string
  username: string;
  email: string;
  profilePicture?: string;
  isAdmin: boolean;
  createdAt?: string; // Date → ISO string
  updatedAt?: string;
}

export interface IAllUsersResponse {
  users: IUserResponse[];
  lastMonthsUsers: number;
  totalUsers: number;
}
