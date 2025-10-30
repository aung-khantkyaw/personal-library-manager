const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['reading', 'completed', 'wishlist'],
    default: 'wishlist'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: String,
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
