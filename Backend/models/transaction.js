const mongoose = require("mongoose");

const creditTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref : 'userDetails'
    },

    // Positive = credits added.
    // Negative = credits spent.
    amount: {
      type: Number,
      required: true,
    },

    type: {
      type: String,
      enum: ["purchase", "usage", "refund", "adjustment"],
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    referenceId: {
      type: String,
      required: true,
    },

    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

creditTransactionSchema.index(
  { user: 1, referenceId: 1 },
  { unique: true }
);

const Transaction= mongoose.model(
  "Transaction",
  creditTransactionSchema
);
module.exports = Transaction;