export function useCart() {
  return {
    items: [],
    addItem: (variantId: string, quantity: number) => {
      console.warn("useCart placeholder: implement cart state or Zustand store");
    },
    removeItem: (variantId: string) => {
      console.warn("useCart placeholder: implement cart state or Zustand store");
    },
  };
}
