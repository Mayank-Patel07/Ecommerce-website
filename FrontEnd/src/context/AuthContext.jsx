import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

// Helper to handle both Base64 and URL images
const processUserImage = (userData) => {
  if (!userData || !userData.image) return userData;

  // Check if image is already in the correct format
  const processedData = { ...userData };

  // Standardize image processing
  if (processedData.image.startsWith("data:image")) {
    return processedData;
  }

  // Check if image is a URL
  // This regex checks for a valid URL format
  if (processedData.image.startsWith("http")) {
    return processedData;
  }

  // Handle Base64 strings and file paths
  const base64Regex = /^[A-Za-z0-9+/=]+$/;
  if (base64Regex.test(processedData.image)) {
    // Ensure Base64 string has proper prefix
    processedData.image = `data:image/jpeg;base64,${processedData.image}`;
  } else {
    // Handle file paths
    if (!processedData.image.startsWith("/")) {
      processedData.image = "/" + processedData.image;
    }
    processedData.image = `http://127.0.0.1:5000${processedData.image}`;
  }

  return processedData;
};

export const AuthProvider = ({ children }) => {
  // Initialize state
  // Using localStorage to persist token
  // across page refreshes
  const [token, setToken] = useState(localStorage.getItem("TOKEN"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // this function will be called when the component mounts
    // and whenever the token changes
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        // Fetch user details from the server
        const { data } = await axios.get(
          "http://127.0.0.1:5000/api/user/details",
          {
            headers: { "auth-token": token },
          }
        );
        const processedUser = processUserImage(data);
        setUser(processedUser);
      } catch (err) {
        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
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

  // Function to handle login
  // and set the token in localStorage
  const login = (newToken) => {
    localStorage.setItem("TOKEN", newToken);
    setToken(newToken);
  };

  // Function to handle logout
  // and remove the token from localStorage
  // and reset the user state
  const logout = () => {
    localStorage.removeItem("TOKEN");
    setToken(null);
    setUser(null);
  };

  // Function to update user data
  // This function will be used to update user data
  const updateUserData = (updatedData) => {
    setUser((prev) => {
      
      const updated = { ...prev, ...updatedData };
      return updated;
    });
  };

  
  const updateUserImage = async (imageFile) => {
    try {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = () => {
          const base64Image = reader.result;
          
          // Update user state with preview
          setUser((prev) => ({
            ...prev,
            previewImage: base64Image,
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

  const saveUserImage = async (userId, imageData) => {
    try {
      // Ensure base64 data has correct prefix
      const base64Data = imageData.startsWith('data:image')
        ? imageData.split('base64,')[1]
        : imageData;

      const response = await axios.post(
        `http://127.0.0.1:5000/api/user/update/${userId}`,
        { image: base64Data },
        { headers: { "auth-token": token } }
      );

      // Update user state with the saved image
      if (response.data && response.data.success) {
        setUser((prev) => {
          const updatedUser = {
            ...prev,
            image: `data:image/jpeg;base64,${base64Data}`,
            previewImage: null, // Clear preview
          };
          return updatedUser;
        });
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
        updateUserImage,
        saveUserImage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};