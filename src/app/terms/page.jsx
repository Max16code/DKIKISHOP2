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
                            <span className="text-yellow-400 font-semibold">DKIKISHOP</span> is your go-to fashion store for unique, trendy and affordable fashion. We help you build your capsule wardrope
                        </p>
                    </div>

                    {/* 2. Who Can Use DKIKISHOP */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">2. Who Can Use DKIKISHOP</h2>
                        <ul className="list-disc list-inside text-gray-400 space-y-2">
                            <li>women who want to look good and clean and don’t want to break the bank to achieve this ❤️ </li>
                            <li>Women who are trying to build their capsule wardrobe and essentials</li>
                            <li>Women who like unique fashion items</li>
                        </ul>
                    </div>

                    {/* 3. Our Products */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">3. Our Products</h2>

                        <h3 className="text-xl font-medium text-white mb-3">3.1 What You See Is What You Get</h3>
                        <ul className="list-disc list-inside text-gray-400 mb-4">
                            <li>we do our best to show real pictures of most of the  products, product might appear brighter or darker than they actually appear due to camera or lighting used</li>
                            <li>Product descriptions are based on either manufacturer’s information or our own description, this is to help you understand the product better</li>
                            <li>Sizes are  based on manufacturer’s label or ours, this is to ensure we give accurate sizing.</li>
                        </ul>

                        <h3 className="text-xl font-medium text-white mb-3">3.2 Availability</h3>
                        <ul className="list-disc list-inside text-gray-400">
                            <li>Any item not paid for is still available and can be taken out of cart after a while</li>
                            <li>Please note that some products are limited and  can be taken out of your cart if you do not pay for it first.(you girlies are quick! 💅)</li>

                        </ul>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">3.3 Sizing</h2>

                        <ul className="list-disc list-inside text-gray-400 mb-4">
                            <li>We use standard UK sizing</li>
                            <li> Kindly know your size before shopping </li>
                            <li>If you’re unsure of your size, please send us a recent picture on WhatsApp so as to ascertain your size before shopping.</li>
                        </ul>
                    </div>


                    {/* 4. Pricing and Payments */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">4. Pricing and Payments</h2>


                        <h3 className="text-xl font-medium text-white mb-3">4.1 Our Prices</h3>
                        <ul className="list-disc list-inside text-gray-400 mb-4">
                            <li>All prices are in <span className="text-green-400">Nigerian Naira (₦)</span></li>
                            <li>Prices include all applicable taxes</li>
                            <li>We reserve the right to adjust prices when necessary</li>
                        </ul>

                        <h3 className="text-xl font-medium text-white mb-3">4.2 Payment</h3>
                        <ul className="list-disc list-inside text-gray-400">
                            <li>we accept payments through various methods (Cards, bank transfers, etc.)</li>
                            <li>Your payment is processed securely – we never see your card details</li>
                            <li>All online payments are processed via PAYSTACK</li>
                            <li>Full payment is required before items are shipped</li>
                        </ul>
                    </div>

                    {/* 5. Shipping and Delivery */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">5.SHIPPING AND DELIVERY
                        </h2>

                        <h3 className="text-xl font-medium text-white mb-3">5.1 DELIVERY TIME FRAME</h3>
                        <ul className="list-disc list-inside text-gray-400 mb-4">
                            <li>We process orders within 24-48 hours after payment</li>
                            <li>Delivery within port harcourt takes 24-48 hours  (within working days)</li>
                            <li>Delivery outside Port Harcourt takes 2-6 working days, depending on your location</li>
                            <li>Delivery outside Nigeria takes 7- 14 working days</li>
                        </ul>

                        <h3 className="text-xl font-medium text-white mb-3">5.2 stockpiling policy</h3>
                        <ul className="list-disc list-inside text-gray-400 mb-4">
                            <li>We offer stockpile within a period of one month,
                                this is so you can shop as many products as you want within this timeframe to maximize delivery fee.</li>
                            <li>Please note that we’re only responsible for items kept within one month,
                                we’re not liable to loss or damage of over stockpiled items.</li>
                            <li>Items kept over a longer period of time (5 months max) will not be accounted for</li>

                        </ul>

                        <h3 className="text-xl font-medium text-white mb-3">5.3 RETURN AND REFUNDS</h3>
                        <h2>OUR RETURN POLICY</h2>
                        <ul className="list-disc list-inside text-gray-400">
                            <li>items can be returned for exchange  if there’s damage or a wrong size was sent from our end</li>
                            <li> Items must be:
                                -Unworn
                                -Unwashed
                                -In original condition it was delivered with all tags attached </li>
                            <h3>NON-RETURNABLE ITEMS</h3>
                            <li>tems on price slash sales</li>
                            <li>Items already worn</li>
                            <li>Items that have exceeded the return window days</li>
                            <li>tems that was sent with accurate sizin</li>

                            <h3>REFUND PROCESS</h3>
                            <li>Refunds/exchange  are made after we receive and confirm the item was returned as it was sent</li>
                            <li>Refund process  takes 2-3 business days</li>
                            <li>Refunds go back to the original payment method</li>
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
                            <li>we’re not liable to loss or damage of items due to over- stockpiling</li>
                            <li>We’re not liable for any indirect damages arising from product misuse</li>
                            <li>* We’re not responsible for delays caused by event beyond our reach and control (such as; unfriendly weathers, strikes, deliveries, etc.) we will always do our best to follow up to ensure you get your items.
                            </li>
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

                        <p className="text-yellow-400 font-semibold">OUR PHYSICAL STORE ADDRESS 💛</p>
                        <li> No 2 Oroma Okocha street, NTA apara link road, Mercyland. Off East west road or NTA road, Port Harcourt, Rivers state.

                            WE ARE  HERE TO ATTEND TO YOU ❤️</li>
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