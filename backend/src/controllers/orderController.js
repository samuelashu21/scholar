import asyncWrapper from "../middleware/asyncWrapper.js";
import { successResponse } from "../utils/apiResponse.js";

const createOrderController = (orderService) => ({
  addOrderItem: asyncWrapper(async (req, res) => {
    const createdOrder = await orderService.addOrderItem({
      ...req.body,
      userId: req.user._id,
    });

    res.status(201).json(successResponse({ message: "Order created", data: createdOrder }));
  }),

  getMyOrders: asyncWrapper(async (req, res) => {
    const orders = await orderService.getMyOrders(req.user._id);
    res.status(200).json(successResponse({ message: "Orders fetched", data: orders }));
  }),

  getOrderById: asyncWrapper(async (req, res) => {
    const order = await orderService.getOrderById(req.params.id);
    res.status(200).json(successResponse({ message: "Order fetched", data: order }));
  }),

  updateOrderToPaid: asyncWrapper(async (req, res) => {
    const order = await orderService.updateOrderToPaid(req.params.id, req.body);
    res.status(200).json(successResponse({ message: "Order updated to paid", data: order }));
  }),

  updateOrderToDelivered: asyncWrapper(async (req, res) => {
    const order = await orderService.updateOrderToDelivered(req.params.id);
    res.status(200).json(successResponse({ message: "Order delivered", data: order }));
  }),

  getOrders: asyncWrapper(async (req, res) => {
    const orders = await orderService.getOrders();
    res.status(200).json(successResponse({ message: "Orders fetched", data: orders }));
  }),
});

export default createOrderController;
