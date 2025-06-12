export interface User{
    username : string;
    full_name : string;
    profile_picture_url : string | null;
}

export interface Like{
    user_id : string;
}

export interface CommentProps{
    comment_id: string;
    parent_comment_id : string;
    content : string;
    user : User;
    likes : Array<Like>;
    replies?: Array<CommentProps>;
}

export interface Artist{
    artist_name : string;
    profile_picture_url : string | null;
}

export interface PostProps {
    post_id : string;
    artist : Artist;
    content_text : string;
    media_type : string;
    media_urls : Array<string>;
    comments : Array<CommentProps>;
}