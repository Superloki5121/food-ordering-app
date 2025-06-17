import React, { useState, useEffect } from 'react';
import axios from 'axios';

const sampleMenu = [
  { id: 1, name: "Sambar Idly", price: 40 },
  { id: 2, name: "Mysore Bonda", price: 50 },
  { id: 3, name: "Onion Dosa", price: 60 },
  { id: 4, name: "Wada", price: 60 }
];

const CustomerView = () => {
  const [menu] = useState(sampleMenu);
  const [cart, setCart] = useState([]);
  const [table, setTable] = useState(new URLSearchParams(window.location.search).get("table") || "");
  const [orderId, setOrderId] = useState(null);
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");

  const addToCart = (item) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      return exists
        ? prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i))
        : [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (item) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === item.id ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const submitOrder = async () => {
    if (!table || cart.length === 0) {
      alert("Please enter table number and select items.");
      return;
    }

    const order = {
      id: Date.now().toString(),
      table,
      items: cart,
      status: "pending"
    };

    try {
      await axios.post("http://192.168.29.238:4000/orders", order);
      setMessage("Order placed! Waiting for admin confirmation...");
      setOrderId(order.id);
      setCart([]);
    } catch (error) {
      console.error(error);
      setMessage("Failed to place order.");
    }
  };

  const resetOrder = () => {
    localStorage.removeItem("orderId");
    localStorage.removeItem("orderStatus");
    setOrderId(null);
    setStatus("");
    setMessage("");
    setCart([]);
    setTable("");
  };

  // Restore orderId and status from localStorage
  useEffect(() => {
    const savedOrderId = localStorage.getItem("orderId");
    const savedStatus = localStorage.getItem("orderStatus");
    if (savedOrderId) setOrderId(savedOrderId);
    if (savedStatus) setStatus(savedStatus);
  }, []);

  // Persist orderId and status to localStorage
  useEffect(() => {
    if (orderId) localStorage.setItem("orderId", orderId);
  }, [orderId]);

  useEffect(() => {
    if (status) localStorage.setItem("orderStatus", status);
  }, [status]);

  // Polling order status
  useEffect(() => {
    if (!orderId) return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`http://192.168.29.238:4000/orders/${orderId}`);
        if (res.data.status !== "pending") {
          setStatus(res.data.status);
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Error fetching order status", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId]);

  const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 700, margin: "0 auto" }}>
      <h2>🍽️ Welcome to TLJ Tiffen Center</h2>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontWeight: 'bold' }}>Table Number: </label>
        <input
          type="text"
          value={table}
          onChange={(e) => setTable(e.target.value)}
          style={{ padding: 6, marginLeft: 10, borderRadius: 4 }}
        />
      </div>

      <h3>📋 Menu</h3>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "15px"
      }}>
        {menu.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 15,
              backgroundColor: "#f9f9f9",
              boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <strong style={{ fontSize: "1.1rem" }}>{item.name}</strong><br />
              <span style={{ color: "#666" }}>₹{item.price}</span>
            </div>
            <button
              onClick={() => addToCart(item)}
              style={{
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                padding: "8px 14px",
                borderRadius: 4,
                cursor: "pointer"
              }}
            >
              Add
            </button>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: 30 }}>🛒 Cart</h3>
      {cart.length === 0 ? (
        <p>No items selected.</p>
      ) : (
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {cart.map((item) => (
            <li
              key={item.id}
              style={{
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                border: "1px solid #eee",
                borderRadius: 6,
                backgroundColor: "#fff"
              }}
            >
              <span style={{ flex: 1 }}>
                {item.name} x {item.qty} = ₹{item.qty * item.price}
              </span>
              <div>
                <button
                  onClick={() => removeFromCart(item)}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "#fff",
                    border: "none",
                    padding: "6px 12px",
                    marginRight: 6,
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                >
                  ➖
                </button>
                <button
                  onClick={() => addToCart(item)}
                  style={{
                    backgroundColor: "#28a745",
                    color: "#fff",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                >
                  ➕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {cart.length > 0 && (
        <p style={{ fontWeight: "bold", marginTop: 10, fontSize: "1.1rem" }}>
          🧾 Total: ₹{total}
        </p>
      )}

      <button
        onClick={submitOrder}
        style={{
          marginTop: 20,
          backgroundColor: "#17a2b8",
          color: "#fff",
          border: "none",
          padding: "12px 24px",
          borderRadius: 6,
          fontSize: "1rem",
          cursor: "pointer"
        }}
      >
        Submit Order
      </button>

      {message && <p style={{ color: "green", marginTop: 10 }}>{message}</p>}
      {status && (
        <p
          style={{
            color: status === "accepted" ? "green" : "red",
            marginTop: 10,
            fontWeight: "bold"
          }}
        >
          {status === "accepted"
            ? "✅ Your order was accepted!"
            : "❌ Your order was rejected."}
        </p>
      )}

      {(status === "accepted" || status === "rejected") && (
        <button
          onClick={resetOrder}
          style={{
            marginTop: 10,
            backgroundColor: "#ffc107",
            color: "#000",
            border: "none",
            padding: "10px 18px",
            borderRadius: 6,
            cursor: "pointer"
          }}
        >
          🆕 Place New Order
        </button>
      )}
    </div>
  );
};

export default CustomerView;
