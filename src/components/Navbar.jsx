'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useCart } from '@/context/Cartcontext'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('thrift')
  const { cartItems } = useCart()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname.startsWith('/new')) {
      setActiveSection('brandNew')
    } else if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('section') === 'brandNew') {
        setActiveSection('brandNew')
      } else {
        setActiveSection('thrift')
      }
    }
  }, [pathname])

  const isLandingPage = pathname === '/'
  const isBrandNewSection = activeSection === 'brandNew'

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Blazers', href: '/category/blazers' },
    { name: 'Jeans', href: '/category/jeans' },
    { name: 'Tops', href: '/category/tops' },
    { name: 'Skirts', href: '/category/skirts' },
    { name: 'Shirts', href: '/category/shirts' },
    { name: 'Dresses', href: '/category/dresses' },
    { name: 'Activewears', href: '/category/activewears' },
    { name: 'Shorts', href: '/category/shorts' },
    { name: 'Accessories', href: '/category/accessories' },
    { name: 'TwoPiece', href: '/category/twopiece' },
    { name: 'Linen', href: '/category/linen' }
  ]

  const brandNewCategories = ['Home', 'Tops', 'Dresses', 'Jeans', 'TwoPiece', 'Linen', 'Shorts', 'Accessories']

  let displayedLinks = navLinks

  if (isLandingPage) {
    displayedLinks = navLinks.filter(link => link.name === 'Home')
  } else if (isBrandNewSection) {
    displayedLinks = navLinks.filter(link => brandNewCategories.includes(link.name))
  } else {
    displayedLinks = navLinks.filter(link => link.name !== 'Accessories')
  }

  // ✅ Always route through /category/[cat] but tag the section
  const buildHref = (baseHref) => {
    if (baseHref === '/' || baseHref === '/Contact') return baseHref
    return `${baseHref}?section=${activeSection}`
  }

  return (
    <>
      <nav className="fixed top-5 z-50 w-full bg-white/40 backdrop-blur-md border-b border-white/30 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between relative">
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-black z-10">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link href="/" className="absolute left-1/2 transform -translate-x-1/2 md:static md:translate-x-0 z-0">
            <div className="relative w-12 h-12 overflow-hidden rounded-full shadow-md hover:shadow-lg transition-shadow duration-300">
              <Image src="/images/kikiLogo.jpg" alt="Dkikishop Logo" fill className="object-cover" sizes="48px" priority />
            </div>
          </Link>

          <div className="hidden md:flex gap-6 ml-10">
            {displayedLinks.map((link, index) => (
              <Link
                key={link.name}
                href={buildHref(link.href)}
                className={`text-black hover:text-pink-600 font-extrabold transition-colors duration-200 ${index === displayedLinks.length - 1 ? 'mr-6' : ''}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4 z-10">
            <Link href="/Contact" className="text-black font-medium hover:text-pink-600 transition hidden md:inline">
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

        {isOpen && (
          <div className="md:hidden animate-fade-in bg-white/90 backdrop-blur-md shadow-md px-6 py-4 space-y-3">
            {displayedLinks.map((link) => (
              <Link
                key={link.name}
                href={buildHref(link.href)}
                className="block text-lg font-medium text-black hover:text-pink-600 transition"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link href="/Contact" className="block text-lg font-medium text-black hover:text-pink-600 transition" onClick={() => setIsOpen(false)}>
              Contact
            </Link>
          </div>
        )}
      </nav>
      <div className="h-20"></div>
    </>
  )
}
