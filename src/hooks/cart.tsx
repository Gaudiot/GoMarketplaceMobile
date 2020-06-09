import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      // await AsyncStorage.removeItem('@GoMarketplace:products');
      // setProducts([]);
      const produtos = await AsyncStorage.getItem('@GoMarketplace:products');

      if (produtos) {
        setProducts(JSON.parse(produtos));
      }
    }

    loadProducts();
  }, []);

  async function storeProducts(): Promise<void> {
    await AsyncStorage.setItem(
      '@GoMarketplace:products',
      JSON.stringify(products),
    );
  }

  const addToCart = useCallback(
    async (product: Product) => {
      // TODO ADD A NEW ITEM TO THE CART
      const productIndex = products.findIndex(item => item.id === product.id);

      if (productIndex < 0) {
        const newProduct = product;
        newProduct.quantity = 1;

        setProducts([...products, newProduct]);
      } else {
        const newProductsList = products.map(item => {
          if (item.id === product.id) item.quantity += 1;

          return item;
        });

        setProducts([...newProductsList]);
      }

      storeProducts();
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const newProducts = products.map(item => {
        if (item.id === id) item.quantity += 1;
        return item;
      });

      setProducts(newProducts);

      storeProducts();
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const productIndex = products.findIndex(item => item.id === id);

      const newProductsList = [...products];
      newProductsList[productIndex].quantity -= 1;

      if (newProductsList[productIndex].quantity === 0) {
        newProductsList.splice(productIndex, 1);
      }

      setProducts([...newProductsList]);

      storeProducts();
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
