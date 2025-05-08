import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import { Spiral } from "ldrs/react";
import "ldrs/react/Spiral.css";

export default function All_product() {

  // State used to store the products data from the server
  const [products, setproducts] = useState([]);

  const navigate = useNavigate();

  // Custom hook to manage cart operations
  // useCart is a custom hook that provides cart-related functions and state
  // addToCart is a function that adds a product to the cart
  // If you want to check the functonality you can check from CartContext component
  const { addToCart } = useCart();

  useEffect(() => {

    const fetch_data = async () => {
      try {

        // Get request to fetch all the product from the Server
        const res = await axios.get(
          "http://127.0.0.1:5000/api/product/allproducts"
        );

        // Storing the products date to the setproducts
        setproducts(res.data);
      } catch (error) {
        toast.error("Error fetching data from server");
      }
    };
    fetch_data();
  }, []);

  // Function is used to add the product to the cart and check if the user is logged in or not
  const handleAddToCart = (product) => {

    // Check if the user is logged in by checking for a token in local storage
    const token = localStorage.getItem("TOKEN");

    // If the token is not present, redirect the user to the login page and show a warning message
    if (!token) {
      toast.warn("Please login to add items to cart");
      navigate("/login");
    } else {
      
      // If the token is present, add the product to the cart and show a success message
      addToCart(product);
      toast.success("Added to cart successfully!");
    }
  };

  return (
    <>
      <div className="container mt-4">
        <h2 className="text-center mb-3">🛍️ All Products</h2>
        <div className="row g-3">
          {products && products.length > 0 ? (
            products.map((product) => (
              <div className="col-sm-6 col-md-4 col-lg-3" key={product._id}>
                <div
                  className="card h-100 border-0"
                  style={{
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                >
                  <img
                    src={product.image}
                    className="card-img-top"
                    alt={product.name}
                    style={{
                      height: "180px",
                      objectFit: "cover",
                      cursor: "pointer",
                    }}
                    onClick={() => navigate(`/item/${product._id}`)}
                  />
                  <div className="card-body p-2 d-flex flex-column text-center">
                    <h6
                      className="card-title text-truncate mb-1"
                      title={product.name}
                    >
                      {product.name}
                    </h6>
                    <p className="card-text text-success fw-semibold mb-2">
                      ₹{product.price}
                    </p>
                    <button
                      className="btn btn-warning btn-sm mt-auto"
                      onClick={() => handleAddToCart(product)}
                    >
                      <i className="bi bi-cart-plus me-1"></i> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div
              className="d-flex justify-content-center align-items-center w-100"
              style={{ minHeight: "200px" }}
            >
              <Spiral size="40" speed="0.9" color="black" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
