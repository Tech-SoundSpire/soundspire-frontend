import { NextRequest, NextResponse } from 'next/server';
import models from '@/models';
import { notifyUser } from '@/utils/notifications';
import Comment from '@/models/Comment';
import Post from '@/models/Post';
import { User } from '@/models/User';
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

        // Send notification to the owner
        try {
            const liker = await User.findByPk(user_id, { attributes: ["username"] });
            const likerName = liker?.username || "Someone";
            if (comment_id) {
                const comment = await Comment.findByPk(comment_id);
                if (comment && comment.user_id !== user_id) {
                    // Check if comment owner is the artist of the post
                    const { default: Artist } = await import("@/models/Artist");
                    const postObj = comment.post_id ? await Post.findByPk(comment.post_id) : null;
                    const pd = postObj?.get({ plain: true }) as any;
                    let link = `/feed?highlight=${comment.post_id || comment_id}`;
                    if (pd?.artist_id) {
                        const art = await Artist.findByPk(pd.artist_id);
                        if (art?.user_id === comment.user_id && art?.slug) {
                            link = `/community/${art.slug}/forum?highlight=${comment.post_id || comment_id}`;
                        }
                    }
                    await notifyUser(comment.user_id, `${likerName} liked your comment`, link, "comment_like");
                }
            } else if (post_id) {
                const post = await Post.findByPk(post_id);
                const postData = post?.get({ plain: true }) as any;
                if (postData?.artist_id) {
                    const { default: Artist } = await import("@/models/Artist");
                    const artist = await Artist.findByPk(postData.artist_id);
                    if (artist?.user_id && artist.user_id !== user_id) {
                        await notifyUser(artist.user_id, `${likerName} liked your post`, `/community/${artist.slug}/forum?highlight=${post_id}`, "comment_like");
                    }
                }
            }
        } catch (err) { console.error("Notification error:", err); }

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