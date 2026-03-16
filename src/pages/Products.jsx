import React, { useState, useEffect } from 'react';
import ProductForm from '../components/ProductForm.jsx';
import ProductSearch from '../components/ProductSearch.jsx';
import productService from '../services/productService.js';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchQuery, sortBy, sortOrder]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const productsData = await productService.getAllProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.generic_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProducts(filtered);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async (product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      try {
        await productService.deleteProduct(product.id);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingProduct(null);
    fetchProducts();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(price).replace('BDT', '৳');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { color: 'red', text: 'Out of Stock' };
    if (stock < 10) return { color: 'orange', text: 'Low Stock' };
    return { color: 'green', text: 'In Stock' };
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return null;
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { color: 'red', text: 'Expired' };
    if (diffDays <= 30) return { color: 'red', text: `${diffDays} days` };
    if (diffDays <= 90) return { color: 'orange', text: `${diffDays} days` };
    return null;
  };

  if (showForm) {
    return (
      <div className="products-page">
        <ProductForm
          product={editingProduct}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-header">
        <h1>Product Management</h1>
        <button onClick={handleAddProduct} className="btn btn-primary">
          Add New Product
        </button>
      </div>

      <div className="products-controls">
        <div className="search-container">
          <ProductSearch
            onProductSelect={handleEditProduct}
            placeholder="Search products..."
          />
        </div>
        
        <div className="filter-controls">
          <input
            type="text"
            placeholder="Quick search..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="loading-spinner">Loading products...</div>
        </div>
      ) : (
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} className="sortable">
                  Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('generic_name')} className="sortable">
                  Generic {sortBy === 'generic_name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('company')} className="sortable">
                  Company {sortBy === 'company' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('buy_price')} className="sortable">
                  Buy Price {sortBy === 'buy_price' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('sell_price')} className="sortable">
                  Sell Price {sortBy === 'sell_price' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('stock')} className="sortable">
                  Stock {sortBy === 'stock' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('expiry_date')} className="sortable">
                  Expiry {sortBy === 'expiry_date' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th>Barcode</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock);
                const expiryStatus = getExpiryStatus(product.expiry_date);
                
                return (
                  <tr key={product.id} className="product-row">
                    <td className="product-name">{product.name}</td>
                    <td className="product-generic">{product.generic_name || '-'}</td>
                    <td className="product-company">{product.company || '-'}</td>
                    <td className="price">{formatPrice(product.buy_price)}</td>
                    <td className="price">{formatPrice(product.sell_price)}</td>
                    <td className={`stock ${stockStatus.color}`}>
                      {product.stock}
                      <div className="stock-status">{stockStatus.text}</div>
                    </td>
                    <td className={`expiry ${expiryStatus?.color || ''}`}>
                      {formatDate(product.expiry_date)}
                      {expiryStatus && (
                        <div className="expiry-status">{expiryStatus.text}</div>
                      )}
                    </td>
                    <td className="barcode">{product.barcode || '-'}</td>
                    <td className="actions">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="btn-edit"
                        title="Edit product"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product)}
                        className="btn-delete"
                        title="Delete product"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="empty-state">
              {searchQuery ? 'No products found matching your search' : 'No products found'}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .products-page {
          padding: 24px;
          background: #f5f5f5;
          min-height: 100vh;
        }

        .products-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .products-header h1 {
          margin: 0;
          color: #333;
          font-size: 28px;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
        }

        .products-controls {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          align-items: center;
        }

        .search-container {
          flex: 1;
          max-width: 400px;
        }

        .filter-controls {
          flex: 1;
          max-width: 300px;
        }

        .search-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          outline: none;
        }

        .search-input:focus {
          border-color: #007bff;
        }

        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .loading-spinner {
          font-size: 18px;
          color: #666;
        }

        .products-table-container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .products-table {
          width: 100%;
          border-collapse: collapse;
        }

        .products-table th {
          background: #f8f9fa;
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          color: #333;
          font-size: 14px;
          border-bottom: 2px solid #dee2e6;
        }

        .products-table th.sortable {
          cursor: pointer;
          user-select: none;
        }

        .products-table th.sortable:hover {
          background: #e9ecef;
        }

        .product-row {
          border-bottom: 1px solid #eee;
          transition: background-color 0.2s;
        }

        .product-row:hover {
          background-color: #f8f9fa;
        }

        .product-row td {
          padding: 12px 16px;
          font-size: 14px;
        }

        .product-name {
          font-weight: 600;
          color: #333;
        }

        .product-generic,
        .product-company {
          color: #666;
        }

        .price {
          font-weight: 500;
          color: #007bff;
        }

        .stock {
          font-weight: 600;
        }

        .stock.green {
          color: #28a745;
        }

        .stock.orange {
          color: #ffc107;
        }

        .stock.red {
          color: #dc3545;
        }

        .stock-status,
        .expiry-status {
          font-size: 11px;
          font-weight: 400;
          margin-top: 2px;
        }

        .expiry.red {
          color: #dc3545;
        }

        .expiry.orange {
          color: #ffc107;
        }

        .barcode {
          font-family: monospace;
          font-size: 13px;
          color: #666;
        }

        .actions {
          display: flex;
          gap: 8px;
        }

        .btn-edit,
        .btn-delete {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          transition: all 0.2s;
        }

        .btn-edit {
          background: #e3f2fd;
          color: #1976d2;
        }

        .btn-edit:hover {
          background: #1976d2;
          color: white;
        }

        .btn-delete {
          background: #ffebee;
          color: #d32f2f;
        }

        .btn-delete:hover {
          background: #d32f2f;
          color: white;
        }

        .empty-state {
          text-align: center;
          padding: 40px;
          color: #666;
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .products-page {
            padding: 16px;
          }

          .products-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .products-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .search-container,
          .filter-controls {
            max-width: none;
          }

          .products-table-container {
            overflow-x: auto;
          }

          .products-table {
            min-width: 800px;
          }
        }
      `}</style>
    </div>
  );
};

export default Products;
