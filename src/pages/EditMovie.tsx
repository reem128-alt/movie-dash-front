import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { Plus, X } from "lucide-react";
import * as z from "zod";
import { Button } from "../components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "react-toastify";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { moviesApi } from "../services/api";
import React from "react";
import { Movie } from "../types/movie";
const url=import.meta.env.VITE_API_BASE_URL

const ageRatings = ["G", "PG", "PG-13", "R", "NC-17"] as const;

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  ageRating: z.enum(ageRatings, {
    required_error: "Please select an age rating",
  }),
  poster: z.union([z.string(), z.instanceof(File)]),
  producer: z.string().min(1, "Producer is required"),
  story: z
    .string()
    .min(50, "Story must be at least 50 characters")
    .max(500, "Story must not exceed 500 characters"),
  actors: z
    .array(
      z.object({
        name: z.string().min(1, "Actor name is required"),
        image: z.union([z.string(), z.instanceof(File)]),
      })
    )
    .min(1, "At least one actor is required"),
  duration: z
    .string()
    .regex(/^\d+h\s\d+min$/, "Duration must be in format: 2h 30min"),
  rating: z
    .number()
    .min(0, "Rating must be at least 0")
    .max(10, "Rating must not exceed 10")
    .step(0.1, "Rating must have at most 1 decimal place"),
  releaseYear: z
    .number()
    .min(1888, "Release year must be after 1888 (first movie ever made)")
    .max(
      new Date().getFullYear() + 5,
      "Release year cannot be too far in the future"
    )
    .int("Release year must be a whole number"),
    views:z.number().optional()
});

type FormValues = z.infer<typeof formSchema>;

export function EditMovie() {
  const queryClient = new QueryClient();
  const [editMovie, setEditMovie] = React.useState<Movie>();
  const { id } = useParams();
  const navigate = useNavigate();
  

  console.log(editMovie);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const { data: movies = [] } = useQuery({
    queryKey: ["movies"],
    queryFn: moviesApi.getAllMovies,
  });

  React.useEffect(() => {
    if (movies && id) {
      const foundMovie = movies.find((m: { _id: any }) => String(m._id) === id);
      setEditMovie(foundMovie);
      if (foundMovie) {
        form.reset({
          title: foundMovie.title,
          ageRating: foundMovie.ageRating,
          poster: foundMovie.poster,
          producer: foundMovie.producer,
          story: foundMovie.story,
          actors: Array.isArray(foundMovie.actors) ? foundMovie.actors : [],
          duration: foundMovie.duration,
          rating: foundMovie.rating,
          releaseYear: foundMovie.releaseYear,
          views:foundMovie.views
        });
      }
    }
  }, [movies, id, form]);

  const EditMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      moviesApi.updateMovie(id, formData),
    onSuccess() {
      toast.success("Movie updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["movies"] });
      navigate("/movies");
    },
    onError(error) {
      toast.error("Failed to update movie");
      console.error(error);
    },
  });
  const { fields, append, remove } = useFieldArray({
    name: "actors",
    control: form.control,
  });

  function onSubmit(data: FormValues) {
    if (!id) return;

    const formData = new FormData();

    // Append all movie data as a single JSON string
    const movieData = {
      title: data.title,
      views:data.views,
      ageRating: data.ageRating,
      producer: data.producer,
      story: data.story,
      duration: data.duration,
      rating: data.rating,
      releaseYear: data.releaseYear,
      actors: data.actors.map((actor) => ({
        name: actor.name,
        image: actor.image instanceof File ? null : actor.image, // Keep existing image URL if not a new file
      })),
    };
    formData.append("movieData", JSON.stringify(movieData));
console.log(formData)
    // Handle poster file
    if (data.poster instanceof File) {
      formData.append("poster", data.poster);
    }

    // Handle actor image files
    data.actors.forEach((actor) => {
      if (actor.image instanceof File) {
        formData.append("actorImages", actor.image);
      }
    });

    EditMutation.mutate({
      id,
      formData,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mx-4">
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-purple-100">Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter movie title"
                    className="bg-purple-950/30 border-purple-800 text-purple-100 placeholder:text-purple-400"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ageRating"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-purple-100">Age Rating</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-purple-950/30 border-purple-800 text-purple-100">
                      <SelectValue placeholder="Select age rating" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-purple-950 border-purple-800">
                    {ageRatings.map((rating) => (
                      <SelectItem
                        key={rating}
                        value={rating}
                        className="text-purple-100 focus:bg-purple-900 focus:text-purple-50"
                      >
                        {rating}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="poster"
            render={({ field: { onChange, ...field } }) => (
              <FormItem>
                <FormLabel className="text-purple-100">Movie Poster</FormLabel>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onChange(file);
                          }
                        }}
                        className="bg-purple-950/30 border-purple-800 text-purple-100 placeholder:text-purple-400"
                      />
                    </FormControl>
                    <FormDescription className="text-purple-300">
                      Upload a new poster image or keep the existing one
                    </FormDescription>
                    <FormMessage className="text-red-400" />
                  </div>
                  {field.value && (
                    <div className="w-[200px] h-[300px] rounded-md overflow-hidden border-2 border-purple-800">
                      <img
                        src={field.value instanceof File ? URL.createObjectURL(field.value) : `${url}${field.value}`}
                        alt="Movie poster preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="producer"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-purple-100">Producer</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter producer name"
                    className="bg-purple-950/30 border-purple-800 text-purple-100 placeholder:text-purple-400"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 text-white">
          <FormField
            control={form.control}
            name="story"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-purple-100">Story</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter movie story/plot"
                    className="bg-purple-950/30 border-purple-800 text-purple-100 placeholder:text-purple-400 min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-purple-300">
                  Provide a brief summary of the movie plot (50-500 characters)
                </FormDescription>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="releaseYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Release Year</FormLabel>
                <Select
                  value={field.value?.toString()}
                  onValueChange={(value) => field.onChange(parseInt(value))}
                >
                  <FormControl>
                    <SelectTrigger className="bg-purple-950/30 text-white border-none relative">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent
                    className="bg-purple-900 text-white border-none z-[999] max-h-[200px] overflow-y-auto"
                    position="popper"
                    sideOffset={5}
                  >
                    {Array.from(
                      { length: new Date().getFullYear() - 1888 + 6 },
                      (_, i) => new Date().getFullYear() + 5 - i
                    ).map((year) => (
                      <SelectItem
                        key={year}
                        value={year.toString()}
                        className="hover:bg-purple-700 focus:bg-purple-700 cursor-pointer border-b border-purple-800/50 last:border-b-0"
                      >
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the year when this movie was or will be released
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel className="text-purple-100">Actors</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-purple-700 text-purple-100 hover:bg-purple-900/50"
              onClick={() => append({ name: "", image: "" })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Actor
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name={`actors.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-purple-100">
                          Actor Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="bg-purple-950/30 border-purple-800 text-purple-100 placeholder:text-purple-400"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name={`actors.${index}.image`}
                    render={({ field: { onChange, ...field } }) => (
                      <FormItem>
                        <FormLabel className="text-purple-100">
                          Actor Image
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            name={field.name}
                            ref={field.ref}
                            onBlur={field.onBlur}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                onChange(file);
                              }
                            }}
                            className="bg-purple-950/30 border-purple-800 text-purple-100 placeholder:text-purple-400"
                          />
                        </FormControl>
                        <FormDescription className="text-purple-300">
                          Upload a new image or keep the existing one
                        </FormDescription>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>
                {index > 0 && (
                  <Button
                    type="button"
                    variant="destructive"
                    className="mt-8"
                    onClick={() => remove(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {fields[index].image && (
                <div className="w-[150px] h-[200px] rounded-md overflow-hidden border-2 border-purple-800">
                  <img
                    src={
                      fields[index].image instanceof File
                        ? URL.createObjectURL(fields[index].image)
                        : `${url}${fields[index].image}`
                    }
                    alt={`Actor ${index + 1} preview`}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
          ))}
          {form.formState.errors.actors?.root && (
            <FormMessage className="text-red-400">
              {form.formState.errors.actors.root.message}
            </FormMessage>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-purple-100">Duration</FormLabel>
                <FormControl>
                  <Input
                    placeholder="2h 30min"
                    className="bg-purple-950/30 border-purple-800 text-purple-100 placeholder:text-purple-400"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-purple-300">
                  Format: 2h 30min
                </FormDescription>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-purple-100">Rating</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    className="bg-purple-950/30 border-purple-800 text-purple-100"
                    {...field}
                    onChange={(event) =>
                      field.onChange(Number.parseFloat(event.target.value))
                    }
                  />
                </FormControl>
                <FormDescription className="text-purple-300">
                  Rate from 0 to 10 (one decimal place)
                </FormDescription>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
        </div>
        <div  className="grid gap-6 sm:grid-cols-2">
        <FormField
            control={form.control}
            name="views"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-purple-100">views</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                   
                    className="bg-purple-950/30 border-purple-800 text-purple-100"
                    {...field}
                    onChange={(event) =>
                      field.onChange(Number.parseFloat(event.target.value))
                    }
                  />
                </FormControl>
                
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/movies")}
            className="text-purple-100 hover:bg-purple-900/50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={EditMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700 text-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {EditMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default EditMovie;
