"use client";
import { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import Post from "@/components/Posts/Post";
import { PostProps, CommentProps } from "@/lib/types";

import {
    getImageUrl,
    DEFAULT_PROFILE_IMAGE,
} from "@/utils/userProfileImageUtils";
import { useAuth } from "@/context/AuthContext";
import BaseHeading from "@/components/BaseHeading/BaseHeading";
import toast from "react-hot-toast";
type community = { id: string; name: string; description: string };
export default function Page() {
    const [posts, setPosts] = useState<PostProps[]>([]);
    const { user } = useAuth();
    const [subscriptions, setSubscriptions] = useState<community[] | null>(
        null
    );

    useEffect(() => {
        fetch("/api/posts")
            .then((res) => res.json())
            .then((data) => {
                const updatedPosts = data.map((post: PostProps) => {
                    const commentsMap: { [key: string]: CommentProps } = {};
                    const topLevelComments: CommentProps[] = [];

                    post.comments.forEach((comment: CommentProps) => {
                        commentsMap[comment.comment_id] = {
                            ...comment,
                            replies: [],
                        };
                    });

                    post.comments.forEach((comment: CommentProps) => {
                        if (comment.parent_comment_id) {
                            const parent =
                                commentsMap[comment.parent_comment_id];
                            parent?.replies?.push(
                                commentsMap[comment.comment_id]
                            );
                        } else {
                            topLevelComments.push(
                                commentsMap[comment.comment_id]
                            );
                        }
                    });

                    return {
                        ...post,
                        comments: topLevelComments,
                    };
                });

                setPosts(updatedPosts);
            });
    }, []);
    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const res = await fetch(
                    `/api/community/subscribe?user_id=${user.id}`
                );
                if (!res.ok)
                    throw new Error("Error fetching subscription data");
                const json = await res.json();

                setSubscriptions(json.communities);
            } catch (err: any) {
                toast.error(err.message || "Error fetching subscription data");
            }
        })();
    }, [user]);
    const userId = user?.id || "33333333-3333-3333-3333-333333333333";

    //console.log(posts)

    return (
        <>
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
                        <div className="relative w-full max-w-2xl items-center mx-auto">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-[80%] px-4 py-2 pl-10 rounded-full bg-[#2d2838] text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        {posts.map((post: PostProps, index: number) => (
                            <Post key={index} post={post} user_id={userId} />
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
                        subscriptions.map((element) => (
                            <div
                                className="flex items-center p-2 text-white"
                                key={element.id}
                            >
                                <img
                                    src={getImageUrl(DEFAULT_PROFILE_IMAGE)}
                                    alt={`Avatar`}
                                    className="w-12 h-12 rounded-full object-cover mr-3"
                                    width={100}
                                    height={100}
                                />
                                <BaseHeading
                                    headingLevel="h3"
                                    fontWeight={500}
                                    fontSize="large"
                                >
                                    {element.name}
                                </BaseHeading>
                            </div>
                        ))
                    ) : (
                        <div>loading subscriptions...</div>
                    )}
                </div>
            </div>
        </>
    );
}
