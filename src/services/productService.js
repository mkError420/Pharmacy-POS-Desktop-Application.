import databaseService from './database.js';

class ProductService {
  async getAllProducts() {
    return await databaseService.getProducts();
  }

  async getProductById(id) {
    const products = await databaseService.getProducts();
    return products.find(product => product.id === parseInt(id));
  }

  async createProduct(productData) {
    // Validate required fields
    if (!productData.name || !productData.buy_price || !productData.sell_price) {
      throw new Error('Name, buy price, and sell price are required');
    }

    // Set default values
    const product = {
      ...productData,
      stock: productData.stock || 0,
      generic_name: productData.generic_name || '',
      company: productData.company || '',
      expiry_date: productData.expiry_date || null,
      barcode: productData.barcode || null
    };

    return await databaseService.addProduct(product);
  }

  async updateProduct(id, productData) {
    // Validate required fields
    if (!productData.name || !productData.buy_price || !productData.sell_price) {
      throw new Error('Name, buy price, and sell price are required');
    }

    return await databaseService.updateProduct(id, productData);
  }

  async deleteProduct(id) {
    return await databaseService.deleteProduct(id);
  }

  async searchProducts(query) {
    if (!query || query.trim() === '') {
      return await this.getAllProducts();
    }
    return await databaseService.searchProducts(query.trim());
  }

  async getProductByBarcode(barcode) {
    const products = await databaseService.searchProducts(barcode);
    return products.find(product => product.barcode === barcode);
  }

  async updateStock(id, quantity) {
    const product = await this.getProductById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    const newStock = product.stock + quantity;
    if (newStock < 0) {
      throw new Error('Insufficient stock');
    }

    return await databaseService.updateProduct(id, { ...product, stock: newStock });
  }

  async getLowStockProducts(threshold = 20) {
    const allProducts = await this.getAllProducts();
    return allProducts.filter(product => product.stock < threshold);
  }

  async getExpiringProducts(daysThreshold = 90) {
    const allProducts = await this.getAllProducts();
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
    
    return allProducts.filter(product => {
      if (!product.expiry_date) return false;
      const expiryDate = new Date(product.expiry_date);
      return expiryDate <= thresholdDate;
    });
  }
}

export default new ProductService();
