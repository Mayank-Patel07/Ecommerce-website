import React, { useState } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import "./ForgotPasswordModal.css";

const ForgotPasswordModal = ({ show, handleClose }) => {
  // State for form fields
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI control states
  const [step, setStep] = useState(1); // Current step in password reset flow
  const [alert, setAlert] = useState({ message: "", type: "" }); // Alert message and type
  const [isLoading, setIsLoading] = useState(false); // Loading state for buttons
  const [timeLeft, setTimeLeft] = useState(0); // Countdown for OTP resend
  const [emailError, setEmailError] = useState(""); // Specific error for email field

  /**
   * Effect to automatically clear alerts after 5 seconds
   * Improves user experience by not requiring manual dismissal
   */
  React.useEffect(() => {
    if (alert.message) {
      const timer = setTimeout(() => {
        setAlert({ message: "", type: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  /**
   * Effect to handle countdown timer for OTP resend functionality
   * Prevents users from spamming the OTP request
   */
  React.useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Validates email format and updates error state
  // This function uses a regex pattern to check if the email is valid
  // It also sets an error message if the email is invalid or empty

  const validateEmail = (email) => {
    // Basic email validation with regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Please enter your email");
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  //  Sends OTP to user's email if email exists in database
  //   Uses a workaround to verify email existence while maintaining security
  //
  const sendOtp = async () => {
    // Reset previous alerts
    setAlert({ message: "", type: "" });

    // Validate email before proceeding
    if (!validateEmail(email)) {
      return;
    }

    setIsLoading(true);
    try {
      // First API call to request password reset
      const response = await axios.post(
        `http://localhost:5000/api/user/forgot-password`,
        { email }
      );

      // Check if email exists in the database by making a separate verification request
      try {
        // This is a workaround since the backend doesn't directly tell us if the email exists
        // We'll use the fact that the server will respond with a success message
        // but won't actually send an OTP if the email doesn't exist
        const verifyEmailExists = await axios.post(
          `http://localhost:5000/api/user/login`,
          {
            email,
            password: "dummy-password-for-check-only",
          }
        );

        // If we get here without an error, the email exists (though login failed due to wrong password)
        // This shouldn't happen in normal flow, but we'll handle it just in case
        setAlert({
          message: "Unknown error occurred, please try again.",
          type: "danger",
        });
      } catch (emailCheckErr) {
        // If status is 400, the email exists but the password is wrong (which is what we want)
        // Any other error means the email likely doesn't exist
        if (emailCheckErr.response?.status === 400) {
          // Email exists, proceed to next step
          setStep(2);

          // Handle development mode where OTP might be returned directly
          if (response.data.devOtp) {
            setAlert({
              message: `Development mode: OTP is ${response.data.devOtp} (only shown in development)`,
              type: "warning",
            });
            setOtp(response.data.devOtp);
          } else {
            setAlert({
              message: "OTP sent to your email. Valid for 10 minutes.",
              type: "success",
            });
          }

          setTimeLeft(60); // Set a 60-second countdown for resend
        } else {
          // Email likely doesn't exist in the database
          setAlert({
            message:
              "Email not registered in our system. Please check your email or sign up.",
            type: "danger",
          });
        }
      }
    } catch (err) {
      // Handle server errors or other issues
      setAlert({
        message:
          err.response?.data?.message || "Error sending OTP. Please try again.",
        type: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verifies the OTP entered by the user
   * Proceeds to password reset step if verification is successful
   */
  const verifyOtp = async () => {
    // Validate OTP format before making API call
    if (!otp) {
      setAlert({ message: "Please enter the OTP", type: "danger" });
      return;
    }

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setAlert({ message: "OTP must be 6 digits", type: "danger" });
      return;
    }

    setIsLoading(true);
    try {
      // Call API to verify OTP
      await axios.post(`http://localhost:5000/api/user/verify-otp`, {
        email,
        otp,
      });
      setStep(3);
      setAlert({
        message: "OTP verified. Please set your new password.",
        type: "success",
      });
    } catch (err) {
      setAlert({
        message:
          err.response?.data?.message || "Invalid OTP. Please try again.",
        type: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles the final password reset step
   * Validates password requirements and updates the user's password
   */
  const resetPassword = async () => {
    // Validate password requirements
    if (!newPassword) {
      setAlert({ message: "Please enter a new password", type: "danger" });
      return;
    }
    if (newPassword.length < 8) {
      setAlert({
        message: "Password must be at least 8 characters",
        type: "danger",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setAlert({ message: "Passwords do not match", type: "danger" });
      return;
    }

    setIsLoading(true);
    try {
      // Call API to reset password
      await axios.post(`http://localhost:5000/api/user/reset-password`, {
        email,
        otp,
        newPassword,
      });
      setAlert({ message: "Password reset successfully!", type: "success" });

      // Reset form and close after a short delay
      setTimeout(() => {
        setStep(1);
        setEmail("");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        handleClose();
      }, 2000);
    } catch (err) {
      setAlert({
        message:
          err.response?.data?.message ||
          "Error resetting password. Please try again.",
        type: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Unified submit handler for all steps
   * Routes to the appropriate function based on current step
   */
  const handleSubmit = () => {
    if (step === 1) return sendOtp();
    if (step === 2) return verifyOtp();
    if (step === 3) return resetPassword();
  };

  /**
   * Renders the step indicator UI
   * Shows which step of the password reset flow the user is currently on
   */
  const renderStepIndicator = () => {
    return (
      <div className="step-indicator">
        <div className={`step ${step >= 1 ? "active" : ""}`}>
          <div className="step-number">1</div>
          <div className="step-title">Email</div>
        </div>
        <div className="step-line"></div>
        <div className={`step ${step >= 2 ? "active" : ""}`}>
          <div className="step-number">2</div>
          <div className="step-title">Verify</div>
        </div>
        <div className="step-line"></div>
        <div className={`step ${step >= 3 ? "active" : ""}`}>
          <div className="step-number">3</div>
          <div className="step-title">Reset</div>
        </div>
      </div>
    );
  };

  /**
   * Renders the form fields based on current step
   * Dynamically changes form content as user progresses through workflow
   */
  const renderFormByStep = () => {
    switch (step) {
      case 1:
        return (
          <Form.Group>
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) validateEmail(e.target.value);
              }}
              className={`form-input ${emailError ? "is-invalid" : ""}`}
              isInvalid={!!emailError}
            />
            {emailError ? (
              <Form.Control.Feedback type="invalid">
                {emailError}
              </Form.Control.Feedback>
            ) : (
              <Form.Text className="text-muted">
                We'll send a 6-digit OTP to this email.
              </Form.Text>
            )}
          </Form.Group>
        );
      case 2:
        return (
          <>
            <Form.Group>
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                value={email}
                disabled
                className="form-input disabled"
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Enter OTP</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").substring(0, 6))
                }
                className="form-input"
                maxLength={6}
              />
              <div className="d-flex justify-content-between align-items-center mt-2">
                <Form.Text className="text-muted">
                  Check your email inbox and spam folder
                </Form.Text>
                {timeLeft > 0 ? (
                  <span className="resend-timer">Resend in {timeLeft}s</span>
                ) : (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={sendOtp}
                    disabled={isLoading}
                    className="resend-btn"
                  >
                    Resend OTP
                  </Button>
                )}
              </div>
            </Form.Group>
          </>
        );
      case 3:
        return (
          <>
            <Form.Group>
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-input"
              />
              <Form.Text className="text-muted">
                Use at least 8 characters with a mix of letters and numbers
              </Form.Text>
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
              />
            </Form.Group>
          </>
        );
      default:
        return null;
    }
  };

  /**
   * Main component render method
   * Assembles all the pieces of the password reset flow
   */
  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      className="password-reset-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Reset Password</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {renderStepIndicator()}

        {alert.message && (
          <Alert variant={alert.type} className="mt-3 mb-3">
            {alert.message}
          </Alert>
        )}

        <Form className="mt-4">{renderFormByStep()}</Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="outline-secondary"
          onClick={handleClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isLoading}
          className="submit-btn"
        >
          {isLoading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Processing...
            </>
          ) : step === 1 ? (
            "Send OTP"
          ) : step === 2 ? (
            "Verify OTP"
          ) : (
            "Reset Password"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ForgotPasswordModal;
