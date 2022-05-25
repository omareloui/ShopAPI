import * as yup from "yup";

export const signinValidation = yup
  .object()
  .shape({
    username: yup.string().required(),
    password: yup.string().min(8).required(),
  })
  .noUnknown();

export const signupValidation = yup
  .object()
  .shape({
    firstname: yup.string().min(3).required(),
    lastname: yup.string().min(3).required(),
    username: yup.string().min(2).required(),
    password: yup.string().min(8).required(),
  })
  .noUnknown();
