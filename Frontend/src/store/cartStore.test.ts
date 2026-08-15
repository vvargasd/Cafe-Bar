import { beforeEach, describe, expect, it } from 'vitest';
import { useCartStore, type Product } from './cartStore';

const product = (id: string, price: number): Product => ({ id, name: id, price });

beforeEach(() => {
  useCartStore.setState({ orderItems: [], tableOrders: {}, activeTable: null });
});

describe('cartStore', () => {
  it('addProduct agrega un producto nuevo con cantidad 1', () => {
    useCartStore.getState().addProduct(product('p1', 3000));
    expect(useCartStore.getState().orderItems).toEqual([{ id: 'p1', name: 'p1', price: 3000, quantity: 1 }]);
  });

  it('addProduct incrementa la cantidad si el producto ya está en la orden', () => {
    useCartStore.getState().addProduct(product('p1', 3000));
    useCartStore.getState().addProduct(product('p1', 3000));
    expect(useCartStore.getState().orderItems).toEqual([{ id: 'p1', name: 'p1', price: 3000, quantity: 2 }]);
  });

  it('removeProduct quita el producto por id', () => {
    useCartStore.getState().addProduct(product('p1', 3000));
    useCartStore.getState().addProduct(product('p2', 1000));
    useCartStore.getState().removeProduct('p1');
    expect(useCartStore.getState().orderItems).toEqual([{ id: 'p2', name: 'p2', price: 1000, quantity: 1 }]);
  });

  it('sendToTable mueve la orden a la mesa y limpia orderItems', () => {
    useCartStore.getState().addProduct(product('p1', 3000));
    useCartStore.getState().sendToTable('Barra');
    const state = useCartStore.getState();
    expect(state.orderItems).toEqual([]);
    expect(state.tableOrders['Barra']).toEqual([{ id: 'p1', name: 'p1', price: 3000, quantity: 1 }]);
  });

  it('sendToTable fusiona cantidades si la mesa ya tenía el mismo producto', () => {
    useCartStore.setState({ tableOrders: { Barra: [{ id: 'p1', name: 'p1', price: 3000, quantity: 1 }] } });
    useCartStore.getState().addProduct(product('p1', 3000));
    useCartStore.getState().sendToTable('Barra');
    expect(useCartStore.getState().tableOrders['Barra']).toEqual([{ id: 'p1', name: 'p1', price: 3000, quantity: 2 }]);
  });

  it('sendToTable no hace nada si la orden está vacía', () => {
    useCartStore.getState().sendToTable('Barra');
    expect(useCartStore.getState().tableOrders['Barra']).toBeUndefined();
  });
});
