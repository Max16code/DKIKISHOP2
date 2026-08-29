// components/SearchSection.jsx
import SearchBar from './SearchBar';

export default function SearchSection({ category = '' }) {
  return (
    <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 mt-2 sm:mt-14">
      <div className="flex justify-start">
        <SearchBar category={category} />
      </div>
    </div>
  );
}