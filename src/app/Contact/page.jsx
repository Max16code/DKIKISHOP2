import React from 'react';
import Link from 'next/link';
import { FcPhone } from 'react-icons/fc';
import { BsEnvelope, BsFillGeoAltFill } from 'react-icons/bs';
import Navbar from '@/components/Navbar';
import { FaSquareInstagram } from "react-icons/fa6";

export default function ContactPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-20 py-10 flex flex-col lg:flex-row gap-10">
      {/* Left: Contact Details */}
      <div className="flex-1 space-y-6">
        <h1 className="text-3xl font-extrabold mb-2">Get In Touch</h1>
        <p className="text-yellow-400">
          Welcome to the world of affordable luxury
        </p>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold mt-6">Contact Information</h2>

          <div>
            <p className="flex items-center gap-2 font-bold text-white mt-4">
              <FcPhone className="text-xl" />
              Phone
            </p>
            <h3 className="ml-6 text-yellow-400">08065082231</h3>
          </div>

          <div>
            <p className="flex items-center gap-2 font-bold text-white mt-4">
              <FaSquareInstagram />
              instagram
            </p>
            <Link href="https://instagram.com/dkikishop.ng" className="text-gray-400 ml-6 hover:text-yellow-400 transition-colors">dkikishop.ng</Link>
          </div>

          <div>
            <p className="flex items-center gap-2 font-bold text-white mt-4">
              <BsFillGeoAltFill className="text-lg" />
              tiktok
            </p>
          <Link href="https://www.tiktok.com/@dkikishop" className="text-gray-400 ml-6 hover:text-yellow-400 transition-colors">dkikishop
              
            </Link>

          </div>
        </div>
      </div>


    </div>
  );
}
