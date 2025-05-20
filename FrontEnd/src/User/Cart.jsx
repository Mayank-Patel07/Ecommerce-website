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
        className="text-center mt-4 fw-semibold fs-5 alert alert-danger shadow mx-auto border-start border-danger border-4"
        style={{
          maxWidth: "450px",
          borderRadius: "0.75rem",
          animation: "fadeIn 1s ease-in-out",
          background: "linear-gradient(to right, #fff5f5, #fff)",
        }}
      >
        <span style={{ color: "#8B0000" }}>
          <i className="bi bi-exclamation-triangle-fill me-2"></i>Access Denied:
        </span>{" "}
        Please <strong>Login First</strong> to view your cart.
      </div>
    );
  }
  return (
    <div className="container my-4">
      <h2
        className="mb-3 text-center  fw-bold"
        style={{ fontSize: "1.8rem" }}
      >
        <i
          className="bi bi-cart4 me-2 text-muted"
          style={{ fontSize: "1.9rem" }}
        ></i>
        Your Cart
      </h2>
      {cartItems.length === 0 ? (
        <div className="alert alert-info text-center p-3 rounded-3 shadow-sm border border-info">
          <i className="bi bi-cart-x fs-3 mb-2 d-block text-info-emphasis"></i>
          <p className="fw-medium mb-0" style={{ fontSize: "0.95rem" }}>
            No items in your cart yet. Ready to start shopping?
          </p>
          <button
            className="btn btn-info mt-2 px-3 py-1 text-white"
            onClick={() => navigate("/allproducts")}
            style={{ fontSize: "0.9rem" }}
          >
            <i className="bi bi-basket me-1"></i>Browse Products
          </button>
        </div>
      ) : (
        <>
          <div className="table-responsive mb-3 shadow-sm rounded-3 overflow-hidden">
            <table className="table table-hover align-middle text-center mb-0">
              <thead
                className="table-dark"
                style={{
                  background: "linear-gradient(45deg, #2c3e50, #3498db)",
                }}
              >
                <tr>
                  <th className="py-2">Image</th>
                  <th className="py-2">Name</th>
                  <th className="py-2">Quantity</th>
                  <th className="py-2">Price</th>
                  <th className="py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr
                    key={item._id}
                    className="border-bottom"
                    style={{ transition: "all 0.2s" }}
                  >
                    <td className="py-2">
                      <div
                        className="p-1 rounded-3 bg-light d-inline-flex align-items-center justify-content-center"
                        style={{ width: "55px", height: "55px" }}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="rounded-3 shadow-sm"
                          style={{
                            width: "48px",
                            height: "48px",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    </td>
                    <td className="fw-medium text-dark">{item.name}</td>
                    <td>
                      <div
                        className="btn-group shadow-sm rounded-pill overflow-hidden"
                        role="group"
                        style={{ transform: "scale(0.9)" }}
                      >
                        <button
                          className="btn btn-light px-2"
                          onClick={() => decrementQty(item._id)}
                          disabled={item.quantity <= 1}
                          style={{ borderRight: "1px solid #e0e0e0" }}
                        >
                          <i className="bi bi-dash"></i>
                        </button>
                        <span
                          className="d-flex align-items-center justify-content-center px-2 bg-white"
                          style={{ minWidth: "32px" }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          className="btn btn-light px-2"
                          onClick={() => incrementQty(item._id)}
                          style={{ borderLeft: "1px solid #e0e0e0" }}
                        >
                          <i className="bi bi-plus"></i>
                        </button>
                      </div>
                    </td>
                    <td className="fw-semibold text-success">
                      ₹{item.price * item.quantity}
                    </td>
                    <td>
                      <button
                        className="btn btn-outline-danger btn-sm rounded-pill px-2"
                        onClick={() => deleteItem(item._id)}
                        style={{ fontSize: "0.8rem" }}
                      >
                        <i className="bi bi-trash me-1"></i>Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div
            className="card shadow-sm rounded-3 border-0 mb-3 bg-gradient"
            style={{
              background: "linear-gradient(to right, #f8f9fa, #e9ecef)",
            }}
          >
            <div className="card-body p-3">
              <div className="row align-items-center">
                <div className="col-md-6 mb-2 mb-md-0">
                  <h4
                    className="card-title text-success mb-1 fw-bold"
                    style={{ fontSize: "1.2rem" }}
                  >
                    <i className="bi bi-cash-coin me-2"></i>Total Amount
                  </h4>
                  <h5 className="mb-0 fs-4 fw-bold">₹{total}</h5>
                </div>
                <div className="col-md-6">
                  <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                    <button
                      className="btn btn-success px-3 py-1 rounded-pill shadow-sm"
                      onClick={() => navigate("/CheckOut")}
                      style={{
                        background: "linear-gradient(45deg, #2ecc71, #27ae60)",
                      }}
                    >
                      <i className="bi bi-credit-card me-1"></i>Checkout
                    </button>
                    <button
                      className="btn btn-outline-primary px-3 py-1 rounded-pill shadow-sm"
                      onClick={() => navigate("/allproducts")}
                    >
                      <i className="bi bi-bag-plus me-1"></i>Shop More
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {/* <div className="card shadow-sm mt-4 rounded-4 border-0">
        <div className="card-header bg-light py-3">
          <h5 className="card-title mb-0 fw-bold">
            <i className="bi bi-clock-history me-2"></i>Your Order History
          </h5>
        </div>
        <div className="card-body">
          {orderHistory.length === 0 ? (
            <div className="text-center p-4">
              <i className="bi bi-inbox fs-1 text-muted mb-3 d-block"></i>
              <p className="text-muted">No previous orders found.</p>
            </div>
          ) : (
            <div style={{ maxHeight: "350px", overflowY: "auto" }} className="custom-scrollbar">
              <ul className="list-group list-group-flush">
                {orderHistory.map((order) => (
                  <li key={order._id} className="list-group-item p-4 mb-3 border rounded-4 shadow-sm">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="fw-bold">
                        <span className="badge bg-secondary me-2">Order ID</span>
                        <span className="text-muted">{order._id}</span>
                      </div>
                      <div className="badge bg-primary rounded-pill">
                        {order.status || "Processing"}
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-6 mb-2 mb-md-0">
                        <div className="small text-muted">
                          <i className="bi bi-calendar3 me-1"></i>
                          <strong>Date:</strong>{" "}
                          {new Date(order.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="small text-muted">
                          <i className="bi bi-credit-card me-1"></i>
                          <strong>Payment:</strong>{" "}
                          {order.paymentMethod
                            ? order.paymentMethod.toUpperCase()
                            : "N/A"}
                        </div>
                      </div>
                    </div>
                    <div className="bg-light p-3 rounded-3 mb-3">
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
                                  width: "50px",
                                  height: "50px",
                                  objectFit: "cover",
                                  marginRight: "15px",
                                  borderRadius: "8px",
                                }}
                                className="shadow-sm"
                              />
                            ) : (
                              <div
                                className="bg-secondary"
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  marginRight: "15px",
                                  borderRadius: "8px",
                                }}
                              ></div>
                            )}
                            <div className="flex-grow-1">
                              <div className="fw-medium">{item.name}</div>
                              <div className="small text-muted">
                                Qty: {item.quantity} × ₹{item.price}
                              </div>
                            </div>
                            <div className="fw-semibold">
                              ₹{item.price * item.quantity}
                            </div>
                          </div>
                        ))}
                    </div>
                    <div className="small text-muted mb-3">
                      <i className="bi bi-geo-alt me-1"></i>
                      <strong>Address:</strong>{" "}
                      {order.address || "No address available"}
                    </div>
                    <div className="d-flex justify-content-end">
                      <div className="fw-bold fs-5 text-success">
                        Total: ₹{order.totalAmount}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div> */}
    </div>
  );
}
