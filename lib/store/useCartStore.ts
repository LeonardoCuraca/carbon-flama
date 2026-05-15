import { create } from "zustand";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  modifiers?: any;
  subtotal: number;
}

interface CartState {
  tableId: number | null;
  items: CartItem[];
  setTable: (tableId: number | null) => void;
  addItem: (product: any, quantity: number, notes?: string, modifiers?: any) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  tableId: null,
  items: [],

  setTable: (tableId) => set({ tableId }),

  addItem: (product, quantity, notes, modifiers) => {
    const items = get().items;
    const existingItem = items.find(
      (item) =>
        item.productId === product.id &&
        item.notes === notes &&
        JSON.stringify(item.modifiers) === JSON.stringify(modifiers)
    );

    if (existingItem) {
      const updatedItems = items.map((item) =>
        item.id === existingItem.id
          ? {
              ...item,
              quantity: item.quantity + quantity,
              subtotal: (item.quantity + quantity) * item.price,
            }
          : item
      );
      set({ items: updatedItems });
    } else {
      const newItem: CartItem = {
        id: Math.random().toString(36).substring(7),
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
        notes,
        modifiers,
        subtotal: quantity * product.price,
      };
      set({ items: [...items, newItem] });
    }
  },

  removeItem: (itemId) => {
    set({ items: get().items.filter((item) => item.id !== itemId) });
  },

  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }
    const updatedItems = get().items.map((item) =>
      item.id === itemId
        ? { ...item, quantity, subtotal: quantity * item.price }
        : item
    );
    set({ items: updatedItems });
  },

  clearCart: () => set({ items: [], tableId: null }),

  getTotal: () => {
    return get().items.reduce((acc, item) => acc + item.subtotal, 0);
  },
}));
