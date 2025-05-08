import React, { useState, useEffect } from "react";
// import List from "@mui/material/List";
// import ListItem from "@mui/material/ListItem";
// import ListItemText from "@mui/material/ListItemText";
// import Divider from "@mui/material/Divider";
import axios from "axios";
import { toast } from "react-toastify";
import { Modal, Button, Form } from "react-bootstrap";
import sampleImage from "../assets/Resized image/Sample img.avif";
import { Spiral } from "ldrs/react";
import "ldrs/react/spiral.css";

export default function Profile() {
  //  use state to manage user data and loading state
  const [newData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);

  //  use state to manage user data
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
    image: "",
    previewImage: "",
  });

  //  use state to manage modal visibility
  const [show, setShow] = useState(false);
  //  use state to manage image change
  //  Track image change
  const [imageChanged, setImageChanged] = useState(false);

  //  Show and hide modal
  //  Show modal when update button is clicked
  //  Hide modal when close button is clicked
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Change user data on input change
  // Used to type in the input fields
  const update = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleUpdate = async (id) => {
    // Validate user data before sending it to the server
    try {
      const token = localStorage.getItem("TOKEN");

      const payload = { ...user };
      // If the image is not changed, remove it from the payload
      // This is to avoid sending the same image again
      if (imageChanged && user.previewImage) {
        payload.image = user.previewImage;
      }

      await axios.put(`http://127.0.0.1:5000/api/user/${id}`, payload, {
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
        },
      });
      // Show success message
      toast.success("Profile updated successfully!");

      // Fetch updated user data
      // This is to update the user data in the state
      const { data } = await axios.get(
        "http://127.0.0.1:5000/api/user/details",
        {
          headers: { "auth-token": token },
        }
      );

      // Update user data in the state
      // This is to update the user data in the state
      setUserData(data);

      // Update user data in the state with the new image
      // This is to update the user data in the state with the new image
      setUser({ ...data, previewImage: data.image });

      // Reset image changed state
      setImageChanged(false);

      // Close modal
      handleClose();
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update profile");
    }
  };

  // Fetch user data on component mount
  // This is to get the user data from the server
  useEffect(() => {
    // Check if the user is logged in by checking for a token in local storage
    const token = localStorage.getItem("TOKEN");
    if (!token) {
      setLoading(false); // If no token, stop loading
      return;
    }

    // Fetch user data from the server
    // This is to get the user data from the server
    (async () => {
      try {
        const { data } = await axios.get(
          "http://127.0.0.1:5000/api/user/details",
          {
            headers: { "auth-token": token },
          }
        );

        //  Set user data in the state
        //  This is to update the user data in the state
        setUserData(data);
        setUser({ ...data, previewImage: data.image });
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false); // Stop loading whether successful or not
      }
    })();
  }, []);

  // Convert image file to base64 string
  // This is to convert the image file to base64 string
  // This is to upload the image to the server
  const convertBase64String = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Update image on file input change
  // This is to update the image on file input change
  // This is to upload the image to the server
  const updateImage = async (event) => {
    // Check if the file input has a file
    const imageFile = event.target.files[0];

    // If there is a file, convert it to base64 string
    if (imageFile) {
      try {
        // Convert the image file to base64 string
        const base64Image = await convertBase64String(imageFile);

        // Set the base64 string as the preview image in the state
        setUser((prev) => ({
          ...prev,
          previewImage: base64Image,
        }));
        // Set the image changed state to true
        setImageChanged(true);
      } catch (error) {
        console.error("Image conversion failed", error);
        toast.error("Image upload failed");
      }
    }
  };

  const borderColor = "#dfc18f";
  const style = {
    p: 0,
    width: "100%",
    borderRadius: 2,
    border: "1px solid",
    borderColor,
    backgroundColor: "background.paper",
  };

  return (
    <>
      {loading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "300px" }}
        >
          <Spiral size="40" speed="0.9" color="black" />
        </div>
      ) : newData && newData.name ? (
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
                    value={user.name}
                    onChange={update}
                    placeholder="Name"
                  />
                </Form.Group>

                <Form.Control
                  type="email"
                  name="email"
                  value={user.email}
                  hidden
                  onChange={update}
                />

                <Form.Group className="mb-2">
                  <Form.Control
                    type="number"
                    name="phone"
                    value={user.phone}
                    onChange={update}
                    placeholder="Phone"
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Control
                    type="text"
                    name="city"
                    value={user.city}
                    onChange={update}
                    placeholder="City"
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Control
                    type="text"
                    name="state"
                    value={user.state}
                    onChange={update}
                    placeholder="State"
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Control
                    type="text"
                    name="district"
                    value={user.district}
                    onChange={update}
                    placeholder="District"
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Control
                    type="number"
                    name="pincode"
                    value={user.pincode}
                    onChange={update}
                    placeholder="Pincode"
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    value={user.address}
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

          <div className="row g-4 align-items-start">
            <div className="col-md-4 text-center">
              <div
                className="position-relative d-inline-block border rounded-circle overflow-hidden shadow-lg bg-white p-2"
                style={{ width: "220px", height: "220px" }}
              >
                <img
                  src={user.previewImage || sampleImage}
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
                  className="position-absolute btn btn-light btn-sm rounded-circle "
                  style={{
                    cursor: "pointer",
                    bottom: "10px",
                    right: "10px",
                    marginRight: "30px",
                    zIndex: 2,
                    boxShadow: "0 0 8px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  {/* <i className="bi bi-pencil"></i>  */}
                  <i class="bi bi-pencil-square"></i>
                </label>
              </div>

              {imageChanged && (
                <button
                  className="btn btn-success btn-sm mt-3 mx-auto d-block shadow-sm"
                  onClick={() => handleUpdate(user._id)}
                >
                  Save Image
                </button>
              )}
            </div>

            <div className="col-md-8">
              <div className="card border-0 shadow-sm rounded-4 bg-light">
                <div className="card-body p-4">
                  <h4 className="card-title mb-4 border-bottom pb-2">
                    Your Details
                  </h4>
                  <dl className="row mb-0">
                    <dt className="col-sm-3">Name:</dt>
                    <dd className="col-sm-9">{newData.name}</dd>

                    <dt className="col-sm-3">Email:</dt>
                    <dd className="col-sm-9">{newData.email}</dd>

                    <dt className="col-sm-3">Mobile Number:</dt>
                    <dd className="col-sm-9">{newData.phone}</dd>

                    <dt className="col-sm-3">City:</dt>
                    <dd className="col-sm-9">{newData.city}</dd>

                    <dt className="col-sm-3">State:</dt>
                    <dd className="col-sm-9">{newData.state}</dd>

                    <dt className="col-sm-3">Pincode:</dt>
                    <dd className="col-sm-9">{newData.pincode}</dd>

                    <dt className="col-sm-3">Address:</dt>
                    <dd className="col-sm-9">{newData.address}</dd>
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
