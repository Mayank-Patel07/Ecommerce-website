import React, { useState, useEffect } from "react";
import "./Product.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import { Spiral } from "ldrs/react";
import "ldrs/react/Spiral.css";

export default function Womens() {
  // State variables
  // These variables are used to manage the state of the component
  // products: Array of products fetched from the server
  const [products, setProducts] = useState([]);

  // searchTerm: The term used to filter products based on name and brand
  const [searchTerm, setSearchTerm] = useState("");

  // currentPage: The current page number for pagination
  const [currentPage, setCurrentPage] = useState(1);
  
  // loading: A boolean indicating whether the data is being fetched
  // It is set to true when the data is being fetched and false when the data is loaded
  // This is used to show a loading spinner while the data is being fetched
  const [loading, setLoading] = useState(true);

  // Constants
  // These constants are used to define the number of products per page
  const PRODUCTS_PER_PAGE = 8;

  // Hooks
  // useCart: A custom hook that provides the addToCart function    
  // This function is used to add products to the cart
  const { addToCart } = useCart();

  // useNavigate: A hook from react-router-dom that allows navigation to different routes
  // This is used to navigate to the login page if the user is not logged in
  const navigate = useNavigate();

  // useEffect: A hook that runs when the component mounts
  // It fetches the product data from the server and sets it to the products state
  // The empty dependency array [] means this effect runs only once when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://127.0.0.1:5000/api/product/womens");
        setProducts(res.data || []);
      } catch (error) {
        toast.error("Error fetching data from server");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Function to handle adding a product to the cart
  // This function checks if the user is logged in by checking for a token in localStorage
  // If the token is not present, it shows a warning message and navigates to the login page
  // If the token is present, it calls the addToCart function to add the product to the cart
  // It also shows a success message after adding the product to the cart
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

  // Function to handle search input change
  // This function updates the searchTerm state with the value entered in the search input
  // It also resets the currentPage to 1 to show the first page of results
  // This is used to filter the products based on the search term
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Filter products based on the search term
  // This function filters the products array based on the searchTerm
  // It checks if the name, brand, or category of the product includes the search term (case insensitive)
  // The filtered products are then used for pagination and display
  const filteredProducts = products.filter((product) =>
    // Check if the product name, brand, or category includes the search term
    // The toLowerCase() method is used to make the search case insensitive
    [product.name, product.brand, product.category].some((field) =>
      field?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Calculate total pages for pagination
  // This function calculates the total number of pages based on the number of filtered products and the number of products per page
  // It uses the Math.ceil() method to round up the total number of pages
  // The displayedProducts array contains the products for the current page
  // The slice() method is used to get the products for the current page based on the currentPage state
  // The displayedProducts array is then used to display the products on the current page
  // The totalPages variable contains the total number of pages
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  // Function to handle next page button click
  // This function increments the currentPage state by 1 if it is less than the total number of pages   
  // This is used to navigate to the next page of products
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  // Function to handle previous page button click
  // This function decrements the currentPage state by 1 if it is greater than 1  
  // This is used to navigate to the previous page of products
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-3">👗 Women's Products</h2>

      <div className="mb-4 text-center">
        <input
          type="text"
          className="form-control w-50 mx-auto"
          placeholder="Search by name or brand..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="row g-3">
        {!loading && displayedProducts.length > 0 ? (
          displayedProducts.map((product) => (
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
        ) : loading ? (
          <div
            className="d-flex justify-content-center align-items-center w-100"
            style={{ minHeight: "300px" }}
          >
            <Spiral size="40" speed="0.9" color="black" />
          </div>
        ) : (
          <div
            className="text-center w-100 text-muted fw-semibold py-5"
            style={{ fontSize: "1.2rem" }}
          >
            😕 No products found.
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {!loading && filteredProducts.length > 0 && (
        <div className="d-flex justify-content-center mt-4 mb-5">
          <button
            className="btn btn-outline-primary me-3 px-4 py-2 rounded-pill"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            <i className="bi bi-arrow-left"></i> Previous
          </button>
          <span className="align-self-center fw-semibold">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn-outline-primary ms-3 px-4 py-2 rounded-pill"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next <i className="bi bi-arrow-right"></i>
          </button>
        </div>
      )}
    </div>
  );
}
