import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

// Helper to handle both Base64 and URL images
const processUserImage = (userData) => {
  // If no user data or no image, return as is
  // This is to prevent errors when destructuring userData.image
  if (!userData || !userData.image) return userData;

  // Make a copy to avoid modifying the original
  const processedData = { ...userData };

  // If the image is already a Base64 string, keep it as is
  if (processedData.image.startsWith("data:image")) {
    return processedData;
  }

  // If the image is a URL (starts with http), keep it as is
  if (processedData.image.startsWith("http")) {
    return processedData;
  }

  // If we get here, it's likely a Base64 string without the prefix
  // Check if it looks like Base64 (contains only valid Base64 characters)
  const base64Regex = /^[A-Za-z0-9+/=]+$/;
  if (base64Regex.test(processedData.image)) {
    // It's likely a Base64 string without the prefix
    console.log("Found raw Base64 image data");
    // We don't add the prefix here because we'll handle it in the Navbar component
  } else {
    // It's probably a path, handle it accordingly
    console.log("Image appears to be a path:", processedData.image);

    // If it doesn't start with a slash, add one
    if (!processedData.image.startsWith("/")) {
      processedData.image = "/" + processedData.image;
    }

    // Prepend the API URL
    processedData.image = `http://127.0.0.1:5000${processedData.image}`;
  }

  return processedData;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("TOKEN"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching user with token:", token);
        const { data } = await axios.get(
          "http://127.0.0.1:5000/api/user/details",
          {
            headers: { "auth-token": token },
          }
        );

        console.log("Raw data from API:", data);

        // Process the user data including image handling
        const processedUser = processUserImage(data);

        console.log("Processed user data:", processedUser);
        setUser(processedUser);
      } catch (err) {
        console.error("Failed to fetch user:", err);

        // If token is invalid, clear it
        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          console.log("Invalid token, logging out");
          localStorage.removeItem("TOKEN");
          setToken(null);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = (newToken) => {
    console.log("Logging in with token:", newToken);
    localStorage.setItem("TOKEN", newToken);
    setToken(newToken);
  };

  const logout = () => {
    console.log("Logging out");
    localStorage.removeItem("TOKEN");
    setToken(null);
    setUser(null);
  };

  const updateUserData = (updatedData) => {
    console.log("Updating user data:", updatedData);
    setUser((prev) => {
      const updated = { ...prev, ...updatedData };
      console.log("New user state:", updated);
      return updated;
    });
  };

  // Function to handle image upload
  const updateUserImage = async (imageFile) => {
    try {
      // Convert image to Base64
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = () => {
          const base64Image = reader.result;

          // Update local state immediately for UI feedback
          setUser((prev) => ({
            ...prev,
            previewImage: base64Image, // For immediate display
          }));

          resolve(base64Image);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(imageFile);
      });
    } catch (error) {
      console.error("Error in updateUserImage:", error);
      throw error;
    }
  };

  // Function to save the image to the backend
  const saveUserImage = async (userId, imageData) => {
    try {
      // Skip the data:image/jpeg;base64, prefix if present
      const base64Data = imageData.includes("base64,")
        ? imageData.split("base64,")[1]
        : imageData;

      const response = await axios.post(
        `http://127.0.0.1:5000/api/user/update/${userId}`,
        { image: base64Data },
        { headers: { "auth-token": token } }
      );

      // Update user state with the saved image
      if (response.data && response.data.success) {
        setUser((prev) => ({
          ...prev,
          image: base64Data, // Store just the Base64 data
          previewImage: null, // Clear preview once saved
        }));
        return { success: true, data: response.data };
      }

      return { success: false, error: "Failed to save image" };
    } catch (error) {
      console.error("Error saving user image:", error);
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
        updateUserData,
        updateUserImage, // New function for image upload
        saveUserImage, // New function to save image to backend
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
