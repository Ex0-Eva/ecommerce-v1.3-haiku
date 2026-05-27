export type CartItem = {
  variantId: string;
  quantity: number;
};

export const cartStore = {
  items: [] as CartItem[],
  addItem(item: CartItem) {
    const existing = this.items.find((entry) => entry.variantId === item.variantId);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      this.items.push(item);
    }
  },
  removeItem(variantId: string) {
    this.items = this.items.filter((item) => item.variantId !== variantId);
  },
};
