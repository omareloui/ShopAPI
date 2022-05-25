import jwt from "jsonwebtoken";

import { Token, TokenPayload, User } from "../@types";

import config from "../config";

export class JWTHelper {
  static secret = config.jwtSecret;

  static expiresIn = config.jwtExpiresIn;

  static create(userId: User["id"], expiresIn = this.expiresIn): Token {
    const token = jwt.sign({ userId } as TokenPayload, this.secret, {
      expiresIn,
    });
    return { body: token, expiresIn: this.expiresIn };
  }

  static verify(token: string): TokenPayload | false {
    try {
      return jwt.verify(token, this.secret) as TokenPayload;
    } catch (_e) {
      return false;
    }
  }

  static decode(token: string) {
    return jwt.decode(token);
  }
}
