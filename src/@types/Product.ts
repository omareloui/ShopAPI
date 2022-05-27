export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

export interface ProductWQuantity extends Product {
  quantity: number;
}

export type CreateProduct = Omit<Product, "id">;

export type UpdateProduct = Partial<CreateProduct>;
