export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

export type CreateProduct = Omit<Product, "id">;

export type UpdateProduct = Partial<CreateProduct>;
