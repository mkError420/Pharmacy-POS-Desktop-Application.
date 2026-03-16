import React, { useState, useEffect } from 'react';
import productService from '../services/productService.js';

const ProductForm = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    generic_name: '',
    company: '',
    buy_price: '',
    sell_price: '',
    stock: '',
    expiry_date: '',
    barcode: ''
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        generic_name: product.generic_name || '',
        company: product.company || '',
        buy_price: product.buy_price || '',
        sell_price: product.sell_price || '',
        stock: product.stock || '',
        expiry_date: product.expiry_date || '',
        barcode: product.barcode || ''
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.buy_price || parseFloat(formData.buy_price) <= 0) {
      newErrors.buy_price = 'Valid buy price is required';
    }

    if (!formData.sell_price || parseFloat(formData.sell_price) <= 0) {
      newErrors.sell_price = 'Valid sell price is required';
    }

    if (formData.buy_price && formData.sell_price && 
        parseFloat(formData.sell_price) <= parseFloat(formData.buy_price)) {
      newErrors.sell_price = 'Sell price must be greater than buy price';
    }

    if (formData.stock && (parseInt(formData.stock) < 0 || !Number.isInteger(parseInt(formData.stock)))) {
      newErrors.stock = 'Stock must be a non-negative integer';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const productData = {
        ...formData,
        buy_price: parseFloat(formData.buy_price),
        sell_price: parseFloat(formData.sell_price),
        stock: parseInt(formData.stock) || 0,
        expiry_date: formData.expiry_date || null,
        barcode: formData.barcode || null
      };

      if (product) {
        await productService.updateProduct(product.id, productData);
      } else {
        await productService.createProduct(productData);
      }

      onSave();
    } catch (error) {
      console.error('Error saving product:', error);
      setErrors({ submit: error.message || 'Failed to save product' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setErrors({});
    onCancel();
  };

  return (
    <div className="product-form">
      <h3>{product ? 'Edit Product' : 'Add New Product'}</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">Product Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              placeholder="Enter product name"
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="generic_name">Generic Name</label>
            <input
              type="text"
              id="generic_name"
              name="generic_name"
              value={formData.generic_name}
              onChange={handleChange}
              placeholder="Enter generic name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="company">Company</label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Enter company name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="buy_price">Buy Price *</label>
            <input
              type="number"
              id="buy_price"
              name="buy_price"
              value={formData.buy_price}
              onChange={handleChange}
              className={errors.buy_price ? 'error' : ''}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
            {errors.buy_price && <span className="error-message">{errors.buy_price}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="sell_price">Sell Price *</label>
            <input
              type="number"
              id="sell_price"
              name="sell_price"
              value={formData.sell_price}
              onChange={handleChange}
              className={errors.sell_price ? 'error' : ''}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
            {errors.sell_price && <span className="error-message">{errors.sell_price}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="stock">Stock Quantity</label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className={errors.stock ? 'error' : ''}
              placeholder="0"
              min="0"
            />
            {errors.stock && <span className="error-message">{errors.stock}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="expiry_date">Expiry Date</label>
            <input
              type="date"
              id="expiry_date"
              name="expiry_date"
              value={formData.expiry_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="barcode">Barcode</label>
            <input
              type="text"
              id="barcode"
              name="barcode"
              value={formData.barcode}
              onChange={handleChange}
              placeholder="Enter barcode"
            />
          </div>
        </div>

        {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}

        <div className="form-actions">
          <button type="button" onClick={handleCancel} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={isSaving} className="btn btn-primary">
            {isSaving ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
          </button>
        </div>
      </form>

      <style jsx>{`
        .product-form {
          background: white;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        h3 {
          margin: 0 0 20px 0;
          color: #333;
          font-size: 20px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        label {
          margin-bottom: 6px;
          font-weight: 500;
          color: #555;
          font-size: 14px;
        }

        input {
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.3s;
        }

        input:focus {
          border-color: #007bff;
        }

        input.error {
          border-color: #dc3545;
        }

        .error-message {
          color: #dc3545;
          font-size: 12px;
          margin-top: 4px;
        }

        .submit-error {
          margin-bottom: 16px;
          text-align: center;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .btn-primary {
          background-color: #007bff;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #0056b3;
        }

        .btn-primary:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background-color: #545b62;
        }
      `}</style>
    </div>
  );
};

export default ProductForm;
