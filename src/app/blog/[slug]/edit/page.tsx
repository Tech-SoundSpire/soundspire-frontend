import type { Metadata } from "next";
import BlogEditor from "../../BlogEditor";

export const metadata: Metadata = { title: "Edit blog post", robots: { index: false } };

export default async function EditBlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    return <BlogEditor slug={(await params).slug} />;
}
