import { UserModel } from "../models";
import { signinValidation, signupValidation } from "../validations";
import { APIError, JWTHelper, PasswordHelper } from "../lib";

import type { Auth, DTO, Signin, Signup, User } from "../@types";

const userModel = new UserModel();

export class AuthModel {
  async signup(dto: DTO | Signup): Promise<Auth> {
    const vData = await signupValidation.validate(dto);
    const user = await userModel.create(vData);
    const token = await JWTHelper.create(user.id);
    return { user, token };
  }

  async signin(dto: DTO | Signin) {
    const { username, password } = await signinValidation.validate(dto);
    const user = await userModel.showWithUsername(username);
    const isValidPassword = await PasswordHelper.verifyPassword(
      password,
      user.password
    );
    if (!isValidPassword)
      throw new APIError("The password isn't correct.", 401);
    const token = await JWTHelper.create(user.id);
    return { user, token };
  }

  async getMe(token: string): Promise<User> {
    const payload = await JWTHelper.verify(token);
    if (!payload) throw new APIError("Invalid token.", 401);
    const user = await userModel.show(payload.userId);
    return user;
  }
}
