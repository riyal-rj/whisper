import React, { createContext, useContext, useState, useEffect } from "react";
import { UserInterface } from "@/types/chat";
import { useNavigate } from "react-router-dom";

interface AuthState {
  user: UserInterface | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: {
    name?: string;
    profilePicture?: File;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const navigate = useNavigate();
  useEffect(() => {
    // Check for existing auth token on app load
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (email: string): Promise<void> => {
    try {
      // Call your backend API to send OTP
      const response = await fetch("http://localhost:5000/api/v1/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to send OTP");
      }
    } catch (error) {
      throw new Error("Failed to send OTP");
    }
  };

  const verifyOTP = async (email: string, otp: string): Promise<void> => {
    try {
      // Call your backend API to verify OTP
      const response = await fetch("http://localhost:5000/api/v1/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      if (!response.ok) {
        throw new Error("Invalid OTP");
      }

      const data = await response.json();
      // const { token, user } = data;

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userData", JSON.stringify(data.user));

      setAuthState((prev) => ({
        ...prev,
        user: data.user,
        isAuthenticated: true,
      }));
    } catch (error) {
      throw new Error("Invalid OTP");
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    navigate("/");
  };

  const updateProfile = async (data: { name?: string; profilePicture?: File }) => {
  try {
    const token = localStorage.getItem('authToken');
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.profilePicture) formData.append('profilePicture', data.profilePicture);

    const response = await fetch('http://localhost:5000/api/v1/update-profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) throw new Error('Failed to update profile');

    const resData = await response.json();
    console.log("Update profile response:", resData);

    if (resData.token) localStorage.setItem('authToken', resData.token);
    if (resData.user) localStorage.setItem('userData', JSON.stringify(resData.user));

    setAuthState(prev => ({
      ...prev,
      user: resData.user,
      isAuthenticated: true,
    }));
  } catch (error) {
    console.error(error);
    throw new Error('Failed to update profile');
  }
};


  const value: AuthContextType = {
    ...authState,
    login,
    verifyOTP,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};