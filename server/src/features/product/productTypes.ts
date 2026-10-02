export interface Product {
  id: string;
  name: string;
  price: number;
  store_id: string;
}

export interface CreateProductDTO {
  name: string;
  price: number;
}

export interface UpdateProductDTO {
  name: string;
}