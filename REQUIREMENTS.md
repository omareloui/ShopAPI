# API Requirements

The company stakeholders want to create an online storefront to showcase their great product ideas. Users need to be able to browse an index of all products, see the specifics of a single product, and add products to an order that they can view in a cart page. You have been tasked with building the API that will support this application, and your coworker is building the frontend.

These are the notes from a meeting with the frontend developer that describe what endpoints the API needs to supply, as well as data shapes the frontend and backend have agreed meet the requirements of the application.

---

## API Endpoints

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

  - Requires a _token_ passed to the Authorization header property.
  - Returns an array of [User](#user-shape) objects.

- #### **Show**

  `GET /users/:id`

  - Requires a _token_ passed to the Authorization header property. And the required user `id` as a `number` as a parameter.
  - Returns the [User](#user-shape) object.

- #### **Create**

  `POST /users`

  - Requires a _token_ passed to the Authorization header property. And to the body:
    - `firstname: string`
    - `lastname: string`
    - `username: string`
    - `password: string`
  - Returns the created [User](#user-shape) object.

- #### **Update**

  `PUT /users/:id`

  - Requires a _token_ passed to the Authorization header property. And the product `id` as a `number` as a parameter. The fields you want to update which could be property from the product except the id.
  - Returns the updated [User](#user-shape) object.

- #### **Delete**

  `DELETE /users/:id`

  - Requires a _token_ passed to the Authorization header property. And the required user `id` as a `number` as a parameter.
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

  - Requires a _token_ passed to the Authorization header property.
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

  - Requires a _token_ passed to the Authorization header property and the user id will be extracted from it.
  - Returns an array of [PopulatedOrder](#order-shape) objects.

- #### **Completed Orders By User**

  `GET /orders/mine/complete`

  - Requires a _token_ passed to the Authorization header property and the user id will be extracted from it.
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
  product_id: number;
  u_id: number;
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
