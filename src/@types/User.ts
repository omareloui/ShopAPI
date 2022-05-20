export interface User {
  id: number;
  firstname: string;
  lastname: string;
  password: string;
}

export type CreateUser = Omit<User, "id">;

export type UpdateUser = Partial<CreateUser>;
