"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MoonIcon, SunIcon, MenuIcon, XIcon, UserIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { useAuth } from "@/lib/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {
  const { setTheme, theme } = useTheme()
  const { user, isAuthenticated, logout, setShowAuthPopup } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isMenuOpen])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleAuthAction = () => {
    if (isAuthenticated) {
      logout()
    } else {
      setShowAuthPopup(true)
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-xl transition-colors duration-200 hover:text-primary">
            QR Scanner
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 items-center">
          <Link href="/" className="text-sm font-medium transition-all duration-200 hover:text-primary">
            Home
          </Link>
          <Link href="/#features" className="text-sm font-medium transition-all duration-200 hover:text-primary">
            Features
          </Link>
          <Link href="/#scanner" className="text-sm font-medium transition-all duration-200 hover:text-primary">
            Scanner
          </Link>
          <Link href="/#about" className="text-sm font-medium transition-all duration-200 hover:text-primary">
            About
          </Link>
          {isAuthenticated && (
            <Link href="/dashboard" className="text-sm font-medium transition-all duration-200 hover:text-primary">
              Dashboard
            </Link>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="transition-all duration-200">
                {theme === "dark" ? <SunIcon className="h-[1.2rem] w-[1.2rem]" /> : <MoonIcon className="h-[1.2rem] w-[1.2rem]" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="transition-all duration-200">
                  <UserIcon className="h-[1.2rem] w-[1.2rem]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.name || "User"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard?tab=overview" className="cursor-pointer w-full transition-all duration-200">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard?tab=profile" className="cursor-pointer w-full transition-all duration-200">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard?tab=history" className="cursor-pointer w-full transition-all duration-200">Scan History</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard?tab=settings" className="cursor-pointer w-full transition-all duration-200">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer transition-all duration-200">Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => setShowAuthPopup(true)} className="transition-all duration-200">
              Login / Register
            </Button>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
          {isMenuOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden animate-fade-in w-full">
          <nav className="container mx-auto px-4 flex flex-col space-y-3 py-4">
            <Link href="/" className="text-sm font-medium transition-all duration-200 hover:text-primary">
              Home
            </Link>
            <Link href="/#features" className="text-sm font-medium transition-all duration-200 hover:text-primary">
              Features
            </Link>
            <Link href="/#scanner" className="text-sm font-medium transition-all duration-200 hover:text-primary">
              Scanner
            </Link>
            <Link href="/#about" className="text-sm font-medium transition-all duration-200 hover:text-primary">
              About
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/dashboard?tab=overview" className="text-sm font-medium transition-all duration-200 hover:text-primary">
                  Dashboard
                </Link>
                <Link href="/dashboard?tab=profile" className="text-sm font-medium transition-all duration-200 hover:text-primary">
                  Profile
                </Link>
                <Link href="/dashboard?tab=history" className="text-sm font-medium transition-all duration-200 hover:text-primary">
                  Scan History
                </Link>
                <Link href="/dashboard?tab=settings" className="text-sm font-medium transition-all duration-200 hover:text-primary">
                  Settings
                </Link>
              </>
            )}
            <div className="flex justify-between items-center pt-2">
              <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="transition-all duration-200">
                {theme === "dark" ? <SunIcon className="h-[1.2rem] w-[1.2rem]" /> : <MoonIcon className="h-[1.2rem] w-[1.2rem]" />}
              </Button>
              <Button onClick={handleAuthAction} className="transition-all duration-200">
                {isAuthenticated ? "Logout" : "Login / Register"}
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

