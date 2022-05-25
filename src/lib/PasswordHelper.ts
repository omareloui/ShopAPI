import bcrypt from "bcrypt";

export class PasswordHelper {
  static hashPassword(plainPassword: string) {
    return bcrypt.hash(
      `${plainPassword}.${process.env.PASSWORD_PEPPER}`,
      parseInt(process.env.SALT_ROUNDS || "14", 10)
    );
  }

  static verifyPassword(plain: string, hash: string) {
    return bcrypt.compare(`${plain}.${process.env.PASSWORD_PEPPER}`, hash);
  }
}
