"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  id: string; // product name + format
  name: string;
  variant: string;
  format: string;
  priceLabel: string;
  price: number;
  image: string;
  qty: number;
};

type NewItem = Omit<CartItem, "qty" | "id" | "price">;

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  currency: string;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (item: NewItem) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
// v2: prices moved from dollars to rand, so older saved bags are ignored.
const STORAGE_KEY = "maison-oduro-cart-v2";

const parsePrice = (label: string) => Number(label.replace(/[^0-9.]/g, "")) || 0;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Restore the bag after hydration so server and client HTML match.
  // Reading localStorage has to happen on the client after mount, so setting
  // state here is intentional.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore corrupted storage */
    }
    setLoaded(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable */
    }
  }, [items, loaded]);

  const add = useCallback((item: NewItem) => {
    const id = `${item.name}__${item.format}`;
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) return prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...item, id, price: parsePrice(item.priceLabel), qty: 1 }];
    });
    setIsOpen(true);
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      qty <= 0 ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? { ...i, qty } : i)),
    );
  }, []);

  const remove = useCallback((id: string) => setItems((prev) => prev.filter((i) => i.id !== id)), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((n, i) => n + i.qty, 0);
    const subtotal = items.reduce((n, i) => n + i.qty * i.price, 0);
    const currency = items[0]?.priceLabel.match(/^[^0-9]+/)?.[0] ?? "R";
    return {
      items,
      count,
      subtotal,
      currency,
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      add,
      setQty,
      remove,
    };
  }, [items, isOpen, add, setQty, remove]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
