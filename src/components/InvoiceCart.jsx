import React, { useState, useEffect } from 'react';

const InvoiceCart = ({ items, onQuantityChange, onRemoveItem, onClearCart, discount, onDiscountChange }) => {
  const [localDiscount, setLocalDiscount] = useState(discount || 0);

  useEffect(() => {
    setLocalDiscount(discount || 0);
  }, [discount]);

  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return Math.max(0, subtotal - localDiscount);
  };

  const handleDiscountChange = (value) => {
    const numValue = parseFloat(value) || 0;
    setLocalDiscount(numValue);
    onDiscountChange(numValue);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(price).replace('BDT', '৳');
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    if (newQuantity > 99) return; // Prevent excessive quantities
    
    onQuantityChange(itemId, newQuantity);
  };

  const subtotal = calculateSubtotal();
  const total = calculateTotal();

  return (
    <div className="invoice-cart">
      <div className="cart-header">
        <h3>Shopping Cart</h3>
        {items.length > 0 && (
          <button onClick={onClearCart} className="btn-clear">
            Clear Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="cart-empty">
          <p>Your cart is empty</p>
          <p>Add products to start billing</p>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-info">
                  <div className="item-name">{item.name}</div>
                  {item.generic_name && (
                    <div className="item-generic">{item.generic_name}</div>
                  )}
                  <div className="item-price">{formatPrice(item.price)}</div>
                </div>
                
                <div className="item-quantity">
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    className="quantity-btn"
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="quantity-display">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>

                <div className="item-total">
                  {formatPrice(item.price * item.quantity)}
                </div>

                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="item-remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            
            <div className="summary-row discount-row">
              <label htmlFor="discount">Discount:</label>
              <div className="discount-input">
                <span>$</span>
                <input
                  id="discount"
                  type="number"
                  value={localDiscount}
                  onChange={(e) => handleDiscountChange(e.target.value)}
                  min="0"
                  max={subtotal}
                  step="0.01"
                />
              </div>
            </div>

            <div className="summary-row total-row">
              <span>Total:</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .invoice-cart {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .cart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #eee;
          background: #f8f9fa;
        }

        .cart-header h3 {
          margin: 0;
          color: #333;
          font-size: 18px;
        }

        .btn-clear {
          background: #dc3545;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .btn-clear:hover {
          background: #c82333;
        }

        .cart-empty {
          padding: 40px 20px;
          text-align: center;
          color: #666;
        }

        .cart-empty p {
          margin: 0 0 8px 0;
          font-size: 14px;
        }

        .cart-items {
          max-height: 300px;
          overflow-y: auto;
        }

        .cart-item {
          display: flex;
          align-items: center;
          padding: 12px 20px;
          border-bottom: 1px solid #eee;
          transition: background-color 0.2s;
        }

        .cart-item:hover {
          background-color: #f8f9fa;
        }

        .cart-item:last-child {
          border-bottom: none;
        }

        .item-info {
          flex: 1;
          min-width: 0;
        }

        .item-name {
          font-weight: 500;
          font-size: 14px;
          color: #333;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .item-generic {
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
        }

        .item-price {
          font-size: 12px;
          color: #007bff;
          font-weight: 500;
        }

        .item-quantity {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 16px;
        }

        .quantity-btn {
          width: 24px;
          height: 24px;
          border: 1px solid #ddd;
          background: white;
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          transition: all 0.2s;
        }

        .quantity-btn:hover:not(:disabled) {
          background-color: #f8f9fa;
          border-color: #007bff;
        }

        .quantity-btn:disabled {
          background-color: #f8f9fa;
          color: #ccc;
          cursor: not-allowed;
        }

        .quantity-display {
          min-width: 20px;
          text-align: center;
          font-weight: 500;
          font-size: 14px;
        }

        .item-total {
          font-weight: 600;
          font-size: 14px;
          color: #333;
          min-width: 60px;
          text-align: right;
          margin-right: 12px;
        }

        .item-remove {
          width: 24px;
          height: 24px;
          border: none;
          background: #dc3545;
          color: white;
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          transition: background-color 0.2s;
        }

        .item-remove:hover {
          background: #c82333;
        }

        .cart-summary {
          padding: 16px 20px;
          background: #f8f9fa;
          border-top: 1px solid #eee;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .summary-row:last-child {
          margin-bottom: 0;
        }

        .discount-row {
          align-items: flex-start;
        }

        .discount-input {
          display: flex;
          align-items: center;
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
        }

        .discount-input span {
          padding: 4px 8px;
          background: #e9ecef;
          color: #666;
          font-size: 12px;
        }

        .discount-input input {
          border: none;
          outline: none;
          padding: 4px 8px;
          width: 80px;
          font-size: 14px;
        }

        .total-row {
          font-weight: 600;
          font-size: 16px;
          color: #333;
          padding-top: 8px;
          border-top: 1px solid #ddd;
        }
      `}</style>
    </div>
  );
};

export default InvoiceCart;
