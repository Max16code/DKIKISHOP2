// app/privacy/page.tsx
'use client'

import Navbar from '@/components/Navbar'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function PrivacyPolicy() {
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
            Privacy Policy for{' '}
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
          {/* Our Promise */}
          <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Our Promise to You</h2>
            <p className="text-gray-300 text-lg">
              At DKIKISHOP, your privacy is our priority. We believe in complete transparency about how we handle your information. This Privacy Policy explains that <span className="text-yellow-400 font-semibold">we only use your personal details for one purpose: to deliver your orders.</span> That's it.
            </p>
          </div>

          {/* 1. Information We Collect */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
            <p className="text-gray-400 mb-4">We collect only the information necessary to process and deliver your orders:</p>
            
            <h3 className="text-xl font-medium text-white mb-3">1.1 Information You Provide</h3>
            <ul className="list-disc list-inside text-gray-400 mb-4 space-y-2">
              <li><span className="text-yellow-400 font-medium">Full Name</span> – To identify you and address your packages correctly</li>
              <li><span className="text-yellow-400 font-medium">Delivery Address</span> – So we know where to send your items</li>
              <li><span className="text-yellow-400 font-medium">Phone Number</span> – To contact you if our delivery partner needs directions or has questions about your delivery</li>
              <li><span className="text-yellow-400 font-medium">Email Address</span> – To send you order confirmations and delivery updates</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">1.2 Payment Information</h3>
            <ul className="list-disc list-inside text-gray-400 mb-4">
              <li>We do <span className="text-red-400 font-semibold">NOT</span> store your payment details (credit/debit card numbers, bank account details, etc.)</li>
              <li>All payments are processed securely through our payment partners</li>
              <li>We only receive confirmation that your payment was successful</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">1.3 Information We Do NOT Collect</h3>
            <ul className="list-disc list-inside text-gray-400 mb-4">
              <li>We do not track your browsing history</li>
              <li>We do not monitor what you do on other websites</li>
              <li>We do not collect data for marketing or advertising purposes</li>
              <li>We do not sell your information to anyone – ever</li>
            </ul>
          </div>

          {/* 2. How We Use Your Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-400 mb-4"><span className="text-yellow-400 font-semibold">We use your information for exactly one purpose: to deliver your purchases.</span></p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-gray-400 border border-yellow-400/20">
                <thead className="bg-yellow-400/10">
                  <tr>
                    <th className="px-4 py-3 border-b border-yellow-400/20 text-white">Information</th>
                    <th className="px-4 py-3 border-b border-yellow-400/20 text-white">How We Use It</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-3 border-b border-yellow-400/20 text-yellow-400">Full Name</td>
                    <td className="px-4 py-3 border-b border-yellow-400/20">Printing on delivery labels so you receive your package</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 border-b border-yellow-400/20 text-yellow-400">Address</td>
                    <td className="px-4 py-3 border-b border-yellow-400/20">Sending your order to the correct location</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 border-b border-yellow-400/20 text-yellow-400">Phone Number</td>
                    <td className="px-4 py-3 border-b border-yellow-400/20">Our delivery agent may call if they need help finding your address</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 border-b border-yellow-400/20 text-yellow-400">Email Address</td>
                    <td className="px-4 py-3">Sending order confirmation and delivery status updates</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-yellow-400 font-semibold mt-4">That's it. Nothing more. Nothing less.</p>
          </div>

          {/* 3. Information Sharing */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">3. Information Sharing</h2>
            <p className="text-gray-400 mb-4">We share your information only when necessary to complete your delivery:</p>
            
            <h3 className="text-xl font-medium text-white mb-3">3.1 Delivery Partners</h3>
            <ul className="list-disc list-inside text-gray-400 mb-4">
              <li>We share your name, address, and phone number with our logistics/delivery partners <span className="text-yellow-400">only for the purpose of delivering your package</span></li>
              <li>These partners are contractually obligated to protect your information and use it solely for delivery</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">3.2 We Do NOT Share With:</h3>
            <ul className="list-disc list-inside text-gray-400 mb-4">
              <li>Marketing companies</li>
              <li>Advertising agencies</li>
              <li>Third-party data brokers</li>
              <li>Social media platforms</li>
              <li>Any other third parties for any other purpose</li>
            </ul>
          </div>

          {/* 4. Data Storage and Security */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">4. Data Storage and Security</h2>
            
            <h3 className="text-xl font-medium text-white mb-3">4.1 How Long We Keep Your Data</h3>
            <ul className="list-disc list-inside text-gray-400 mb-4">
              <li>We retain your order information for record purposes only</li>
              <li>If you want your data deleted after delivery, simply contact us and we will remove it immediately</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">4.2 Security Measures</h3>
            <ul className="list-disc list-inside text-gray-400 mb-4">
              <li>Your data is stored on secure servers with restricted access</li>
              <li>Only authorized personnel handling order fulfillment can access customer details</li>
              <li>We use industry-standard encryption to protect your information during transmission</li>
            </ul>
          </div>

          {/* 5. Your Rights */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">5. Your Rights</h2>
            <p className="text-gray-400 mb-4">You have complete control over your information:</p>
            <ul className="list-disc list-inside text-gray-400 mb-4 space-y-2">
              
              <li><span className="text-yellow-400">Opt-Out:</span> Since we don't use your data for marketing, there's nothing to opt out of!</li>
            </ul>
            <p className="text-gray-400">To exercise any of these rights, simply contact us at <span className="text-yellow-400">Tailoredbykiki@gmail.com</span></p>
          </div>

          {/* 6. Cookies and Tracking */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">6. Cookies and Tracking</h2>
            <p className="text-gray-400 mb-4"><span className="text-yellow-400 font-semibold">We do not use tracking cookies or analytics tools.</span></p>
            <p className="text-gray-400">The only cookies on our site are strictly necessary for the website to function (like keeping items in your cart while you shop). These cookies do not track you or collect personal information.</p>
          </div>

          {/* 7. Children's Privacy */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">7. Children's Privacy</h2>
            <p className="text-gray-400">DKIKISHOP is not intended for children under 13. We do not knowingly collect information from children. If you believe a child has provided us with personal information, contact us and we will delete it immediately.</p>
          </div>

          {/* 8. Changes to This Policy */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">8. Changes to This Policy</h2>
            <p className="text-gray-400 mb-4">If we ever need to update this privacy policy (which we don't anticipate), we will:</p>
            <ol className="list-decimal list-inside text-gray-400 mb-4">
              <li>Post the new policy on this page</li>
              <li>Update the "Last Updated" date at the top</li>
              <li>Notify customers via email if the changes are significant</li>
            </ol>
            <p className="text-gray-400">Rest assured, our core promise remains: <span className="text-yellow-400 font-semibold">we will never use your information for anything other than delivery.</span></p>
          </div>

          {/* 9. Contact Us */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">9. Contact Us</h2>
            <p className="text-gray-400 mb-4">Have questions about your privacy? We're here to help:</p>
            <div className="bg-white/5 p-6 rounded-lg border border-yellow-400/20">
              <p className="text-gray-300 mb-2"><span className="text-yellow-400">Email:</span> Tailoredbykiki@gmail.com</p>
              <p className="text-gray-300 mb-2"><span className="text-yellow-400">Phone:</span> 08065082231</p>
              <p className="text-gray-300"><span className="text-yellow-400">Address:</span> shop NO.11 OROMA OKOCHA, MERCYLAND PORTHARCOURT, RIVERS STATE</p>
            </div>
          </div>

          {/* The Bottom Line */}
          <div className="bg-gradient-to-r from-yellow-400/20 to-transparent p-6 rounded-lg border-l-4 border-yellow-400 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">The Bottom Line</h2>
            <p className="text-gray-300 text-lg">
              <span className="text-yellow-400 font-bold">We get your information to send you your stuff. We don't use it for anything else. We don't share it with anyone else. It's that simple.</span>
            </p>
          </div>

          {/* Footer Note */}
          <div className="text-center text-gray-400 italic border-t border-yellow-400/20 pt-8 mt-8">
            <p className="mb-4">
              At DKIKISHOP, we believe privacy isn't complicated. You trust us with your details, and we honor that trust by using them only for what you gave them to us for – delivering your luxury fashion.
            </p>
            <p className="text-yellow-400 font-semibold">
              Thank you for choosing DKIKISHOP. Luxury on a Budget, with privacy you can trust.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}