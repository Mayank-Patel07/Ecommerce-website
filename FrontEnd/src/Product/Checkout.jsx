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
  const { cartItems, clearCart } = useCart();

  // State variables
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [user, setUser] = useState({});
  const [orderHistory, setOrderHistory] = useState([]);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  useEffect(() => {
    const token = localStorage.getItem("TOKEN");
    if (!token) return;

    const fetchUserAndOrders = async () => {
      try {
        const userRes = await axios.get(
          "http://127.0.0.1:5000/api/user/details",
          {
            headers: { "auth-token": token },
          }
        );
        setUser(userRes.data);

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

  const handleUpdate = async (id) => {
    const token = localStorage.getItem("TOKEN");
    try {
      await axios.put(`http://127.0.0.1:5000/api/user/${id}`, user, {
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
        },
      });
      toast.success("Profile updated successfully!");

      const { data } = await axios.get(
        "http://127.0.0.1:5000/api/user/details",
        {
          headers: { "auth-token": token },
        }
      );
      setUser(data);
      handleClose();
    } catch (error) {
      toast.error("Failed to update profile details. Token is not valid.");
    }
  };

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

        const options = {
          key: import.meta.env.VITE_API_Test_Key_ID,
          amount: data.amount,
          currency: data.currency,
          order_id: data.id,
          name: "My E-commerce Site",
          description: "Test Transaction",
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
            name: user.name,
            email: user.email,
            contact: user.phone,
          },
          theme: {
            color: "#3399cc",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        toast.error("Failed to initiate payment.");
      }
    }
  };

  const update = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handlePaymentChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const formatAddress = (user) => {
    if (!user) return "No address information";
    const parts = [user.address, user.city, user.district, user.state].filter(
      Boolean
    );
    return parts.length ? parts.join(", ") : "No address information";
  };

  // Custom styles for the component
  const styles = {
    pageContainer: {
      padding: "30px 15px",
      maxWidth: "1000px",
      margin: "0 auto",
    },
    pageTitle: {
      fontSize: "28px",
      fontWeight: "700",
      textAlign: "center",
      marginBottom: "30px",
      color: "#333",
    },
    card: {
      border: "none",
      borderRadius: "12px",
      boxShadow: "0 6px 15px rgba(0, 0, 0, 0.1)",
      marginBottom: "25px",
      overflow: "hidden",
    },
    cardHeader: {
      backgroundColor: "#2c3e50",
      color: "white",
      padding: "16px 20px",
      borderRadius: "12px 12px 0 0",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    sectionTitle: {
      fontSize: "18px",
      fontWeight: "600",
      margin: "0",
    },
    editButton: {
      backgroundColor: "#41756f",
      borderColor: "#41756f",
      color: "white",
      borderRadius: "6px",
      fontSize: "14px",
      padding: "6px 15px",
    },
    cardBody: {
      padding: "20px",
    },
    listItem: {
      padding: "8px 0",
      borderBottom: "none",
    },
    itemImage: {
      width: "60px",
      height: "60px",
      objectFit: "cover",
      borderRadius: "8px",
      marginRight: "15px",
    },
    itemName: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#333",
    },
    itemDetails: {
      fontSize: "14px",
      color: "#777",
    },
    totalAmount: {
      fontSize: "18px",
      fontWeight: "700",
      color: "#2c3e50",
      margin: "0",
    },
    payButton: {
      backgroundColor: "#27ae60",
      borderColor: "#27ae60",
      color: "white",
      borderRadius: "6px",
      padding: "8px 20px",
      fontSize: "15px",
    },
    modalHeader: {
      backgroundColor: "#2c3e50",
      color: "white",
      borderBottom: "none",
      padding: "16px 20px",
    },
    modalBody: {
      backgroundColor: "#f8f9fa",
      padding: "20px",
    },
    formLabel: {
      fontWeight: "600",
      color: "#444",
      marginBottom: "6px",
    },
    formControl: {
      padding: "10px 12px",
      borderRadius: "8px",
      border: "1px solid #ced4da",
      fontSize: "15px",
      marginBottom: "15px",
    },
    saveButton: {
      backgroundColor: "#2c3e50",
      borderColor: "#2c3e50",
      width: "100%",
      borderRadius: "8px",
      padding: "10px",
      marginTop: "10px",
      fontSize: "16px",
    },
    radioLabel: {
      fontSize: "16px",
      fontWeight: "500",
      marginLeft: "8px",
    },
  };

  return (
    <Container style={styles.pageContainer}>
      <h1 style={styles.pageTitle}>🧾 Checkout</h1>

      {/* Billing Address */}
      <Card style={styles.card}>
        <div style={styles.cardHeader}>
          <h5 style={styles.sectionTitle}>Billing Address</h5>
          <Button
            variant="primary"
            size="sm"
            onClick={handleShow}
            style={styles.editButton}
          >
            Edit Address
          </Button>
        </div>

        <Modal show={show} onHide={handleClose} centered>
          <Modal.Header closeButton style={styles.modalHeader}>
            <Modal.Title>Your Details</Modal.Title>
          </Modal.Header>
          <Modal.Body style={styles.modalBody}>
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
                  <Form.Label
                    style={styles.formLabel}
                    className="text-capitalize"
                  >
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
                    style={styles.formControl}
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
              <Button variant="dark" type="submit" style={styles.saveButton}>
                Save Changes
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        <Card.Body style={styles.cardBody}>
          {user?.name ? (
            <ListGroup variant="flush">
              <ListGroup.Item style={styles.listItem}>
                <strong>Name:</strong> {user.name}
              </ListGroup.Item>
              <ListGroup.Item style={styles.listItem}>
                <strong>Phone:</strong> {user.phone}
              </ListGroup.Item>
              <ListGroup.Item style={styles.listItem}>
                <strong>Email:</strong> {user.email}
              </ListGroup.Item>
              <ListGroup.Item style={styles.listItem}>
                <strong>Address:</strong> {formatAddress(user)}
              </ListGroup.Item>
            </ListGroup>
          ) : (
            <p style={{ color: "#777" }}>Fetching billing details...</p>
          )}
        </Card.Body>
      </Card>

      {/* Cart Items */}
      <Card style={styles.card}>
        <Card.Body style={styles.cardBody}>
          <Card.Title
            style={{
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "20px",
            }}
          >
            Your Cart Items
          </Card.Title>

          {cartItems.length === 0 ? (
            <p style={{ color: "#777" }}>No items in your cart.</p>
          ) : (
            <div
              style={{
                maxHeight: "250px",
                overflowY: "auto",
                paddingRight: "5px",
              }}
            >
              <ListGroup variant="flush">
                {cartItems.map((item) => (
                  <ListGroup.Item
                    key={item._id}
                    style={{
                      border: "none",
                      padding: "10px 0",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={styles.itemImage}
                    />
                    <div style={{ flexGrow: 1 }}>
                      <div style={styles.itemName}>{item.name}</div>
                      <div style={styles.itemDetails}>
                        Qty: {item.quantity} × ₹{item.price}
                      </div>
                    </div>
                    <strong style={{ fontSize: "16px" }}>
                      ₹{item.price * item.quantity}
                    </strong>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "20px",
              paddingTop: "15px",
              borderTop: "1px solid #eee",
            }}
          >
            <p style={styles.totalAmount}>Total: ₹{totalAmount}</p>
            <Button
              variant="success"
              style={styles.payButton}
              onClick={handlePay}
            >
              Proceed to Pay
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Payment Method */}
      <Card style={styles.card}>
        <Card.Body style={styles.cardBody}>
          <Card.Title
            style={{
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "20px",
            }}
          >
            Payment Method
          </Card.Title>

          <div style={{ marginBottom: "12px" }}>
            <Form.Check
              type="radio"
              name="payment"
              value="cod"
              id="cod"
              label="Cash on Delivery"
              checked={paymentMethod === "cod"}
              onChange={handlePaymentChange}
              style={{ marginBottom: "10px" }}
            />
          </div>

          <div>
            <Form.Check
              type="radio"
              name="payment"
              value="card"
              id="card"
              label="Credit Card Payment"
              checked={paymentMethod === "card"}
              onChange={handlePaymentChange}
            />
          </div>
        </Card.Body>
      </Card>

      {/* Order History section is commented out in the original code */}
    </Container>
  );
};

export default Checkout;
