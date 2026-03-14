import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product, CartItem } from '@/types/pos.types';

interface POSState {
    cart: CartItem[];
    addToCart: (product: Product, quantity?: number) => void;
    updateQuantity: (id: string, delta: number) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    
    // UI State
    isPaymentModalOpen: boolean;
    setPaymentModalOpen: (open: boolean) => void;
}

export const usePOSStore = create<POSState>()(
    persist(
        (set) => ({
            cart: [],
            isPaymentModalOpen: false,

            addToCart: (product, quantity = 1) => set((state) => {
                const existing = state.cart.find((item) => item.$id === product.$id);
                if (existing) {
                    return {
                        cart: state.cart.map((item) =>
                            item.$id === product.$id
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        ),
                    };
                }
                return { cart: [...state.cart, { ...product, quantity }] };
            }),

            updateQuantity: (id, delta) => set((state) => {
                const updated = state.cart.map((item) => {
                    if (item.$id === id) {
                        const newQuantity = item.quantity + delta;
                        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
                    }
                    return item;
                }).filter(Boolean) as CartItem[];
                return { cart: updated };
            }),

            removeFromCart: (id) => set((state) => ({
                cart: state.cart.filter((item) => item.$id !== id),
            })),

            clearCart: () => set({ cart: [] }),

            setPaymentModalOpen: (open) => set({ isPaymentModalOpen: open }),
        }),
        {
            name: 'pos-cart-storage', // localStorage key
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ cart: state.cart }), // Only persist cart, not UI state
        }
    )
);
