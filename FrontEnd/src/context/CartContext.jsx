import { createContext, useContext, useState } from "react";
import { toast } from "react-toastify";
const CartContext = createContext();

// CartProvider component to provide cart context to the application
// It uses useState to manage cart items and provides functions to add, increment, decrement, delete items, and clear the cart.
export const CartProvider = ({ children }) => {
  // State to hold cart items
  // useState is a React hook that allows you to add state to functional components
  // It returns an array with two elements: the current state and a function to update it
  const [cartItems, setCartItems] = useState([]);

  // Function to add a product to the cart
  // It checks if the product already exists in the cart
  // If it does, it increments the quantity, otherwise it adds the product with a quantity of 1
  // The function uses the setCartItems function to update the state
  // The function takes a product object as an argument
  const addToCart = (product) => {
    // Check if the product is already in the cart
    setCartItems((prev) => {
      // If the product is already in the cart, increment its quantity
      // If not, add it to the cart with a quantity of 1
      const exist = prev.find((item) => item._id === product._id);
      // If the product already exists in the cart, increment its quantity
      // Otherwise, add it to the cart with a quantity of 1
      if (exist) {
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // If the product does not exist in the cart, add it with a quantity of 1
      // The spread operator (...) is used to create a new array with the existing items and the new product
      // The new product is created by spreading the properties of the product object and adding a quantity property with a value  of 1
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Function to increment the quantity of a product in the cart
  // The function takes the product ID as an argument
  // It takes the product ID as an argument and updates the cart items state
  // It maps over the previous cart items and increments the quantity of the product with the matching ID
  // The spread operator (...) is used to create a new array with the updated item
  // The function uses the setCartItems function to update the state
  const incrementQty = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // Function to clear the cart
  // It sets the cart items state to an empty array, effectively removing all items from the cart
  // The function uses the setCartItems function to update the state
  const clearCart = () => {
    setCartItems([]);
  };

  // Function to decrement the quantity of a product in the cart
  // The function takes the product ID as an argument
  // It maps over the previous cart items and decrements the quantity of the product with the matching ID
  // If the quantity becomes 0, the item is removed from the cart
  // The spread operator (...) is used to create a new array with the updated item
  // The function uses the setCartItems function to update the state
  const decrementQty = (id) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item._id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Function to delete an item from the cart
  // The function takes the product ID as an argument
  // It filters the cart items to remove the item with the matching ID
  const deleteItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item._id !== id));
    toast.success("Item deleted successfully");
  };

  return (
    // The CartContext.Provider component provides the cart context to its children
    // It takes a value prop that contains the cart items and functions to manage the cart  
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
