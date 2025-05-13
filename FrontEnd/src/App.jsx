import React, { useState, useEffect } from "react";
import Navbar from "./Root/Navbar";
import Home from "./Root/Home";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Mens from "./Product/Mens";
import Womens from "./Product/Womens";
import Kids from "./Product/Kids";
import Login from "./User/Login";
import Register from "./User/Register";
import Selected_product from "./User/Selected_product";
import Profile from "./User/Profile";
import Cart from "./User/Cart";
import All_product from "./Product/All_product";
import Uploads from "./Product/Uploads";
import axios from "axios";
import { CartProvider } from "./context/CartContext";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import CheckOut from "./Product/Checkout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ThankYou from "./Product/Thankyou";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  
  // State is used to hold the data
  // Toggle the display button (Login , Register)
  const [Dis_data, setDis_Data] = useState({
    logout: "none",
    login: "block",
    register: "block",
  });

  // useEffect is used to check if the user is logged in or not
  useEffect(() => {

    // Check if the token is present in local storage
    const token = localStorage.getItem("TOKEN");

    // If the token is present, set the display data to show logout button
    if (token) {
      setDis_Data({
        logout: "block",
        login: "none",
        register: "none",
      });

      // Fetch user data from the server
      const fetchUserData = async () => {
        try {

          // Make a GET request to the server to fetch user details
          // Setting the headers

          await axios.get("http://127.0.0.1:5000/api/user/details", {
            headers: {
              "auth-token": token,
            },
          });

        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    } else {

      // If the token is not present, set the display data to show login and register buttons
      setDis_Data({
        logout: "none",
        login: "block",
        register: "block",
      });
    }
  }, []);

  return (
    <>
      <AuthProvider> 
        <CartProvider>
          <BrowserRouter>
            <Navbar Dis_data={Dis_data} setDis_Data={setDis_Data} />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/allproducts" element={<All_product />} />
              <Route path="/mens" element={<Mens />} />
              <Route path="/womens" element={<Womens />} />
              <Route path="/kids" element={<Kids />} />
              <Route
                path="/login"
                element={
                  <Login Dis_data={Dis_data} setDis_Data={setDis_Data} />
                }
              />
              <Route
                path="/register"
                element={
                  <Register Dis_data={Dis_data} setDis_Data={setDis_Data} />
                }
              />
              <Route path="/item/:id" element={<Selected_product />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/uploads" element={<Uploads />} />
              <Route path="/CheckOut" element={<CheckOut />} />
              <Route path="*" element={<h1>404 Not Found</h1>} />
              <Route path="/thankyou" element={<ThankYou />} />
            </Routes>
            {/* Toast Container should be placed once at the root */}
            <ToastContainer position="top-right" autoClose={2000} />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </>
  );
}
