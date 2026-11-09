import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, MapPin, X } from 'lucide-react'
import { searchCities } from '../api/weather'

export default function CitySearch({ onSelectCity }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  // 400ms 디바운스 (Debounce) 적용
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([])
      setLoading(false)
      setIsOpen(false)
      return
    }

    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const searchResults = await searchCities(query)
        setResults(searchResults)
        setIsOpen(true)
      } catch (err) {
        console.error('검색 실패:', err)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 400) // 400ms 대기

    return () => clearTimeout(timer)
  }, [query])

  // 바깥 영역 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (cityItem) => {
    const selected = {
      name: cityItem.name,
      country: cityItem.country,
      lat: cityItem.latitude,
      lon: cityItem.longitude
    }
    onSelectCity(selected)
    setQuery('')
    setIsOpen(false)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  return (
    <div className="city-search-container" ref={containerRef}>
      <div className="search-input-wrapper">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="전 세계 도시 검색 (예: Seoul, Tokyo, Paris, New York)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
        />
        {loading && <Loader2 size={16} className="search-spinner spin" />}
        {query && !loading && (
          <button className="search-clear-btn" onClick={handleClear} aria-label="검색어 지우기">
            <X size={16} />
          </button>
        )}
      </div>

      {/* 드롭다운 결과 */}
      {isOpen && results.length > 0 && (
        <ul className="search-dropdown" role="listbox">
          {results.map((item) => (
            <li
              key={`${item.id}-${item.latitude}-${item.longitude}`}
              className="search-item"
              onClick={() => handleSelect(item)}
              role="option"
              aria-selected="false"
            >
              <div className="search-item-info">
                <MapPin size={15} className="item-pin-icon" />
                <span className="item-name">{item.name}</span>
                {item.admin1 && <span className="item-region">{item.admin1},</span>}
                <span className="item-country">{item.country}</span>
              </div>
              <span className="item-coords">
                {item.latitude.toFixed(2)}°, {item.longitude.toFixed(2)}°
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* 검색 결과 없음 */}
      {isOpen && !loading && query.trim().length >= 2 && results.length === 0 && (
        <div className="search-dropdown search-empty">
          <span>'{query}'에 대한 검색 결과가 없습니다.</span>
        </div>
      )}
    </div>
  )
}

