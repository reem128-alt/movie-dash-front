const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export const moviesApi = {
  // GET all movies
  getAllMovies: async () => {
    const response = await fetch(`${API_BASE_URL}/movies`);
    return response.json();
  },

  // GET single movie
  getMovie: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/movies/${id}`);
    return response.json();
  },

  // POST new movie
  createMovie: async (formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/movies`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Failed to create movie');
    }
    return response.json();
  },

  // PUT update movie
  updateMovie: async (id: string, formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/movies/${id}`, {
      method: "PUT",
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Failed to update movie');
    }
    return response.json();
  },

  // DELETE movie
  deleteMovie: async (id:string) => {
    const response = await fetch(`${API_BASE_URL}/movies/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error('Failed to delete movie');
    }
    return response.json();
  },
};
