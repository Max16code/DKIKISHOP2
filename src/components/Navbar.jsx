'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useCart } from '@/context/Cartcontext'
import Image from 'next/image'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { cartItems } = useCart()

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Blazers', href: '/category/blazers' },
    { name: 'Jeans', href: '/category/jeans' },
    { name: 'Shirts', href: '/category/shirts' },
    { name: 'Skirts', href: '/category/skirts' },
    { name: 'Dresses', href: '/category/dresses' },
    { name: 'Activewears', href: '/category/activewears' },
    { name: 'Shorts', href: '/category/shorts' },         // 🆕 Added
    { name: 'Accessories', href: '/category/accessories' }, // 🆕 Added
    
  ]

  return (
    <>
      <nav className="fixed top-5 z-50 w-full bg-white/40 backdrop-blur-md border-b border-white/30 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between relative">
          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-black z-10"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="absolute left-1/2 transform -translate-x-1/2 md:static md:translate-x-0 z-0"
          >
            <div className="relative w-12 h-12">
              {/* Main Logo */}
              <Image
                src="/images/kikiLogo.jpg"
                alt="Dkikishop Logo"
                fill
                className="rounded-full object-cover shadow-md hover:opacity-90 transition"
              />

              
            </div>


          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex gap-6 ml-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-black hover:text-pink-600 font-extrabold transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Side: Contact + Cart */}
          <div className="flex items-center gap-4 z-10">
            <Link
              href="/Contact"
              className="text-black font-medium hover:text-pink-600 transition hidden md:inline"
            >
              Contact
            </Link>

            <Link href="/cart" className="relative pr-2">
              <ShoppingCart className="w-6 h-6 text-black hover:text-pink-600 transition" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full px-1.5">
                  {cartItems.length}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden animate-fade-in bg-white/90 backdrop-blur-md shadow-md px-6 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block text-lg font-medium text-black hover:text-pink-600 transition"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            {/* Contact in Mobile Dropdown */}
            <Link
              href="/contact"
              className="block text-lg font-medium text-black hover:text-pink-600 transition"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
          </div>
        )}
      </nav>

      {/* Spacer */}
      <div className="h-20"></div>
    </>
  )
}
