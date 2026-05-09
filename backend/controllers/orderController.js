import createOrderController from "../src/controllers/orderController.js";
import OrderService from "../src/services/orderService.js";
import orderRepository from "../src/repositories/orderRepository.js";

const orderService = new OrderService(orderRepository);
const {
  addOrderItem,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getOrders,
} = createOrderController(orderService);

export {
  addOrderItem,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getOrders,
};
