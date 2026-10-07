// Who may write the blog (same staff rule as reviews). Safe to import in client components;
// the API routes enforce it again on every write.
export const BLOG_EDITOR_DOMAIN = "@soundspire.online";
export const isBlogEditorEmail = (email?: string | null) => !!email && email.toLowerCase().endsWith(BLOG_EDITOR_DOMAIN);
