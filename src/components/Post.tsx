'use client';
import { FaRegHeart, FaRegPaperPlane, FaRegComments, FaHeart } from 'react-icons/fa6';
import { useState } from 'react';
import Comment from '@/components/PostComment';
import Image from 'next/image';

export default function Post(){

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [showComments,setShowComments]=useState<boolean>(false);
    const [liked,setLiked]=useState<boolean>(false);

    return(
        <div className='post rounded-xl bg-white w-[80%] mb-10'>
            <div className='post-header flex items-center p-5'>
                <Image
                    src="/images/placeholder.jpg"
                    alt={`Avatar`}
                    className="w-12 h-12 rounded-full object-cover mr-3"
                    width={100}
                    height={100}
                />
                <h1 className='font-bold'>ArtistName</h1>
            </div>
            <div className='post-body mb-2'>
                <Image
                    src="/images/placeholder.jpg"
                    alt={`Avatar`}
                    className="w-full h-auto"
                    width={100} height={100}
                />
            </div>
            <div className='post-interactions flex pl-4 py-5 text-lg'>
                <div className='flex items-center mr-4'>
                    { !liked ? 
                        <FaRegHeart className='mr-3 cursor-pointer' onClick={()=> setLiked(!liked)}/> :
                        <FaHeart className='mr-3 cursor-pointer fill-rose-400' onClick={()=> setLiked(!liked)}/>
                    }
                    <p>Like</p>
                </div>
                <div className='flex items-center mr-4'>
                    <FaRegComments className='mr-3'/>
                    <p>Comment</p>
                </div>
                <div className='flex items-center mr-4'>
                    <FaRegPaperPlane className='mr-3'/>
                    <p>Share</p>
                </div>
            </div>
            <div className='post-details flex px-5 pb-5 flex-wrap'>
                <p><span className='font-bold mr-3'>ArtistName</span>This is the post caption, this sentence was added just to increase size. Caption can be as long as you want it to be, just testing the wrap</p>
            </div>
            <div className='post-comments-preview p-4'>
                <div className='post-comment flex items-center py-2'>
                    <Image
                        src="/images/placeholder.jpg"
                        alt={`Avatar`}
                        className="w-12 h-12 rounded-full object-cover mr-5"
                         width={100} height={100}
                    />
                    <div>
                        <input placeholder='Enter Comment...' className='border-b-black border-b-2 w-[35vw] p-2 focus:outline-none'></input>
                    </div>
                    { showComments ? 
                        <Comment/>
                    : null }
                                
                </div>
            </div>            
        </div>
    )
}