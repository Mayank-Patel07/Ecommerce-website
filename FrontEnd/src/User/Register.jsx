import React, { use, useState } from "react";
import { Link } from "react-router-dom";
import "./User.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Register({ Dis_data, setDis_Data }) {
  // Destructure the Dis_data prop to get the values for logout, login, and register buttons
  const color_text = "rgb(235 212 131)";
  const color_all = "#dfc18f";

  const [color, setcolor] = useState(" #294948");

  // State to hold product data

  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    district: "",
    pincode: "",
    address: "",
    password: "",
    confirm_password: "",
  });

  // Function for updating the state of the form fields
  const update = (e) => {
    const { name, value } = e.target;

    // If the field is 'phone', allow only digits and max 10 characters
    if (name === "phone") {
      // Allow only numbers and restrict length to 10
      const digitsOnly = value.replace(/\D/g, ""); // Remove non-numeric characters
      if (digitsOnly.length <= 10) {
        setUser({ ...user, [name]: digitsOnly });
      }
    } else {
      // For other fields, update normally
      setUser({ ...user, [name]: value });
    }
  };

  const navigate = useNavigate();

  // State to hold validation errors
  const [errors, setErrors] = useState({});

  // Function to validate the form fields
  // It checks if the fields are empty or not and returns an object with error messages
  // If there are no errors, it returns an empty object
  const validate = () => {
    const newErrors = {};

    // Trim all string fields to avoid spaces-only values
    const trimmedName = user.name?.trim();
    const trimmedAddress = user.address?.trim();
    const trimmedEmail = user.email?.trim();
    const trimmedCity = user.city?.trim();
    const trimmedState = user.state?.trim();
    const trimmedDistrict = user.district?.trim();

    if (!trimmedName) newErrors.name = "Name is required";
    if (!trimmedEmail) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(trimmedEmail))
      newErrors.email = "Email is invalid";

    if (!user.phone) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(user.phone))
      newErrors.phone = "Phone number must be 10 digits";

    if (!trimmedCity) newErrors.city = "City is required";
    if (!trimmedState) newErrors.state = "State is required";
    if (!trimmedDistrict) newErrors.district = "District is required";

    if (!user.pincode) newErrors.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(user.pincode))
      newErrors.pincode = "Pincode must be 6 digits";

    if (!trimmedAddress) newErrors.address = "Address is required";

    if (!user.password) newErrors.password = "Password is required";
    else if (user.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (!user.confirm_password) {
      newErrors.confirm_password = "Confirmation Password is required";
    } else if (user.password !== user.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    return newErrors;
  };

  // Function to handle form submission
  // It prevents the default form submission behavior and validates the form fields
  // If there are validation errors, it sets the errors state and navigates to the register page
  const dataSubmit = async (e) => {
    e.preventDefault();

    // Run validation
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      navigate("/register");
      return;
    }

    // Set errors for password mismatch
    if (user.password !== user.confirm_password) {
      navigate("/register");
      // alert("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    } else {
      try {
        // Make the API call

        const res = await axios.post("http://127.0.0.1:5000/api/user", user);

        // console.log(res);
        const data = res.data;
        // console.log("Login response:", data);

        // Check if the response contains a token
        if (data.token) {
          // Save token to localStorage
          localStorage.setItem("TOKEN", data.token);
          setDis_Data({
            logout: "block",
            login: "none",
            register: "none",
          });

          // Show success alert
          toast.success("Registration Successful");

          // Navigate to products list
          navigate("/login");

          // Getting the token from localStorage
          const token = localStorage.getItem("TOKEN");

          // If token exists, fetch user data
          if (token) {
            // Fetch user data if token exists
            const fetchUserData = async () => {
              try {
                // Make a GET request to fetch user details
                const response = await axios.get(
                  "http://127.0.0.1:5000/api/user/details",
                  {
                    headers: {
                      "auth-token": localStorage.getItem("TOKEN"),
                    },
                  }
                );
                const data = response.data;
                // console.log("User data:", data);
              } catch (error) {
                console.error("Error fetching user data:", error);
              }
            };

            fetchUserData();
          }
        } else {
          toast.error("Registration failed: Please try again");
        }
      } catch (error) {
        toast.error(
          "Registration failed: Invalid credentials please try again"
        );
      }
    }
  };

  return (
    <>
      <div
        style={{ backgroundColor: color_all }}
        class="alert alert-warning fs-5 fw-semibold"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          fill="currentColor"
          class="bi bi-box-arrow-in-right pl-1"
          viewBox="0 0 16 16"
        >
          <path
            fill-rule="evenodd"
            d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0z"
          />
          <path
            fill-rule="evenodd"
            d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"
          />
        </svg>
        <span className="pl-2 " style={{ paddingLeft: "5px" }}>
          Register
        </span>
      </div>
      <div className="container mt-2 d-flex justify-content-center align-items-center">
        <div className="form_data" style={{ width: "380px" }}>
          <form
            onSubmit={dataSubmit}
            className=""
            noValidate
            style={{ backgroundColor: "#dfc18f" }}
          >
            <h3
              className={`text-start h5 pro pl-3`}
              style={{
                paddingLeft: "12px",
                background:
                  "linear-gradient(to right, #294948 0%, #03070A 100%)",
                color: "white",
              }}
            >
              Register
            </h3>

            <div className="form-group m-2">
              <input
                type="text"
                name="name"
                value={user.name}
                onChange={update}
                className="form-control"
                placeholder="Name"
              />

              {errors.name && (
                <small className="text-danger">
                  <strong style={{ color: "#6d30a9" }}>{errors.name}</strong>
                </small>
              )}
            </div>

            <div className="form-group m-2">
              <input
                type="email"
                name="email"
                value={user.email}
                onChange={update}
                className="form-control"
                placeholder="Email"
              />
              {errors.email && (
                <small className="text-danger">
                  <strong style={{ color: "#6d30a9" }}>{errors.email}</strong>
                </small>
              )}
            </div>

            <div className="form-group m-2">
              <input
                type="text"
                name="phone"
                value={user.phone}
                onChange={update}
                className="form-control"
                placeholder="Number"
                maxlength="10"
              />
              {errors.phone && (
                <small className="text-danger">
                  <strong style={{ color: "#6d30a9" }}>{errors.phone}</strong>
                </small>
              )}
            </div>
            <div className="form-group m-2">
              <input
                type="text"
                name="city"
                value={user.city}
                onChange={update}
                className="form-control"
                placeholder="City"
              />
              {errors.city && (
                <small className="text-danger">
                  <strong style={{ color: "#6d30a9" }}>{errors.city}</strong>
                </small>
              )}
            </div>
            <div className="form-group m-2">
              <input
                type="text"
                name="state"
                value={user.state}
                onChange={update}
                className="form-control"
                placeholder="State"
              />
              {errors.state && (
                <small className="text-danger">
                  <strong style={{ color: "#6d30a9" }}>{errors.state}</strong>
                </small>
              )}
            </div>
            <div className="form-group m-2">
              <input
                type="text"
                name="district"
                value={user.district}
                onChange={update}
                className="form-control"
                placeholder="District"
              />
              {errors.district && (
                <small className="text-danger">
                  <strong style={{ color: "#6d30a9" }}>
                    {errors.district}
                  </strong>
                </small>
              )}
            </div>
            <div className="form-group m-2">
              <input
                type="number"
                name="pincode"
                value={user.pincode}
                onChange={update}
                className="form-control"
                placeholder="Pincode"
              />
              {errors.pincode && (
                <small className="text-danger">
                  <strong style={{ color: "#6d30a9" }}>{errors.pincode}</strong>
                </small>
              )}
            </div>
            <div className="form-group m-2">
              <input
                type="text"
                name="address"
                value={user.address}
                onChange={update}
                className="form-control"
                placeholder="Address"
              />

              {errors.address && (
                <small className="text-danger">
                  <strong style={{ color: "#6d30a9" }}>{errors.address}</strong>
                </small>
              )}
            </div>
            <div className="form-group m-2">
              <input
                type="password"
                name="password"
                value={user.password}
                onChange={update}
                min="1"
                className="form-control"
                placeholder="Password"
              />
              {errors.password && (
                <small className="text-danger">
                  <strong style={{ color: "#6d30a9" }}>
                    {errors.password}
                  </strong>
                </small>
              )}
            </div>

            <div className="form-group m-2">
              <input
                type="password"
                name="confirm_password"
                value={user.confirm_password}
                onChange={update}
                className="form-control"
                placeholder="Confirm Password"
              />
              {errors.confirm_password && (
                <small className="text-danger">
                  <strong style={{ color: "#6d30a9" }}>
                    {errors.confirm_password}
                  </strong>
                </small>
              )}
            </div>
            <button
              type="submit"
              className="btn btn-sm btn-success "
              style={{
                background:
                  "linear-gradient(to right, #294948 0%, #03070A 100%)",
                color: "white",
                marginLeft: "10px ",
              }}
            >
              Register
            </button>
            <div className="container ">
              <div className="mb-2">
                <p style={{ display: "inline" }} className="">
                  Have an account?
                </p>
                <span>
                  <Link
                    to="/login"
                    style={{
                      color: "#63a2d5",
                      textDecoration: "none",
                      marginLeft: "5px",
                    }}
                  >
                    Login
                  </Link>
                </span>
              </div>
            </div>
            <div>
              <h3
                className={`text-center h5 pro pl-3 text-white `}
                style={{
                  background:
                    "linear-gradient(to right, #294948 0%, #03070A 100%)",
                  color: "white",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <span className="border border-white p-1">BrainsKart</span>
              </h3>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
