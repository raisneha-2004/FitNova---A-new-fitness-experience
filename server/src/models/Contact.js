const mongoose = require('mongoose');

/**
 * Contact Message Schema
 */
const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 150,
    },
    topic: {
      type: String,
      required: true,
      enum: ['Feedback', 'Bug report', 'Feature request', 'Other'],
      default: 'Feedback',
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Contact', contactSchema);
