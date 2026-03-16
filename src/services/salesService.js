import databaseService from './database.js';
import productService from './productService.js';

class SalesService {
  async createSale(saleData) {
    const { items, discount = 0 } = saleData;
    
    // Validate sale data
    if (!items || items.length === 0) {
      throw new Error('Sale must contain at least one item');
    }

    // Check stock availability
    for (const item of items) {
      const product = await productService.getProductById(item.product_id);
      if (!product) {
        throw new Error(`Product with ID ${item.product_id} not found`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
      }
    }

    // Calculate totals
    let totalAmount = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await productService.getProductById(item.product_id);
      const itemTotal = item.quantity * product.sell_price;
      
      processedItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        price: product.sell_price,
        total: itemTotal
      });
      
      totalAmount += itemTotal;
    }

    const netAmount = totalAmount - discount;

    // Create sale record
    const sale = {
      date: new Date().toISOString().split('T')[0],
      total_amount: totalAmount,
      discount: discount,
      net_amount: netAmount,
      items: processedItems
    };

    return await databaseService.createSale(sale);
  }

  async getSales(startDate, endDate) {
    const today = new Date();
    const defaultStartDate = startDate || new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const defaultEndDate = endDate || today.toISOString().split('T')[0];
    
    return await databaseService.getSales(defaultStartDate, defaultEndDate);
  }

  async getSaleById(id) {
    const sales = await this.getSales();
    return sales.find(sale => sale.id === parseInt(id));
  }

  async getSaleDetails(saleId) {
    return await databaseService.getSaleDetails(saleId);
  }

  async getTodaySales() {
    const today = new Date().toISOString().split('T')[0];
    return await databaseService.getDailySalesReport(today);
  }

  async getWeeklySales() {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() - today.getDay() + 6);
    
    return await this.getSales(
      weekStart.toISOString().split('T')[0],
      weekEnd.toISOString().split('T')[0]
    );
  }

  async getMonthlySales(year, month) {
    const currentDate = new Date();
    const targetYear = year || currentDate.getFullYear();
    const targetMonth = month || currentDate.getMonth() + 1;
    
    return await databaseService.getMonthlySalesReport(targetYear, targetMonth);
  }

  async getSalesSummary(startDate, endDate) {
    const sales = await this.getSales(startDate, endDate);
    
    const summary = {
      totalSales: sales.length,
      totalRevenue: 0,
      totalDiscount: 0,
      averageSaleAmount: 0
    };

    sales.forEach(sale => {
      summary.totalRevenue += sale.net_amount;
      summary.totalDiscount += sale.discount;
    });

    if (sales.length > 0) {
      summary.averageSaleAmount = summary.totalRevenue / sales.length;
    }

    return summary;
  }

  async getTopSellingProducts(startDate, endDate, limit = 10) {
    const sales = await this.getSales(startDate, endDate);
    const productSales = new Map();

    // Process all sales to calculate product totals
    for (const sale of sales) {
      const saleDetails = await this.getSaleDetails(sale.id);
      saleDetails.forEach(item => {
        const current = productSales.get(item.name) || {
          name: item.name,
          generic_name: item.generic_name,
          totalQuantity: 0,
          totalRevenue: 0
        };
        
        current.totalQuantity += item.quantity;
        current.totalRevenue += item.total;
        productSales.set(item.name, current);
      });
    }

    // Convert to array and sort by revenue
    return Array.from(productSales.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);
  }
}

export default new SalesService();
