import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./OrderHistory.css";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const token = localStorage.getItem("TOKEN");

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const { data } = await axios.get(
          "http://127.0.0.1:5000/api/order/history",
          { headers: { "auth-token": token } }
        );
        setOrders(data.orders || []);
        setFiltered(data.orders || []);
      } catch {
        toast.error("Failed to fetch order history");
      }
    })();
  }, [token]);

  const applyFilter = () => {
    const s = startDate ? new Date(startDate) : null;
    const e = endDate ? new Date(endDate) : null;
    setFiltered(
      orders.filter((o) => {
        const d = new Date(o.createdAt);
        return (!s || d >= s) && (!e || d <= e);
      })
    );
  };

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
        Please <strong>Login First</strong> to view order history.
      </div>
    );
  }

  return (
    <div className="container my-4">
      <h2 className="text-center mb-4 fw-bold">
        <span className="me-2">📦</span>Your Order History
      </h2>
      
      {/* Enhanced Date Filter Section */}
      <div className="filter-section p-4 rounded-4 shadow mb-5 bg-light bg-gradient border">
        <div className="row g-3 align-items-end">
          <div className="col-sm-4">
            <label className="form-label fw-semibold">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="form-control shadow-sm border border-1"
            />
          </div>
          <div className="col-sm-4">
            <label className="form-label fw-semibold">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="form-control shadow-sm border border-1"
            />
          </div>
          <div className="col-sm-4 d-grid">
            <button
            style={{
        background: "linear-gradient(to right, #294948 0%, #03070A 100%)",
        color: "white",
      }}
              className="btn btn-primary fw-semibold shadow-sm btn-lg"
              onClick={applyFilter}
            >
              <i className="bi bi-funnel me-2"></i>Filter Orders
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="alert alert-info text-center shadow-sm rounded-3 border border-info">
          <i className="bi bi-info-circle me-2"></i>
          No orders found for the selected period.
        </div>
      ) : (
        <div className="row g-4">
          {filtered.map((order) => (
            <div key={order._id} className="col-12 col-md-6">
              <div className="card order-box h-100 border-0 rounded-4 shadow hover-shadow">
                <div style={{
        background: "linear-gradient(to right, #294948 0%, #03070A 100%)",
        color: "white",
      }} 
                className="card-header text-white py-3 px-4 rounded-top-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">
                      Order ID: <span className="fw-bold">{order._id}</span>
                    </h6>
                    <small className="opacity-75">
                      {new Date(order.createdAt).toLocaleString()}
                    </small>
                  </div>
                </div>
                
                <div className="card-body">
                  <div className="mb-4">
                    {order.items.map((itm, idx) => (
                      <div
                        key={idx}
                        className="d-flex align-items-center mb-3 p-2 bg-light rounded-3"
                      >
                        <img
                          src={itm.image}
                          alt={itm.name}
                          className="rounded-3 me-3 shadow-sm"
                          style={{ width: 48, height: 48, objectFit: "cover" }}
                        />
                        <div className="flex-grow-1">
                          <div className="fw-medium">{itm.name}</div>
                          <small className="text-muted">Qty: {itm.quantity}</small>
                        </div>
                        <div className="fw-semibold">
                          ₹{itm.price * itm.quantity}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <hr className="my-3" />
                  
                  <p className="small mb-1">
                    <i className="bi bi-geo-alt me-1"></i>
                    <strong>Address:</strong> {order.address || "N/A"}
                  </p>
                  
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div>
                      <span className={`badge ${
                        order.status === "Delivered" ? "bg-success" :
                        order.status === "Shipped" ? "bg-info" :
                        order.status === "Processing" ? "bg-warning" :
                        "bg-secondary"
                      } rounded-pill px-3 py-2 me-2`}>
                        {order.status}
                      </span>
                      
                      <span className={`badge ${
                        order.paymentMethod?.toLowerCase() === "card" ? "bg-primary" :
                        order.paymentMethod?.toLowerCase() === "upi" ? "bg-info text-dark" :
                        order.paymentMethod?.toLowerCase() === "cod" ? "bg-warning text-dark" :
                        "bg-secondary"
                      } rounded-pill px-3 py-2`}>
                        {order.paymentMethod?.toUpperCase() || "N/A"}
                      </span>
                    </div>
                    
                    <span className="fw-bold fs-4 text-success">
                      ₹{order.totalAmount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}