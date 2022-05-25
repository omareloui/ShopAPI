import * as yup from "yup";

const id = yup.number();

const name = yup.string().min(3);

const username = yup
  .string()
  .min(3)
  .matches(
    /^[\w\-_]+$/i,
    "You can only enter letters, numbers or underscores."
  );

const password = yup.string().min(8);

export const showUserSchema = yup
  .object()
  .shape({ id: id.required() })
  .noUnknown();

export const showUserWithUsernameSchema = yup
  .object()
  .shape({ username: username.required() })
  .noUnknown();

export const createUserSchema = yup
  .object()
  .shape({
    firstname: name.required(),
    lastname: name.required(),
    username: username.required(),
    password: password.required(),
  })
  .noUnknown();

export const updateUserSchema = yup
  .object()
  .shape({
    id: id.required(),
    firstname: name,
    lastname: name,
    username,
    password,
  })
  .noUnknown();

export const deleteUserSchema = yup
  .object()
  .shape({ id: id.required() })
  .noUnknown();
