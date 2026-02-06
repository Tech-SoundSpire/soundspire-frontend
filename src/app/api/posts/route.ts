import models from "@/models";
import { NextResponse } from "next/server";
import { Op } from "sequelize";

const { Post, Comment, Like, Artist, User, CommunitySubscription } = models;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const userId = searchParams.get("user_id");

    // 🔒 Base condition
    const postWhere: any = {
      deleted_at: null,
    };

    // 🔍 Search on post content / title
    if (search && search.trim().length > 0) {
      postWhere[Op.or] = [
        { content_text: { [Op.iLike]: `%${search}%` } },
        { "$artist.artist_name$": { [Op.iLike]: `%${search}%` } },
      ];
    }

    const posts = await Post.findAll({
      where: postWhere,
      include: [
        {
          model: Artist,
          as: "artist",
          required: false,
        },
        {
          model: Comment,
          as: "comments",
          required: false,
          where: { deleted_at: null },
          include: [
            {
              model: Like,
              as: "likes",
              required: false,
            },
            {
              model: Comment,
              as: "replies",
              required: false,
              include: [
                {
                  model: User,
                  as: "user",
                  attributes: [
                    "user_id",
                    "username",
                    "profile_picture_url",
                    "full_name",
                  ],
                  required: false,
                },
              ],
            },
            {
              model: User,
              as: "user",
              attributes: [
                "user_id",
                "username",
                "profile_picture_url",
                "full_name",
              ],
              required: false,
            },
          ],
        },
        {
          model: Like,
          as: "likes",
          required: false,
        },
      ],
      order: [["created_at", "DESC"]],
    });

    const rawPosts = posts.map((post) => post.toJSON());
    return NextResponse.json(rawPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}
