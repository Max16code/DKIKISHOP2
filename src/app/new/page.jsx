import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function NewArrivalsComingSoon() {
  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <Navbar />
      <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
        <h1 className="text-5xl md:text-7xl font-black text-yellow-400 mb-4 tracking-tighter">
          BRAND NEW
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold mb-6">
          Something fresh is coming.
        </h2>
        <p className="text-gray-400 max-w-md mx-auto mb-8">
          We are currently curating our brand new collection. Check back soon for fresh drops!
        </p>
        <Link href="/">
          <button className="bg-white text-black font-bold px-8 py-3 rounded-full hover:bg-yellow-400 transition-colors">
            Return to Portals
          </button>
        </Link>
      </div>
    </div>
  )
}
