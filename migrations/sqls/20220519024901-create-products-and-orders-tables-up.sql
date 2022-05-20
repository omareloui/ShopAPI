CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR,
  price integer,
  category VARCHAR(50)
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  userId integer REFERENCES users(id),
  productId integer REFERENCES products(id),
  quantity integer,
  state VARCHAR(20)
);
