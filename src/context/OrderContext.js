import React, { createContext, useContext, useState } from "react";

const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [table, setTable] = useState("");

  const addToCart = (item) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + 1 } : i
        );
      } else {
        return [...prev, { ...item, qty: 1 }];
      }
    });
  };

  const resetOrder = () => {
    setCart([]);
    setTable("");
  };

  const value = {
    cart,
    table,
    setTable,
    addToCart,
    resetOrder
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};
