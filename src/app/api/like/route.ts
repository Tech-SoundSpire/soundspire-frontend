import { NextRequest, NextResponse } from 'next/server';
import models from '@/models';
const { Like } = models;

type LikeWhereClause = {
  user_id: string;
  post_id?: string;
  comment_id?: string;
};

export async function POST(request : NextRequest){
    try{
        const { user_id,post_id,comment_id} = await request.json();
        
         if (!user_id || (!post_id && !comment_id)) {
            return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
        }

        const like = await Like.create({
            user_id,
            ...(post_id && { post_id }),
            ...(comment_id && { comment_id }),
        })

        return NextResponse.json(like);
    } catch (error : unknown){
        console.error('Error liking:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Failed to like', details: errorMessage }, { status: 500 });
    }
}

export async function DELETE(request:NextRequest){
    try{
        const { user_id,post_id,comment_id} = await request.json();
        
        if (!user_id || (!post_id && !comment_id)) {
            return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
        }

        const whereClause : LikeWhereClause = { user_id };

        if (post_id) {
            whereClause.post_id = post_id;
        } else {
            whereClause.comment_id = comment_id;
        }

        await Like.destroy({ where: whereClause });

        return NextResponse.json({message: 'DELETED succesfully'});
    } catch (error : unknown){
        console.error('Error disliking:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Failed to dislike', details: errorMessage }, { status: 500 });
    }
}