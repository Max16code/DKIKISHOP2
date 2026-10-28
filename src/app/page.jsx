'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'
import { CartProvider } from '@/context/Cartcontext' // ✅ Import Provider

export default function LandingPortals() {
  return (
    <CartProvider> {/* ✅ Wrap the page to fix the Navbar crash */}
      <div className="relative h-screen w-full overflow-hidden bg-black text-white flex flex-col">
        <div className="absolute top-0 w-full z-50">
          <Navbar />
        </div>

        <div className="flex flex-col md:flex-row h-full w-full mt-16 md:mt-0">
          
          {/* THRIFT PORTAL */}
          <Link href="/thrift" className="relative flex-1 group overflow-hidden border-b md:border-b-0 md:border-r border-white/10">
            <motion.div 
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <Image
                src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=2000&auto=format&fit=crop"
                alt="Thrift Collection"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60 group-hover:opacity-80"
                priority
              />
            </motion.div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 transition-transform duration-500 group-hover:-translate-y-4">
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter drop-shadow-2xl"
              >
                THRIFT
              </motion.h2>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-300 mt-2 text-sm md:text-lg tracking-[0.2em] uppercase font-semibold"
              >
                Curated Pre-loved Gems
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 px-8 py-3 bg-white text-black font-bold uppercase tracking-wider rounded-full shadow-lg group-hover:bg-yellow-400 transition-colors duration-300"
              >
                Shop Thrift
              </motion.div>
            </div>
          </Link>

          {/* BRAND NEW PORTAL */}
          <Link href="/new" className="relative flex-1 group overflow-hidden">
            <motion.div 
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <Image
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop"
                alt="Brand New Collection"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60 group-hover:opacity-80"
                priority
              />
            </motion.div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 transition-transform duration-500 group-hover:-translate-y-4">
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter drop-shadow-2xl"
              >
                BRAND NEW
              </motion.h2>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-300 mt-2 text-sm md:text-lg tracking-[0.2em] uppercase font-semibold"
              >
                Fresh Drops, Zero Wear
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-8 px-8 py-3 bg-white text-black font-bold uppercase tracking-wider rounded-full shadow-lg group-hover:bg-yellow-400 transition-colors duration-300"
              >
                Shop New
              </motion.div>
            </div>
          </Link>
        </div>
      </div>
    </CartProvider>
  )
}
