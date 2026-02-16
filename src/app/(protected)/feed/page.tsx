"use client";

import { useState, useEffect } from "react";
import Post from "@/components/Posts/Post";
import { PostProps } from "@/lib/types";
import styles from "./feed.module.css";
import SearchDropdown from "@/components/ui/SearchDropdown";
import {
  getImageUrl,
  DEFAULT_PROFILE_IMAGE,
} from "@/utils/userProfileImageUtils";
import { useAuth } from "@/context/AuthContext";
import BaseHeading from "@/components/BaseHeading/BaseHeading";
import toast from "react-hot-toast";
import BaseText from "@/components/BaseText/BaseText";
import Link from "next/link";
import { type communityDataFromAPI } from "@/types/communityGetAllAPIData";

interface CommentProps {
  comment_id: string;
  parent_comment_id?: string | null;
  replies?: CommentProps[];
}

export default function Page() {
  const [posts, setPosts] = useState<PostProps[]>([]);
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] =
    useState<communityDataFromAPI[] | null>(null);

  const userId = user?.id || "33333333-3333-3333-3333-333333333333";

  /* =========================
     Fetch Feed Posts
  ========================= */
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/posts");
        const data = await res.json();

        const updatedPosts = data.map((post: PostProps) => {
          const commentsMap: Record<string, CommentProps> = {};
          const topLevelComments: CommentProps[] = [];

          post.comments?.forEach((comment: CommentProps) => {
            commentsMap[comment.comment_id] = {
              ...comment,
              replies: [],
            };
          });

          post.comments?.forEach((comment: CommentProps) => {
            if (comment.parent_comment_id) {
              commentsMap[comment.parent_comment_id]?.replies?.push(
                commentsMap[comment.comment_id]
              );
            } else {
              topLevelComments.push(commentsMap[comment.comment_id]);
            }
          });

          return {
            ...post,
            comments: topLevelComments,
          };
        });

        setPosts(updatedPosts);
      } catch (err) {
        console.error("Failed to fetch posts", err);
      }
    };

    fetchPosts();
  }, []);

  /* =========================
     Fetch Subscriptions
  ========================= */
  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const res = await fetch(
          `/api/community/subscribe?user_id=${user.id}`
        );
        if (!res.ok) throw new Error("Error fetching subscription data");

        const json = await res.json();
        setSubscriptions(json.communities);
      } catch (err: any) {
        toast.error(err.message || "Error fetching subscription data");
      }
    })();
  }, [user]);

  return (
    <div className="flex">
      <main className="ml-16 px-8 py-6 w-[70%]">
        <div className="flex justify-between items-center mt-6 mb-8 w-full">
          <BaseHeading
            headingLevel="h1"
            textColor="#ffffff"
            fontSize="sub heading"
            fontWeight={700}
            className="mx-auto"
          >
            Posts
          </BaseHeading>

          <div className="w-full max-w-2xl mx-auto">
            <SearchDropdown
              apiEndpoint="/api/posts"
              placeholder="Search posts..."
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          {posts.map((post: PostProps) => (
            <Post key={post.post_id} post={post} user_id={userId} />
          ))}
        </div>
      </main>

      <div className="fixed right-0 bg-slate-950 p-2 w-[23%] h-full">
        <div className="flex flex-col items-center">
          <BaseHeading
            headingLevel="h2"
            textColor="#ffffff"
            fontWeight={700}
            fontSize="sub heading"
            className="mt-5 mb-8"
          >
            My Subscriptions
          </BaseHeading>
        </div>

        {subscriptions ? (
          <div className="flex items-start justify-center p-2 flex-col">
            {subscriptions.map((element) => (
              <Link
                className={styles.subscription}
                href={`/community/${element.artist_slug}`}
                key={element.id}
              >
                <img
                  src={
                    getImageUrl(element.artist_profile_picture_url) ||
                    getImageUrl(element.artist_cover_photo_url) ||
                    getImageUrl(DEFAULT_PROFILE_IMAGE)
                  }
                  alt="Avatar"
                  className="w-12 h-12 rounded-full object-cover mr-3"
                />

                <div className={styles.text}>
                  <BaseText
                    wrapper="span"
                    fontWeight={500}
                    textColor="inherit"
                    fontSize="large"
                  >
                    {element.name}
                  </BaseText>
                  <div className={styles.separator}></div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div>Loading subscriptions...</div>
        )}
      </div>
    </div>
  );
}
