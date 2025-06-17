import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminView = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:4000/orders");
      console.log("Fetched orders:", res.data);
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders", err);
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
  try {
    console.log("Updating order:", id, "→", newStatus); // ✅ Debug
    const res = await axios.patch(`http://localhost:4000/orders/${id}`, {
      status: newStatus,
    });
    console.log("Updated order:", res.data);
    alert(`Order ${id} has been ${newStatus}`);
    fetchOrders();
  } catch (err) {
    console.error("❌ Error updating order", err);
  }
};


  return (
    <div style={{ padding: 20 }}>
      <h2>🧾 Admin Dashboard – Incoming Orders</h2>

      {orders.length === 0 ? (
        <p>⏳ Loading or no orders found...</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            style={{
              border: "1px solid #ccc",
              padding: 15,
              marginBottom: 15,
              borderRadius: 5,
              backgroundColor:
                order.status === "accepted"
                  ? "#e6ffed"
                  : order.status === "rejected"
                  ? "#ffe6e6"
                  : "#fff",
            }}
          >
            <h3>Table #{order.table}</h3>
            <p>
              <strong>Status:</strong>{" "}
              <span
                style={{
                  color:
                    order.status === "accepted"
                      ? "green"
                      : order.status === "rejected"
                      ? "red"
                      : "orange",
                }}
              >
                {order.status}
              </span>
            </p>
            <ul>
              {order.items.map((item, idx) => (
                <li key={idx}>
                  {item.name} x {item.qty}
                </li>
              ))}
            </ul>
            {order.status === "pending" && (
              <div style={{ marginTop: 10 }}>
                <button
                  onClick={() => updateOrderStatus(order.id, "accepted")}
                  style={{ marginRight: 10 }}
                >
                  ✅ Accept
                </button>
                <button
                  onClick={() => updateOrderStatus(order.id, "rejected")}
                  style={{ backgroundColor: "crimson", color: "#fff" }}
                >
                  ❌ Reject
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default AdminView;
