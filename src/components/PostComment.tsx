'use client';
import { FaRegHeart, FaHeart } from 'react-icons/fa6';
import { useState } from 'react';
import Image from 'next/image';

export default function Comment(){
    const [liked,setLiked]=useState<boolean>(false);

    return(
    <div className='post-comment flex items-center py-2'>
        <Image
            src="/images/placeholder.jpg"
            alt={`Avatar`}
            className="w-12 h-12 rounded-full object-cover mr-5"
            width={100} height={100}
        />
        <div>
            <h1>Commenter Name</h1>
            <h1>This is a comment preview, Just a test for a longer comment haha</h1>
            <div className='flex'>
                <div className='flex items-center mr-4'>
                    { !liked ? 
                        <FaRegHeart className='mr-3 cursor-pointer' onClick={()=> setLiked(!liked)}/> :
                        <FaHeart className='mr-3 cursor-pointer fill-rose-400' onClick={()=> setLiked(!liked)}/>
                    }
                    <p className='comment-like-count'>14</p>
                </div>
                <div className='flex items-center mr-4'>
                    <p className='font-semibold'>Reply</p>
                </div>
            </div>
        </div>                       
    </div>
    )
}