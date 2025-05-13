import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";

const Checkout = () => {
  // Context
  // Importing the CartContext to manage cart items and actions
  // This allows us to access the cart items and functions like clearCart
  const { cartItems, clearCart } = useCart();

  // State variables
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // State to manage user details and order history
  // This includes user information and their past orders
  // State to manage order history
  const [user, setUser] = useState({});
  const [orderHistory, setOrderHistory] = useState([]);

  // State to manage the modal visibility for editing user details
  // This modal allows users to update their address and other details
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  // Function to handle the modal close and show actions
  // This is used to toggle the visibility of the modal when the user clicks the edit button
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Calculate the total amount based on cart items
  // This uses the reduce function to sum up the price of each item multiplied by its quantity
  // This is used to display the total amount before payment
  // This is done by iterating over the cart items and summing up the total price
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Fetch user details and order history when the component mounts
  // This uses the useEffect hook to make an API call to fetch user details and order history
  // The API call is made using axios, and the response is stored in the state variables
  // This is done to display the user's details and their past orders in the checkout page
  useEffect(() => {
    // Check if the user is logged in by checking for a token in local storage
    const token = localStorage.getItem("TOKEN");
    // If no token is found, return early to avoid making unnecessary API calls
    if (!token) return;

    // Fetch user details from the API
    const fetchUserAndOrders = async () => {
      try {
        const userRes = await axios.get(
          "http://127.0.0.1:5000/api/user/details",
          {
            headers: { "auth-token": token },
          }
        );
        // Process the user data to include the image URL
        // This is done to ensure the image URL is correctly formatted for display

        setUser(userRes.data);

        // Fetch user order history from the API
        // This includes the user's address, phone number, and email
        // This is done to display the user's details in the checkout page
        const ordersRes = await axios.get(
          "http://127.0.0.1:5000/api/order/history",
          {
            headers: { "auth-token": token },
          }
        );
        setOrderHistory(ordersRes.data.orders);
      } catch (error) {
        toast.error("Failed to fetch user or order details");
      }
    };

    fetchUserAndOrders();
  }, []);

  // Function to handle the update of user details
  // This is called when the user submits the form in the modal
  // This function sends a PUT request to the API to update the user's details
  const handleUpdate = async (id) => {
    // Check if the user object is empty or not
    const token = localStorage.getItem("TOKEN");
    try {
      await axios.put(`http://127.0.0.1:5000/api/user/${id}`, user, {
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
        },
      });

      // Show success message using toast
      // This is done to inform the user that their details have been updated successfully
      toast.success("Profile updated successfully!");

      // Fetch the updated user details from the API
      // This is done to ensure the user details are up-to-date after the update
      const { data } = await axios.get(
        "http://127.0.0.1:5000/api/user/details",
        {
          headers: { "auth-token": token },
        }
      );
      // Update the user state with the new details
      setUser(data);
      // Close the modal after successful update
      handleClose();
    } catch (error) {
      toast.error("Failed to update profile details. Token is not valid.");
    }
  };

  // Function to handle the payment process
  // This is called when the user clicks the "Proceed to Pay" button
  // This function sends a POST request to the API to create an order
  // This includes the cart items, payment method, total amount, and user address
  // This is done to place the order and redirect the user to the thank you page
  const handlePay = async () => {
    // Checking the cart is empty or not
    // This is done to ensure the user has items in their cart before proceeding to payment
    if (!cartItems.length) {
      toast.warn("Cart is empty!");
      return;
    }

    const token = localStorage.getItem("TOKEN");
    try {
      // Safe address concatenation with null checks
      // This is done to ensure the address is correctly formatted for the API request
      const fullAddress = `${user.address || ""}, ${user.city || ""}, ${
        user.district || ""
      }, ${user.state || ""} - ${user.pincode || ""}`;

      // Sending the order details to the API
      // This includes the cart items, payment method, total amount, and user address
      await axios.post(
        "http://127.0.0.1:5000/api/order",
        {
          cartItems,
          paymentMethod,
          totalAmount,
          address: fullAddress,
        },
        {
          headers: { "auth-token": token },
        }
      );
      // Show success message using toast
      // This is done to inform the user that their order has been placed successfully
      toast.success("Order placed successfully!");

      // Clear the cart after successful order placement
      // This is done to reset the cart items after the order is placed
      clearCart();
      navigate("/thankyou");
    } catch (error) {
      toast.error("Failed to place order.");
    }
  };

  // Function to handle the update of user details in the modal
  // This is called when the user types in the input fields in the modal
  // This function updates the user state with the new values entered by the user
  const update = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  // Function to handle the change of payment method
  // This is called when the user selects a different payment method
  // This function updates the paymentMethod state with the selected value
  const handlePaymentChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  // Safe function to display address with null checks
  const formatAddress = (user) => {
    // Check if the user object is empty or not
    if (!user) return "No address information";

    // Concatenate address parts with null checks
    // This is done to ensure the address is correctly formatted for display
    // Filter out null/undefined values
    const parts = [user.address, user.city, user.district, user.state].filter(
      Boolean
    );

    // Join the address parts with a comma and space
    // Return the formatted address or a default message if no parts are found
    return parts.length ? parts.join(", ") : "No address information";
    // This is done to ensure the address is correctly formatted for display
  };

  return (
    <div className="container py-5">
      <h1 className="mb-4 text-center">🧾 Checkout</h1>

      {/* Billing Address */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Billing Address</h5>
          <button
            type="button"
            className="btn btn-sm btn-dark"
            onClick={handleShow}
            style={{
              background:
                "linear-gradient(90deg, rgba(65,117,111,1) 26%, rgba(15,27,29,1) 100%)",
              color: "white",
            }}
          >
            Edit Address
          </button>
        </div>

        <Modal show={show} onHide={handleClose} centered>
          <Modal.Header
            closeButton
            style={{ backgroundColor: "#294948", color: "white" }}
          >
            <Modal.Title>Your Details</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ backgroundColor: "#dfc18f" }}>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdate(user._id);
              }}
            >
              {[
                "name",
                "phone",
                "city",
                "state",
                "district",
                "pincode",
                "address",
              ].map((field) => (
                <Form.Group className="mb-2" key={field}>
                  <Form.Control
                    as={field === "address" ? "textarea" : "input"}
                    rows={field === "address" ? 3 : undefined}
                    type={
                      field === "pincode" || field === "phone"
                        ? "number"
                        : "text"
                    }
                    name={field}
                    value={user[field] || ""}
                    onChange={(e) => {
                      let value = e.target.value;

                      if (field === "phone") {
                        // Remove non-digits and limit to 10 characters
                        value = value.replace(/\D/g, "").slice(0, 10);
                      }

                      // Update the user state with the new value
                      update({ target: { name: field, value } });
                    }}
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  />
                </Form.Group>
              ))}

              <Form.Control
                type="email"
                name="email"
                value={user.email || ""}
                hidden
                onChange={update}
              />

              <Button variant="dark" type="submit" className="mt-2 w-100">
                Save Changes
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        <div className="card-body">
          {user?.name ? (
            <ul className="list-unstyled mb-0">
              <li>
                <strong>Name:</strong> {user.name || "Not provided"}
              </li>
              <li>
                <strong>Phone:</strong> {user.phone || "Not provided"}
              </li>
              <li>
                <strong>Email:</strong> {user.email || "Not provided"}
              </li>
              <li>
                <strong>Address:</strong> {formatAddress(user)}
              </li>
            </ul>
          ) : (
            <p className="text-muted">Fetching billing details...</p>
          )}
        </div>
      </div>

      {/* Cart Items */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">Your Cart Items</h5>
          {cartItems.length === 0 ? (
            <p className="text-muted">No items in your cart.</p>
          ) : (
            <div style={{ maxHeight: "250px", overflowY: "auto" }}>
              <ul className="list-group list-group-flush mb-3">
                {cartItems.map((item) => (
                  <li
                    key={item._id}
                    className="list-group-item d-flex align-items-center"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="rounded me-3"
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                    />
                    <div className="flex-grow-1">
                      <div className="fw-semibold">{item.name}</div>
                      <div className="text-muted small">
                        Qty: {item.quantity} × ₹{item.price}
                      </div>
                    </div>
                    <strong className="ms-2">
                      ₹{item.price * item.quantity}
                    </strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="d-flex justify-content-between align-items-center mt-2">
            <p className="fw-bold mb-0 fs-5">Total: ₹{totalAmount}</p>
            <button className="btn btn-sm btn-success" onClick={handlePay}>
              Proceed to Pay
            </button>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">Payment Method</h5>
          <div className="form-check mb-2">
            <input
              className="form-check-input"
              type="radio"
              name="payment"
              value="cod"
              checked={paymentMethod === "cod"}
              onChange={handlePaymentChange}
              id="cod"
            />
            <label className="form-check-label" htmlFor="cod">
              Cash on Delivery
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="payment"
              value="card"
              disabled
              checked={paymentMethod === "card"}
              onChange={handlePaymentChange}
              id="card"
            />
            <label className="form-check-label" htmlFor="card">
              Credit Card Payment
            </label>
          </div>
        </div>
      </div>

      {/* Order History */}
      <div className="card shadow-sm mt-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Your Order History</h5>
          {orderHistory.length === 0 ? (
            <p className="text-muted">No previous orders found.</p>
          ) : (
            <div style={{ maxHeight: "250px", overflowY: "auto" }}>
              <ul className="list-group list-group-flush">
                {orderHistory.map((order) => (
                  <li key={order._id} className="list-group-item">
                    <div className="fw-bold mb-1">
                      Order ID: <span className="text-muted">{order._id}</span>
                    </div>
                    <div className="small text-muted">
                      <strong>Date:</strong>{" "}
                      {new Date(order.createdAt).toLocaleString()}
                    </div>
                    <div className="small text-muted">
                      <strong>Payment:</strong>{" "}
                      {order.paymentMethod
                        ? order.paymentMethod.toUpperCase()
                        : "N/A"}
                    </div>
                    <div className="small text-muted mb-2">
                      <strong>Status:</strong> {order.status || "Processing"}
                    </div>

                    {/* Product Items with Images */}
                    <div className="mb-2">
                      {order.items &&
                        order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="d-flex align-items-center mb-2"
                          >
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  objectFit: "cover",
                                  marginRight: "10px",
                                  borderRadius: "5px",
                                }}
                              />
                            ) : (
                              <div
                                className="bg-secondary"
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  marginRight: "10px",
                                  borderRadius: "5px",
                                }}
                              ></div>
                            )}
                            <div className="small flex-grow-1">
                              {item.name} × {item.quantity} – ₹
                              {item.price * item.quantity}
                            </div>
                          </div>
                        ))}
                    </div>
                    <div className="small text-muted">
                      <strong>Address:</strong>{" "}
                      {order.address || "No address available"}
                    </div>
                    <div className="fw-semibold">
                      Total: ₹{order.totalAmount}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
