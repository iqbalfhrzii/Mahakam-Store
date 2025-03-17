/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; 

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null); 
  const [ setAuthToken] = useState(localStorage.getItem("authToken")); 
  const saveUserRole = (role) => {
    setUserRole(role); 
  };

  const login = async (userCredentials) => {
    // Logika login bisa ditambahkan di sini
  };

  const logout = () => {
    setUserRole(null);
    setAuthToken(null);
    localStorage.removeItem("authToken");  
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
  
    if (token) {
      try {
    
        const decodedToken = jwtDecode(token);
        // console.log("Decoded token:", decodedToken);
        const role = decodedToken.role || "user";   
        saveUserRole(role);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);  

  return (
    <UserContext.Provider value={{ userRole, saveUserRole, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);


