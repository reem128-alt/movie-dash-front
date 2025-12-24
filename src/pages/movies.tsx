import * as React from "react";
import { Search } from "lucide-react";
import { moviesApi } from "../services/api";
import { useQuery } from "@tanstack/react-query";
import { Input } from "../components/ui/input";
import { useNavigate } from "react-router";
import { useAppSelector, useAppDispatch } from "../store/hook";
import { setQuery } from "../store/searchReducer";
import Loading from "../components/loading";
import { Button } from "../components/ui/button";
import { PosterCard } from "../components/PosterCard";
import { Movie } from "../types/movie";

function MovieList() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const query = useAppSelector((state) => state.search.query);
  const [localSearch, setLocalSearch] = React.useState(query || "");

  const {
    data: movies = [],
    isLoading,
    error,
  } = useQuery<Movie[]>({
    queryKey: ["movies"],
    queryFn: moviesApi.getAllMovies,
    staleTime: 10000,
    refetchInterval: 30000,
  });

console.log(movies)

  // Update local search when query from Redux changes
  React.useEffect(() => {
    if (query) {
      setLocalSearch(query);
    }
  }, [query]);

  const filteredMovies = React.useMemo(() => {
    const searchTerm = localSearch.toLowerCase();
    return movies.filter(
      (movie) =>
        movie.title.toLowerCase().includes(searchTerm) ||
        movie.producer.toLowerCase().includes(searchTerm) ||
        movie.actors.some((actor) =>
          actor.name.toLowerCase().includes(searchTerm)
        )
    );
  }, [localSearch, movies]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    dispatch(setQuery(value));
  };

  if (isLoading) {
    return <Loading size="lg" text="Loading movies..." fullScreen />;
  }

  if (error) {
    return <div className="text-red-500">Error loading movies</div>;
  }

  if (!movies.length) {
    return (
      <div className="space-y-4 text-center text-purple-100 py-12">
        <h2 className="text-2xl font-semibold">No movies yet</h2>
        <p className="text-purple-300">
          Add your first movie to get started.
        </p>
        <Button
          onClick={() => navigate("/addmovie")}
          className="bg-purple-700 hover:bg-purple-600 text-white"
        >
          Add Movie
        </Button>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-purple-100">Movies</h1>
        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-purple-400" />
          <Input
            type="search"
            placeholder="Search by title, producer, or actor..."
            className="pl-8 bg-purple-950/30 border-purple-900 text-purple-100 placeholder:text-purple-400"
            value={localSearch}
            onChange={handleSearch}
          />
        </div>
        <div className="text-sm text-purple-300">
          {filteredMovies.length} movies found
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredMovies.map((movie) => (
          <PosterCard
            key={movie._id}
            movie={movie}
            onClick={() => navigate(`/moviesDetail/${movie._id}`)}
          />
        ))}
      </div>

      {localSearch && filteredMovies.length === 0 && (
        <div className="text-purple-100 text-center py-8">
          No movies found matching "{localSearch}"
        </div>
      )}
    </div>
  );
}

export default MovieList;
