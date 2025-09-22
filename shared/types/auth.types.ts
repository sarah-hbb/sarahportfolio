export interface SigninDTO {
  email: string;
  password: string;
}

export interface GoogleSignupDTO {
  username: string;
  email: string;
  googlePhotoURL?: string;
}
