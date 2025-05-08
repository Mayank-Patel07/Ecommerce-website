import React from "react";
import { useNavigate } from "react-router-dom";

const ThankYou = () => {
  
  // useNavigate hook to programmatically navigate to different routes
  const navigate = useNavigate();

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100 text-center">
      <div className="card shadow-lg border-0 p-5" style={{ maxWidth: "600px" }}>
        <div className="card-body">
          <div className="mb-4">
            <i className="bi bi-check-circle-fill text-success display-1"></i>
          </div>
          <h1 className="card-title display-5 fw-bold mb-3">Thank You!</h1>
          <p className="card-text fs-5 text-muted mb-4">
            Your order has been placed successfully.
          </p>
          <button
            className="btn btn-outline-primary btn-lg px-4"
            onClick={() => navigate("/allproducts")}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
