export interface OrderItemDTO {
  productId: string;
  quantity: number;
}

export interface CreateOrderDTO {
  storeId: string;
  items: OrderItemDTO[];
}