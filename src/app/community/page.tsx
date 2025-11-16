import { DEFAULT_PROFILE_IMAGE, getImageUrl } from "@/utils/userProfileImageUtils";
import Image from "next/image";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function ArtistCommunityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0f24] to-[#0d0711] text-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 border-b border-gray-700">
        <div className="flex space-x-6">
          <a href="#" className="font-semibold text-white border-b-2 border-orange-500 pb-1">Home</a>
          <a href="#">Artist Forum</a>
          <a href="#">All Chat</a>
          <a href="#">Fan Art</a>
          <a href="#">Suggestions</a>
        </div>
        <div>
          <a href="#" className="font-medium">Ed Sheeran’s Community</a>
        </div>
      </nav>

      {/* Hero Image with Overlay */}
      <div className="relative flex justify-center items-center mt-6">
        <div className="relative w-[80vw] h-[70vh] rounded-2xl overflow-hidden">
          <Image
            src={getImageUrl(DEFAULT_PROFILE_IMAGE)} // replace with your Ed Sheeran image
            alt="Ed Sheeran"
            fill
            className="object-cover"
          />
          <div className="absolute top-6 right-6 text-right">
            <h2 className="text-3xl font-bold">Ed Sheeran</h2>
            <p className="text-orange-300">#Sheerios</p>
          </div>
        </div>

         {/* Icons on right side (centered vertically) */}
      <div className="absolute top-1/2 -translate-y-1/2 right-4 flex flex-col gap-4 text-white text-2xl">
        <a href="#"><FaXTwitter /></a>
        <a href="#"><FaInstagram /></a>
        <a href="#"><FaYoutube /></a>
      </div>
      </div>

      {/* About Section */}
      <section className="px-12 mt-8 max-w-4xl">
        <h3 className="text-xl font-bold mb-3">About</h3>
        <p className="text-gray-300 leading-relaxed mb-4">
          Hey there, welcome! I’m Ed Sheeran – really happy to have you here. Whether you’ve been
          listening since ‘+’ or just found your way through a song or reel, thanks for joining the journey.
        </p>
        <p className="mb-3">To get you started, here are a few songs I’d recommend:</p>
        <ul className="space-y-1 text-gray-200">
          <li>🎵 Shape of You – upbeat and fun</li>
          <li>🎵 Perfect – for all the lovebirds</li>
          <li>🎵 Photograph – full of memories</li>
          <li>🎵 Eyes Closed – one of my newer favorites</li>
          <li>🎵 Thinking Out Loud – a timeless one</li>
        </ul>
        <p className="mt-4 text-gray-300">
          Take your time, explore, and enjoy the music.  
          Before you join, do take a moment to read through the{" "}
          <a href="#guidelines" className="text-blue-400 underline">community guidelines</a> – let’s keep this
          space respectful and welcoming for everyone.
        </p>
      </section>

      {/* Highlights of Community */}
      <section className="px-12 mt-12">
        <h3 className="text-xl font-bold mb-4">Highlights of Community</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="relative h-48 rounded-lg overflow-hidden">
            <Image src={getImageUrl(DEFAULT_PROFILE_IMAGE)} alt="Highlight 1" fill className="object-cover" />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded">
              Be a <span className="font-semibold">part of the TRIBE</span>
            </div>
          </div>
          <div className="relative h-48 rounded-lg overflow-hidden">
            <Image src={getImageUrl(DEFAULT_PROFILE_IMAGE)} alt="Highlight 2" fill className="object-cover" />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded">
              Get access to Behind the Scenes
            </div>
          </div>
          <div className="relative h-48 rounded-lg overflow-hidden">
            <Image src={getImageUrl(DEFAULT_PROFILE_IMAGE)} alt="Highlight 3" fill className="object-cover" />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded">
              Tap into the global community
            </div>
          </div>
        </div>
      </section>

      {/* Artist Profile */}
      <section className="px-12 mt-12">
        <h3 className="text-xl font-bold mb-4">Artist Profile</h3>
        <Image src={getImageUrl(DEFAULT_PROFILE_IMAGE)} alt="Ed Sheeran" width={80} height={80} className="rounded-lg" />
      </section>

      {/* Reviews Section */}
      <section className="px-12 mt-12">
        <h3 className="text-xl font-bold mb-6">Reviews by the Sound Spire team</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#1e142d] rounded-xl overflow-hidden shadow-md">
              <div className="relative h-48">
                <Image src={getImageUrl(DEFAULT_PROFILE_IMAGE)} alt="Review" fill className="object-cover" />
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-300 mb-3">
                  Lorem ipsum dolor sit amet sed do eiusmod tempor Lorem ipsum dolor sit amet sed do eiusmod tempor
                </p>
                <p className="text-xs text-gray-400">Ashish Paul, 20th Dec</p>
                <button className="mt-3 px-3 py-1 bg-orange-500 rounded-md text-sm font-medium">
                  Read More
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Notice */}
      <footer className="px-12 py-8 mt-12 border-t border-gray-700 flex flex-col items-center gap-3">
        <p id="guidelines">
          <span className="text-gray-400">Notice</span>{" "}
          <span className="font-semibold">Guidelines for Ed Shreeran Community</span>
        </p>
        <div className="flex space-x-6 text-xl">
          <a href="#"><FaXTwitter/></a>
          <a href="#"><FaInstagram/></a>
          <a href="#"><FaYoutube/></a>
        </div>
      </footer>
    </div>
  );
}