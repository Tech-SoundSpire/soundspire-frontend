"use client";

import BaseHeading from "@/components/BaseHeading/BaseHeading";
import styles from "./communities.module.css";
import Link from "next/link";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import SearchDropdown from "@/components/ui/SearchDropdown";
import {
  getDefaultProfileImageUrl,
  getImageUrl,
} from "@/utils/userProfileImageUtils";
import { communityDataFromAPI } from "@/types/communityGetAllAPIData";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import BaseText from "@/components/BaseText/BaseText";

export default function MyCommunities() {
  const { user } = useAuth();

  const [searchValue, setSearchValue] = useState("");
  const [userProfilePicture, setUserProfilePicture] = useState<string | null>(
    null,
  );

  // 🔑 SINGLE source of truth for UI
  const [communities, setCommunities] = useState<communityDataFromAPI[]>([]);
  const [loadingCommunities, setLoadingCommunities] = useState(true);

  /* =========================
       Initial load → subscribed communities
       ========================= */
  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const res = await fetch(`/api/community/subscribe?user_id=${user.id}`);
        if (!res.ok) throw new Error("Error fetching subscribed communities");

        const json = await res.json();
        setCommunities(json.communities);
        setUserProfilePicture(json.user?.profile_picture_url || null);
      } catch (err) {
        toast.error("Failed to load communities");
        console.error(err);
      } finally {
        setLoadingCommunities(false);
      }
    })();
  }, [user]);

  /* =========================
       Search logic
       ========================= */
  useEffect(() => {
    if (!user) return;

    // 🔁 CLEAR SEARCH → subscribed communities
    if (!searchValue.trim()) {
      (async () => {
        try {
          const res = await fetch(
            `/api/community/subscribe?user_id=${user.id}`,
          );
          const json = await res.json();
          setCommunities(json.communities);
        } catch {
          toast.error("Failed to reload communities");
        }
      })();
      return;
    }

    // ⛔ avoid spam requests
    if (searchValue.trim().length < 2) return;

    const fetchAllCommunities = async () => {
      try {
        const res = await fetch(
          `/api/community?search=${encodeURIComponent(searchValue)}`,
        );
        if (!res.ok) throw new Error("Search failed");

        const json = await res.json();
        setCommunities(json.communities);
      } catch (err) {
        toast.error("Community search failed");
      }
    };

    const debounce = setTimeout(fetchAllCommunities, 300);
    return () => clearTimeout(debounce);
  }, [searchValue, user]);

  /* =========================
       UI
       ========================= */
  return (
    <div className={styles.main}>
      <header className={styles["intro"]}>
        <div className={styles["navigation"]}>
          <Link href={`/feed/`}>
            <FaArrowLeftLong />
          </Link>
          <BaseHeading
            headingLevel="h1"
            fontSize="calc(var(--large-text) + 1rem)"
            fontWeight={600}
            textColor="#ddaca6"
          >
            MY COMMUNITIES
          </BaseHeading>
        </div>

        <div className={styles["search"]}>
          <div className={styles["search-bar"]}>
            <SearchDropdown
              apiEndpoint="/api/community"
              placeholder="Search Communities..."
            />
          </div>

          <div className={styles["profile-picture"]}>
            <img
              alt="User Profile Picture"
              src={
                getImageUrl(userProfilePicture) || getDefaultProfileImageUrl()
              }
            />
          </div>
        </div>
      </header>

      <main className={styles.communities}>
        {loadingCommunities ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : communities.length === 0 ? (
          <BaseText textColor="#f0f0f0" fontSize="large">
            No Communities Found.
          </BaseText>
        ) : (
          communities.map((community) => {
            const communityAt = community.name?.replace(/[\s'",.]/g, "");

            return (
              <div key={community.id} className={styles["community-card"]}>
                <div className={styles["cover-image"]}>
                  <img
                    src={
                      getImageUrl(community.artist_profile_picture_url) ||
                      getImageUrl(community.artist_cover_photo_url) ||
                      getDefaultProfileImageUrl()
                    }
                    alt={`${community.name}'s cover image.`}
                  />
                </div>

                <div className={styles["card-content"]}>
                  <div className={styles["reference"]}>
                    <BaseHeading
                      headingLevel="h2"
                      fontSize="sub heading"
                      fontWeight={500}
                      textColor="#f0f0f0"
                    >
                      {community.name}
                    </BaseHeading>
                    <BaseText
                      wrapper="span"
                      fontSize="normal"
                      textColor="#817f85"
                    >
                      @{communityAt}
                    </BaseText>
                  </div>

                  <div className={styles["stats"]}>
                    <div className={styles["listeners"]}>
                      <div className={styles["design"]}></div>
                      <BaseText
                        wrapper="span"
                        fontSize="normal"
                        textColor="#f0f0f0"
                      >
                        75,983
                      </BaseText>
                    </div>

                    <div className={styles["genres"]}>
                      <div className={styles["design"]}></div>
                      <BaseText
                        wrapper="span"
                        fontSize="normal"
                        textColor="#f0f0f0"
                      >
                        Hip Hop, Jazz
                      </BaseText>
                    </div>
                  </div>

                  <Link
                    href={`/community/${community.artist_slug}`}
                    className={styles["community-link"]}
                  >
                    <BaseText
                      wrapper="span"
                      fontSize="inherit"
                      textColor="inherit"
                    >
                      Go to Community
                    </BaseText>
                    <FaArrowRightLong />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}
