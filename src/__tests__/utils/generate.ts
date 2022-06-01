import { faker } from "@faker-js/faker";

import {
  CreateOrder,
  CreateProduct,
  CreateUser,
  OrderState,
  Signup,
} from "../../@types";

function generateWMinChar<T extends string>(func: () => T, min = 3): T {
  const result = func();
  if (result.length < min) return generateWMinChar(func, min);
  return result;
}

const generate = {
  user: (override: Partial<CreateUser> = {}): CreateUser => ({
    firstname: generateWMinChar(faker.name.firstName),
    lastname: generateWMinChar(faker.name.lastName),
    username: generateWMinChar(() =>
      `${faker.hacker.noun()}${faker.random.numeric(
        5
      )}${faker.random.word()}`.replace(/[^\w\-_]/g, "_")
    ),
    password: generateWMinChar(() => faker.random.words(3), 8),
    ...override,
  }),

  signup(override: Partial<Signup> = {}): Signup {
    return { ...this.user(), ...override };
  },

  product: (override: Partial<CreateProduct> = {}): CreateProduct => ({
    name: generateWMinChar(() => faker.random.words(3)),
    price: parseInt(faker.random.numeric(3), 10),
    category: generateWMinChar(() => faker.random.words(3)),
    ...override,
  }),

  order: (
    productsIds: number[],
    override: Partial<CreateOrder> = {}
  ): CreateOrder => ({
    products: productsIds.map(pId => ({
      id: pId,
      quantity: parseInt(faker.random.numeric(), 10),
    })),
    state: OrderState.ACTIVE,
    ...override,
  }),
};

export { generate };
