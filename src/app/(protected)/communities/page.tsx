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
export default function MyCommunities() {
    const [searchValue, setSearchValue] = useState("");
    const [userProfilePicture, setUserProfilePicture] = useState<null | string>(
        null,
    );
    const { user } = useAuth();
    const [subscribedCommunitiesData, setSubscribedCommunitiesData] = useState<
        communityDataFromAPI[]
    >([]);
    const [loadingCommunities, setLoadingCommunities] = useState(true);
    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const res = await fetch(
                    `/api/community/subscribe?user_id=${user.id}`,
                );
                if (!res.ok)
                    throw new Error("Error trying to fetch community API.");
                const json = await res.json();

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
                            placeholder="Search"
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
            <main className={styles.communities}>
                {loadingCommunities ? (
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    </div>
                ) : subscribedCommunitiesData.length <= 0 ? (
                    <BaseText textColor="#f0f0f0" fontSize="large">
                        No Communities Found.
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
                                                75,983
                                            </BaseText>
                                        </div>
                                        <div className={styles["genres"]}>
                                            <div
                                                className={styles["design"]}
                                            ></div>
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
