import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@fidevoltz/types';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  slug: string;
  inStock: boolean;
  stockQuantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  incrementQuantity: (productId: string) => void;
  decrementQuantity: (productId: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getTax: () => number;
  getShipping: () => number;
  getTotal: () => number;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
}

const TAX_RATE = 0.08; // 8% tax
const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_COST = 5.99;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existingItem = items.find((i) => i.productId === product.id);
        
        // Safely get stock quantity - API uses 'stock', mock uses 'stockQuantity'
        const stockQty = (product as any).stock || (product as any).stockQuantity || 99;
        const isInStock = (product as any).stock ? (product as any).stock > 0 : (product as any).inStock !== false;
        
        if (existingItem) {
          // Update quantity if item exists
          set({
            items: items.map((i) =>
              i.productId === product.id
                ? { ...i, quantity: Math.min(i.quantity + quantity, stockQty) }
                : i
            ),
          });
        } else {
          // Add new item
          const newItem: CartItem = {
            id: `cart-${product.id}-${Date.now()}`,
            productId: product.id,
            name: product.name,
            price: Number(product.price),
            quantity: Math.min(quantity, stockQty),
            image: product.image || undefined,
            slug: (product as any).slug || product.id, // Fallback to ID if no slug
            inStock: isInStock,
            stockQuantity: stockQty,
          };
          set({ items: [...items, newItem] });
        }
      },
      
      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.productId !== productId) }),
      
      updateQuantity: (productId, quantity) => {
        const item = get().items.find((i) => i.productId === productId);
        if (!item) return;
        
        const newQuantity = Math.max(1, Math.min(quantity, item.stockQuantity));
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity: newQuantity } : i
          ),
        });
      },
      
      incrementQuantity: (productId) => {
        const item = get().items.find((i) => i.productId === productId);
        if (!item) return;
        
        if (item.quantity < item.stockQuantity) {
          set({
            items: get().items.map((i) =>
              i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        }
      },
      
      decrementQuantity: (productId) => {
        const item = get().items.find((i) => i.productId === productId);
        if (!item) return;
        
        if (item.quantity > 1) {
          set({
            items: get().items.map((i) =>
              i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i
            ),
          });
        }
      },
      
      clearCart: () => set({ items: [] }),
      
      getItemCount: () =>
        get().items.reduce((acc, item) => acc + item.quantity, 0),
      
      getSubtotal: () =>
        get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
      
      getTax: () => get().getSubtotal() * TAX_RATE,
      
      getShipping: () => {
        const subtotal = get().getSubtotal();
        return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
      },
      
      getTotal: () =>
        get().getSubtotal() + get().getTax() + get().getShipping(),
      
      isInCart: (productId) =>
        get().items.some((i) => i.productId === productId),
      
      getItemQuantity: (productId) => {
        const item = get().items.find((i) => i.productId === productId);
        return item ? item.quantity : 0;
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
