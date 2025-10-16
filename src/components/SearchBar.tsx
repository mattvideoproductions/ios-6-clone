interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar = ({ value, onChange, placeholder = 'Search' }: SearchBarProps) => {
  return (
    <div className="search-bar">
      <span className="search-bar__icon" aria-hidden>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M15.5 15.5L21 21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="11"
            cy="11"
            r="7"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </span>
      <input
        className="search-bar__input"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
};

export default SearchBar;
