import { NextRequest, NextResponse } from "next/server";
import BlogPost from "@/models/BlogPost";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import { getBlogPost, requireBlogEditor, sanitizePostInput } from "@/lib/blog";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };

// GET /api/blog/[slug] - one post (public).
export async function GET(_request: NextRequest, { params }: Ctx) {
    try {
        const post = await getBlogPost((await params).slug);
        if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
        return NextResponse.json({ post });
    } catch (error) {
        console.error("Error loading blog post:", error);
        return NextResponse.json({ error: "Failed to load post" }, { status: 500 });
    }
}

// PUT /api/blog/[slug] - edit a post (@soundspire.online accounts only). The slug never
// changes, so shared links keep working after edits.
export async function PUT(request: NextRequest, { params }: Ctx) {
    try {
        await connectionTestingAndHelper();
        const editor = await requireBlogEditor(request);
        if ("error" in editor) return NextResponse.json({ error: editor.error }, { status: editor.status });

        const input = sanitizePostInput(await request.json());
        if ("error" in input) return NextResponse.json({ error: input.error }, { status: 400 });

        const { slug } = await params;
        const [updated] = await BlogPost.update(input, { where: { slug } });
        if (updated === 0) return NextResponse.json({ error: "Post not found" }, { status: 404 });
        return NextResponse.json({ success: true, slug });
    } catch (error) {
        console.error("Error updating blog post:", error);
        return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
    }
}
