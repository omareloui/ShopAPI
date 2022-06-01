import * as yup from "yup";

import { OrderState } from "../@types";

export const showOrderSchema = yup
  .object()
  .shape({
    id: yup.number().required(),
  })
  .noUnknown();

export const showByUserSchema = yup
  .object()
  .shape({
    userId: yup.number().required(),
  })
  .noUnknown();

export const userIdForOrderSchema = yup.number().required();

export const createOrderSchema = yup
  .object()
  .shape({
    products: yup
      .array()
      .min(1)
      .of(
        yup
          .object()
          .shape({ id: yup.number(), quantity: yup.number().default(1).min(1) })
      )
      .required(),
    state: yup.mixed<OrderState>().oneOf(Object.values(OrderState)).required(),
  })
  .noUnknown();

export const deleteOrderSchema = yup
  .object()
  .shape({
    id: yup.number().required(),
  })
  .noUnknown();
