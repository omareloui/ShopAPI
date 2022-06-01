-- Remove the intermiate table
DROP TABLE order_products;

-- Readd removed columns from orders table
ALTER TABLE orders ADD COLUMN product_id INT REFERENCES products(id);
ALTER TABLE orders ADD COLUMN quantity INT;
