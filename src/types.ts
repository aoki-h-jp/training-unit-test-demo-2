export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
}

export interface DataStore {
  items: Map<string, InventoryItem>;
} 