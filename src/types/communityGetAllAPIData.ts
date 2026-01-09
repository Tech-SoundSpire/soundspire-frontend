type Nullish = undefined | null;
export type communityDataFromAPI = {
    id: string;
    name: string | Nullish;
    description: string | Nullish;
    artist_name: string | Nullish;
    artist_profile_picture_url: string | Nullish;
    artist_cover_photo_url: string | Nullish;
    artist_slug: string | Nullish;
};
