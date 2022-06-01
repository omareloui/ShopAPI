-- Create the intermiate table
CREATE TABLE order_products (
  id SERIAL PRIMARY KEY,
  product_id integer REFERENCES products(id),
  order_id integer REFERENCES orders(id),
  quantity integer
);

-- Remove unnecessary columns from orders
ALTER TABLE orders DROP COLUMN product_id;
ALTER TABLE orders DROP COLUMN quantity;
