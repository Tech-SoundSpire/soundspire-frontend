import { NextRequest, NextResponse } from "next/server";
import BlogPost from "@/models/BlogPost";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import { listBlogPosts, requireBlogEditor, sanitizePostInput, uniqueSlug } from "@/lib/blog";

export const dynamic = "force-dynamic";

// GET /api/blog - public list of posts, newest first.
export async function GET() {
    try {
        return NextResponse.json({ posts: await listBlogPosts() });
    } catch (error) {
        console.error("Error listing blog posts:", error);
        return NextResponse.json({ error: "Failed to load posts" }, { status: 500 });
    }
}

// POST /api/blog - create a post (@soundspire.online accounts only).
export async function POST(request: NextRequest) {
    try {
        await connectionTestingAndHelper();
        const editor = await requireBlogEditor(request);
        if ("error" in editor) return NextResponse.json({ error: editor.error }, { status: editor.status });

        const input = sanitizePostInput(await request.json());
        if ("error" in input) return NextResponse.json({ error: input.error }, { status: 400 });

        const post = await BlogPost.create({ ...input, slug: await uniqueSlug(input.title), author_user_id: editor.userId });
        return NextResponse.json({ success: true, slug: post.slug }, { status: 201 });
    } catch (error) {
        console.error("Error creating blog post:", error);
        return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }
}
