import models from '@/models';
import { NextResponse } from 'next/server';

const { Post, Comment, Like, Artist, User } = models;

export async function GET() {
  try {
    const posts = await Post.findAll({
      where: { deleted_at: null },
      include: [
        {
          model: Artist,
          as: 'artist',
        },
        {
          model: Comment,
          as: 'comments',
          required: false,
          where: { deleted_at: null },
          include: [
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
            },
          ],
        },
        {
          model: Like,
          as: 'likes',
          required: false,
        },
      ],
      order: [['created_at', 'DESC']],
    });

    const rawPosts = posts.map((post) => post.toJSON());

    return NextResponse.json(rawPosts);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch posts', details: error },
      { status: 500 }
    );
  }
}
