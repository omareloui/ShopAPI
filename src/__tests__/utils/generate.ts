import { faker } from "@faker-js/faker"

import { CreateOrder, CreateProduct, CreateUser, OrderState } from "../../@types"

function generateWMinChar<T extends string>(func: () => T, min = 3): T {
  const result = func()
  if (result.length < min) return generateWMinChar(func, min)
  return result
}

const generate = {
  user: (): CreateUser => ({
    firstname: generateWMinChar(faker.name.firstName),
    lastname: generateWMinChar(faker.name.lastName),
    password: generateWMinChar(() => faker.random.words(3), 8),
  }),

  product: (): CreateProduct => ({
    name: generateWMinChar(() => faker.random.words(3)),
    price: parseInt(faker.random.numeric(3), 10),
    category: generateWMinChar(() => faker.random.words(3)),
  }),

  order: (userId: number, productId: number): CreateOrder => ({
    u_id: userId,
    product_id: productId,
    quantity: parseInt(faker.random.numeric(), 10),
    state: OrderState.ACTIVE,
  }),
}

export { generate }
