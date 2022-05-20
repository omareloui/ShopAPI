import * as yup from "yup";

export const createProductSchema = yup.object().shape({
  name: yup.string().required().min(3),
  price: yup.number().required().positive(),
  category: yup.string().required().min(3),
});

export const showProductSchema = yup.object().shape({
  id: yup.number().required(),
});

export const updateProductSchema = yup.object().shape({
  id: yup.number().required(),
  name: yup.string().min(3),
  price: yup.number().positive(),
  category: yup.string().min(3),
});

export const deleteProductSchema = yup.object().shape({
  id: yup.number().required(),
});
