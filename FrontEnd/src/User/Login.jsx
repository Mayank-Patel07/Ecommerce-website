import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  //  get login method from context
  //  use context to get the login method
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const color_all = "#dfc18f";

  //  use state to manage user data and errors
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  //  update user data on input change
  const update = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  //  validate user data
  //  check if email and password are not empty
  const validate = () => {
    const newErrors = {};
    if (!user.email) newErrors.email = "Email is required";
    if (!user.password) newErrors.password = "Password is required";
    return newErrors;
  };

  //  submit user data to server
  //  if validation passes, send a POST request to the server
  //  if login is successful, redirect to all products page
  //  if login fails, show an error message
  //  if there is an error, show an error message
  //  if there is a token in the response, call the login method from context and redirect to all products page

  const dataSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const res = await axios.post(
        "http://127.0.0.1:5000/api/user/login",
        user
      );
      const data = res.data;
      if (data.token) {
        login(data.token); //  use context to login
        toast.success("Login Successful");
        navigate("/allproducts");
      } else {
        toast.error("Login failed: Invalid credentials");
      }
    } catch (error) {
      toast.error("Login failed: Invalid credentials");
    }
  };

  return (
    <>
      <div
        style={{ backgroundColor: color_all }}
        className="alert alert-warning fs-5 fw-semibold"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          fill="currentColor"
          className="bi bi-box-arrow-in-right pl-1"
          viewBox="0 0 16 16"
        >
          <path
            fillRule="evenodd"
            d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0z"
          />
          <path
            fillRule="evenodd"
            d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"
          />
        </svg>
        <span className="pl-2" style={{ paddingLeft: "5px" }}>
          Login Here
        </span>
      </div>

      <div className="container mt-2 d-flex justify-content-center align-items-center">
        <div className="form_data" style={{ width: "320px" }}>
          <form
            onSubmit={dataSubmit}
            noValidate
            style={{ backgroundColor: "#dfc18f" }}
          >
            <h3
              className="text-start h5 pro pl-3"
              style={{
                paddingLeft: "12px",
                background:
                  "linear-gradient(to right, #294948 0%, #03070A 100%)",
                color: "white",
              }}
            >
              Login
            </h3>

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
                  <strong>{errors.email}</strong>
                </small>
              )}
            </div>

            <div className="form-group m-2">
              <input
                type="password"
                name="password"
                value={user.password}
                onChange={update}
                className="form-control"
                placeholder="Password"
              />
              {errors.password && (
                <small className="text-danger">
                  <strong>{errors.password}</strong>
                </small>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-sm btn-success"
              style={{
                background:
                  "linear-gradient(to right, #294948 0%, #03070A 100%)",
                color: "white",
                marginLeft: "10px",
              }}
            >
              Login
            </button>

            <div className="container">
              <div className="mb-2">
                <p style={{ display: "inline" }}>New to Brains kit?</p>
                <span>
                  <Link
                    to="/register"
                    style={{
                      color: "#63a2d5",
                      textDecoration: "none",
                      marginLeft: "5px",
                    }}
                  >
                    Register
                  </Link>
                </span>
              </div>
            </div>

            <div>
              <h3
                className="text-center h5 pro pl-3 text-white"
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
