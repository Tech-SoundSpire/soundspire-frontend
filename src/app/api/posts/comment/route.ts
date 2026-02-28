import { NextRequest, NextResponse } from 'next/server';
import models from '@/models';
import { notifyUser } from '@/utils/notifications';
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

       // Notify on comment/reply
       try {
           const commenter = await User.findByPk(user_id, { attributes: ["username"] });
           const name = commenter?.username || "Someone";
           if (parent_comment_id) {
               // Reply — notify parent comment owner
               const parent = await Comment.findByPk(parent_comment_id);
               if (parent && parent.user_id !== user_id) {
                   // Check if parent comment owner is the artist
                   const { default: Post } = await import("@/models/Post");
                   const { default: Artist } = await import("@/models/Artist");
                   const post = await Post.findByPk(post_id);
                   const pd = post?.get({ plain: true }) as any;
                   let link = `/feed?highlight=${post_id}`;
                   if (pd?.artist_id) {
                       const art = await Artist.findByPk(pd.artist_id);
                       if (art?.user_id === parent.user_id && art?.slug) {
                           link = `/community/${art.slug}/forum?highlight=${post_id}`;
                       }
                   }
                   await notifyUser(parent.user_id, `${name} replied to your comment`, link, "comment_reply");
               }
           } else {
               // Top-level comment — notify the post's artist → route to forum
               const { default: Post } = await import("@/models/Post");
               const { default: Artist } = await import("@/models/Artist");
               const post = await Post.findByPk(post_id);
               const postData = post?.get({ plain: true }) as any;
               if (postData?.artist_id) {
                   const artist = await Artist.findByPk(postData.artist_id);
                   if (artist?.user_id && artist.user_id !== user_id) {
                       await notifyUser(artist.user_id, `${name} commented on your post`, `/community/${artist.slug}/forum?highlight=${post_id}`, "comment_reply");
                   }
               }
           }
       } catch (err) { console.error("Notification error:", err); }

       return NextResponse.json(detailedComment.get({ plain: true }));
    } catch (error : unknown){
        console.error('Error adding comment:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Failed to add comment', details: errorMessage }, { status: 500 });
    }
}