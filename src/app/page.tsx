"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getLogoUrl, getImageUrl } from "@/utils/userProfileImageUtils";

interface OnboardedArtist {
  artist_id: string;
  artist_name: string;
  profile_picture_url: string;
  bio: string;
  slug: string;
}

const faqItems = [
  {
    id: "what-is-soundspire",
    question: "What is SoundSpire?",
    answer:
      "SoundSpire is a music platform that connects fans directly with their favorite artists through exclusive communities, reviews, and personalized discovery.",
  },
  {
    id: "how-do-i-join",
    question: "How do I join an artist community?",
    answer:
      "Simply sign up, select your favorite genres and artists, then browse communities from the Explore page. Click on any artist to view their community and subscribe.",
  },
  {
    id: "is-it-free",
    question: "Is SoundSpire free for fans?",
    answer:
      "Yes! Signing up and discovering artists is completely free. Some artist communities may offer premium tiers with exclusive content.",
  },
  {
    id: "how-artists-join",
    question: "How can artists join the platform?",
    answer:
      "Artists can sign up through our onboarding flow, verify their identity via SoundCharts, set up their community, and start engaging with fans immediately.",
  },
];

const SOUNDCHARTS_LOGO = "s3://soundspirewebsiteassets/assets/soundchartslogo.svg";

export default function LandingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [artists, setArtists] = useState<OnboardedArtist[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({ artists: 0, fans: 0, communities: 0, reviews: 0 });

  useEffect(() => {
    if (isLoading) return;
    if (user) {
      if (user.role === "artist") {
        router.replace("/artist/dashboard");
      } else {
        router.replace("/explore");
      }
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    (async () => {
      try {
        const [artistsRes, statsRes] = await Promise.all([
          fetch("/api/explore/artists?q="),
          fetch("/api/stats"),
        ]);
        if (artistsRes.ok) {
          const data = await artistsRes.json();
          setArtists(data.filter((a: any) => a.user_id));
        }
        if (statsRes.ok) {
          setStats(await statsRes.json());
        }
      } catch {
        // ignore
      }
    })();
  }, []);


  if (isLoading || user) {
    return (
      <div className="min-h-screen bg-[#0a0612] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4E27]" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0612] text-white overflow-x-hidden">
      {/* ===== NAVBAR ===== */}
      <header className="fixed top-0 left-0 right-0 z-50 px-3 md:px-4 py-3 md:py-4">
        <nav className="max-w-[1400px] mx-auto flex items-center justify-between px-4 md:px-8 py-3 bg-white/30 backdrop-blur-2xl rounded-2xl border border-white/40 shadow-lg">
          <Link href="/" className="flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={getLogoUrl()} alt="SoundSpire" className="h-6 md:h-8" />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-white/80 hover:text-white font-medium transition">
              About
            </a>
            <Link href="/artist-onboarding" className="text-white/80 hover:text-white font-medium transition">
              For Artists
            </Link>
            <Link href="/signup" className="text-white/80 hover:text-white font-medium transition">
              For Fans
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-white font-medium hover:text-[#FF4E27] transition">
              Login
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2 bg-[#FF4E27] hover:bg-[#e5431f] rounded-xl font-medium transition"
            >
              Get Started
            </Link>
          </div>
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label="Toggle menu"
          >
            <span className={`w-6 h-0.5 bg-white transition-transform ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`w-6 h-0.5 bg-white transition-opacity ${mobileMenuOpen ? "opacity-0" : ""}`} />
            <span className={`w-6 h-0.5 bg-white transition-transform ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </nav>
        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 mx-auto max-w-[1400px] px-4 py-4 bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10">
            <div className="flex flex-col gap-4">
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-white/80 hover:text-white font-medium transition py-2">
                About
              </a>
              <Link href="/artist-onboarding" onClick={() => setMobileMenuOpen(false)} className="text-white/80 hover:text-white font-medium transition py-2">
                For Artists
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="text-white/80 hover:text-white font-medium transition py-2">
                For Fans
              </Link>
              <hr className="border-white/10" />
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-white font-medium hover:text-[#FF4E27] transition py-2">
                Login
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="px-5 py-3 bg-[#FF4E27] hover:bg-[#e5431f] rounded-xl font-medium transition text-center">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[85vh] md:min-h-screen flex items-center pt-0 md:pt-24">
        {/* Background image */}
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getImageUrl("s3://soundspirewebsiteassets/assets/index.png")}
            alt=""
            className="w-full h-full object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/40 to-black/10 md:from-black/50 md:via-black/20 md:to-transparent" />
        </div>
        <div className="relative max-w-[1400px] mx-auto px-6 md:px-16 pt-20 pb-6 md:py-20 w-full">
          <h1 className="font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight text-[#FF4E27] max-w-2xl">
            The Superfan Experience like never before
          </h1>
          <p className="mt-6 text-white/70 text-lg md:text-xl max-w-lg">
            Connect directly with your favorite artists, access exclusive releases, and join a community that shares your passion.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="px-8 py-4 bg-[#FF4E27] hover:bg-[#e5431f] rounded-2xl font-semibold text-lg transition flex items-center gap-2"
            >
              Join Now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </Link>
            <a
              href="#about"
              className="px-8 py-4 rounded-2xl font-semibold text-lg border border-white/20 bg-white/5 hover:bg-white/10 transition"
            >
              Explore Now
            </a>
          </div>
        </div>
      </section>

      {/* ===== ABOUT US SECTION ===== */}
      <section id="about" className="relative py-24 md:py-32 overflow-hidden">
        {/* Right-hand orange shape — hidden on mobile */}
        <div className="absolute top-1/2 -translate-y-1/2 right-0 w-auto pointer-events-none hidden md:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getImageUrl("s3://soundspirewebsiteassets/assets/AboutUs_Vinyl_RightHand.png")}
            alt=""
            className="h-[859px] w-auto object-contain object-right"
            aria-hidden="true"
          />
        </div>

        <div className="max-w-[1400px] mx-auto px-8 md:px-16 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl md:text-7xl font-bold text-[#FF4E27] mb-6" style={{ textShadow: "3px 2px 0px #ffffff20" }}>
              ABOUT US
            </h2>
            <p className="text-white/80 text-lg leading-relaxed mb-10">
              SoundSpire bridges the gap between artists and their most dedicated fans. We believe music is more than just listening — it&apos;s about belonging to a community, sharing experiences, and growing together.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#FF4E27]/20 flex items-center justify-center">
                  <span className="text-[#FF4E27] font-bold text-lg">{stats.artists}+</span>
                </div>
                <span className="text-white/70 text-sm">Artists Onboarded</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#FF4E27]/20 flex items-center justify-center">
                  <span className="text-[#FF4E27] font-bold text-lg">{stats.fans}+</span>
                </div>
                <span className="text-white/70 text-sm">Active Fans</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#FF4E27]/20 flex items-center justify-center">
                  <span className="text-[#FF4E27] font-bold text-lg">{stats.communities}+</span>
                </div>
                <span className="text-white/70 text-sm">Communities</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#FF4E27]/20 flex items-center justify-center">
                  <span className="text-[#FF4E27] font-bold text-lg">{stats.reviews}+</span>
                </div>
                <span className="text-white/70 text-sm">Reviews Written</span>
              </div>
            </div>
          </div>

          {/* Vinyl Record — oversized, touching the right screen edge */}
          <div className="flex justify-center md:justify-end relative z-10 md:-mr-48 lg:-mr-56">
            <div className="relative w-64 h-64 md:w-[700px] md:h-[700px] lg:w-[859px] lg:h-[859px] aspect-square group cursor-pointer">
              <div className="w-full h-full aspect-square rounded-full bg-gradient-to-br from-gray-800 via-gray-900 to-black shadow-2xl border-[12px] border-gray-700 transition-transform duration-700 group-hover:animate-[spin_2s_linear_infinite]">
                {/* Grooves */}
                <div className="absolute inset-6 rounded-full border border-white/5" />
                <div className="absolute inset-12 rounded-full border border-white/5" />
                <div className="absolute inset-[4.5rem] rounded-full border border-white/5" />
                <div className="absolute inset-24 rounded-full border border-white/5" />
                <div className="absolute inset-32 rounded-full border border-white/5" />
                <div className="absolute inset-40 rounded-full border border-white/5" />
                <div className="absolute inset-48 rounded-full border border-white/5" />
                <div className="absolute inset-56 rounded-full border border-white/5" />
                <div className="absolute inset-64 rounded-full border border-white/5" />
                {/* Center: white dot + red ring */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-36 h-36 md:w-60 md:h-60 lg:w-72 lg:h-72 rounded-full bg-[#d42020] flex items-center justify-center shadow-lg">
                    <div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-white" />
                  </div>
                </div>
                {/* Vinyl.png on top, filling the entire disc */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getImageUrl("s3://soundspirewebsiteassets/assets/Vinyl.png")}
                  alt=""
                  className="absolute inset-0 w-full h-full object-fill rounded-full"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== EVERYTHING YOU NEED TO GROW ===== */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-white">
              Everything You Need
            </h2>
            <h2 className="text-4xl md:text-6xl font-black text-[#FF4E27]">
              to Grow.
            </h2>
            <p className="mt-6 text-white/70 text-lg md:text-xl max-w-3xl mx-auto">
              From community building to content monetization — SoundSpire gives artists every tool they need, in one place.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-[#FF4E27]/40 transition">
              <div className="w-10 h-10 rounded-lg bg-[#FF4E27]/20 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-[#FF4E27]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <p className="text-[#FF4E27] text-sm font-mono tracking-wider mb-2">COMMUNITY</p>
              <h3 className="text-2xl font-black text-white mb-3">Join Your Tribe</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-4">
                Build and engage with artist-specific communities. Share your passion with fans who get it.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-white/50 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF4E27]" />
                  Live Chat Rooms
                </li>
                <li className="flex items-center gap-2 text-white/50 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF4E27]" />
                  Fan Leaderboards
                </li>
                <li className="flex items-center gap-2 text-white/50 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF4E27]" />
                  Moderator Tools
                </li>
              </ul>
            </div>
            {/* Card 2 */}
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-[#FF4E27]/40 transition">
              <div className="w-10 h-10 rounded-lg bg-[#FF4E27]/20 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-[#FF4E27]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-[#FF4E27] text-sm font-mono tracking-wider mb-2">CONTENT</p>
              <h3 className="text-2xl font-black text-white mb-3">Share Your Art</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-4">
                Upload videos, images, and posts. Adaptive HLS streaming ensures your content looks great everywhere.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-white/50 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF4E27]" />
                  Video Uploads with HLS
                </li>
                <li className="flex items-center gap-2 text-white/50 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF4E27]" />
                  Image Galleries
                </li>
                <li className="flex items-center gap-2 text-white/50 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF4E27]" />
                  Fan Art Showcases
                </li>
              </ul>
            </div>
            {/* Card 3 */}
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-[#FF4E27]/40 transition">
              <div className="w-10 h-10 rounded-lg bg-[#FF4E27]/20 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-[#FF4E27]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <p className="text-[#FF4E27] text-sm font-mono tracking-wider mb-2">DISCOVERY</p>
              <h3 className="text-2xl font-black text-white mb-3">Get Discovered</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-4">
                Personalized recommendations match fans with artists they&apos;ll love. Reviews and ratings help you stand out.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-white/50 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF4E27]" />
                  Smart Recommendations
                </li>
                <li className="flex items-center gap-2 text-white/50 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF4E27]" />
                  Review & Rating System
                </li>
                <li className="flex items-center gap-2 text-white/50 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF4E27]" />
                  Genre-based Explore
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ARTISTS ON BOARD ===== */}
      <section className="relative py-16 md:pt-12 md:pb-44 overflow-hidden">
        {/* Left side — hidden on mobile */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getImageUrl("s3://soundspirewebsiteassets/assets/OurPartners_Right.png")}
          alt=""
          className="absolute -top-44 left-0 h-[calc(100%+176px)] w-[280px] md:w-[400px] lg:w-[500px] object-fill pointer-events-none hidden md:block"
          aria-hidden="true"
        />
        {/* Right side — hidden on mobile */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getImageUrl("s3://soundspirewebsiteassets/assets/OurPartners_Left.png")}
          alt=""
          className="absolute -top-44 right-0 h-[calc(100%+176px)] w-[280px] md:w-[400px] lg:w-[500px] object-fill pointer-events-none hidden md:block"
          aria-hidden="true"
        />
        {/* Bottom orange triangle — hidden on mobile */}
        <div className="absolute bottom-0 left-0 right-0 h-[65%] pointer-events-none hidden md:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getImageUrl("s3://soundspirewebsiteassets/assets/ArtistOnBoard_Bottom.png")}
            alt=""
            className="w-full h-full object-fill"
            aria-hidden="true"
          />
        </div>

        <div className="max-w-[1400px] mx-auto px-8 md:px-16 relative z-10">
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white text-center mb-8 md:mb-16 lg:mb-20" style={{ textShadow: "3px 2px 0px #FF4E27" }}>
            ARTISTS ON BOARD
          </h2>
          {artists.length > 0 ? (
            <div className="flex flex-col items-center">
              {/* Mobile: simple centered grid, Desktop: inverted V on triangle */}
              <div className="grid grid-cols-3 gap-4 md:hidden w-full place-items-center">
                {artists.slice(0, 6).map((artist) => (
                  <div key={artist.artist_id} className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#FF4E27]/30 shadow-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getImageUrl(artist.profile_picture_url)}
                        alt={artist.artist_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="mt-2 text-xs text-white/70 text-center font-medium">{artist.artist_name}</h3>
                  </div>
                ))}
              </div>
              {/* Desktop: inverted V */}
              <div className="hidden md:flex items-start justify-center gap-24 lg:gap-32">
                {artists.slice(0, 5).map((artist, i) => {
                  const count = Math.min(artists.length, 5);
                  const center = Math.floor(count / 2);
                  const distFromCenter = Math.abs(i - center);
                  const isCenter = i === center;
                  const offset = isCenter ? 0 : distFromCenter * 90 + 40;
                  return (
                    <div key={artist.artist_id} className="flex flex-col items-center" style={{ paddingTop: `${offset}px` }}>
                      <div className={`rounded-full overflow-hidden border-4 shadow-2xl transition-all duration-300 ${isCenter ? "w-60 h-60 border-[#FF4E27]" : "w-40 h-40 border-[#FF4E27]/30"}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getImageUrl(artist.profile_picture_url)}
                          alt={artist.artist_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className={`mt-3 font-semibold text-center ${isCenter ? "text-xl text-[#FF4E27]" : "text-sm text-white/70"}`}>
                        {artist.artist_name}
                      </h3>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4E27]" />
            </div>
          )}
        </div>
      </section>

      {/* ===== OUR PARTNERS ===== */}
      <section className="relative py-24 md:py-32 overflow-hidden">

        <div className="max-w-[1400px] mx-auto px-8 md:px-16 relative z-10">
          <h2 className="text-5xl md:text-7xl font-bold text-white text-center mb-16" style={{ textShadow: "3px 2px 0px #FF4E27" }}>
            OUR PARTNERS
          </h2>
          <div className="flex justify-center gap-12 flex-wrap">
            <div className="flex flex-col items-center gap-4 px-10 py-8 rounded-3xl border border-white/10 bg-white/5 hover:border-[#FF4E27]/30 transition">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getImageUrl(SOUNDCHARTS_LOGO)}
                alt="SoundCharts"
                className="h-12 w-auto object-contain"
              />
              <span className="text-white/80 text-lg font-semibold">SoundCharts</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-8 md:px-16">
          <h2 className="text-5xl md:text-7xl font-bold text-white text-center mb-16" style={{ textShadow: "3px 2px 0px #FF4E27" }}>
            FAQ
          </h2>
          <div className="space-y-4">
            {faqItems.map((item) => (
              <div key={item.id} className="border border-white/10 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === item.id ? null : item.id)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition"
                  aria-expanded={openFaq === item.id}
                >
                  <span className="text-white/90 text-lg font-medium">{item.question}</span>
                  <svg
                    className={`w-5 h-5 text-[#FF4E27] transition-transform flex-shrink-0 ml-4 ${openFaq === item.id ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === item.id && (
                  <div className="px-6 pb-6 text-white/60 leading-relaxed">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-16 bg-gradient-to-t from-[#281545] to-black">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={getLogoUrl()} alt="SoundSpire" className="h-8 mb-4" />
              <p className="text-white/50 text-sm">
                The ultimate platform for superfans and independent artists.
              </p>
            </div>
            {/* Links */}
            <div>
              <h4 className="text-[#FF4E27] text-xs font-bold tracking-widest mb-4">EXPLORE</h4>
              <ul className="space-y-2 text-white/70 text-sm">
                <li><a href="#" className="hover:text-white transition">Home</a></li>
                <li><a href="#about" className="hover:text-white transition">About</a></li>
                <li><Link href="/signup" className="hover:text-white transition">Sign Up</Link></li>
                <li><Link href="/login" className="hover:text-white transition">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[#FF4E27] text-xs font-bold tracking-widest mb-4">HELP & SUPPORT</h4>
              <ul className="space-y-2 text-white/70 text-sm">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition">Community Guidelines</a></li>
                <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[#FF4E27] text-xs font-bold tracking-widest mb-4">LEGAL</h4>
              <ul className="space-y-2 text-white/70 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms & Conditions</a></li>
                <li><a href="#" className="hover:text-white transition">Copyright Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-white/40 text-sm">
              &copy; 2025 SoundSpire. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
