import React, { useState, useEffect, useRef } from 'react';
import ProductSearch from '../components/ProductSearch.jsx';
import InvoiceCart from '../components/InvoiceCart.jsx';
import productService from '../services/productService.js';
import salesService from '../services/salesService.js';

const Sales = () => {
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  useEffect(() => {
    // Focus on search input when component mounts
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const addToCart = (product) => {
    if (product.stock === 0) {
      alert('This product is out of stock');
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        // Check if adding one more would exceed available stock
        if (existingItem.quantity >= product.stock) {
          alert(`Only ${product.stock} units available in stock`);
          return prevCart;
        }
        
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, {
          id: product.id,
          name: product.name,
          generic_name: product.generic_name,
          price: product.sell_price,
          quantity: 1,
          stock: product.stock
        }];
      }
    });

    // Clear search and refocus
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const updateQuantity = (itemId, newQuantity) => {
    const item = cart.find(item => item.id === itemId);
    if (!item) return;

    if (newQuantity > item.stock) {
      alert(`Only ${item.stock} units available in stock`);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId
          ? { ...item, quantity: newQuantity }
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    if (cart.length > 0 && window.confirm('Are you sure you want to clear the cart?')) {
      setCart([]);
      setDiscount(0);
    }
  };

  const handleDiscountChange = (newDiscount) => {
    const subtotal = calculateSubtotal();
    if (newDiscount <= subtotal) {
      setDiscount(newDiscount);
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return Math.max(0, subtotal - discount);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setIsProcessing(true);
    
    try {
      const saleData = {
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        discount: discount
      };

      const result = await salesService.createSale(saleData);
      
      // Show success message
      alert(`Sale completed successfully! Invoice #${result.id}`);
      
      // Clear cart
      setCart([]);
      setDiscount(0);
      
      // Focus back to search
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
      
    } catch (error) {
      console.error('Error processing sale:', error);
      alert(`Failed to process sale: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e) => {
    // Keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          handleCheckout();
          break;
        case 'Delete':
          e.preventDefault();
          clearCart();
          break;
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(price).replace('BDT', '৳');
  };

  const subtotal = calculateSubtotal();
  const total = calculateTotal();

  return (
    <div className="sales-page" onKeyDown={handleKeyDown} tabIndex="0">
      <div className="sales-header">
        <h1>Point of Sale</h1>
        <div className="shortcuts">
          <span className="shortcut">Ctrl+Enter: Checkout</span>
          <span className="shortcut">Ctrl+Delete: Clear Cart</span>
        </div>
      </div>

      <div className="sales-layout">
        {/* Left side - Product Search */}
        <div className="sales-left">
          <div className="search-section">
            <h2>Search Products</h2>
            <div className="search-container">
              <ProductSearch
                onProductSelect={addToCart}
                placeholder="Scan barcode or search for medicine..."
              />
            </div>
          </div>

          <div className="quick-stats">
            <div className="stat-card">
              <h3>Cart Items</h3>
              <div className="stat-value">{cart.length}</div>
            </div>
            <div className="stat-card">
              <h3>Total Quantity</h3>
              <div className="stat-value">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </div>
            </div>
            <div className="stat-card">
              <h3>Subtotal</h3>
              <div className="stat-value">{formatPrice(subtotal)}</div>
            </div>
          </div>
        </div>

        {/* Right side - Cart and Checkout */}
        <div className="sales-right">
          <InvoiceCart
            items={cart}
            onQuantityChange={updateQuantity}
            onRemoveItem={removeFromCart}
            onClearCart={clearCart}
            discount={discount}
            onDiscountChange={handleDiscountChange}
          />

          <div className="checkout-section">
            <div className="checkout-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Discount:</span>
                <span>{formatPrice(discount)}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || isProcessing}
              className="checkout-btn"
            >
              {isProcessing ? 'Processing...' : 'Complete Sale'}
            </button>

            <div className="payment-info">
              <p>Payment will be processed and stock will be updated automatically</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .sales-page {
          padding: 24px;
          background: #f5f5f5;
          min-height: 100vh;
          outline: none;
        }

        .sales-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .sales-header h1 {
          margin: 0;
          color: #333;
          font-size: 28px;
        }

        .shortcuts {
          display: flex;
          gap: 16px;
        }

        .shortcut {
          font-size: 12px;
          color: #666;
          background: #e9ecef;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .sales-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          height: calc(100vh - 120px);
        }

        .sales-left {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .search-section {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .search-section h2 {
          margin: 0 0 16px 0;
          color: #333;
          font-size: 18px;
        }

        .search-container {
          position: relative;
        }

        .quick-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .stat-card {
          background: white;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .stat-card h3 {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #007bff;
        }

        .sales-right {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .checkout-section {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .checkout-summary {
          margin-bottom: 20px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .summary-row.total {
          font-size: 18px;
          font-weight: 700;
          color: #333;
          padding-top: 8px;
          border-top: 2px solid #dee2e6;
          margin-bottom: 0;
        }

        .checkout-btn {
          width: 100%;
          padding: 16px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s;
          margin-bottom: 16px;
        }

        .checkout-btn:hover:not(:disabled) {
          background: #218838;
        }

        .checkout-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .payment-info {
          text-align: center;
          color: #666;
          font-size: 12px;
        }

        @media (max-width: 1024px) {
          .sales-layout {
            grid-template-columns: 1fr;
            height: auto;
          }

          .quick-stats {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .sales-page {
            padding: 16px;
          }

          .sales-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .shortcuts {
            flex-direction: column;
            gap: 8px;
          }

          .quick-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Sales;
