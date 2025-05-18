import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  ListGroup,
  Container,
  Row,
  Col,
  Modal,
  Form,
} from "react-bootstrap";
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
    if (!cartItems.length) {
      toast.warn("Cart is empty!");
      return;
    }

    const token = localStorage.getItem("TOKEN");

    const fullAddress = `${user.address || ""}, ${user.city || ""}, ${
      user.district || ""
    }, ${user.state || ""} - ${user.pincode || ""}`;

    if (paymentMethod === "cod") {
      // Cash on Delivery flow
      try {
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
        toast.success("Order placed successfully!");
        clearCart();
        navigate("/thankyou");
      } catch (error) {
        toast.error("Failed to place order.");
      }
    } else {
      // Card Payment via Razorpay
      try {
        const { data } = await axios.post(
          "http://127.0.0.1:5000/api/payment/razorpay",
          { amount: totalAmount * 100 }, // Razorpay works in paise
          {
            headers: { "auth-token": token },
          }
        );
        console.log(data);

        const options = {
          key: import.meta.env.VITE_API_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: data.currency,
          order_id: data.id,
          name: "My E-commerce Site",
          description: "Test Transaction",

          // Callback function to handle payment success
          handler: async function (response) {
            try {
              await axios.post(
                "http://127.0.0.1:5000/api/order",
                {
                  cartItems,
                  paymentMethod,
                  totalAmount,
                  address: fullAddress,
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  signature: response.razorpay_signature,
                },
                {
                  headers: { "auth-token": token },
                }
              );
              toast.success("Payment successful and order placed!");
              clearCart();
              navigate("/thankyou");
            } catch (err) {
              toast.error(
                "Payment succeeded but order failed. Please contact support."
              );
            }
          },

          prefill: {
            // Prefill user details in the Razorpay payment form
            name: user.name,
            email: user.email,
            contact: user.phone,
          },
          theme: {
            color: "#3399cc",
          },
        };

        // Load Razorpay script dynamically
        //  This is done to ensure Razorpay script is loaded before using it
        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        toast.error("Failed to initiate payment.");
      }
    }
  };

  // Function to update user details in the state
  // This is called when the user types in the input fields in the modal
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
    <Container className="py-3">
      <h1 className="text-center fw-bold  mb-3">🧾 Checkout</h1>

      {/* Billing Address */}
      <Card className="mb-3 shadow-lg border-0 rounded-4">
        <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center rounded-top-4 px-4 py-3">
          <h5 className="mb-0">Billing Address</h5>
          <Button
            variant="dark"
            size="sm"
            onClick={handleShow}
            style={{
              background:
                "linear-gradient(90deg, rgba(65,117,111,1) 26%, rgba(15,27,29,1) 100%)",
              color: "white",
            }}
          >
            Edit Address
          </Button>
        </Card.Header>

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
                <Form.Group className="mb-3" key={field}>
                  <Form.Label className="text-capitalize fw-semibold">
                    {field}
                  </Form.Label>
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
                        value = value.replace(/\D/g, "").slice(0, 10);
                      }
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
              <Button
                variant="dark"
                type="submit"
                className="w-100 rounded-pill mt-2"
              >
                Save Changes
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        <Card.Body className="px-4 py-3">
          {user?.name ? (
            <ListGroup variant="flush">
              <ListGroup.Item className="border-0 px-0 py-1">
                <strong>Name:</strong> {user.name}
              </ListGroup.Item>
              <ListGroup.Item className="border-0 px-0 py-1">
                <strong>Phone:</strong> {user.phone}
              </ListGroup.Item>
              <ListGroup.Item className="border-0 px-0 py-1">
                <strong>Email:</strong> {user.email}
              </ListGroup.Item>
              <ListGroup.Item className="border-0 px-0 py-1">
                <strong>Address:</strong> {formatAddress(user)}
              </ListGroup.Item>
            </ListGroup>
          ) : (
            <p className="text-muted">Fetching billing details...</p>
          )}
        </Card.Body>
      </Card>

      {/* Cart Items */}
      <Card className="mb-4 shadow-lg border-0 rounded-4">
        <Card.Body className="px-4 py-3">
          <Card.Title className="mb-4 fw-semibold">Your Cart Items</Card.Title>
          {cartItems.length === 0 ? (
            <p className="text-muted">No items in your cart.</p>
          ) : (
            <div style={{ maxHeight: "250px", overflowY: "auto" }}>
              <ListGroup variant="flush">
                {cartItems.map((item) => (
                  <ListGroup.Item
                    key={item._id}
                    className="border-0 px-0 d-flex align-items-center"
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
                    <strong>₹{item.price * item.quantity}</strong>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          )}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <p className="fw-bold fs-5 mb-0">Total: ₹{totalAmount}</p>
            <Button variant="success" size="sm" onClick={handlePay}>
              Proceed to Pay
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Payment Method */}
      <Card className="mb-4 shadow-lg border-0 rounded-4">
        <Card.Body className="px-4 py-3">
          <Card.Title className="mb-3 fw-semibold">Payment Method</Card.Title>
          <Form.Check
            type="radio"
            name="payment"
            value="cod"
            id="cod"
            label="Cash on Delivery"
            checked={paymentMethod === "cod"}
            onChange={handlePaymentChange}
            className="mb-2"
          />
          <Form.Check
            type="radio"
            name="payment"
            value="card"
            id="card"
            label="Credit Card Payment"
            checked={paymentMethod === "card"}
            onChange={handlePaymentChange}
          />
        </Card.Body>
      </Card>

      {/* Order History */}
      <Card className="shadow-lg border-0 rounded-4">
        <Card.Body className="px-4 py-3">
          <Card.Title className="mb-3 fw-semibold">
            Your Order History
          </Card.Title>
          {orderHistory.length === 0 ? (
            <p className="text-muted">No previous orders found.</p>
          ) : (
            <div style={{ maxHeight: "250px", overflowY: "auto" }}>
              <ListGroup variant="flush">
                {orderHistory.map((order) => (
                  <ListGroup.Item
                    key={order._id}
                    className="border-0 mb-3 px-0"
                  >
                    <div className="fw-bold mb-1">
                      Order ID: <span className="text-muted">{order._id}</span>
                    </div>
                    <div className="small text-muted">
                      <strong>Date:</strong>{" "}
                      {new Date(order.createdAt).toLocaleString()}
                    </div>
                    <div className="small text-muted">
                      <strong>Payment:</strong>{" "}
                      {order.paymentMethod?.toUpperCase() || "N/A"}
                    </div>
                    <div className="small text-muted mb-2">
                      <strong>Status:</strong> {order.status || "Processing"}
                    </div>

                    {order.items?.map((item, idx) => (
                      <div key={idx} className="d-flex align-items-center mb-2">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="rounded me-2"
                            style={{
                              width: "40px",
                              height: "40px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            className="bg-secondary me-2"
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "5px",
                            }}
                          />
                        )}
                        <div className="small flex-grow-1">
                          {item.name} × {item.quantity} – ₹
                          {item.price * item.quantity}
                        </div>
                      </div>
                    ))}

                    <div className="small text-muted">
                      <strong>Address:</strong>{" "}
                      {order.address || "No address available"}
                    </div>
                    <div className="fw-semibold">
                      Total: ₹{order.totalAmount}
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Checkout;
