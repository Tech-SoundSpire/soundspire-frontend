/* eslint-disable @next/next/no-img-element */
"use client";

// import Carousel from '@/components/Carousel';
// import ArtistCard from '@/components/ArtistCard';
// import ReviewCard from '@/components/ReviewCard';
// import GenreCard from '@/components/GenreCard';
import { FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  getImageUrl,
  DEFAULT_PROFILE_IMAGE,
} from "@/utils/userProfileImageUtils";

interface Review {
  review_id: string;
  title: string;
  text_content: string;
  rating: number;
  image_urls: string[];
  created_at: string;
  user: {
    user_id: string;
    username: string;
    full_name: string;
    profile_picture_url: string;
  };
  artist: {
    artist_id: string;
    artist_name: string;
    profile_picture_url: string;
  };
}

interface Artist {
  artist_id: string;
  artist_name: string;
  profile_picture_url: string;
  bio: string;
}

interface Genre {
  genre_id: string;
  name: string;
}

const carouselItems = [
  {
    title: "INDIE FOLK MUSIC COLLECTION",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna",
    price: "49.99$$",
    image: getImageUrl(DEFAULT_PROFILE_IMAGE),
  },
  {
    title: "ELECTRONIC BEATS VOL. 2",
    description:
      "Experience the cutting edge of electronic music with our latest collection",
    price: "39.99$$",
    image: getImageUrl(DEFAULT_PROFILE_IMAGE),
  },
  {
    title: "JAZZ CLASSICS REMASTERED",
    description:
      "Timeless jazz recordings remastered for the modern audiophile",
    price: "59.99$$",
    image: getImageUrl(DEFAULT_PROFILE_IMAGE),
  },
];

export default function ExplorePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const { setUser } = useAuth();
  const router = useRouter();

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reviewsRes, artistsRes, genresRes] = await Promise.all([
          fetch("/api/explore/reviews"),
          fetch("/api/explore/artists"),
          fetch("/api/explore/genres"),
        ]);

        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData);
        }

        if (artistsRes.ok) {
          const artistsData = await artistsRes.json();
          setArtists(artistsData);
        }

        if (genresRes.ok) {
          const genresData = await genresRes.json();
          setGenres(genresData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + carouselItems.length) % carouselItems.length,
    );
  };

  const handleLogout = async () => {
    try {
      await axios.get("../api/users/logout", {
        withCredentials: true,
      });
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1625]">
      <main className="ml-16 px-8 py-6">
        {/* Search Bar and Logout */}
        <div className="flex justify-between items-center mb-8">
          <div className="relative w-full max-w-2xl items-center mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-4 py-2 pl-10 rounded-full bg-[#2d2838] text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 ml-4 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200"
          >
            Logout
          </button>
        </div>

        {/* Featured Carousel */}
        <section className="mb-12">
          <div className="relative rounded-lg overflow-hidden">
            <div className="aspect-[2/1] bg-gradient-to-r from-purple-900 to-purple-600 p-8 flex items-center">
              <div className="flex-1">
                <h2 className="text-4xl font-bold text-white mb-4">
                  {carouselItems[currentSlide].title}
                </h2>
                <p className="text-gray-300 mb-4 max-w-md">
                  {carouselItems[currentSlide].description}
                </p>
                <div className="text-2xl font-bold text-white">
                  {carouselItems[currentSlide].price}
                </div>
              </div>
              <div className="flex-1 flex justify-center">
                <img
                  src={carouselItems[currentSlide].image}
                  alt="Featured Album"
                  className="w-64 h-64 object-cover transform rotate-[-5deg]"
                />
              </div>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <FaChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <FaChevronRight className="w-6 h-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {carouselItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentSlide ? "bg-white" : "bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Suggested Artists */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">SUGGESTED ARTISTS</h2>
            <div className="flex space-x-2">
              <button className="p-2 rounded-full bg-[#2d2838] text-white hover:bg-purple-700">
                <FaChevronLeft />
              </button>
              <button className="p-2 rounded-full bg-[#2d2838] text-white hover:bg-purple-700">
                <FaChevronRight />
              </button>
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-4">
              {artists.map((artist) => (
                <div
                  key={artist.artist_id}
                  className="flex-shrink-0 text-center"
                >
                  <img
                    src={
                      artist.profile_picture_url ||
                      getImageUrl(DEFAULT_PROFILE_IMAGE)
                    }
                    alt={artist.artist_name}
                    className="w-24 h-24 rounded-full object-cover mb-2"
                  />
                  <p className="text-white text-sm font-medium max-w-24 truncate">
                    {artist.artist_name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Reviews */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">REVIEWS</h2>
            <a href="#" className="text-gray-400 hover:text-white">
              See All
            </a>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.slice(0, 3).map((review) => (
                <div
                  key={review.review_id}
                  className="bg-[#2d2838] rounded-lg overflow-hidden"
                >
                  <img
                    src={
                      review.image_urls && review.image_urls.length > 0
                        ? review.image_urls[0]
                        : getImageUrl(DEFAULT_PROFILE_IMAGE)
                    }
                    alt={review.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-white font-bold mb-2">
                      {review.title}
                    </h3>
                    {review.artist?.artist_name && (
                      <p className="text-purple-400 text-sm mb-2">
                        by {review.artist.artist_name}
                      </p>
                    )}
                    <p className="text-gray-400 text-sm mb-4">
                      {review.text_content.length > 100
                        ? `${review.text_content.substring(0, 100)}...`
                        : review.text_content}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">
                        {review.user?.full_name ||
                          review.user?.username ||
                          "Unknown User"}
                        , {new Date(review.created_at).toLocaleDateString()}
                      </span>
                      <button
                        className="px-4 py-1 bg-[#ff4d4d] text-white rounded-full text-sm"
                        onClick={() =>
                          router.push(`/reviews/${review.review_id}`)
                        }
                      >
                        Read More
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Discover by Genre */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">DISCOVER BY GENRE</h2>
            <a href="#" className="text-gray-400 hover:text-white">
              See More
            </a>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {genres.map((genre) => (
                <div
                  key={genre.genre_id}
                  className="relative aspect-[4/3] rounded-lg overflow-hidden bg-[#2d2838] cursor-pointer hover:scale-105 transition-transform duration-200"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <img
                    src={getImageUrl(DEFAULT_PROFILE_IMAGE)}
                    alt={genre.name}
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
                  />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-white text-xl font-bold">
                      {genre.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
