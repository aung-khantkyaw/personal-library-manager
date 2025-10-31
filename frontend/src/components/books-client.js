"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  useBooks,
  useCreateBook,
  useUpdateBook,
  useDeleteBook,
} from "@/hooks/useBooks";

export default function BooksClient() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState("-updatedAt");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editBook, setEditBook] = useState(null);

  const { data, isLoading } = useBooks(filter, sort, page);
  const books = data?.books || [];
  const totalPages = data?.pages || 1;
  const createBook = useCreateBook();
  const updateBook = useUpdateBook();
  const deleteBook = useDeleteBook();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const book = {
      title: formData.get("title"),
      author: formData.get("author"),
      status: formData.get("status"),
      rating: formData.get("rating") || undefined,
      review: formData.get("review") || undefined,
    };

    if (editBook) {
      await updateBook.mutateAsync({ id: editBook._id, ...book });
    } else {
      await createBook.mutateAsync(book);
    }
    setShowModal(false);
    setEditBook(null);
  };

  return (
    <>
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Library</h1>
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => {
              setFilter("");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg transition ${!filter ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            All
          </button>
          <button
            onClick={() => {
              setFilter("reading");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg transition ${filter === 'reading' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Reading
          </button>
          <button
            onClick={() => {
              setFilter("completed");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg transition ${filter === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Completed
          </button>
          <button
            onClick={() => {
              setFilter("wishlist");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg transition ${filter === 'wishlist' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Wishlist
          </button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="-updatedAt">Latest</option>
            <option value="updatedAt">Oldest</option>
            <option value="title">Title A-Z</option>
            <option value="-title">Title Z-A</option>
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition ml-auto"
          >
            Add Book
          </button>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <div key={book._id} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{book.title}</h3>
                  <p className="text-gray-600 mb-2">by {book.author}</p>
                  <p className="text-sm text-gray-500 mb-2">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded">{book.status}</span>
                  </p>
                  {book.rating && <p className="text-yellow-600 mb-2">⭐ {book.rating}/5</p>}
                  {book.review && <p className="text-gray-700 text-sm mb-3">{book.review}</p>}
                  <p className="text-xs text-gray-400 mb-4">
                    Updated: {new Date(book.updatedAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditBook(book);
                        setShowModal(true);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteBook.mutate(book._id)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex gap-4 justify-center items-center mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                <span className="text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => {
            setShowModal(false);
            setEditBook(null);
          }}
        >
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6">{editBook ? "Edit Book" : "Add Book"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input name="title" defaultValue={editBook?.title} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                <input name="author" defaultValue={editBook?.author} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  defaultValue={editBook?.status || "wishlist"}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="wishlist">Wishlist</option>
                  <option value="reading">Reading</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating (1-5)</label>
                <input
                  name="rating"
                  type="number"
                  min="1"
                  max="5"
                  defaultValue={editBook?.rating}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
                <textarea
                  name="review"
                  defaultValue={editBook?.review}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Save
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
