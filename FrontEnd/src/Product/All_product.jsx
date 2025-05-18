import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import { Spiral } from "ldrs/react";
import "ldrs/react/Spiral.css";

export default function All_product() {
  // State variables
  // These variables are used to manage the state of the component
  const [products, setProducts] = useState([]);

  // currentPage: The current page number for pagination
  const [currentPage, setCurrentPage] = useState(1);

  // loading: A boolean indicating whether the data is being fetched
  // It is set to true when the data is being fetched and false when the data is loaded
  // This is used to show a loading spinner while the data is being fetched
  const [loading, setLoading] = useState(true);

  // totalPages: The total number of pages based on the filtered products
  const [totalPages, setTotalPages] = useState(1);

  // Constants
  // These constants are used to define the number of products per page
  const PRODUCTS_PER_PAGE = 8;

  // searchTerm: The term used to filter products based on name and brand
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Function to handle search input change
  // This function updates the searchTerm state and resets the currentPage to 1
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to page 1 on search
  };

  // Filter products based on search term
  // This function filters the products array based on the search term
  // It checks if the search term is included in the product name, brand, or category
  const filteredProducts = products.filter((product) =>
    [product.name, product.brand, product.category].some((field) =>
      field?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  useEffect(() => {
    const fetch_data = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://127.0.0.1:5000/api/product/allproducts`,
          {
            params: {
              page: currentPage,
              limit: PRODUCTS_PER_PAGE,
            },
          }
        );
        setProducts(res.data.products || []);
        setTotalPages(res.data.totalPages || 1);
      } catch (error) {
        toast.error("Error fetching data from server");
      } finally {
        setLoading(false);
      }
    };
    fetch_data();
  }, [currentPage]);

  // Function to handle adding a product to the cart
  // This function checks if the user is logged in by checking for a token in localStorage
  // If the token is not present, it shows a warning message and navigates to the login page
  // If the token is present, it calls the addToCart function to add the product to the cart
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

  // Function to handle next page button click
  // This function increments the currentPage state by 1 if it is less than totalPages
  // It is used to navigate to the next page of products
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  // Function to handle previous page button click
  // This function decrements the currentPage state by 1 if it is greater than 1
  // It is used to navigate to the previous page of products
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="container mt-4 px-md-5">
      <h2 className="text-center mb-4">🛍️ All Products</h2>

      <div className="mb-4 text-center">
        <input
          type="text"
          className="form-control mx-auto shadow-sm"
          style={{ maxWidth: "450px", borderRadius: "30px" }}
          placeholder="🔍 Search by name or brand..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {loading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "300px" }}
        >
          <Spiral size="40" speed="0.9" color="black" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div
          className="text-center fw-semibold fs-5"
          style={{ minHeight: "300px" }}
        >
          😕 No products found.
        </div>
      ) : (
        <div className="row g-3">
          {filteredProducts.map((product) => (
            <div className="col-sm-6 col-md-4 col-lg-3" key={product._id}>
              <div
                className="card h-100 border-0"
                style={{
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
              >
                <div className="position-relative overflow-hidden rounded-top">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="card-img-top"
                    style={{
                      height: "180px",
                      objectFit: "cover",
                      transition: "transform 0.3s ease",
                      cursor: "pointer",
                    }}
                    onClick={() => navigate(`/item/${product._id}`)}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.transform = "scale(1.05)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
                  />
                </div>
                <div className="card-body d-flex flex-column text-center p-3">
                  <h6
                    className="card-title text-truncate mb-1 fw-semibold"
                    title={product.name}
                  >
                    {product.name}
                  </h6>
                  <p className="text-success fw-bold mb-2">₹{product.price}</p>
                  <button
                    className="btn btn-warning btn-sm rounded-pill mt-auto"
                    onClick={() => handleAddToCart(product)}
                  >
                    <i className="bi bi-cart-plus me-1"></i> Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
