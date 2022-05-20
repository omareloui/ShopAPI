import * as yup from "yup";

export const showUserSchema = yup
  .object()
  .shape({
    id: yup.number().required(),
  })
  .noUnknown();

export const createUserSchema = yup
  .object()
  .shape({
    firstname: yup.string().min(3).required(),
    lastname: yup.string().min(3).required(),
    password: yup.string().min(8).required(),
  })
  .noUnknown();

export const updateUserSchema = yup
  .object()
  .shape({
    id: yup.number().required(),
    firstname: yup.string().min(3),
    lastname: yup.string().min(3),
    password: yup.string().min(8),
  })
  .noUnknown();

export const deleteUserSchema = yup
  .object()
  .shape({
    id: yup.number().required(),
  })
  .noUnknown();
