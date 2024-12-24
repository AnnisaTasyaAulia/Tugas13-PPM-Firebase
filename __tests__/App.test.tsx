import React from 'react';
import { render } from '@testing-library/react-native';
import { CartContext } from '../src/cart/CartContext';
import OrderScreen from '../src/screns/OrderScreen';

test('menghitung total harga dengan benar', () => {
  const cart = [
    { strCategory: 'Vegan', price: '$13.99', strCategoryThumb: 'image_url_1' },
    { strCategory: 'Breakfast', price: '$10.99', strCategoryThumb: 'image_url_2' },
  ];
  
  const setCart = jest.fn();

  const { getByText } = render(
    <CartContext.Provider value={{ cart, setCart }}>
      <OrderScreen />
    </CartContext.Provider>
  );

  // Memastikan total harga yang dihitung adalah 24.98
  expect(getByText(/Total: \$ 24.98/i)).toBeTruthy();
});

test('menambah kuantitas item dengan benar', () => {
  const cart = [{ strCategory: 'Makanan', price: '$10.00', strCategoryThumb: 'image_url_1' }];
  const setCart = jest.fn();
  const setQuantities = jest.fn();

  const { getByText } = render(
    <CartContext.Provider value={{ cart, setCart }}>
      <OrderScreen />
    </CartContext.Provider>
  );

  // Menemukan tombol untuk menambah kuantitas
  const addButton = getByText('+');
  
  // Simulasi klik pada tombol tambah
  fireEvent.press(addButton);

  // Memastikan kuantitas bertambah
  expect(setQuantities).toHaveBeenCalledWith([2]); // Asumsi kuantitas awal adalah 1
});


test('menghapus item dari keranjang dengan benar', () => {
  const cart = [{ strCategory: 'Makanan', price: '$10.00', strCategoryThumb: 'image_url_1' }];
  const setCart = jest.fn();
  const setQuantities = jest.fn();
  const { getByText } = render(
    <CartContext.Provider value={{ cart, setCart }}>
      <OrderScreen />
    </CartContext.Provider>
  );

  // Menemukan tombol untuk menghapus item
  const removeButton = getByText('Delete'); // Asumsi ada tombol delete

  // Simulasi klik pada tombol hapus
  fireEvent.press(removeButton);

  // Memastikan item dihapus dari keranjang
  expect(setCart).toHaveBeenCalledWith([]); // Keranjang harus kosong setelah penghapusan
});

