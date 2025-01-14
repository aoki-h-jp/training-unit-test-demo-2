import { InventoryItem } from './types';

interface Store {
  items: Map<string, InventoryItem>;
  clear: () => void;
}

export const store: Store = {
  items: new Map(),
  clear: function () {
    this.items.clear();
  }
}; 