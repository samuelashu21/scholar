import Order from "../../models/orderModel.js";
import Product from "../../models/productModel.js";

const orderRepository = {
  findProductsByIds: (ids) => Product.find({ _id: { $in: ids } }),
  createOrder: (payload) => Order.create(payload),
  findOrdersByUserId: (userId) => Order.find({ user: userId }),
  findById: (orderId) => Order.findById(orderId),
  findByIdWithUser: (orderId) => Order.findById(orderId).populate("user", "name email"),
  saveOrder: (order) => order.save(),
  findProductById: (productId) => Product.findById(productId),
  saveProduct: (product) => product.save(),
  findAll: () => Order.find({}).populate("user", "id name"),
};

export default orderRepository;
