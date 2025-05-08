import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";

export default function Selected_product() {
  // Get the product ID from the URL parameters and initialize the navigate function for navigation
  const { id } = useParams();
  const navigate = useNavigate();

  // Custom hook to manage cart operations
  // useCart is a custom hook that provides cart-related functions and state
  // addToCart is a function that adds a product to the cart
  // If you want to check the functonality you can check from CartContext component
  const { addToCart } = useCart();

  // State to hold product details
  // useState is a React hook that allows you to add state to functional components
  // product is an object that holds the details of the selected product
  const [product, setProduct] = useState({
    name: "",
    image: "",
    price: "",
    description: "",
    category: "",
    brand: "",
  });

  // Function to fetch product details from the server using the product ID.
  // The function fetchProduct is an asynchronous function that fetches product details from the server using the product ID
  // The function uses the axios library to make a GET request to the server and retrieve the product details
  // The function also handles errors that may occur during the request and displays an error message using the toast library
  // The function is called inside a useEffect hook to fetch the product details when the component mounts

  const fetchProduct = async () => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:5000/api/product/item/${id}`
      );
      setProduct(res.data);
    } catch (err) {
      // console.error("Failed to fetch product:", err);
      toast.error("Error loading product");
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  // Function to handle adding the product to the cart
  // The function checks if the user is logged in by checking for a token in local storage
  // If the token is not present, it shows a warning message and redirects the user to the login page
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
    <div className="container mt-4">
      <div className="alert alert-warning text-center fs-5 fw-semibold">
        🛒 Your Selected Product
      </div>

      <div className="card shadow-sm p-3">
        <div className="row g-0">
          <div className="col-md-5">
            <img
              src={product.image}
              className="img-fluid rounded-start"
              alt={product.name}
              style={{ objectFit: "cover", height: "100%", width: "100%" }}
            />
          </div>
          <div className="col-md-7 d-flex flex-column">
            <div className="card-body">
              <h5 className="card-title mb-2">
                Name: <strong>{product.name}</strong>
              </h5>
              <p className="card-text mb-1">
                Brand: <strong>{product.brand || "N/A"}</strong>
              </p>
              <p className="card-text mb-1">
                Category: <strong>{product.category}</strong>
              </p>
              <p className="card-text mb-2 text-success fw-semibold fs-5">
                ₹{product.price}
              </p>
              <button
                className="btn btn-warning fw-bold"
                onClick={() => handleAddToCart(product)}
              >
                <i className="bi bi-cart-plus me-2"></i>Add to Cart
              </button>
              <hr />
              <p className="card-text mt-3">
                <strong>Description:</strong> <br />
                {product.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
