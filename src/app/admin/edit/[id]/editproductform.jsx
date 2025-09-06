'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function EditProductForm({ product }) {
  if (!product) {
    return (
      <div className="p-6 text-red-500">
        Product data failed to load. <button 
          onClick={() => window.location.reload()}
          className="text-blue-500 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const router = useRouter();
  
  const [formData, setFormData] = useState({
  title: product?.title ?? '',
  price: product?.price ?? 0,
  description: product?.description ?? '',
  image: product?.image ?? '',
  sizes: product?.sizes ?? '',           // ✅ ensure it's never undefined
  quantity: product?.quantity ??'',
  category: product?.category ?? '',     // ✅ ensure it's never undefined
  _id: product?._id ?? ''
});


  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`/api/updateproduct/${formData._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Update failed');
      }
      
      toast.success('Product updated successfully');
      router.push('/admin/dashboard');
    } catch (error) {
      toast.error(error.message);
      console.error('Update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {['title', 'price', 'description', 'image'].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium mb-1 capitalize">
              {field === 'image' ? 'Image URL' : field}
            </label>
            {field === 'description' ? (
              <textarea
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                rows="4"
              />
            ) : (
              <input
                type={field === 'price' ? 'number' : field === 'image' ? 'text' : 'text'} // ✅ corrected here
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required={field !== 'description' && field !== 'image'}
                step={field === 'price' ? '0.01' : undefined}
              />
            )}
          </div>
        ))}

        {/* Sizes */}
        <div>
          <label className="block text-sm font-medium mb-1">Sizes (e.g. S, M, L, XL)</label>
          <input
            type="text"
            name="sizes"
            value={formData.sizes}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="S, M, L"
          />
        </div>

        {/* Quantity */}
<div>
  <label className="block text-sm font-medium mb-1">Quantity</label>
  <input
    type="number"
    name="quantity"
    value={formData.quantity}
    onChange={handleChange}
    className="w-full p-2 border rounded"
    required
    step="1"
    min="0"
  />
</div>

        {/* Category Dropdown */}
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">-- Select Category --</option>
            <option value="blazers">Blazers</option>
            <option value="shirts">Shirts</option>
            <option value="skirts">Skirts</option>
            <option value="jeans">Jeans</option>
            <option value="activewears">Activewears</option>
          </select>
        </div>


        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 text-white rounded ${
              isSubmitting ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
            }`}
            aria-label="Update product"
          >
            {isSubmitting ? 'Updating...' : 'Update Product'}
          </button>
          
          <button
            type="button"
            onClick={() => router.push('/admin/dashboard')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            aria-label="Cancel editing"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
