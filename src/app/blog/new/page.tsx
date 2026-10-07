import type { Metadata } from "next";
import BlogEditor from "../BlogEditor";

export const metadata: Metadata = { title: "New blog post", robots: { index: false } };

export default function NewBlogPostPage() {
    return <BlogEditor />;
}
