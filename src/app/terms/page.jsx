// app/terms/page.tsx
'use client'

import Navbar from '@/components/Navbar'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function TermsOfService() {
    return (
        <div className="relative min-h-screen bg-gradient-to-br from-[#1f1f1f] to-[#121212] overflow-hidden">
            {/* Faint Logo Background */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/kikiLogo.jpg"
                    alt="Background Logo"
                    fill
                    className="object-cover opacity-5"
                    sizes="100vw"
                    priority
                />
            </div>

            <Navbar />

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-16">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-wide mb-4">
                        Terms of Service for{' '}
                        <span className="text-yellow-400">DKIKISHOP.com</span>
                    </h1>
                    <p className="text-gray-400">
                        Last Updated: March 15, 2026
                    </p>
                </motion.div>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="prose prose-invert prose-yellow max-w-none"
                >
                    {/* The Short Version - Highlighted Section */}
                    <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-6 mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">✨ The Short Version</h2>
                        <p className="text-gray-300 text-lg">
                            We sell Trendy and affordable luxury fashion on a budget. You buy it. We deliver it. Everyone's happy. Here are the simple rules.
                        </p>
                    </div>

                    {/* 1. Who We Are */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">1. Who We Are</h2>
                        <p className="text-gray-400">
                            <span className="text-yellow-400 font-semibold">DKIKISHOP</span> is your go-to for trendy and affordable fashion without the luxury price tag. We're here to help you look amazing without breaking the bank.
                        </p>
                    </div>

                    {/* 2. Who Can Use DKIKISHOP */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">2. Who Can Use DKIKISHOP</h2>
                        <ul className="list-disc list-inside text-gray-400 space-y-2">
                            <li>You must be <span className="text-yellow-400">18 years or older</span> to make a purchase</li>
                            <li>If you're under 18, shop with a parent or guardian's permission</li>
                            <li>By using our site, you promise the information you give us is correct</li>
                        </ul>
                    </div>

                    {/* 3. Our Products */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">3. Our Products</h2>

                        <h3 className="text-xl font-medium text-white mb-3">3.1 What You See Is What You Get</h3>
                        <ul className="list-disc list-inside text-gray-400 mb-4">
                            <li>We do our best to show accurate colors, but screens can vary slightly</li>
                            <li>Product descriptions are based on either manufacturer information and our own quality checks</li>
                            <li>Sizes may vary slightly between different brands and styles</li>
                        </ul>

                        <h3 className="text-xl font-medium text-white mb-3">3.2 Availability</h3>
                        <ul className="list-disc list-inside text-gray-400">
                            <li>If it's on the site, we're trying to keep it in stock</li>
                            <li>Sometimes items sell out fast (you girlies are quick! 💅)</li>
                            
                        </ul>
                    </div>

                    {/* 4. Pricing and Payments */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">4. Pricing and Payments</h2>

                        <h3 className="text-xl font-medium text-white mb-3">4.1 Our Prices</h3>
                        <ul className="list-disc list-inside text-gray-400 mb-4">
                            <li>All prices are in <span className="text-green-400">Nigerian Naira (₦)</span></li>
                            <li>Prices include all applicable taxes</li>
                            <li>We reserve the right to change prices, but don't worry – you pay the price at checkout</li>
                        </ul>

                        <h3 className="text-xl font-medium text-white mb-3">4.2 Payment</h3>
                        <ul className="list-disc list-inside text-gray-400">
                            <li>We accept major payment methods (cards, bank transfers, etc.)</li>
                            <li>Your payment is processed securely – we never see your card details</li>
                            <li>Full payment is required before items are shipped</li>
                        </ul>
                    </div>

                    {/* 5. Shipping and Delivery */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">5. Shipping and Delivery</h2>

                        <h3 className="text-xl font-medium text-white mb-3">5.1 Delivery Time</h3>
                        <ul className="list-disc list-inside text-gray-400 mb-4">
                            <li>We process orders within 24-48 hours</li>
                            <li>Delivery takes <span className="text-yellow-400">2-3 business days</span> nationwide</li>
                            <li><span className="text-green-400">Free shipping</span> on orders over ₦200,000</li>
                        </ul>

                        <h3 className="text-xl font-medium text-white mb-3">5.2 Delivery Area</h3>
                        <ul className="list-disc list-inside text-gray-400 mb-4">
                            <li>We deliver across Nigeria</li>
                            <li>If you're outside our delivery area, we'll let you know</li>
                        </ul>

                        <h3 className="text-xl font-medium text-white mb-3">5.3 Failed Deliveries</h3>
                        <ul className="list-disc list-inside text-gray-400">
                            <li>Please provide correct contact details</li>
                            <li>If our delivery agent can't reach you, they'll try again</li>
                            <li>Repeated failed delivery attempts may result in order cancellation</li>
                        </ul>
                    </div>

                    {/* 6. Returns and Refunds */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">6. Returns and Refunds</h2>

                        <h3 className="text-xl font-medium text-white mb-3">6.1 Our 2-Day Return Policy</h3>
                        <ul className="list-disc list-inside text-gray-400 mb-4">
                            <li>You have <span className="text-yellow-400">2 days</span> from delivery to request a return</li>
                            <li className="text-white">Items must be:</li>
                            <ul className="list-circle list-inside ml-6 text-gray-400 mb-2">
                                <li>Unworn</li>
                                <li>Unwashed</li>
                                <li>In original condition with all tags attached</li>
                            </ul>
                        </ul>

                        <h3 className="text-xl font-medium text-white mb-3">6.2 Non-Returnable Items</h3>
                        <ul className="list-disc list-inside text-gray-400 mb-4">
                            <li>Sale items (unless faulty)</li>
                            <li>Intimates (for hygiene reasons)</li>

                        </ul>

                        <h3 className="text-xl font-medium text-white mb-3">6.3 Refund Process</h3>
                        <ul className="list-disc list-inside text-gray-400">
                            <li>Once we receive and inspect your return, we'll process your refund within 3-5 business days</li>
                            <li>Refunds go back to your original payment method</li>
                            <li>Shipping costs are non-refundable</li>
                        </ul>
                    </div>



                    {/* 7. Our Rights */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">7. Our Rights</h2>
                        <p className="text-gray-400 mb-3">We reserve the right to:</p>
                        <ul className="list-disc list-inside text-gray-400">
                            <li>Cancel any order if we suspect fraud or unauthorized activity</li>
                            <li>Update these terms (we'll always post changes here)</li>
                            <li>Refuse service to anyone for valid reasons (like repeated returns of worn items)</li>
                        </ul>
                    </div>

                    {/* 8. Limitation of Liability */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">8. Limitation of Liability</h2>
                        <ul className="list-disc list-inside text-gray-400">
                            <li>We're not liable for any indirect damages arising from product use</li>
                            <li>Our total liability is limited to the purchase price of your order</li>
                            <li>We're not responsible for delays caused by events beyond our control (weather, strikes, etc.)</li>
                        </ul>
                    </div>

                    {/* 9. Contact Us */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">9. Contact Us</h2>
                        <p className="text-gray-400 mb-4">Questions? Problems? Just want to say hi?</p>

                        <div className="bg-white/5 p-6 rounded-lg border border-yellow-400/20 mb-4">
                            <p className="text-gray-300 mb-2"><span className="text-yellow-400">Email:</span> Tailoredbykiki@gmail.com</p>
                            <p className="text-gray-300 mb-2"><span className="text-yellow-400">Phone:</span> 08065082231</p>
                            <p className="text-gray-300"><span className="text-yellow-400">Instagram:</span> @dkikishop_backup</p>
                        </div>

                        <p className="text-yellow-400 font-semibold">We're here for you! 💛</p>
                    </div>

                    {/* The Simple Truth - Highlighted Section */}
                    <div className="bg-gradient-to-r from-yellow-400/20 to-transparent p-6 rounded-lg border-l-4 border-yellow-400 mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">The Simple Truth</h2>
                        <p className="text-gray-300 text-lg">
                            <span className="text-yellow-400 font-bold">You shop. We deliver. You slay. That's the DKIKISHOP promise.</span>
                        </p>
                    </div>

                    {/* Closing Note */}
                    <div className="text-center text-gray-400 border-t border-yellow-400/20 pt-8 mt-8">
                        <p className="mb-4">
                            Thanks for being part of our community!
                        </p>
                        <p className="text-yellow-400 font-semibold italic">
                            By using DKIKISHOP.com, you agree to these simple terms. Now go find your next favorite outfit! ✨
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}