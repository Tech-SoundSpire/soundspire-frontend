import { NextRequest, NextResponse } from 'next/server';
import models from '@/models';
const { Comment, Like, User } = models;

export async function POST(request:NextRequest) {
    try{
        const { user_id, content, post_id, parent_comment_id } = await request.json();

        if (!user_id || !content || !post_id ){
        return NextResponse.json({ error: 'Missing Required Parameters.' }, { status: 400 });
        }

        const comment = await Comment.create({
            user_id,
            content,
            post_id,
            ...(parent_comment_id && { parent_comment_id }),
            created_at: new Date(),
            updated_at: new Date(),
        });

        const detailedComment = await comment.reload({
            include : [
            {
              model: Like,
              as: 'likes',
              required: false,
            },
            {
              model: Comment,
              as: 'replies',
              required: false,
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['user_id', 'username', 'profile_picture_url','full_name'],
                  required: false,
                },
              ],
            },
            {
              model: User,
              as: 'user',
              attributes: ['user_id', 'username', 'profile_picture_url','full_name'],
              required: false,
            },]
        })

        return NextResponse.json(detailedComment);
    } catch (error : unknown){
        console.error('Error adding comment:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Failed to add comment', details: errorMessage }, { status: 500 });
    }
}