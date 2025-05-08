import React, { useState, useEffect } from "react";
import "./Product.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import { Spiral } from "ldrs/react";
import "ldrs/react/Spiral.css";

export default function Womens() {
  const color_text = "rgb(235 212 131)";
  const color_all = "#dfc18f";

  // Custom hook to manage cart operations
  // useCart is a custom hook that provides cart-related functions and state
  // addToCart is a function that adds a product to the cart
  // If you want to check the functonality you can check from CartContext component
  const { addToCart } = useCart();

  // State used to store the products data from the server
  const [products, setproducts] = useState([]);

  // Fetch products from the API
  // This function fetches the product data from the API and sets it to the state
  useEffect(() => {
    const fetch_data = async () => {
      try {
        // Get request to fetch all the product from the Server
        const res = await axios.get("http://127.0.0.1:5000/api/product/womens");
        setproducts(res.data);
        // console.log(res.data);
        // console.log(res);
      } catch (error) {
        // console.log(error);
        // alert("Error fetching data from server");
        toast.error("Error fetching data from server");
      }
    };
    fetch_data();
  }, []);

  const navigate = useNavigate();

  // Function is used to add the product to the cart and check if the user is logged in or not
  const handleAddToCart = (product) => {
    const token = localStorage.getItem("TOKEN");
    if (!token) {
      toast.warn("Please login to add items to cart");
      navigate("/login");
    } else {
      addToCart(product);
      toast.success("Added to cart successfully!");
    }
  };

  return (
    <>
      <div className="container mt-4">
        <h2 className="text-center mb-3">🛍️ Women's Products</h2>
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
