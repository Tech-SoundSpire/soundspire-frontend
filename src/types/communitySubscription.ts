export type communitySubscriptionData = {
    user_id: string;
    community_id: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    payment_id: string | null;
    auto_renew: boolean;
    created_at: string;
    updated_at: string;
};
