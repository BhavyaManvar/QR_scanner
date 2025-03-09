"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type User = {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  showAuthPopup: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  setShowAuthPopup: (show: boolean) => void
  updateUser: (updates: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthPopup, setShowAuthPopup] = useState(false) // Changed to false initially to prevent camera issues
  
  // Check if user is already logged in from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
    
    // Delay showing auth popup to allow camera initialization
    const timer = setTimeout(() => {
      if (!storedUser) {
        setShowAuthPopup(true)
      }
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])
  
  // Detect if we're on a camera-related page
  useEffect(() => {
    const handleHashChange = () => {
      const isOnCameraSection = window.location.hash === '#scanner'
      if (isOnCameraSection) {
        // Temporarily hide auth popup on camera section
        setShowAuthPopup(false)
      } else if (!user) {
        // Show auth popup on other sections if not logged in
        setShowAuthPopup(true)
      }
    }
    
    // Check on initial load
    handleHashChange()
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [user])

  // Mock login function - in a real app, this would call your API
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock user data - in a real app, this would come from your API
      const mockUser: User = {
        id: "user-" + Math.random().toString(36).substr(2, 9),
        name: email.split('@')[0],
        email: email
      }
      
      setUser(mockUser)
      localStorage.setItem("user", JSON.stringify(mockUser))
      setShowAuthPopup(false)
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Mock signup function - in a real app, this would call your API
  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock user data - in a real app, this would come from your API
      const mockUser: User = {
        id: "user-" + Math.random().toString(36).substr(2, 9),
        name: name,
        email: email
      }
      
      setUser(mockUser)
      localStorage.setItem("user", JSON.stringify(mockUser))
      setShowAuthPopup(false)
    } catch (error) {
      console.error("Signup error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    // Don't immediately show auth popup on logout
    setTimeout(() => {
      setShowAuthPopup(true)
    }, 1000)
  }

  const updateUser = async (updates: Partial<User>) => {
    if (!user) throw new Error("No user logged in")
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
      
      return updatedUser
    } catch (error) {
      console.error("Update user error:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        showAuthPopup,
        login,
        signup,
        logout,
        setShowAuthPopup,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 