// app/api/carousel/route.js - THE FIXED VERSION!
export async function GET() {
  // Your 8 categories - HARDCODED to always show
  const categories = [
    { name: 'Blazers', slug: 'blazers' },
    { name: 'Jeans', slug: 'jeans' },
    { name: 'Tops', slug: 'tops' },
    { name: 'Shirts', slug: 'shirts' },
    { name: 'Skirts', slug: 'skirts' },
    { name: 'Activewears', slug: 'activewears' },
    { name: 'Dresses', slug: 'dresses' },
    { name: 'Accessories', slug: 'accessories' },
    { name: 'Shorts', slug: 'shorts' },
    { name: 'Twopiece', slug: 'twopiece' }
  ]
  
  try {
    // Fetch REAL products for EACH category
    const items = await Promise.all(
      categories.map(async (cat) => {
        try {
          // Make sure this URL matches your actual API endpoint
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/getproducts/${cat.slug}?limit=1`,
            { 
              cache: 'no-store', // Don't cache while testing
              headers: {
                'Content-Type': 'application/json',
              }
            }
          )
          
          if (!res.ok) {
            console.log(`No products for ${cat.slug}`)
            return {
              name: cat.name,
              slug: cat.slug,
              image: null,
              hasProduct: false,
              productCount: 0
            }
          }
          
          const data = await res.json()
          const product = data.products?.[0]
          
          return {
            name: cat.name,
            slug: cat.slug,
            image: product?.images?.[0] || null,
            hasProduct: !!product,
            productCount: data.products?.length || 0
          }
          
        } catch (error) {
          console.log(`Error fetching ${cat.slug}:`, error.message)
          return {
            name: cat.name,
            slug: cat.slug,
            image: null,
            hasProduct: false,
            productCount: 0
          }
        }
      })
    )
    
    console.log('✅ Carousel API returning:', items.map(i => `${i.name}: ${i.hasProduct ? 'Has image' : 'No image'}`))
    
    return Response.json({ 
      success: true, 
      items: items 
    })
    
  } catch (error) {
    console.error('❌ Carousel API error:', error)
    return Response.json({ 
      success: false, 
      error: error.message 
    })
  }
}