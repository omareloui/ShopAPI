# API Requirements

## API Endpoints

> Note that in end-points that require a token you can get the token from `/auth/signin` or `/auth/signup` and you have to prefix it with `"Bearer "` and add it to `Authorization` header.

### **Authentication**

- #### **Sign In**

  `POST /auth/signin`

  - Requires
    - `username: string`
    - `password: string`
  - Returns an [Auth](#auth-shape) object.

- #### **Sign Up**

  `POST /auth/signup`

  - Requires
    - `firstname: string`
    - `lastname: string`
    - `username: string`
    - `password: string`
  - Returns an [Auth](#auth-shape) object.

### **Users**

- #### **Index**

  `GET /users`

  - Requires a _token_.
  - Returns an array of [User](#user-shape) objects.

- #### **Show**

  `GET /users/:id`

  - Requires a _token_. And the required user `id` as a `number` as a parameter.
  - Returns the [User](#user-shape) object.

- #### **Create**

  `POST /users`

  - Requires a _token_. And to the body:
    - `firstname: string`
    - `lastname: string`
    - `username: string`
    - `password: string`
  - Returns the created [User](#user-shape) object.

- #### **Update**

  `PUT /users/:id`

  - Requires a _token_. And the product `id` as a `number` as a parameter. The fields you want to update which could be property from the product except the id.
  - Returns the updated [User](#user-shape) object.

- #### **Delete**

  `DELETE /users/:id`

  - Requires a _token_. And the required user `id` as a `number` as a parameter.
  - Returns a [DeleteResponse](#delete-response-shape) object.

### **Products**

- #### **Index**

  `GET /products`

  - Requires noting.
  - Returns an array of [Product](#product-shape) objects.

- #### **Show**

  `GET /products/:id`

  - Requires noting other than the product `id` as a `number` as a parameter.
  - Returns a [Product](#product-shape) object.

- #### **By Category**

  `GET /products/category/:category`

  - Requires noting other than the product `category` as a `string` as a parameter.
  - Returns a [Product](#product-shape) object.

- #### **Create**

  `POST /products`

  - Requires a _token_.
  - Returns the created [Product](#product-shape) object.

- #### **Top 5 most popular products**

  `GET /products/top-five`

  - Requires noting.
  - Returns an array of maximum length of 5 of [ProductWQuantity](#product-shape) object.

- #### **Update**

  `PUT /products/:id`

  - Requires the product `id` as a `number` as a parameter. The fields you want to update which could be property from the product except the id.
  - Returns the updated [Project](#product-shape) object.

- #### **Delete**

  `DELETE /projects/:id`

  - Requires the product `id` as a `number` as a parameter.
  - Returns a [DeleteResponse](#delete-response-shape) object.

### **Orders**

- #### **Index**

  `GET /orders`

  - Requires nothing.
  - Returns an array of [PopulatedOrder](#order-shape) objects.

- #### **Current Orders By User**

  `GET /orders/mine`

  - Requires a _token_.
  - Returns an array of [PopulatedOrder](#order-shape) objects.

- #### **Completed Orders By User**

  `GET /orders/mine/complete`

  - Requires a _token_ and the user id will be extracted from it.
  - Returns an array of [PopulatedOrder](#order-shape) objects with a state of complete.

- #### **Show**

  `GET /orders/:id`

  - Requires nothing.
  - Returns an array of [PopulatedOrder](#order-shape) objects with a state of complete.

- #### **Create**

  `POST /orders`

  - Requires
    - `product_id: number` the product id.
    - `u_id: number` the user id.
    - `quantity: number`
    - `state: OrderState` [OrderState](#order-shape) is "active" or "complete".
  - Returns the created order as [PopulatedOrder](#order-shape) object.

- #### **Update**

  `PUT /orders/:id`

  - Requires the product `id` as a `number` as a parameter. The fields you want to update which could be property from the product except the id.
  - Returns updated order as [PopulatedOrder](#order-shape) object.

- #### **Delete**

  `DELETE /orders/:id`

  - Requires the product `id` as a `number` as a parameter.
  - Returns a [DeleteResponse](#delete-response-shape) object.

---

## Data Shapes

### <a name="user-shape"></a>User

```typescript
interface User {
  id: number;
  firstname: string;
  lastname: string;
  username: string;
  password: string;
}
```

### <a name="auth-shape"></a>Auth

```typescript
interface Token {
  body: string;
  expiresIn: string;
}

interface Auth {
  user: User;
  token: Token;
}
```

### <a name="product-shape"></a>Product

```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

interface ProductWQuantity extends Product {
  quantity: number;
}
```

### <a name="order-shape"></a>Order

```typescript
enum OrderState {
  ACTIVE = "active",
  COMPLETE = "complete",
}

interface Order {
  id: number;
  product_id: number; // Foreign key to products table.
  u_id: number; // Foreign key to users table.
  quantity: number;
  state: OrderState;
}

interface PopulatedOrder {
  id: number;
  product: string;
  product_price: number;
  product_category: string;
  u_firstname: string;
  u_lastname: string;
  u_username: string;
  quantity: number;
  state: OrderState;
}
```

### <a name="delete-response-shape"></a>Delete Response

```typescript
interface DeleteResponse {
  ok: boolean;
}
```
