// components/SearchBar.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { IoSearchOutline, IoCloseOutline } from 'react-icons/io5';

export default function SearchBar({ category = '' }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const router = useRouter();

  // Fetch suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        let url = `/api/search?q=${encodeURIComponent(query)}`;
        if (category) {
          url += `&category=${encodeURIComponent(category)}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setSuggestions(data.products);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(delayDebounce);
  }, [query, category]);

  // Update dropdown position when open
  useEffect(() => {
    if (!isOpen) return;
    const updatePosition = () => {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    };
    updatePosition();
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      let path = `/search?q=${encodeURIComponent(query.trim())}`;
      if (category) {
        path += `&category=${encodeURIComponent(category)}`;
      }
      router.push(path);
      setIsOpen(false);
      setQuery('');
    }
  };

  const handleSuggestionClick = () => {
    setIsOpen(false);
    setQuery('');
  };

  // Dropdown content to be portaled
  const dropdownContent = (
    <AnimatePresence>
      {isOpen && (query.length >= 2 || suggestions.length > 0) && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'absolute',
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
          }}
          className="bg-black/90 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl z-[9999] overflow-hidden"
        >
          {loading ? (
            <div className="p-2 text-center text-gray-400 text-xs">
              <div className="inline-block w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : suggestions.length === 0 ? (
            <div className="p-3 text-center text-gray-400 text-xs">
              No products found.
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {suggestions.map((product) => (
                <Link
                  key={product._id}
                  href={`/product/${product._id}`}
                  onClick={handleSuggestionClick}
                  className="flex items-center gap-2 p-2 hover:bg-white/10 transition-colors"
                >
                  <div className="relative w-8 h-8 rounded-md overflow-hidden bg-gray-800 flex-shrink-0">
                    <Image
                      src={product.images?.[0] || '/images/fallback.jpg'}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">
                      {product.title}
                    </p>
                    <p className="text-yellow-400 text-[10px]">
                      ₦{Number(product.price).toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
              <div className="border-t border-white/10 p-1.5 text-center">
                
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div className="relative">
        <form onSubmit={handleSubmit} className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search"
            className="w-24 sm:w-32 md:w-40 px-2 py-1 pl-7 pr-7 bg-white/10 border border-white/20 rounded-full text-sm text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
          />
          <IoSearchOutline className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                setIsOpen(false);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <IoCloseOutline className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>
      {typeof window !== 'undefined' && createPortal(dropdownContent, document.body)}
    </>
  );
}