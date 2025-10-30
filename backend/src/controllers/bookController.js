const Book = require("../models/Book");
const { client } = require("../config/redis");

const getCacheKey = (userId) => `books:${userId}`;

const invalidateCache = async (userId) => {
  const pattern = `${getCacheKey(userId)}*`;
  const keys = await client.keys(pattern);
  if (keys.length > 0) await client.del(keys);
};

exports.createBook = async (req, res) => {
  try {
    const { title, author, status, rating, review } = req.body;

    if (!title || !author) {
      return res.status(400).json({ error: "Title and author required" });
    }

    const book = new Book({
      title,
      author,
      status,
      rating,
      review,
      ownerId: req.userId,
    });

    await book.save();
    await invalidateCache(req.userId);

    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBooks = async (req, res) => {
  try {
    const { status, sort = "-updatedAt", page = 1, limit = 10 } = req.query;
    const cacheKey = `${getCacheKey(req.userId)}:${
      status || "all"
    }:${sort}:${page}`;

    const cached = await client.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const query = { ownerId: req.userId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const books = await Book.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    const total = await Book.countDocuments(query);

    const result = {
      books,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    };
    await client.setEx(cacheKey, 3600, JSON.stringify(result));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findOne({
      _id: req.params.id,
      ownerId: req.userId,
    });

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    const { title, author, status, rating, review } = req.body;

    if (title) book.title = title;
    if (author) book.author = author;
    if (status) book.status = status;
    if (rating !== undefined) book.rating = rating;
    if (review !== undefined) book.review = review;

    await book.save();
    await invalidateCache(req.userId);

    res.json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findOneAndDelete({
      _id: req.params.id,
      ownerId: req.userId,
    });

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    await invalidateCache(req.userId);

    res.json({ message: "Book deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
