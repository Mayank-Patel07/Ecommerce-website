import { createContext, useContext, useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { AuthContext } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Destructure the AuthContext to get user, loading
  // This allows us to access the user information and loading state from the context, which is provided by the AuthProvider component
  const { user, loading } = useContext(AuthContext);
  // Initialize cartItems state
  // This state will hold the items in the cart
  const [cartItems, setCartItems] = useState([]);

  // Save latest known userId in a ref to avoid race conditions
  // This ref will hold the user ID to ensure that we are saving the cart items for the correct user
  // It will be updated whenever the user ID changes
  const userIdRef = useRef("guest");

  // Update userIdRef whenever loading or user changes
  // This effect will run whenever the loading state or user changes
  // If loading is false and user has an ID, set userIdRef to that ID
  // If loading is false and user does not have an ID, set userIdRef to "guest"
  useEffect(() => {
    if (!loading && user?._id) {
      userIdRef.current = user._id;
    } else if (!loading && !user?._id) {
      userIdRef.current = "guest";
    }
  }, [loading, user]);

  // Helper function to get the storage key for localStorage
  // This function takes a userId as an argument and returns a string that will be used as the key for localStorage
  const getStorageKey = (userId) => `cart_${userId || "guest"}`;

  // Load cart from localStorage
  useEffect(() => {
    // If loading is true, do not run this effect
    // This is to ensure that we are not trying to access user data before it is loaded
    if (loading) return;

    // Get the user ID from the user object or set it to "guest" if not available
    // This is to ensure that we are using the correct user ID for localStorage
    const userId = user?._id || "guest";
    const storageKey = getStorageKey(userId);
    // Get the cart items from localStorage using the storage key
    const savedCart = localStorage.getItem(storageKey);
    try {
      // Parse the saved cart items from localStorage
      // If there are no saved cart items, set cartItems to an empty array
      setCartItems(savedCart ? JSON.parse(savedCart) : []);
    } catch (err) {
      console.error("Failed to parse cart:", err);
      setCartItems([]);
    }
  }, [user?._id, loading]);

  // Save cart to localStorage
  useEffect(() => {
    // If loading is true, do not run this effect
    if (loading) return;

    // Saving the current ref value
    // This is to ensure that we are using the correct user ID for localStorage
    // This will be the user ID that we saved in the userIdRef
    const userId = userIdRef.current;
    const storageKey = getStorageKey(userId);
    // Save the cart items to localStorage using the storage key
    // This will save the current cart items to localStorage
    localStorage.setItem(storageKey, JSON.stringify(cartItems));
    // If the user is not a guest, send the cart items to the server
    // This will send the current cart items to the server to be saved
  }, [cartItems, loading]);

  const addToCart = (product) => {
    // Check if the product is already in the cart
    // If it is, increment the quantity
    setCartItems((prev) => {
      const exist = prev.find((item) => item._id === product._id);
      // If the product already exists in the cart, increment its quantity
      if (exist) {
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // If the product does not exist in the cart, add it with a quantity of 1
      // This will add the product to the cart with a quantity of 1
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Increment and decrement quantity functions
  // These functions will be used to increment and decrement the quantity of items in the cart
  const incrementQty = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // Decrement quantity function
  // This function will be used to decrement the quantity of items in the cart
  const decrementQty = (id) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item._id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Delete item function
  // This function will be used to delete an item from the cart
  const deleteItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item._id !== id));
    toast.success("Item deleted successfully");
  };

  // Clear cart function
  // This function will be used to clear the entire cart
  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        incrementQty,
        decrementQty,
        deleteItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
