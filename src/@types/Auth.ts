import { User } from ".";

export interface Token {
  body: string;
  expiresIn: string;
}

export interface TokenPayload {
  userId: number;
  iat: number;
  exp: number;
}

export interface Signup {
  firstname: string;
  lastname: string;
  username: string;
  password: string;
}

export interface Signin {
  username: string;
  password: string;
}

export interface Auth {
  user: User;
  token: Token;
}
