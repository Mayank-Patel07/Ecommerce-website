import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Uploads() {
  // State variables
  // These variables are used to manage the state of the component
  const navigate = useNavigate();

  // token: The authentication token stored in localStorage
  const token = localStorage.getItem("TOKEN");

  // user: The user object fetched from the server
  // This object contains user details like email, name, etc.
  const [user, setUser] = useState(null);

  // products: An object containing product details like name, brand, image, price, category, and description
  // This object is used to store the product details entered by the user in the form
  const [products, setProducts] = useState({
    name: "",
    brand: "",
    image: "",
    price: "",
    category: "",
    description: "",
  });

  // errors: An object containing validation errors for the product form
  // This object is used to store the error messages for each field in the form
  const [errors, setErrors] = useState({});

  // allProducts: An array of all products fetched from the server
  // This array is used to display all the uploaded products in the UI
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // useEffect: A hook that runs when the component mounts
  // It fetches the product data from the server and sets it to the products state
  // The empty dependency array [] means this effect runs only once when the component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          "http://127.0.0.1:5000/api/product/allproducts"
        );
        setAllProducts(res.data.products);
        if (token) {
          const { data } = await axios.get(
            "http://127.0.0.1:5000/api/user/details",
            {
              headers: { "auth-token": token },
            }
          );
          setUser(data);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Function to handle image upload
  // This function converts the uploaded image file to a base64 string
  const updateImage = async (event) => {
    const imageFile = event.target.files[0];
    const base64Image = await convertBase64String(imageFile);
    setProducts({ ...products, image: base64Image });
  };

  // Function to convert a file to a base64 string
  // This function uses the FileReader API to read the file as a data URL
  const convertBase64String = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  // Function to handle input changes
  // This function updates the products state with the value entered in the input fields
  // It uses the name attribute of the input field to update the corresponding property in the products object
  const update = (e) => {
    const { name, value } = e.target;
    setProducts({ ...products, [name]: value });
  };

  // Function to validate the product form
  // This function checks if all required fields are filled and returns an object with error messages
  // If there are no errors, it returns an empty object
  // This function is called when the user submits the form
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

  const dataSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      if (!token) {
        toast.warn("Please login to upload products");
        navigate("/login");
      } else {
        try {
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

  // Function to delete a product by ID
  // This function is called when the user clicks the delete button for a product
  const deleteProductById = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await axios.delete(`http://127.0.0.1:5000/api/product/item/${id}`, {
        headers: { "auth-token": token },
      });
      toast.success("Product deleted");
      setAllProducts(allProducts.filter((p) => p._id !== id));
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <>
      {token && user?.email === import.meta.env.VITE_API_MAIL ? (
        <div className="container my-5">
          {/* Header */}
          <div className="alert alert-primary text-center fs-5 fw-semibold rounded-4 shadow-sm">
            🧾 All Uploaded Products
          </div>

          {/* Products Grid */}
          <div className="row g-4">
            {allProducts.map((product) => (
              <div key={product._id} className="col-sm-6 col-md-4 col-lg-3">
                <div className="card h-100 shadow-sm border-0 rounded-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="card-img-top rounded-top-4"
                    style={{ height: "180px", objectFit: "cover" }}
                  />
                  <div className="card-body p-3 d-flex flex-column">
                    <h6
                      className="card-title text-truncate"
                      title={product.name}
                    >
                      {product.name}
                    </h6>
                    <p className="mb-1 small">
                      <strong>Brand:</strong> {product.brand}
                    </p>
                    <p className="mb-1 small">
                      <strong>Price:</strong> ₹{product.price}
                    </p>
                    <p className="mb-2 small">
                      <strong>Category:</strong> {product.category}
                    </p>
                    {!loading && (
                      <button
                        className="btn btn-sm btn-outline-danger mt-auto"
                        onClick={() => deleteProductById(product._id)}
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Upload Section */}
          <div className="alert alert-success text-center fs-5 fw-semibold mt-5 rounded-4 shadow-sm">
            📦 Upload a New Product
          </div>

          <div className="row justify-content-center mb-5">
            <div className="col-md-6 col-lg-5">
              <div className="card shadow-lg p-4 rounded-4 border-0">
                <h5 className="mb-4 text-center text-dark fw-bold">
                  📝 Upload New Product
                </h5>
                <form onSubmit={dataSubmit} noValidate>
                  {["name", "brand", "price", "description"].map((field) => (
                    <div className="mb-3" key={field}>
                      <label className="form-label text-capitalize">
                        {field}
                      </label>
                      {field === "description" ? (
                        <textarea
                          name={field}
                          value={products[field]}
                          onChange={update}
                          className="form-control"
                          rows="2"
                        />
                      ) : (
                        <input
                          type={field === "price" ? "number" : "text"}
                          name={field}
                          value={products[field]}
                          onChange={update}
                          className="form-control"
                          placeholder={`Enter ${field}`}
                          min={field === "price" ? "1" : undefined}
                        />
                      )}
                      {errors[field] && (
                        <small className="text-danger">{errors[field]}</small>
                      )}
                    </div>
                  ))}

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

                  <div className="mb-4">
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
          style={{ maxWidth: "500px", borderRadius: "1rem" }}
        >
          <span style={{ color: "#8B0000" }}>Access Denied</span>
        </div>
      )}
    </>
  );
}
