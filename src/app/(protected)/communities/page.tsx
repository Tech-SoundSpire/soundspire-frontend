"use client";
import BaseHeading from "@/components/BaseHeading/BaseHeading";
import styles from "./communities.module.css";
import Link from "next/link";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import {
    getDefaultProfileImageUrl,
    getImageUrl,
} from "@/utils/userProfileImageUtils";
import { communityDataFromAPI } from "@/types/communityGetAllAPIData";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import BaseText from "@/components/BaseText/BaseText";
import SearchDropdown from "@/components/ui/SearchDropdown";
import { useLanguage } from "@/context/LanguageContext";
export default function MyCommunities() {
    const [searchValue, setSearchValue] = useState("");
    const { t } = useLanguage();
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [userProfilePicture, setUserProfilePicture] = useState<null | string>(
        null,
    );
    const { user } = useAuth();
    const [subscribedCommunitiesData, setSubscribedCommunitiesData] = useState<
        communityDataFromAPI[]
    >([]);
    const [loadingCommunities, setLoadingCommunities] = useState(true);

    // Search all communities
    useEffect(() => {
        if (!searchValue.trim()) { setSearchResults([]); setIsSearching(false); return; }
        setIsSearching(true);
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/communities/search?search=${encodeURIComponent(searchValue)}`);
                if (res.ok) {
                    const data = await res.json();
                    setSearchResults(data.communities || []);
                }
            } catch { /* ignore */ }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchValue]);
    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                // console.log("[communities] fetching subscribe for user:", user.id);
                const res = await fetch(
                    `/api/community/subscribe?user_id=${user.id}`,
                    { cache: 'no-store' }
                );
                // console.log("[communities] subscribe response status:", res.status);
                if (!res.ok)
                    throw new Error("Error trying to fetch community API.");
                const json = await res.json();
                // console.log("[communities] subscribe data:", json.communities?.map((c: any) => ({ name: c.artist_name, pic: c.artist_profile_picture_url })));
                setSubscribedCommunitiesData(json.communities);
                setUserProfilePicture(json.user.profile_picture_url);
            } catch (err) {
                toast.error("Failed to load communities");
                console.error(err);
            } finally {
                setLoadingCommunities(false);
            }
        })();
    }, [user]);

    return (
        <div className={styles.main}>
            <header className={styles["intro"]}>
                <div className={styles["navigation"]}>
                    <Link href={`/feed/`}>
                        <FaArrowLeftLong></FaArrowLeftLong>
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
                        <div className={styles.icon}>
                            <FaSearch></FaSearch>
                        </div>
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            placeholder={t("Search all communities...")}
                        ></input>
                    </div>
                    <div className={styles["profile-picture"]}>
                        <img
                            alt="User Profile Picture"
                            src={
                                getImageUrl(userProfilePicture) ||
                                getDefaultProfileImageUrl()
                            }
                        ></img>
                    </div>
                </div>
            </header>
            {/* Search Results */}
            {isSearching && searchResults.length > 0 && (
                <div className="w-full px-8" style={{ paddingLeft: "calc(var(--navbar-collapsed) + 2rem)" }}>
                    <BaseHeading headingLevel="h2" fontSize="large" fontWeight={600} textColor="#ddaca6" className="mb-4">
                        {t('Search Results')}
                    </BaseHeading>
                    <div className={styles.communities}>
                        {searchResults.map((c: any) => (
                            <div key={c.community_id} className={styles["community-card"]}>
                                <div className={styles["cover-image"]}>
                                    <img src={getImageUrl(c.artist_profile_picture_url) || getDefaultProfileImageUrl()} alt={c.name} />
                                </div>
                                <div className={styles["card-content"]}>
                                    <div className={styles["reference"]}>
                                        <BaseHeading headingLevel="h2" fontSize="sub heading" fontWeight={500} textColor="#f0f0f0">{c.name}</BaseHeading>
                                        <BaseText wrapper="span" fontSize="normal" textColor="#817f85">{c.artist_name || "Artist"}</BaseText>
                                    </div>
                                    <Link href={`/community/${c.artist_slug}`} className={styles["community-link"]}>
                                        <BaseText wrapper="span" fontSize="inherit" textColor="inherit">{t('Go to Community')}</BaseText>
                                        <FaArrowRightLong />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {isSearching && searchResults.length === 0 && searchValue.trim() && (
                <div className="w-full text-center py-8" style={{ paddingLeft: "calc(var(--navbar-collapsed) + 2rem)" }}>
                    <BaseText textColor="#6b7280" fontSize="large">No communities found for &quot;{searchValue}&quot;</BaseText>
                </div>
            )}
            <main className={styles.communities}>
                {loadingCommunities ? (
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    </div>
                ) : subscribedCommunitiesData.length <= 0 ? (
                    <BaseText textColor="#f0f0f0" fontSize="large">
                        {t('No Communities Found.')}
                    </BaseText>
                ) : (
                    subscribedCommunitiesData.map((community) => {
                        const communityAt = community.name?.replace(
                            /[\s'",.]/g,
                            "",
                        );
                        return (
                            <div
                                key={community.artist_slug}
                                className={styles["community-card"]}
                            >
                                <div className={styles["cover-image"]}>
                                    <img
                                        src={
                                            getImageUrl(
                                                community.artist_profile_picture_url,
                                            ) ||
                                            getImageUrl(
                                                community.artist_cover_photo_url,
                                            ) ||
                                            getDefaultProfileImageUrl()
                                        }
                                        alt={`${community.name}'s cover image.`}
                                    ></img>
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
                                        >{`@${communityAt}`}</BaseText>
                                    </div>
                                    <div className={styles["stats"]}>
                                        <div className={styles["listeners"]}>
                                            <div
                                                className={styles["design"]}
                                            ></div>
                                            <BaseText
                                                wrapper="span"
                                                fontSize="normal"
                                                textColor="#f0f0f0"
                                            >
                                                {(community as any).subscriber_count || 0} subscribers
                                            </BaseText>
                                        </div>
                                        {(community as any).genres?.length > 0 && (
                                        <div className={styles["genres"]}>
                                            <div
                                                className={styles["design"]}
                                            ></div>
                                            <BaseText
                                                wrapper="span"
                                                fontSize="normal"
                                                textColor="#f0f0f0"
                                            >
                                                {(community as any).genres.join(", ")}
                                            </BaseText>
                                        </div>
                                        )}
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
                                            {t('Go to Community')}
                                        </BaseText>
                                        <FaArrowRightLong></FaArrowRightLong>
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
