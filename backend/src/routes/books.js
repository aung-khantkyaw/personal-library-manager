const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  createBook,
  getBooks,
  updateBook,
  deleteBook,
} = require("../controllers/bookController");

router.use(auth);

router.post("/", createBook);
router.get("/", getBooks);
router.put("/:id", updateBook);
router.delete("/:id", deleteBook);

module.exports = router;
