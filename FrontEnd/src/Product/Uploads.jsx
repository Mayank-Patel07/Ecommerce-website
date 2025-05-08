import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Uploads() {
  const navigate = useNavigate();

  // State to hold product details
  const [products, setProducts] = useState({
    name: "",
    brand: "",
    image: "",
    price: "",
    category: "",
    description: "",
  });

  // State to hold Errors
  const [errors, setErrors] = useState({});

  // Functions to upload base64 image
  const updateImage = async (event) => {
    const imageFile = event.target.files[0];
    const base64Image = await convertBase64String(imageFile);
    setProducts({ ...products, image: base64Image });
  };

  const convertBase64String = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Function is used to type in the input fields
  const update = (e) => {
    const { name, value } = e.target;
    setProducts({ ...products, [name]: value });
  };

  // Function to validate the form data
  const validate = () => {
    const newErrors = {};
    if (!products.name.trim()) newErrors.name = "Product name is required";
    if (!products.brand.trim()) newErrors.brand = "Brand name is required";
    if (!products.image) newErrors.image = "Product image is required";
    if (!products.price || products.price <= 0)
      newErrors.price = "Valid product price is required";
    if (!products.category) newErrors.category = "Category is required";
    if (!products.description.trim())
      newErrors.description = "Product description is required";
    return newErrors;
  };

  // Function to submit the form data
  // It checks if the user is logged in or not
  const dataSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      // If the user is not logged in, it redirects to the login page
      const token = localStorage.getItem("TOKEN");
      if (!token) {
        toast.warn("Please login to add items to cart");
        navigate("/login");
      } else {
        toast.success("Added to cart successfully!");
        try {
          //  Uploads the product data to the server
          // If the product is uploaded successfully, it redirects to the all products page
          await axios.post(
            "http://127.0.0.1:5000/api/product/uploads",
            products,
            {
              headers: { "auth-token": token },
            }
          );
          toast.success("Product uploaded successfully!");
          navigate("/allproducts");
        } catch (error) {
          toast.error("Error uploading product");
        }
      }
    }
  };

  const token = localStorage.getItem("TOKEN");

  return (
    <>
      {token ? (
        <div className="container mt-4">
          <div className="alert alert-warning text-center fs-5 fw-semibold">
            📦 Upload a New Product to List on Website
          </div>

          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="card shadow-lg p-4 rounded-4">
                <h4 className="mb-4 text-center text-dark">
                  📝 New Product Form
                </h4>
                <form onSubmit={dataSubmit} noValidate>
                  <div className="mb-3">
                    <label className="form-label">Product Name</label>
                    <input
                      type="text"
                      name="name"
                      value={products.name}
                      onChange={update}
                      className="form-control"
                      placeholder="Enter product name"
                    />
                    {errors.name && (
                      <small className="text-danger">{errors.name}</small>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Brand</label>
                    <input
                      type="text"
                      name="brand"
                      value={products.brand}
                      onChange={update}
                      className="form-control"
                      placeholder="Enter brand"
                    />
                    {errors.brand && (
                      <small className="text-danger">{errors.brand}</small>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Product Image</label>
                    <input
                      type="file"
                      name="image"
                      className="form-control"
                      onChange={updateImage}
                    />
                    {errors.image && (
                      <small className="text-danger">{errors.image}</small>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Price (₹)</label>
                    <input
                      type="number"
                      name="price"
                      value={products.price}
                      onChange={update}
                      min="1"
                      className="form-control"
                      placeholder="Enter price"
                    />
                    {errors.price && (
                      <small className="text-danger">{errors.price}</small>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      name="category"
                      value={products.category}
                      onChange={update}
                    >
                      <option value="">Choose category</option>
                      <option value="male">Men's</option>
                      <option value="female">Women's</option>
                      <option value="kids">Kids</option>
                    </select>
                    {errors.category && (
                      <small className="text-danger">{errors.category}</small>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Product Description</label>
                    <textarea
                      name="description"
                      value={products.description}
                      onChange={update}
                      className="form-control"
                      rows="4"
                      placeholder="Enter product description"
                    ></textarea>
                    {errors.description && (
                      <small className="text-danger">
                        {errors.description}
                      </small>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success w-100 fw-bold"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(65,117,111,1) 26%, rgba(15,27,29,1) 100%)",
                    }}
                  >
                    Submit Product
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="text-center mt-5 fw-semibold fs-4 alert alert-danger shadow-lg mx-auto"
          style={{
            maxWidth: "500px",
            borderRadius: "1rem",
            animation: "fadeIn 1s ease-in-out",
          }}
        >
          <span style={{ color: "#8B0000" }}>Access Denied:</span> Please{" "}
          <strong>Login First</strong> to upload a product.
        </div>
      )}
    </>
  );
}
