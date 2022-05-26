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

export const createOrderSchema = yup
  .object()
  .shape({
    product_id: yup.number().required(),
    u_id: yup.number().required(),
    quantity: yup.number().default(1).min(1),
    state: yup.mixed<OrderState>().oneOf(Object.values(OrderState)).required(),
  })
  .noUnknown();

export const updateOrderSchema = yup
  .object()
  .shape({
    product_id: yup.number(),
    u_id: yup.number(),
    quantity: yup.number().min(1),
    state: yup.mixed<OrderState>().oneOf(Object.values(OrderState)),
  })
  .noUnknown();

export const deleteOrderSchema = yup
  .object()
  .shape({
    id: yup.number().required(),
  })
  .noUnknown();
