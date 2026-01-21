export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  product: {
    id: string;
    name: string;
    price: number;
    image: string | null;
    stock: number;
  };
  quantity: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AddToCartDto {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}
