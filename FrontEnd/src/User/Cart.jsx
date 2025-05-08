import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

export default function Cart() {
  // Uses CartContext to manage cart items and actions
  const { cartItems, incrementQty, decrementQty, deleteItem } = useCart();
  const navigate = useNavigate();

  // State to manage order history
  // This state will hold the order history fetched from the server
  const [orderHistory, setOrderHistory] = useState([]);

  // Retrieves the token from local storage to authenticate API requests
  const token = localStorage.getItem("TOKEN");

  // Calculates the total price of items in the cart
  // This is done by reducing the cartItems array and summing up the price of each item multiplied by its quantity
  // The initial value of the sum is set to 0
  // The reduce function iterates over each item in the cartItems array and calculates the total price
  // The total price is then stored in the total variable
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // useEffect hook to fetch user and order details when the component mounts or when the token changes
  // This effect runs only when the token is available
  useEffect(() => {
    if (!token) return;

    // Function to fetch user and order details from the server
    // It uses axios to make a GET request to the server's order history endpoint
    // The token is passed in the headers for authentication
    // If the request is successful, the order history is set in the state
    const fetchUserAndOrders = async () => {
      try {
        const ordersRes = await axios.get(
          "http://127.0.0.1:5000/api/order/history",
          {
            headers: { "auth-token": token },
          }
        );
        setOrderHistory(ordersRes.data.orders);
      } catch (error) {
        toast.error("Failed to fetch user or order details");
      }
    };

    fetchUserAndOrders();
  }, [token]);

  // If the cart is empty, show a message indicating that there are no items in the cart
  // If the user is not logged in (no token), show an access denied message
  if (!token) {
    return (
      <div
        className="text-center mt-5 fw-semibold fs-4 alert alert-danger shadow-lg mx-auto"
        style={{
          maxWidth: "500px",
          borderRadius: "1rem",
          animation: "fadeIn 1s ease-in-out",
        }}
      >
        <span style={{ color: "#8B0000" }}>Access Denied:</span> Please{" "}
        <strong>Login First</strong> to view your cart and order history.
      </div>
    );
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4 text-center text-primary">🛒 Your Cart</h2>

      {cartItems.length === 0 ? (
        <div className="alert alert-info text-center">No items in cart.</div>
      ) : (
        <>
          <div className="table-responsive mb-4">
            <table className="table table-hover align-middle text-center border rounded shadow-sm">
              <thead className="table-dark">
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="rounded"
                        width="60"
                        height="60"
                      />
                    </td>
                    <td>{item.name}</td>
                    <td>
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => decrementQty(item._id)}
                          disabled={item.quantity <= 1}
                        >
                          <i className="bi bi-dash"></i>
                        </button>
                        <span className="px-3">{item.quantity}</span>
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => incrementQty(item._id)}
                        >
                          <i className="bi bi-plus"></i>
                        </button>
                      </div>
                    </td>
                    <td>₹{item.price * item.quantity}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteItem(item._id)}
                      >
                        <i className="bi bi-trash me-1"></i>Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h4 className="card-title text-success">💰 Total Amount</h4>
              <h5 className="mb-4">₹{total}</h5>
              <div className="d-flex flex-wrap gap-3">
                <button
                  className="btn btn-success px-4"
                  onClick={() => navigate("/CheckOut")}
                >
                  Checkout
                </button>
                <button
                  className="btn btn-outline-primary px-4"
                  onClick={() => navigate("/allproducts")}
                >
                  Shop More
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="card shadow-sm mt-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Your Order History</h5>
          {orderHistory.length === 0 ? (
            <p className="text-muted">No previous orders found.</p>
          ) : (
            <div style={{ maxHeight: "250px", overflowY: "auto" }}>
              <ul className="list-group list-group-flush">
                {orderHistory.map((order) => (
                  <li key={order._id} className="list-group-item">
                    <div className="fw-bold mb-1">
                      Order ID: <span className="text-muted">{order._id}</span>
                    </div>
                    <div className="small text-muted">
                      <strong>Date:</strong>{" "}
                      {new Date(order.createdAt).toLocaleString()}
                    </div>
                    <div className="small text-muted">
                      <strong>Payment:</strong>{" "}
                      {order.paymentMethod
                        ? order.paymentMethod.toUpperCase()
                        : "N/A"}
                    </div>
                    <div className="small text-muted mb-2">
                      <strong>Status:</strong> {order.status || "Processing"}
                    </div>

                    <div className="mb-2">
                      {order.items &&
                        order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="d-flex align-items-center mb-2"
                          >
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  objectFit: "cover",
                                  marginRight: "10px",
                                  borderRadius: "5px",
                                }}
                              />
                            ) : (
                              <div
                                className="bg-secondary"
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  marginRight: "10px",
                                  borderRadius: "5px",
                                }}
                              ></div>
                            )}
                            <div className="small flex-grow-1">
                              {item.name} × {item.quantity} – ₹
                              {item.price * item.quantity}
                            </div>
                          </div>
                        ))}
                    </div>
                    <div className="small text-muted">
                      <strong>Address:</strong>{" "}
                      {order.address || "No address available"}
                    </div>
                    <div className="fw-semibold">
                      Total: ₹{order.totalAmount}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
