import React, { useState, useEffect, useRef } from 'react';
import productService from '../services/productService.js';

const ProductSearch = ({ onProductSelect, placeholder = "Search products..." }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const searchProducts = async () => {
      if (query.trim() === '') {
        setResults([]);
        setShowResults(false);
        return;
      }

      setIsLoading(true);
      try {
        const products = await productService.searchProducts(query);
        setResults(products.slice(0, 10)); // Limit to 10 results
        setShowResults(true);
      } catch (error) {
        console.error('Error searching products:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProductClick = (product) => {
    onProductSelect(product);
    setQuery('');
    setShowResults(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowResults(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { color: 'red', text: 'Out of Stock' };
    if (stock < 10) return { color: 'orange', text: 'Low Stock' };
    return { color: 'green', text: 'In Stock' };
  };

  return (
    <div ref={searchRef} className="product-search">
      <div className="search-input-container">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="search-input"
          autoFocus
        />
        {isLoading && <div className="search-spinner">Searching...</div>}
      </div>

      {showResults && results.length > 0 && (
        <div className="search-results">
          {results.map((product) => {
            const stockStatus = getStockStatus(product.stock);
            return (
              <div
                key={product.id}
                className="search-result-item"
                onClick={() => handleProductClick(product)}
              >
                <div className="product-info">
                  <div className="product-name">{product.name}</div>
                  {product.generic_name && (
                    <div className="product-generic">{product.generic_name}</div>
                  )}
                  {product.company && (
                    <div className="product-company">{product.company}</div>
                  )}
                </div>
                <div className="product-details">
                  <div className="product-price">{formatPrice(product.sell_price)}</div>
                  <div className={`product-stock ${stockStatus.color}`}>
                    {stockStatus.text} ({product.stock})
                  </div>
                  {product.barcode && (
                    <div className="product-barcode">BC: {product.barcode}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showResults && !isLoading && results.length === 0 && (
        <div className="search-no-results">
          No products found
        </div>
      )}

      <style jsx>{`
        .product-search {
          position: relative;
          width: 100%;
        }

        .search-input-container {
          position: relative;
        }

        .search-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
          outline: none;
          transition: border-color 0.3s;
        }

        .search-input:focus {
          border-color: #007bff;
        }

        .search-spinner {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
          font-size: 14px;
        }

        .search-results {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          max-height: 400px;
          overflow-y: auto;
          z-index: 1000;
        }

        .search-result-item {
          padding: 12px 16px;
          border-bottom: 1px solid #eee;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: background-color 0.2s;
        }

        .search-result-item:hover {
          background-color: #f8f9fa;
        }

        .search-result-item:last-child {
          border-bottom: none;
        }

        .product-info {
          flex: 1;
        }

        .product-name {
          font-weight: 600;
          font-size: 14px;
          color: #333;
          margin-bottom: 2px;
        }

        .product-generic {
          font-size: 12px;
          color: #666;
          margin-bottom: 2px;
        }

        .product-company {
          font-size: 11px;
          color: #888;
        }

        .product-details {
          text-align: right;
          margin-left: 16px;
        }

        .product-price {
          font-weight: 600;
          font-size: 14px;
          color: #007bff;
          margin-bottom: 2px;
        }

        .product-stock {
          font-size: 11px;
          margin-bottom: 2px;
        }

        .product-stock.green {
          color: #28a745;
        }

        .product-stock.orange {
          color: #ffc107;
        }

        .product-stock.red {
          color: #dc3545;
        }

        .product-barcode {
          font-size: 10px;
          color: #666;
        }

        .search-no-results {
          padding: 16px;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default ProductSearch;
