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
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: digitsOnly }));
      }
    } else {
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

  // CSS Styles
  const styles = {
    container: {
      padding: "32px 24px",
      maxWidth: "1200px",
      margin: "0 auto",
    },
    alertHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: "#fff3cd",
      border: "1px solid #ffeeba",
      borderRadius: "8px",
      padding: "16px 20px",
      marginBottom: "24px",
      boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    },
    headerText: {
      display: "flex",
      alignItems: "center",
      fontSize: "18px",
      fontWeight: "600",
      color: "#856404",
    },
    icon: {
      fontSize: "23px",
      marginRight: "10px",
    },
    updateButton: {
      backgroundColor: "#41756f",
      border: "none",
      color: "white",
      padding: "8px 16px",
      borderRadius: "6px",
      fontSize: "14px",
      fontWeight: "500",
    },
    modalHeader: {
      backgroundColor: "#294948", 
      color: "white",
      padding: "16px 20px",
      borderBottom: "1px solid #233e3d",
    },
    modalBody: {
      backgroundColor: "#f8f9fa",
      padding: "20px",
    },
    formControl: {
      padding: "10px 12px",
      borderRadius: "6px",
      border: "1px solid #ced4da",
      marginBottom: "12px",
      width: "100%",
      fontSize: "15px",
    },
    saveButton: {
      backgroundColor: "#2c3e50",
      border: "none",
      width: "100%",
      padding: "10px 0",
      marginTop: "12px",
      borderRadius: "6px",
      fontWeight: "500",
    },
    profileRow: {
      display: "flex",
      flexWrap: "wrap",
      marginLeft: "-16px",
      marginRight: "-16px",
    },
    profileImageCol: {
      width: "100%",
      padding: "0 16px",
      marginBottom: "24px",
      textAlign: "center",
    },
    profileDetailsCol: {
      width: "100%",
      padding: "0 16px",
    },
    imageContainer: {
      display: "inline-block",
      position: "relative",
      border: "1px solid #dee2e6",
      borderRadius: "50%",
      overflow: "hidden",
      padding: "8px",
      background: "white",
      width: "220px",
      height: "220px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    },
    profileImg: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      borderRadius: "50%",
    },
    editImageButton: {
      position: "absolute",
      bottom: "10px",
      right: "40px",
      background: "white",
      border: "1px solid #dee2e6",
      borderRadius: "50%",
      padding: "6px 8px",
      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    },
    saveImageButton: {
      backgroundColor: "#28a745",
      border: "none",
      color: "white",
      padding: "8px 16px",
      borderRadius: "6px",
      marginTop: "16px",
      fontSize: "14px",
      fontWeight: "500",
      display: "block",
      margin: "16px auto 0",
    },
    detailsCard: {
      border: "none",
      borderRadius: "12px",
      backgroundColor: "#f8f9fa",
      boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
    },
    cardBody: {
      padding: "24px",
    },
    cardTitle: {
      marginBottom: "20px",
      paddingBottom: "12px",
      borderBottom: "1px solid #dee2e6",
      fontSize: "20px",
      fontWeight: "600",
      color: "#333",
    },
    detailRow: {
      display: "flex",
      flexWrap: "wrap",
      marginBottom: "8px",
    },
    detailLabel: {
      width: "30%",
      fontWeight: "600",
      color: "#495057",
      paddingRight: "12px",
    },
    detailValue: {
      width: "70%",
      color: "#212529",
    },
    accessDeniedAlert: {
      textAlign: "center",
      marginTop: "40px",
      padding: "20px",
      maxWidth: "500px",
      marginLeft: "auto",
      marginRight: "auto",
      backgroundColor: "#f8d7da",
      color: "#721c24",
      borderRadius: "10px", 
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    },
    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "300px",
    }
  };

  // Media queries equivalent in inline styles using JavaScript
  if (window.innerWidth >= 768) {
    styles.profileImageCol = {
      ...styles.profileImageCol,
      width: "33.333%",
      marginBottom: "0",
    };
    styles.profileDetailsCol = {
      ...styles.profileDetailsCol,
      width: "66.667%",
    };
  }

  // Render loading state
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Spiral size="40" speed="0.9" color="black" />
      </div>
    );
  }

  // Main render
  return (
    <>
      {user ? (
        <div style={styles.container}>
          <div style={styles.alertHeader}>
            <div style={styles.headerText}>
              <i className="bi bi-person-circle" style={styles.icon}></i>
              <span>Your Details</span>
            </div>
            <button
              type="button"
              onClick={handleShow}
              style={styles.updateButton}
            >
              Update Profile
            </button>
          </div>
          
          {/* Modal for updating profile */}
          <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton style={styles.modalHeader}>
              <Modal.Title>Billing Details</Modal.Title>
            </Modal.Header>
            <Modal.Body style={styles.modalBody}>
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdate(user._id);
                }}
              >
                <Form.Group>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={update}
                    placeholder="Name"
                    style={styles.formControl}
                  />
                </Form.Group>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  hidden
                  onChange={update}
                />
                <Form.Group>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={update}
                    placeholder="Phone"
                    style={styles.formControl}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Control
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={update}
                    placeholder="City"
                    style={styles.formControl}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Control
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={update}
                    placeholder="State"
                    style={styles.formControl}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Control
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={update}
                    placeholder="District"
                    style={styles.formControl}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Control
                    type="number"
                    name="pincode"
                    value={formData.pincode}
                    onChange={update}
                    placeholder="Pincode"
                    style={styles.formControl}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    value={formData.address}
                    onChange={update}
                    placeholder="Address"
                    style={{...styles.formControl, resize: "vertical"}}
                  />
                </Form.Group>
                <Button variant="dark" type="submit" style={styles.saveButton}>
                  Save Changes
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
          
          {/* Profile Image and Details Sections */}
          <div style={styles.profileRow}>
            {/* Profile Image Section */}
            <div style={styles.profileImageCol}>
              <div style={styles.imageContainer}>
                <img
                  src={user.previewImage || user.image || sampleImage}
                  alt="Profile Preview"
                  style={styles.profileImg}
                />
                <input
                  type="file"
                  accept="image/*"
                  id="profileImageUpload"
                  style={{display: "none"}}
                  onChange={updateImage}
                />
                <label
                  htmlFor="profileImageUpload"
                  style={styles.editImageButton}
                >
                  <i className="bi bi-pencil-square"></i>
                </label>
              </div>
              {imageChanged && (
                <button
                  style={styles.saveImageButton}
                  onClick={handleImageSave}
                >
                  Save Image
                </button>
              )}
            </div>
            
            {/* Profile Details Section */}
            <div style={styles.profileDetailsCol}>
              <div style={styles.detailsCard}>
                <div style={styles.cardBody}>
                  <h4 style={styles.cardTitle}>
                    Your Details
                  </h4>
                  <div>
                    <div style={styles.detailRow}>
                      <div style={styles.detailLabel}>Name:</div>
                      <div style={styles.detailValue}>{user.name}</div>
                    </div>
                    <div style={styles.detailRow}>
                      <div style={styles.detailLabel}>Email:</div>
                      <div style={styles.detailValue}>{user.email}</div>
                    </div>
                    <div style={styles.detailRow}>
                      <div style={styles.detailLabel}>Mobile Number:</div>
                      <div style={styles.detailValue}>{user.phone}</div>
                    </div>
                    <div style={styles.detailRow}>
                      <div style={styles.detailLabel}>City:</div>
                      <div style={styles.detailValue}>{user.city}</div>
                    </div>
                    <div style={styles.detailRow}>
                      <div style={styles.detailLabel}>State:</div>
                      <div style={styles.detailValue}>{user.state}</div>
                    </div>
                    <div style={styles.detailRow}>
                      <div style={styles.detailLabel}>Pincode:</div>
                      <div style={styles.detailValue}>{user.pincode}</div>
                    </div>
                    <div style={styles.detailRow}>
                      <div style={styles.detailLabel}>Address:</div>
                      <div style={styles.detailValue}>{user.address}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
        className="text-center mt-4 fw-semibold fs-5 alert alert-danger shadow mx-auto border-start border-danger border-4"
        style={{
          maxWidth: "450px",
          borderRadius: "0.75rem",
          animation: "fadeIn 1s ease-in-out",
          background: "linear-gradient(to right, #fff5f5, #fff)",
        }}
      >
        <span style={{ color: "#8B0000" }}>
          <i className="bi bi-exclamation-triangle-fill me-2"></i>Access Denied:
        </span>{" "}
        Please <strong>Login First.</strong>
      </div>
      )}
    </>
  );
}