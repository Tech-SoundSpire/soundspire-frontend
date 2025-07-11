"use client";
import { useState,useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import Post from '@/components/Posts/Post';
import { PostProps,CommentProps } from '@/lib/types';
import Image from 'next/image';

export default function Page(){
    const [posts,setPosts]=useState<PostProps[]>([])

    useEffect(() => {
        fetch('/api/posts')
            .then(res => res.json())
            .then(data => {
            const updatedPosts = data.map((post: PostProps) => {
                const commentsMap: { [key: string]: CommentProps } = {};
                const topLevelComments: CommentProps[] = [];

                post.comments.forEach((comment: CommentProps) => {
                commentsMap[comment.comment_id] = { ...comment, replies: [] };
                });

                post.comments.forEach((comment: CommentProps) => {
                if (comment.parent_comment_id) {
                    const parent = commentsMap[comment.parent_comment_id];
                    parent?.replies?.push(commentsMap[comment.comment_id]);
                } else {
                    topLevelComments.push(commentsMap[comment.comment_id]);
                }
                });

                return {
                ...post,
                comments: topLevelComments
                };
            });

            setPosts(updatedPosts);
            });
        }, []);

    const userId = '33333333-3333-3333-3333-333333333333';
    
    //console.log(posts)

    return(
        <>   
            <div className='flex'>
                <main className="ml-16 px-8 py-6 w-[70%]">
                    <div className="flex justify-between items-center mt-6 mb-8 w-full">
                        <h1 className="text-white text-4xl font-bold mx-auto">Posts</h1>
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
                <div className='flex flex-col items-center justify-center'>
                    {
                        posts.map((post:PostProps,index:number)=> (<Post key={index} post={post} user_id={userId}/>)) 
                    }
                </div>
                </main>
                 <div className='fixed right-0 bg-slate-950 p-2 w-[23%] h-full'>
                    <div className='flex flex-col items-center'>
                        <h1 className='text-white font-bold text-2xl mt-5 mb-8'>My Subscriptions</h1>
                    </div>
                    
                    <div className='flex items-center p-2 text-white'>
                            <Image
                                src="/images/placeholder.jpg"
                                alt={`Avatar`}
                                className="w-12 h-12 rounded-full object-cover mr-3"
                                width={100}
                                height={100}
                            />
                            <h1 className='font-bold'>ArtistName</h1>
                    </div>
                    <div className='flex items-center p-2 text-white'>
                            <Image
                                src="/images/placeholder.jpg"
                                alt={`Avatar`}
                                className="w-12 h-12 rounded-full object-cover mr-3"
                                width={100}
                                height={100}
                            />
                            <h1 className='font-bold'>ArtistName</h1>
                    </div>
                    <div className='flex items-center p-2 text-white'>
                            <Image
                                src="/images/placeholder.jpg"
                                alt={`Avatar`}
                                className="w-12 h-12 rounded-full object-cover mr-3"
                                width={100}
                                height={100}
                            />
                            <h1 className='font-bold'>ArtistName</h1>
                    </div>
                    <div className='flex items-center p-2 text-white'>
                            <Image
                                src="/images/placeholder.jpg"
                                alt={`Avatar`}
                                className="w-12 h-12 rounded-full object-cover mr-3"
                                width={100}
                            height={100}
                            />
                            <h1 className='font-bold'>ArtistName</h1>
                    </div>
                    <div className='flex items-center p-2 text-white'>
                            <Image
                                src="/images/placeholder.jpg"
                                alt={`Avatar`}
                                className="w-12 h-12 rounded-full object-cover mr-3"
                                width={100}
                                height={100}
                            />
                            <h1 className='font-bold'>ArtistName</h1>
                    </div>
                </div>
            </div>
        </>
    )
}