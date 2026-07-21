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



                    {/* 1. Who We Are */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">1. Who We Are</h2>
                        <p className="text-gray-400">
                            <span className="text-yellow-400 font-semibold">DKIKISHOP</span> is your go-to fashion store for unique, trendy and affordable fashion. We help you build your capsule wardrope
                        </p>
                    </div>

                    {/* 2. Who Can Use DKIKISHOP */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">2. Who Can Use DKIKISHOP</h2>
                        <ul className="space-y-2 text-gray-400">
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>Women who want to look good and clean and don't want to break the bank to achieve this ❤️</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>Women who are trying to build their capsule wardrobe and essentials</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>Women who like unique fashion items</span>
                            </li>
                        </ul>
                    </div>

                    {/* 3. Our Products */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">3. Our Products</h2>

                        <h3 className="text-xl font-medium text-white mb-3">What You See Is What You Get</h3>
                        <ul className="space-y-2 text-gray-400 mb-4">
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>We do our best to show real pictures of most of the products, product might appear brighter or darker than they actually appear due to camera or lighting used</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>Product descriptions are based on either manufacturer's information or our own description, this is to help you understand the product better</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>Sizes are based on manufacturer's label or ours, this is to ensure we give accurate sizing</span>
                            </li>
                        </ul>

                        <h3 className="text-xl font-medium text-white mb-3">Availability</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>Any item not paid for is still available and can be taken out of cart after a while</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>Please note that some products are limited and can be taken out of your cart if you do not pay for it first</span>
                            </li>
                        </ul>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">Sizing</h2>
                        <ul className="space-y-2 text-gray-400 mb-4">
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>We use standard UK sizing</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>Kindly know your size before shopping</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>If you're unsure of your size, please send us a recent picture on WhatsApp so as to ascertain your size before shopping.</span>
                            </li>
                        </ul>
                    </div>

                    {/* 4. Pricing and Payments */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">4. Pricing and Payments</h2>

                        <h3 className="text-xl font-medium text-white mb-3">Our Prices</h3>
                        <ul className="space-y-2 text-gray-400 mb-4">
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>All prices are in <span className="text-green-400">Nigerian Naira (₦)</span></span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>Prices include all applicable taxes</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>We reserve the right to adjust prices when necessary</span>
                            </li>
                        </ul>

                        <h3 className="text-xl font-medium text-white mb-3"> Payment</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>We accept payments through various methods (Cards, bank transfers, etc.)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>Your payment is processed securely – we never see your card details</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>All online payments are processed via PAYSTACK</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>Full payment is required before items are shipped</span>
                            </li>
                        </ul>
                    </div>

                    {/* 5. Shipping and Delivery */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">5. SHIPPING AND DELIVERY</h2>

                        <h3 className="text-xl font-medium text-white mb-3">DELIVERY TIME FRAME</h3>
                        <ul className="space-y-2 text-gray-400 mb-4">
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>We process orders within 24-48 hours after payment</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>Delivery within Port Harcourt takes 24-48 hours (within working days)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>Delivery outside Port Harcourt takes 2-6 working days, depending on your location</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>Delivery outside Nigeria takes 7-14 working days</span>
                            </li>
                        </ul>

                        <h3 className="text-xl font-medium text-white mb-3"> STOCKPILING POLICY</h3>
                        <ul className="space-y-2 text-gray-400 mb-4">
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>We offer stockpile within a period of one month, this is so you can shop as many products as you want within this timeframe to maximize delivery fee.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>Please note that we're only responsible for items kept within one month, we're not liable to loss or damage of over stockpiled items.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>Items kept over a longer period of time (5 months max) will not be accounted for</span>
                            </li>
                        </ul>

                        <h3 className="text-xl font-medium text-white mb-3">6 RETURN AND REFUNDS</h3>
                        <h4 className="text-lg font-medium text-white mb-2">OUR RETURN POLICY</h4>
                        <ul className="space-y-2 text-gray-400 mb-4">
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>Items can be returned for exchange if there's damage or a wrong size was sent from our end</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>Items must be: Unworn, Unwashed, In original condition it was delivered with all tags attached</span>
                            </li>
                        </ul>

                        <h4 className="text-lg font-medium text-white mb-2">NON-RETURNABLE ITEMS</h4>
                        <ul className="space-y-2 text-gray-400 mb-4">
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>Items on price slash sales</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>Items already worn</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>Items that have exceeded the return window days</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>Items that was sent with accurate sizing</span>
                            </li>
                        </ul>

                        <h4 className="text-lg font-medium text-white mb-2">REFUND PROCESS</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>Refunds/exchange are made after we receive and confirm the item was returned as it was sent</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>Refund process takes 2-3 business days</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>Refunds go back to the original payment method</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>Shipping costs are non-refundable</span>
                            </li>
                        </ul>
                    </div>

                    {/* 7. Our Rights */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">7. Our Rights</h2>
                        <p className="text-gray-400 mb-3">We reserve the right to:</p>
                        <ul className="space-y-2 text-gray-400">
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>Cancel any order if we suspect fraud or unauthorized activity</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>Update these terms (we'll always post changes here)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>Refuse service to anyone for valid reasons (like repeated returns of worn items)</span>
                            </li>
                        </ul>
                    </div>

                    {/* 8. Limitation of Liability */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">8. Limitation of Liability</h2>
                        <ul className="space-y-2 text-gray-400">
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>We're not liable to loss or damage of items due to over-stockpiling</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>We're not liable for any indirect damages arising from product misuse</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 border-2 border-yellow-200/50 flex-shrink-0"></span>
                                <span>We're not responsible for delays caused by event beyond our reach and control (such as; unfriendly weathers, strikes, deliveries, etc.) we will always do our best to follow up to ensure you get your items.</span>
                            </li>
                        </ul>
                    </div>

                    {/* 9. Contact Us */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4"> CONTACT US</h2>
                        <p className="text-gray-400 mb-4">CHAT WITH CUSTOMER CARE VIA</p>

                        <div className="bg-white/5 p-6 rounded-lg border border-yellow-400/20 mb-4">
                            <p className="text-gray-300 mb-2"><span className="text-yellow-400">Email:</span> Tailoredbykiki@gmail.com</p>
                            <p className="text-gray-300 mb-2"><span className="text-yellow-400">Phone:</span> 08065082231</p>
                            <p className="text-gray-300"><span className="text-yellow-400">Instagram:</span> @dkikishop_backup</p>
                        </div>

                        
                        <ul className="space-y-2 text-gray-400">
                                                    </ul>
                    </div>

                    

                    {/* Closing Note */}
                    <div className="text-center text-gray-400 border-t border-yellow-400/20 pt-8 mt-8">
                        <p className="mb-4">
                            Thanks for being part of our community!
                        </p>
                        <p className="text-yellow-400 font-semibold italic">
                            By using DKIKISHOP.com, you agree to these simple terms. We are happy to meet your wardrobe needs. Huryy now, add to cart and checkout!!! ✨
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}