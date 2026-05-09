import { calcPrices } from "../../utils/calcPrices.js";
import AppError from "../utils/appError.js";
import { ErrorCodes } from "../utils/errorCodes.js";

class OrderService {
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  async addOrderItem({ orderItems, shippingAddress, paymentMethod, userId }) {
    if (!orderItems?.length) {
      throw new AppError("No order items", { statusCode: 400, code: ErrorCodes.BAD_REQUEST });
    }

    const itemsFromDB = await this.orderRepository.findProductsByIds(orderItems.map((x) => x._id));
    const existingIds = new Set(itemsFromDB.map((item) => item._id.toString()));
    const missingIds = orderItems.map((item) => item._id).filter((id) => !existingIds.has(id));

    if (missingIds.length > 0) {
      throw new AppError("One or more products were not found", {
        statusCode: 404,
        code: ErrorCodes.NOT_FOUND,
        details: { missingProductIds: missingIds },
      });
    }

    const dbOrderItems = orderItems.map((item) => {
      const dbItem = itemsFromDB.find((p) => p._id.toString() === item._id);

      return {
        ...item,
        product: item._id,
        price: dbItem.price,
        _id: undefined,
      };
    });

    const prices = calcPrices(dbOrderItems);

    return this.orderRepository.createOrder({
      orderItems: dbOrderItems,
      user: userId,
      shippingAddress,
      paymentMethod,
      ...prices,
    });
  }

  async getMyOrders(userId) {
    return this.orderRepository.findOrdersByUserId(userId);
  }

  async getOrderById(orderId) {
    const order = await this.orderRepository.findByIdWithUser(orderId);
    if (!order) {
      throw new AppError("Order not found", { statusCode: 404, code: ErrorCodes.NOT_FOUND });
    }

    return order;
  }

  async updateOrderToPaid(orderId, paymentData) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new AppError("Order not found", { statusCode: 404, code: ErrorCodes.NOT_FOUND });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: paymentData.paymentId || paymentData.id,
      status: "COMPLETED",
      update_time: paymentData.update_time || new Date().toISOString(),
      email_address: paymentData.email_address || "not.provided@example.com",
    };

    for (const item of order.orderItems) {
      const product = await this.orderRepository.findProductById(item.product);
      if (!product) {
        throw new AppError(`Product ${item.product} not found`, {
          statusCode: 404,
          code: ErrorCodes.NOT_FOUND,
        });
      }

      if (product.countInStock < item.qty) {
        throw new AppError(`Insufficient stock for ${product.name}`, {
          statusCode: 400,
          code: ErrorCodes.BAD_REQUEST,
        });
      }

      product.countInStock -= item.qty;
      await this.orderRepository.saveProduct(product);
    }

    return this.orderRepository.saveOrder(order);
  }

  async updateOrderToDelivered(orderId) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new AppError("Order not found", { statusCode: 404, code: ErrorCodes.NOT_FOUND });
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();
    return this.orderRepository.saveOrder(order);
  }

  async getOrders() {
    return this.orderRepository.findAll();
  }
}

export default OrderService;
