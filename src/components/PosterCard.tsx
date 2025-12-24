import * as React from "react";
import { Star, Clock } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Movie } from "../types/movie";

const url = import.meta.env.VITE_API_BASE_URL;

interface PosterCardProps {
  movie: Movie;
  onClick: () => void;
}

export function PosterCard({ movie, onClick }: PosterCardProps) {
  const [loaded, setLoaded] = React.useState(false);
  const posterUrl = movie.poster?.startsWith("http")
    ? movie.poster
    : `${url}${movie.poster}`;

  return (
    <Card
      className="overflow-hidden transition-all hover:shadow-lg hover:shadow-purple-900/20 border-purple-900 bg-gradient-to-br from-purple-950/50 to-black"
      onClick={onClick}
    >
      <CardHeader className="p-0">
        <div className="aspect-[3/4] h-[500px] relative">
          {!loaded && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-purple-950 via-purple-900 to-black" />
          )}
          <img
            src={posterUrl}
            alt={movie.title}
            className={`object-cover w-full h-full transition-opacity duration-500 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-purple-950/50 to-transparent" />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold truncate text-purple-100">
            {movie.title}
          </h3>
          <Badge
            variant="outline"
            className="border-purple-700 text-purple-200"
          >
            {movie.ageRating}
          </Badge>
        </div>
        <div className="flex -space-x-2 mb-2">
          {movie.actors.slice(0, 3).map((actor, index) => (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="border-2 border-purple-900 ring-2 ring-black">
                    <AvatarImage src={`${url}${actor.image}`} alt={actor.name} />
                    <AvatarFallback className="bg-purple-950 text-purple-200">
                      {actor.name[0]}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent className="bg-purple-950 border-purple-700">
                  <p>{actor.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        <p className="text-sm text-purple-300">Producer: {movie.producer}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 text-purple-300 flex items-center justify-between">
        <div className="flex items-center">
          <Star className="mr-1 h-4 w-4 text-purple-500" />
          {movie.rating}
        </div>
        <div className="flex items-center">
          <Clock className="mr-1 h-4 w-4" />
          {movie.duration}
        </div>
      </CardFooter>
    </Card>
  );
}
