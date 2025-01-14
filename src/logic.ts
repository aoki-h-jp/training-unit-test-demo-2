import { v4 as uuidv4 } from 'uuid';
import { store } from './store';
import { InventoryItem } from './types';

export class InventoryError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = 'InventoryError';
  }
}

export const getInventory = async ({ id }: { id?: string }) => {
  if (!id) {
    return Array.from(store.items.values());
  }

  const item = store.items.get(id);
  if (!item) {
    throw new InventoryError(`Item with id ${id} not found`, 404);
  }
  return item;
};

export const addItem = async ({ name, quantity }: { name: string; quantity: number }) => {
  if (!name || quantity === undefined) {
    throw new InventoryError('Name and quantity are required', 400);
  }

  // 在庫が1000以上の場合はエラーを返す
  if (quantity >= 1000) {
    throw new InventoryError('Quantity cannot be greater than or equal to 1000', 400);
  }

  // 在庫がマイナスの場合はエラーを返す
  if (quantity < 0) {
    throw new InventoryError('Quantity cannot be negative', 400);
  }

  const id = uuidv4();
  const newItem: InventoryItem = { id, name, quantity };
  store.items.set(id, newItem);
  return newItem;
};

export const updateItem = async ({ id, quantity }: { id: string; quantity: number }) => {
  if (!id || quantity === undefined) {
    throw new InventoryError('Id and quantity are required', 400);
  }

  const item = store.items.get(id);
  if (!item) {
    throw new InventoryError(`Item with id ${id} not found`, 404);
  }

  // 在庫がマイナスの場合はエラーを返す
  if (quantity < 0) {
    throw new InventoryError('Quantity cannot be negative', 400);
  }

  const updatedItem = { ...item, quantity };
  store.items.set(id, updatedItem);
  return updatedItem;
};

export const deleteItem = async ({ id }: { id: string }) => {
  if (!id) {
    throw new InventoryError('Id is required', 400);
  }

  if (!store.items.has(id)) {
    throw new InventoryError(`Item with id ${id} not found`, 404);
  }

  store.items.delete(id);
  return { message: 'Item deleted successfully' };
}; 