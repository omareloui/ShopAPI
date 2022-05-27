import { Router } from "express";

import { usersRoutes } from "./user.handler";
import { authRoutes } from "./auth.handler";
import { productsRoutes } from "./product.handler";
import { ordersRoutes } from "./order.handler";

const router = Router();

router.use(usersRoutes);
router.use(authRoutes);
router.use(productsRoutes);
router.use(ordersRoutes);

export { router };
