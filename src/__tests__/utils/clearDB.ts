import { query } from "../../utils";

export function clearDB() {
  return query(
    "DELETE FROM order_products *; DELETE FROM orders *; DELETE FROM products *; DELETE FROM users *;"
  );
}
