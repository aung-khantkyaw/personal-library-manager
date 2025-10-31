import api from "@/lib/api";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

export const useBooks = (status, sort, page) => {
  return useQuery({
    queryKey: ["books", status, sort, page],
    queryFn: async () => {
      const params = { sort, page };
      if (status) {
        params.status = status;
      }
      const { data } = await api.get("/books", { params });
      return data;
    },
  });
};

export const useCreateBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (book) => api.post("/books", book),
    onSuccess: () => queryClient.invalidateQueries(["books"]),
  });
};

export const useUpdateBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...book }) => api.put(`/books/${id}`, book),
    onSuccess: () => queryClient.invalidateQueries(["books"]),
  });
};

export const useDeleteBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/books/${id}`),
    onSuccess: () => queryClient.invalidateQueries(["books"]),
  });
};
