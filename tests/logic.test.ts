import { describe, it, expect, beforeEach } from 'vitest';
import { getInventory, addItem, updateItem, deleteItem, InventoryError } from '../src/logic';
import { store } from '../src/store';
import { vi } from 'vitest';

describe('Inventory Management', () => {
  beforeEach(() => {
    store.clear();
  });

  describe('GET /inventory', () => {
    it('should return empty array when no items exist', async () => {
      const result = await getInventory({});
      expect(result).toEqual([]);
    });

    it('should return all items when no id is specified', async () => {
      const item = await addItem({ name: 'Widget', quantity: 10 });
      const result = await getInventory({});
      expect(result).toEqual([item]);
    });

    it('should return specific item when id is specified', async () => {
      const item = await addItem({ name: 'Widget', quantity: 10 });
      const result = await getInventory({ id: item.id });
      expect(result).toEqual(item);
    });

    it('should throw 404 when item is not found', async () => {
      await expect(getInventory({ id: 'non-existent' }))
        .rejects.toThrow(InventoryError);
    });
  });

  describe('POST /inventory', () => {
    it('should create new item', async () => {
      const result = await addItem({ name: 'Widget', quantity: 10 });
      expect(result).toEqual({
        id: expect.any(String),
        name: 'Widget',
        quantity: 10
      });
    });

    it('should throw 400 when name is missing', async () => {
      await expect(addItem({ name: '', quantity: 10 }))
        .rejects.toThrow(InventoryError);
    });

    it("在庫が1000以上の場合はエラーを返す", async () => {
      await expect(addItem({ name: 'Coffee', quantity: 1000 }))
        .rejects.toThrow(InventoryError);
    });

    it("在庫がマイナスの場合はエラーを返す", async () => {
      await expect(addItem({ name: 'Coffee', quantity: -1 }))
        .rejects.toThrow(InventoryError);
    });
  });

  describe('PUT /inventory/:id', () => {
    it('should update existing item', async () => {
      const item = await addItem({ name: 'Widget', quantity: 10 });
      const result = await updateItem({ id: item.id, quantity: 20 });
      expect(result.quantity).toBe(20);
    });

    it('should throw 404 when updating non-existent item', async () => {
      await expect(updateItem({ id: 'non-existent', quantity: 20 }))
        .rejects.toThrow(InventoryError);
    });

    it("在庫がマイナスの場合はエラーを返す", async () => {
      const item = await addItem({ name: 'Coffee', quantity: 10 });
      await expect(updateItem({ id: item.id, quantity: -1 }))
        .rejects.toThrow(InventoryError);
    });

    it('should throw 400 when quantity is undefined', async () => {
      const item = await addItem({ name: 'Widget', quantity: 10 });
      await expect(updateItem({ id: item.id, quantity: undefined as any }))
        .rejects.toThrow(new InventoryError('Id and quantity are required', 400));
    });
  });

  describe('DELETE /inventory/:id', () => {
    it('should delete existing item', async () => {
      const item = await addItem({ name: 'Widget', quantity: 10 });
      const result = await deleteItem({ id: item.id });
      expect(result.message).toBe('Item deleted successfully');
      await expect(getInventory({ id: item.id }))
        .rejects.toThrow(InventoryError);
    });

    it('should throw 404 when deleting non-existent item', async () => {
      await expect(deleteItem({ id: 'non-existent' }))
        .rejects.toThrow(InventoryError);
    });

    it('should throw 400 when id is empty', async () => {
      await expect(deleteItem({ id: '' }))
        .rejects.toThrow(new InventoryError('Id is required', 400));
    });
  });

  describe('Error Handling', () => {
    it('should handle database error in getInventory', async () => {
      store.items.get = vi.fn().mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(getInventory({ id: '1' }))
        .rejects.toThrow('Database error');
    });

    it('should handle database error in addItem', async () => {
      store.items.set = vi.fn().mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(addItem({ name: 'Test', quantity: 1 }))
        .rejects.toThrow('Database error');
    });

    it('should handle database error in updateItem', async () => {
      store.items.set = vi.fn().mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(updateItem({ id: '1', quantity: 1 }))
        .rejects.toThrow('Database error');
    });

    it('should handle database error in deleteItem', async () => {
      store.items.has = vi.fn().mockReturnValue(true);
      store.items.delete = vi.fn().mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(deleteItem({ id: '1' }))
        .rejects.toThrow('Database error');
    });
  });
}); 