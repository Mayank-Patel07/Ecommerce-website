import React, { useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar({ Dis_data, setDis_Data }) {
  // Destructure the props
  const navigate = useNavigate();

  // Destructure the AuthContext to get user, logout, and token
  // This allows us to access the user information and logout function from the context, which is provided by the AuthProvider component
  const { user, logout, token } = useContext(AuthContext);

  // Handle logout function
  // This function will be called when the user clicks the logout button
  // It will call the logout function from the AuthContext to clear the token and user data, and then navigate to the login page
  // It also updates the display data to show the login and register options and hide the logout option
  // Finally, it navigates to the login page
  const handleLogout = () => {
    // Call the logout function from the AuthContext to clear the token and user data
    logout();
    setDis_Data({
      logout: "none",
      login: "block",
      register: "block",
    });
    navigate("/login");
  };

  // Navigation links for the navbar
  // These links will be displayed in the navbar for easy navigation
  // Each link has a path and a label
  // The path is the URL to navigate to when the link is clicked
  // The label is the text that will be displayed for the link
  const navLinks = [
    { path: "/allproducts", label: "All Products" },
    { path: "/mens", label: "Men's Wear" },
    { path: "/kids", label: "Kids Wear" },
    { path: "/womens", label: "Women's Wear" },
    { path: "/uploads", label: "Upload" },
  ];

  // Helper function to render user avatar properly
  // This function checks if the user has a preview image or a stored image from the database
  const renderUserAvatar = () => {
    // If there's a preview image (from recent upload), use that first
    if (user?.previewImage) {
      return (
        <img
          src={user.previewImage}
          alt="Profile"
          className="rounded-circle me-2"
          style={{ width: "24px", height: "24px", objectFit: "cover" }}
        />
      );
    }

    // If there's a stored image from the database (could be Base64 or URL)
    if (user?.image) {
      // Determine if this is already a Base64 string
      const isBase64 = user.image.startsWith("data:image");

      return (
        <img
          src={isBase64 ? user.image : `data:image/jpeg;base64,${user.image}`}
          alt="Profile"
          className="rounded-circle me-2"
          style={{ width: "24px", height: "24px", objectFit: "cover" }}
          onError={(e) => {
            console.error("Image failed to load:", e);
            e.target.onerror = null; // Prevent infinite error loop
            e.target.src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='12' fill='%23718096'/%3E%3Cpath d='M12 14c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v1h16v-1c0-2.66-5.33-4-8-4z' fill='%23ffffff'/%3E%3C/svg%3E";
          }}
        />
      );
    }
    // Default avatar
    return <span className="me-2">👤</span>;
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-light fixed-top"
      style={{
        background: "linear-gradient(to right, #294948 0%, #03070A 100%)",
        color: "white",
        padding: "7px 25px",
      }}
    >
      <div className="container-fluid">
        <Link
          className="navbar-brand text-white border border-white p-1 rounded"
          to="/"
        >
          BRAINSKART
        </Link>

        <button
          className="navbar-toggler bg-white"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {navLinks.map((link) => (
              <li className="nav-item" key={link.path}>
                <Link className="nav-link text-white" to={link.path}>
                  {link.label}
                </Link>
              </li>
            ))}

            <li className="nav-item">
              <Link className="nav-link text-white" to="/cart">
                🛒 Cart
              </Link>
            </li>
          </ul>

          <ul className="navbar-nav">
            <li className="nav-item">
              <Link
                className="nav-link text-white d-flex align-items-center"
                to="/profile"
              >
                {renderUserAvatar()}
                <span>{user?.name || ""}</span>
              </Link>
            </li>

            {!token && (
              <>
                <li className="nav-item">
                  <Link className="nav-link text-white" to="/login">
                    🔐 Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-white" to="/register">
                    ⚙️ Register
                  </Link>
                </li>
              </>
            )}

            {token && (
              <li className="nav-item">
                <button
                  className="nav-link text-white bg-transparent border-0"
                  style={{ cursor: "pointer" }}
                  onClick={handleLogout}
                >
                  🔓 Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
