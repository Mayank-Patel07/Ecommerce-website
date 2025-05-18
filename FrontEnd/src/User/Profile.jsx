import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Modal, Button, Form } from "react-bootstrap";
import sampleImage from "../assets/Resized image/Sample img.avif";
import { Spiral } from "ldrs/react";
import "ldrs/react/spiral.css";
import { AuthContext } from "../context/AuthContext";

export default function Profile() {
  // Use AuthContext
  const { user, token, updateUserData, updateUserImage, saveUserImage } = useContext(AuthContext);

  // State for modal and loading
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);

  // State to manage form data (allows editing without immediately changing context)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    district: "",
    pincode: "",
    address: "",
  });

  // State to track image changes
  const [imageChanged, setImageChanged] = useState(false);

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        city: user.city || "",
        state: user.state || "",
        district: user.district || "",
        pincode: user.pincode || "",
        address: user.address || "",
      });
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [user]);

  // Show and hide modal
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Update form data
  const update = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number
    if (name === "phone") {
      // Allow only digits and limit to 10 characters
      // This regex replaces all non-digit characters with an empty string
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length <= 10) {
        // Update form data with digits only
        setFormData(prev => ({ ...prev, [name]: digitsOnly }));
      }
    } else {
      // Update form data for other fields
      // This will update the form data with the new value
      // The spread operator is used to copy the existing form data
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle profile update
  const handleUpdate = async (id) => {
    try {
      // Update user data in context and backend
      updateUserData(formData);

      // Make API call to update user data
      await axios.put(`http://127.0.0.1:5000/api/user/${id}`, formData, {
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
        },
      });

      toast.success("Profile updated successfully!");
      
      // Close modal
      handleClose();
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update profile");
    }
  };

  // Convert image to base64 and prepare for upload
  const convertBase64String = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Update image on file input change
  const updateImage = async (event) => {
    const imageFile = event.target.files[0];
    if (imageFile) {
      try {
        // Convert image to base64 using context method
        const base64Image = await updateUserImage(imageFile);
        
        // Set image changed to true
        setImageChanged(true);
      } catch (error) {
        console.error("Image conversion failed", error);
        toast.error("Image upload failed");
      }
    }
  };

  // Save image to backend
  const handleImageSave = async () => {
    try {
      // Verify user exists before saving
      if (!user || !user._id) {
        toast.error("User information not available");
        return;
      }

      // Save image using context method
      await saveUserImage(user._id, user.previewImage);
      
      toast.success("Image updated successfully!");
      setImageChanged(false);
    } catch (error) {
      console.error("Image save failed", error);
      toast.error("Failed to save image");
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "300px" }}
      >
        <Spiral size="40" speed="0.9" color="black" />
      </div>
    );
  }

  // Main render
  return (
    <>
      {user ? (
        <div className="container py-4">
          <div className="d-flex justify-content-between align-items-center alert alert-warning fs-5 fw-semibold">
            <div className="d-flex align-items-center">
              <i
                className="bi bi-person-circle me-2"
                style={{ fontSize: "23px" }}
              ></i>
              <span>Your Details</span>
            </div>
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
              Update Profile
            </button>
          </div>

          {/* Modal for updating profile */}
          <Modal show={show} onHide={handleClose} centered>
            <Modal.Header
              closeButton
              style={{ backgroundColor: "#294948", color: "white" }}
            >
              <Modal.Title>Billing Details</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: "#dfc18f" }}>
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdate(user._id);
                }}
              >
                <Form.Group className="mb-2">
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={update}
                    placeholder="Name"
                  />
                </Form.Group>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  hidden
                  onChange={update}
                />
                <Form.Group className="mb-2">
                  <Form.Control
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={update}
                    placeholder="Phone"
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Control
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={update}
                    placeholder="City"
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Control
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={update}
                    placeholder="State"
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Control
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={update}
                    placeholder="District"
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Control
                    type="number"
                    name="pincode"
                    value={formData.pincode}
                    onChange={update}
                    placeholder="Pincode"
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    value={formData.address}
                    onChange={update}
                    placeholder="Address"
                  />
                </Form.Group>
                <Button variant="dark" type="submit" className="mt-2 w-100">
                  Save Changes
                </Button>
              </Form>
            </Modal.Body>
          </Modal>

          {/* Profile Image Section */}
          <div className="row g-4 align-items-start">
            <div className="col-md-4 text-center">
              <div
                className="position-relative d-inline-block border rounded-circle overflow-hidden shadow-lg bg-white p-2"
                style={{ width: "220px", height: "220px" }}
              >
                <img
                  src={user.previewImage || user.image || sampleImage}
                  alt="Profile Preview"
                  className="img-fluid rounded-circle w-100 h-100 object-fit-cover"
                />
                <input
                  type="file"
                  accept="image/*"
                  id="profileImageUpload"
                  className="d-none"
                  onChange={updateImage}
                />
                <label
                  htmlFor="profileImageUpload"
                  className="position-absolute btn btn-light btn-sm rounded-circle"
                  style={{
                    cursor: "pointer",
                    bottom: "10px",
                    right: "10px",
                    marginRight: "30px",
                    zIndex: 2,
                    boxShadow: "0 0 8px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <i className="bi bi-pencil-square"></i>
                </label>
              </div>
              {imageChanged && (
                <button
                  className="btn btn-success btn-sm mt-3 mx-auto d-block shadow-sm"
                  onClick={handleImageSave}
                >
                  Save Image
                </button>
              )}
            </div>

            {/* Profile Details Section */}
            <div className="col-md-8">
              <div className="card border-0 shadow-sm rounded-4 bg-light">
                <div className="card-body p-4">
                  <h4 className="card-title mb-4 border-bottom pb-2">
                    Your Details
                  </h4>
                  <dl className="row mb-0">
                    <dt className="col-sm-3">Name:</dt>
                    <dd className="col-sm-9">{user.name}</dd>
                    <dt className="col-sm-3">Email:</dt>
                    <dd className="col-sm-9">{user.email}</dd>
                    <dt className="col-sm-3">Mobile Number:</dt>
                    <dd className="col-sm-9">{user.phone}</dd>
                    <dt className="col-sm-3">City:</dt>
                    <dd className="col-sm-9">{user.city}</dd>
                    <dt className="col-sm-3">State:</dt>
                    <dd className="col-sm-9">{user.state}</dd>
                    <dt className="col-sm-3">Pincode:</dt>
                    <dd className="col-sm-9">{user.pincode}</dd>
                    <dt className="col-sm-3">Address:</dt>
                    <dd className="col-sm-9">{user.address}</dd>
                  </dl>
                </div>
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
          <strong>Login First</strong>
        </div>
      )}
    </>
  );
}