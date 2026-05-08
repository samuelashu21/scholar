import mongoose from "mongoose";

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
        selectedVariant: {
          name: { type: String },
          optionLabel: { type: String },
          sku: { type: String },
        },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
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
      required: true,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "refund_requested",
        "refunded",
      ],
      default: "pending",
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: [
            "pending",
            "confirmed",
            "processing",
            "shipped",
            "out_for_delivery",
            "delivered",
            "cancelled",
            "refund_requested",
            "refunded",
          ],
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
      },
    ],
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

orderSchema.virtual("isPaid").get(function () {
  const paidLikeStatuses = ["confirmed", "processing", "shipped", "out_for_delivery", "delivered"];
  return paidLikeStatuses.includes(this.status);
});

orderSchema.virtual("isDelivered").get(function () {
  return this.status === "delivered";
});

orderSchema.virtual("paidAt").get(function () {
  const paidEntry = this.statusHistory?.find((entry) => entry.status === "confirmed");
  return paidEntry?.timestamp ?? null;
});

orderSchema.virtual("deliveredAt").get(function () {
  const deliveredEntry = this.statusHistory?.find((entry) => entry.status === "delivered");
  return deliveredEntry?.timestamp ?? null;
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
