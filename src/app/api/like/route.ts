import { NextRequest, NextResponse } from 'next/server';
import models from '@/models';
const { Like } = models;

export async function POST(request : NextRequest){
    try{
        const { user_id,post_id} = await request.json();
        
        if (!user_id || !post_id ){
            return NextResponse.json({ error: 'Missing Required Parameters.' }, { status: 400 });
        }

        const like = await Like.create({
            user_id,
            post_id
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
        const { user_id,post_id} = await request.json();
        
        if (!user_id || !post_id ){
            return NextResponse.json({ error: 'Missing Required Parameters.' }, { status: 400 });
        }

        await Like.destroy({
            where: {
                user_id,
                post_id
            }
        });

        return NextResponse.json({message: 'DELTED succesfully'});
    } catch (error : unknown){
        console.error('Error disliking:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Failed to dislike', details: errorMessage }, { status: 500 });
    }
}