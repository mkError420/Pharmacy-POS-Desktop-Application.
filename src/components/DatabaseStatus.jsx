import React, { useState, useEffect } from 'react';

const DatabaseStatus = () => {
  const [status, setStatus] = useState({
    connected: false,
    error: null,
    tables: [],
    products: 0,
    path: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const checkDatabaseStatus = async () => {
    try {
      const dbStatus = await window.electronAPI.getDatabaseStatus();
      setStatus(dbStatus);
    } catch (error) {
      setStatus({
        connected: false,
        error: error.message,
        tables: [],
        products: 0,
        path: null
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: '#f8f9fa',
        padding: '10px 15px',
        borderRadius: '5px',
        border: '1px solid #dee2e6',
        fontSize: '12px',
        zIndex: 1000
      }}>
        Checking database...
      </div>
    );
  }

  if (!status.connected) {
    return (
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: '#f8d7da',
        color: '#721c24',
        padding: '10px 15px',
        borderRadius: '5px',
        border: '1px solid #f5c6cb',
        fontSize: '12px',
        zIndex: 1000,
        maxWidth: '300px'
      }}>
        <div><strong>Database Error</strong></div>
        <div>{status.error || 'Database not connected'}</div>
        <button 
          onClick={checkDatabaseStatus}
          style={{
            marginTop: '5px',
            padding: '3px 8px',
            fontSize: '11px',
            background: '#721c24',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#d4edda',
      color: '#155724',
      padding: '10px 15px',
      borderRadius: '5px',
      border: '1px solid #c3e6cb',
      fontSize: '12px',
      zIndex: 1000,
      maxWidth: '300px'
    }}>
      <div><strong>Database Connected</strong></div>
      <div>Products: {status.products}</div>
      <div>Tables: {status.tables.join(', ')}</div>
      <div style={{ fontSize: '10px', color: '#6c757d', marginTop: '5px' }}>
        {status.path ? `Path: ${status.path.split('\\').pop()}` : ''}
      </div>
    </div>
  );
};

export default DatabaseStatus;
