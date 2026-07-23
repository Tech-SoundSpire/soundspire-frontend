import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SoundSpire",
    short_name: "SoundSpire",
    description: "The Superfan Experience — connect with your favorite artists.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0612",
    theme_color: "#FF4E27",
    icons: [
      { src: "/api/images/assets/ss_logo.png", sizes: "any", type: "image/png" },
    ],
  };
}
