import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function ArtistPayoutPage() {
  return (
    <div className="text-white">
      <div className="relative z-10 p-8 pb-0">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="text-[#FA6400]">Let&apos;s</span> Get Going
          </h1>
          <p className="text-xl mb-2 max-w-[70vw] ml-auto mr-auto italic mt-5">
            &quot;To receive your payments, enter your payout details. Your
            data remains secure and is not saved on our servers. This step can
            be skipped if the information is not currently available&quot;
          </p>

          <button className="bg-[#FA6400] rounded-md py-2 px-4 mt-5 mb-0 text-primary-foreground">
            Add Payout Details
          </button>
        </div>
      </div>

      {/* Album collage */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2 transform rotate-12 scale-110">
            {Array.from({ length: 24 }, (_, i) => (
              <div
                key={i}
                className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg transform rotate-12 hover:rotate-0 transition-transform duration-300"
                style={{
                  background: `linear-gradient(45deg, 
                    hsl(${Math.random() * 360}, 70%, 60%), 
                    hsl(${Math.random() * 360}, 70%, 40%))`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="flex mx-5">
        <div className="flex items-center">
          <button className="w-[40px] h-[40px] bg-gray-600 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors duration-200">
            <FaChevronLeft className="text-[#ffdcd2] text-xl size-4" />
          </button>
          <p className="text-2xl ml-2">Go Back</p>
        </div>
        <div className="flex items-center ml-auto">
          <p className="text-2xl mr-2">Skip For Now</p>
          <button className="w-[40px] h-[40px] bg-gray-600 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors duration-200">
            <FaChevronRight className="text-[#ffdcd2] text-xl size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
