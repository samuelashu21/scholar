import mongoose from "mongoose";
import { mapLegacyFlagsFromStatus, ORDER_STATUSES } from "../utils/orderStatus.js";

const statusHistorySchema = mongoose.Schema(
  {
    status: {
      type: String,
      enum: ORDER_STATUSES,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: "",
    },
    actor: {
      // User (admin/seller) who performed the status transition.
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { _id: false }
);

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    orderItems: [
      {
        name: {
          type: String,
          required: true,
        },
        image: {
          type: String, 
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        qty: {
          type: Number,
          required: true,
        },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        selectedVariant: {
          name: { type: String, default: "" },
          label: { type: String, default: "" },
          sku: { type: String, default: "" },
        },
      },
    ],

    shippingAddress: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      postalCode: {
        type: Number,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
    },

    paymentMethod: {
      type: String,
      required: true,
    },
    paymentResult: {
      id: {
        type: String,
      },
      status: {
        type: String,
      },
      update_time: {
        type: String,
      },
      email_address: {
        type: String,
      },
    },

    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "pending",
      required: true,
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
  },

  { timestamps: true }
);

orderSchema.pre("save", function (next) {
  const { isPaid, isDelivered } = mapLegacyFlagsFromStatus(this.status);
  this.isPaid = isPaid;
  this.isDelivered = isDelivered;

  if (isPaid && !this.paidAt) {
    this.paidAt = new Date();
  }

  if (isDelivered && !this.deliveredAt) {
    this.deliveredAt = new Date();
  }

  if (!this.statusHistory || this.statusHistory.length === 0) {
    this.statusHistory = [
      {
        status: this.status || "pending",
        timestamp: new Date(),
        note: "Order created",
      },
    ];
  }

  next();
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
