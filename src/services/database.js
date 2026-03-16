// Database service layer for interacting with Electron IPC

class DatabaseService {
  constructor() {
    this.api = window.electronAPI;
  }

  // Product operations
  async getProducts() {
    try {
      return await this.api.getProducts();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async addProduct(product) {
    try {
      return await this.api.addProduct(product);
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }

  async updateProduct(id, product) {
    try {
      return await this.api.updateProduct(id, product);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(id) {
    try {
      return await this.api.deleteProduct(id);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  async searchProducts(query) {
    try {
      return await this.api.searchProducts(query);
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  // Sales operations
  async createSale(sale) {
    try {
      return await this.api.createSale(sale);
    } catch (error) {
      console.error('Error creating sale:', error);
      throw error;
    }
  }

  async getSales(startDate, endDate) {
    try {
      return await this.api.getSales(startDate, endDate);
    } catch (error) {
      console.error('Error fetching sales:', error);
      throw error;
    }
  }

  async getSaleDetails(saleId) {
    try {
      return await this.api.getSaleDetails(saleId);
    } catch (error) {
      console.error('Error fetching sale details:', error);
      throw error;
    }
  }

  // Report operations
  async getLowStockProducts() {
    try {
      return await this.api.getLowStockProducts();
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      throw error;
    }
  }

  async getExpiryAlerts() {
    try {
      return await this.api.getExpiryAlerts();
    } catch (error) {
      console.error('Error fetching expiry alerts:', error);
      throw error;
    }
  }

  async getDailySalesReport(date) {
    try {
      return await this.api.getDailySalesReport(date);
    } catch (error) {
      console.error('Error fetching daily sales report:', error);
      throw error;
    }
  }

  async getMonthlySalesReport(year, month) {
    try {
      return await this.api.getMonthlySalesReport(year, month);
    } catch (error) {
      console.error('Error fetching monthly sales report:', error);
      throw error;
    }
  }

  // Print operation
  async printInvoice(invoiceData) {
    try {
      return await this.api.printInvoice(invoiceData);
    } catch (error) {
      console.error('Error printing invoice:', error);
      throw error;
    }
  }
}

export default new DatabaseService();
