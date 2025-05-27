CREATE EXTENSION IF NOT EXISTS "uuid-ossp";--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: artist_payout_methods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.artist_payout_methods (
    payout_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    artist_id uuid NOT NULL,
    method_type character varying(50) NOT NULL,
    account_details jsonb NOT NULL,
    is_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: artist_verification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.artist_verification (
    verification_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    artist_id uuid NOT NULL,
    verification_document_urls text[],
    admin_notes text,
    status character varying(50) DEFAULT 'pending'::character varying,
    verified_by uuid,
    submission_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    verification_date timestamp with time zone
);


--
-- Name: artists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.artists (
    artist_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    artist_name character varying(255) NOT NULL,
    bio text,
    profile_picture_url text,
    cover_photo_url text,
    verification_status character varying(50) DEFAULT 'pending'::character varying,
    third_party_platform character varying(50),
    third_party_id character varying(255),
    featured boolean DEFAULT false,
    payout_method jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comments (
    comment_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    post_id uuid,
    parent_comment_id uuid,
    user_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone,
    CONSTRAINT comments_check CHECK (((post_id IS NOT NULL) OR (parent_comment_id IS NOT NULL)))
);


--
-- Name: communities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.communities (
    community_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    artist_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    subscription_fee numeric(10,2) NOT NULL,
    subscription_interval character varying(20) DEFAULT 'monthly'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: community_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_subscriptions (
    subscription_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    community_id uuid NOT NULL,
    start_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    end_date timestamp with time zone NOT NULL,
    is_active boolean DEFAULT true,
    payment_id uuid,
    auto_renew boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: forum_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.forum_posts (
    forum_post_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    forum_id uuid NOT NULL,
    user_id uuid NOT NULL,
    title character varying(255),
    content text,
    media_type character varying(50),
    media_urls text[],
    is_pinned boolean DEFAULT false,
    is_answered boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: forums; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.forums (
    forum_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    community_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    forum_type character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: genres; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.genres (
    genre_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL
);


--
-- Name: languages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.languages (
    language_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL
);


--
-- Name: likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.likes (
    like_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    post_id uuid,
    comment_id uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT likes_check CHECK ((((post_id IS NOT NULL) AND (comment_id IS NULL)) OR ((post_id IS NULL) AND (comment_id IS NOT NULL))))
);


--
-- Name: live_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.live_events (
    event_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    community_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    event_type character varying(50) NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone,
    status character varying(50) DEFAULT 'scheduled'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.posts (
    post_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    artist_id uuid NOT NULL,
    content_text text,
    media_type character varying(50),
    media_urls text[],
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone
);


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    review_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    content_type character varying(20) NOT NULL,
    content_id character varying(255) NOT NULL,
    artist_id uuid,
    artist_name character varying(255),
    content_name character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    text_content text NOT NULL,
    rating smallint NOT NULL,
    image_urls text[],
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: share_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.share_links (
    link_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    post_id uuid NOT NULL,
    created_by uuid NOT NULL,
    share_token character varying(255) NOT NULL,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: user_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_preferences (
    preference_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    genres uuid[] DEFAULT '{}'::uuid[],
    languages uuid[] DEFAULT '{}'::uuid[],
    favorite_artists uuid[] DEFAULT '{}'::uuid[],
    spotify_id character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: user_verification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_verification (
    verification_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    verification_token character varying(255) NOT NULL,
    verification_type character varying(50) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_used boolean DEFAULT false
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    user_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255),
    full_name character varying(100) NOT NULL,
    gender character varying(20),
    date_of_birth date,
    city character varying(100),
    country character varying(100),
    mobile_number character varying(20),
    profile_picture_url text,
    bio text,
    is_verified boolean DEFAULT false,
    is_artist boolean DEFAULT false,
    google_id character varying(255),
    spotify_linked boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    last_login timestamp with time zone,
    deleted_at timestamp with time zone
);


--
-- Name: artist_payout_methods artist_payout_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artist_payout_methods
    ADD CONSTRAINT artist_payout_methods_pkey PRIMARY KEY (payout_id);


--
-- Name: artist_verification artist_verification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artist_verification
    ADD CONSTRAINT artist_verification_pkey PRIMARY KEY (verification_id);


--
-- Name: artists artists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artists
    ADD CONSTRAINT artists_pkey PRIMARY KEY (artist_id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (comment_id);


--
-- Name: communities communities_artist_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communities
    ADD CONSTRAINT communities_artist_id_name_key UNIQUE (artist_id, name);


--
-- Name: communities communities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communities
    ADD CONSTRAINT communities_pkey PRIMARY KEY (community_id);


--
-- Name: community_subscriptions community_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_subscriptions
    ADD CONSTRAINT community_subscriptions_pkey PRIMARY KEY (subscription_id);


--
-- Name: community_subscriptions community_subscriptions_user_id_community_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_subscriptions
    ADD CONSTRAINT community_subscriptions_user_id_community_id_key UNIQUE (user_id, community_id);


--
-- Name: forum_posts forum_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forum_posts
    ADD CONSTRAINT forum_posts_pkey PRIMARY KEY (forum_post_id);


--
-- Name: forums forums_community_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forums
    ADD CONSTRAINT forums_community_id_name_key UNIQUE (community_id, name);


--
-- Name: forums forums_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forums
    ADD CONSTRAINT forums_pkey PRIMARY KEY (forum_id);


--
-- Name: genres genres_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genres
    ADD CONSTRAINT genres_name_key UNIQUE (name);


--
-- Name: genres genres_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genres
    ADD CONSTRAINT genres_pkey PRIMARY KEY (genre_id);


--
-- Name: languages languages_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.languages
    ADD CONSTRAINT languages_name_key UNIQUE (name);


--
-- Name: languages languages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.languages
    ADD CONSTRAINT languages_pkey PRIMARY KEY (language_id);


--
-- Name: likes likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_pkey PRIMARY KEY (like_id);


--
-- Name: likes likes_user_id_post_id_comment_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_user_id_post_id_comment_id_key UNIQUE (user_id, post_id, comment_id);


--
-- Name: live_events live_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.live_events
    ADD CONSTRAINT live_events_pkey PRIMARY KEY (event_id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (post_id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (review_id);


--
-- Name: share_links share_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.share_links
    ADD CONSTRAINT share_links_pkey PRIMARY KEY (link_id);


--
-- Name: share_links share_links_share_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.share_links
    ADD CONSTRAINT share_links_share_token_key UNIQUE (share_token);


--
-- Name: user_verification unique_active_token; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_verification
    ADD CONSTRAINT unique_active_token UNIQUE (user_id, verification_type, is_used);


--
-- Name: user_preferences user_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_pkey PRIMARY KEY (preference_id);


--
-- Name: user_verification user_verification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_verification
    ADD CONSTRAINT user_verification_pkey PRIMARY KEY (verification_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_google_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key UNIQUE (google_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_artists_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_artists_name ON public.artists USING btree (artist_name);


--
-- Name: idx_comments_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comments_parent_id ON public.comments USING btree (parent_comment_id);


--
-- Name: idx_comments_post_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comments_post_id ON public.comments USING btree (post_id);


--
-- Name: idx_comments_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comments_user_id ON public.comments USING btree (user_id);


--
-- Name: idx_forum_posts_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_forum_posts_created_at ON public.forum_posts USING btree (created_at);


--
-- Name: idx_forum_posts_forum_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_forum_posts_forum_id ON public.forum_posts USING btree (forum_id);


--
-- Name: idx_forum_posts_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_forum_posts_user_id ON public.forum_posts USING btree (user_id);


--
-- Name: idx_likes_comment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_likes_comment_id ON public.likes USING btree (comment_id);


--
-- Name: idx_likes_post_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_likes_post_id ON public.likes USING btree (post_id);


--
-- Name: idx_likes_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_likes_user_id ON public.likes USING btree (user_id);


--
-- Name: idx_live_events_community_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_live_events_community_id ON public.live_events USING btree (community_id);


--
-- Name: idx_live_events_start_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_live_events_start_time ON public.live_events USING btree (start_time);


--
-- Name: idx_live_events_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_live_events_status ON public.live_events USING btree (status);


--
-- Name: idx_posts_artist_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_artist_id ON public.posts USING btree (artist_id);


--
-- Name: idx_posts_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_created_at ON public.posts USING btree (created_at);


--
-- Name: idx_reviews_content; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_content ON public.reviews USING btree (content_type, content_id);


--
-- Name: idx_reviews_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_user_id ON public.reviews USING btree (user_id);


--
-- Name: idx_subscriptions_community_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subscriptions_community_id ON public.community_subscriptions USING btree (community_id);


--
-- Name: idx_subscriptions_end_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subscriptions_end_date ON public.community_subscriptions USING btree (end_date);


--
-- Name: idx_subscriptions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subscriptions_user_id ON public.community_subscriptions USING btree (user_id);


--
-- Name: idx_user_preferences_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_preferences_user_id ON public.user_preferences USING btree (user_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- Name: artist_payout_methods artist_payout_methods_artist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artist_payout_methods
    ADD CONSTRAINT artist_payout_methods_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.artists(artist_id) ON DELETE CASCADE;


--
-- Name: artist_verification artist_verification_artist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artist_verification
    ADD CONSTRAINT artist_verification_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.artists(artist_id) ON DELETE CASCADE;


--
-- Name: artist_verification artist_verification_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artist_verification
    ADD CONSTRAINT artist_verification_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: artists artists_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artists
    ADD CONSTRAINT artists_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: comments comments_parent_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_parent_comment_id_fkey FOREIGN KEY (parent_comment_id) REFERENCES public.comments(comment_id) ON DELETE CASCADE;


--
-- Name: comments comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(post_id) ON DELETE CASCADE;


--
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: communities communities_artist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communities
    ADD CONSTRAINT communities_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.artists(artist_id) ON DELETE CASCADE;


--
-- Name: community_subscriptions community_subscriptions_community_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_subscriptions
    ADD CONSTRAINT community_subscriptions_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(community_id) ON DELETE CASCADE;


--
-- Name: community_subscriptions community_subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_subscriptions
    ADD CONSTRAINT community_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: forum_posts forum_posts_forum_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forum_posts
    ADD CONSTRAINT forum_posts_forum_id_fkey FOREIGN KEY (forum_id) REFERENCES public.forums(forum_id) ON DELETE CASCADE;


--
-- Name: forum_posts forum_posts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forum_posts
    ADD CONSTRAINT forum_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: forums forums_community_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forums
    ADD CONSTRAINT forums_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(community_id) ON DELETE CASCADE;


--
-- Name: likes likes_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comments(comment_id) ON DELETE CASCADE;


--
-- Name: likes likes_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(post_id) ON DELETE CASCADE;


--
-- Name: likes likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: live_events live_events_community_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.live_events
    ADD CONSTRAINT live_events_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(community_id) ON DELETE CASCADE;


--
-- Name: posts posts_artist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.artists(artist_id) ON DELETE CASCADE;


--
-- Name: reviews reviews_artist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.artists(artist_id) ON DELETE SET NULL;


--
-- Name: reviews reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: share_links share_links_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.share_links
    ADD CONSTRAINT share_links_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: share_links share_links_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.share_links
    ADD CONSTRAINT share_links_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(post_id) ON DELETE CASCADE;


--
-- Name: user_preferences user_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: user_verification user_verification_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_verification
    ADD CONSTRAINT user_verification_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (user_id, username, email, password_hash, full_name, gender, date_of_birth, city, country, mobile_number, profile_picture_url, bio, is_verified, is_artist, google_id, spotify_linked, created_at, updated_at, last_login, deleted_at) FROM stdin;
5ef193a5-ff4c-44eb-8b64-b2555a375b41	john_doe	john@example.com	hashed_password_1	John Doe	male	\N	New York	USA	\N	\N	Music enthusiast and guitarist	t	f	\N	f	2025-05-27 21:26:20.639502+05:30	2025-05-27 21:26:20.639502+05:30	\N	\N
98043eee-ad8e-4626-9044-ed5b2562459b	jane_smith	jane@example.com	hashed_password_2	Jane Smith	female	\N	Los Angeles	USA	\N	\N	Piano player and songwriter	t	t	\N	f	2025-05-27 21:26:20.639502+05:30	2025-05-27 21:26:20.639502+05:30	\N	\N
b2b80d94-5727-4b0b-b0e6-67c8344ab873	mike_wilson	mike@example.com	hashed_password_3	Mike Wilson	male	\N	London	UK	\N	\N	Drummer and producer	t	t	\N	f	2025-05-27 21:26:20.639502+05:30	2025-05-27 21:26:20.639502+05:30	\N	\N
7478d88f-07bb-4261-b959-a58ed0c098c7	sarah_jones	sarah@example.com	hashed_password_4	Sarah Jones	female	\N	Toronto	Canada	\N	\N	Music lover and concert goer	t	f	\N	f	2025-05-27 21:26:20.639502+05:30	2025-05-27 21:26:20.639502+05:30	\N	\N
\.


--
-- Data for Name: artists; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.artists (artist_id, user_id, artist_name, bio, profile_picture_url, cover_photo_url, verification_status, third_party_platform, third_party_id, featured, payout_method, created_at, updated_at) FROM stdin;
aee08f82-a190-44d6-ad30-81a8209b3f6a	98043eee-ad8e-4626-9044-ed5b2562459b	Jane Smith Music	Award-winning pianist and composer	\N	\N	verified	\N	\N	t	\N	2025-05-27 21:26:20.639502+05:30	2025-05-27 21:26:20.639502+05:30
9a75f158-acd3-461e-8b21-a68cb586a05e	b2b80d94-5727-4b0b-b0e6-67c8344ab873	Mike Wilson Beats	Professional drummer and music producer	\N	\N	verified	\N	\N	t	\N	2025-05-27 21:26:20.639502+05:30	2025-05-27 21:26:20.639502+05:30
\.


--
-- Data for Name: artist_payout_methods; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.artist_payout_methods (payout_id, artist_id, method_type, account_details, is_default, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: artist_verification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.artist_verification (verification_id, artist_id, verification_document_urls, admin_notes, status, verified_by, submission_date, verification_date) FROM stdin;
\.


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.posts (post_id, artist_id, content_text, media_type, media_urls, created_at, updated_at, deleted_at) FROM stdin;
4a84d920-3f60-4b62-9dca-4830c7a8a864	aee08f82-a190-44d6-ad30-81a8209b3f6a	Just finished recording my new piano piece!	text	\N	2025-05-27 21:26:20.639502+05:30	2025-05-27 21:26:20.639502+05:30	\N
31c936bb-739d-401d-8865-1a5237952da0	9a75f158-acd3-461e-8b21-a68cb586a05e	New beat drop coming soon...	text	\N	2025-05-27 21:26:20.639502+05:30	2025-05-27 21:26:20.639502+05:30	\N
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.comments (comment_id, post_id, parent_comment_id, user_id, content, created_at, updated_at, deleted_at) FROM stdin;
cf8211cb-0aea-4c64-8022-85dc26325d74	4a84d920-3f60-4b62-9dca-4830c7a8a864	\N	5ef193a5-ff4c-44eb-8b64-b2555a375b41	This is amazing!	2025-05-27 21:26:20.639502+05:30	2025-05-27 21:26:20.639502+05:30	\N
203067c6-9404-4fac-97c1-e9bd171ae138	4a84d920-3f60-4b62-9dca-4830c7a8a864	\N	7478d88f-07bb-4261-b959-a58ed0c098c7	This is amazing!	2025-05-27 21:26:20.639502+05:30	2025-05-27 21:26:20.639502+05:30	\N
\.


--
-- Data for Name: communities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.communities (community_id, artist_id, name, description, subscription_fee, subscription_interval, created_at, updated_at) FROM stdin;
837f1fe5-c8d1-497b-ab49-85f59b33bf26	aee08f82-a190-44d6-ad30-81a8209b3f6a	Jane's Piano Community	Join Jane's community for piano lessons and exclusive content	9.99	monthly	2025-05-27 21:26:20.639502+05:30	2025-05-27 21:26:20.639502+05:30
8918c5f6-ea5a-4bc7-9a41-f0275d2a31d9	9a75f158-acd3-461e-8b21-a68cb586a05e	Mike's Production Hub	Learn production techniques and get exclusive beats	9.99	monthly	2025-05-27 21:26:20.639502+05:30	2025-05-27 21:26:20.639502+05:30
\.


--
-- Data for Name: community_subscriptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.community_subscriptions (subscription_id, user_id, community_id, start_date, end_date, is_active, payment_id, auto_renew, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: forums; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.forums (forum_id, community_id, name, description, forum_type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: forum_posts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.forum_posts (forum_post_id, forum_id, user_id, title, content, media_type, media_urls, is_pinned, is_answered, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: genres; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.genres (genre_id, name) FROM stdin;
e39be6bb-e488-496c-b350-7ca9232c488d	Rock
e981099e-e385-4697-92d8-e6064c1b71cf	Pop
c540bb4c-7068-4b12-8e1e-b5c75680eb83	Jazz
c411be34-bc44-4e99-abe1-7ddc4f48a5ae	Hip Hop
492c754b-c622-4e88-89c3-d52d17efe399	Electronic
\.


--
-- Data for Name: languages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.languages (language_id, name) FROM stdin;
ad7266bc-fc6c-483a-9e86-5e1bbea594ec	English
8d45f74f-4672-4d5a-a31e-e9b41c53e990	Spanish
f2a1ebaf-98ac-49db-83c8-74b0368b651a	French
33ada84f-737e-4603-9312-d7921f882f69	Japanese
bf4981f7-fc88-4a99-a998-3b45f86ece1b	Korean
\.


--
-- Data for Name: likes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.likes (like_id, user_id, post_id, comment_id, created_at) FROM stdin;
38e489e8-741c-452a-9bb3-57444969a93c	5ef193a5-ff4c-44eb-8b64-b2555a375b41	4a84d920-3f60-4b62-9dca-4830c7a8a864	\N	2025-05-27 21:26:20.639502+05:30
afbb7cb1-ff15-4822-86f9-8e6cc68d45ae	7478d88f-07bb-4261-b959-a58ed0c098c7	4a84d920-3f60-4b62-9dca-4830c7a8a864	\N	2025-05-27 21:26:20.639502+05:30
\.


--
-- Data for Name: live_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.live_events (event_id, community_id, title, description, event_type, start_time, end_time, status, created_at, updated_at) FROM stdin;
a4484f32-febf-4904-a728-98223976cf07	837f1fe5-c8d1-497b-ab49-85f59b33bf26	Live Piano Masterclass	Learn advanced piano techniques	workshop	2025-05-28 21:26:20.639502+05:30	2025-05-29 21:26:20.639502+05:30	scheduled	2025-05-27 21:26:20.639502+05:30	2025-05-27 21:26:20.639502+05:30
c4503f03-397e-4a36-8dc1-cfba14dec0fa	8918c5f6-ea5a-4bc7-9a41-f0275d2a31d9	Beat Making Workshop	Learn how to make professional beats	workshop	2025-05-28 21:26:20.639502+05:30	2025-05-29 21:26:20.639502+05:30	scheduled	2025-05-27 21:26:20.639502+05:30	2025-05-27 21:26:20.639502+05:30
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reviews (review_id, user_id, content_type, content_id, artist_id, artist_name, content_name, title, text_content, rating, image_urls, created_at, updated_at) FROM stdin;
3cc63844-e794-419e-86c7-0de14340220b	5ef193a5-ff4c-44eb-8b64-b2555a375b41	album	album123	aee08f82-a190-44d6-ad30-81a8209b3f6a	\N	Piano Dreams	Beautiful Piano Compositions	This is an amazing piece of work!	5	\N	2025-05-27 21:26:20.639502+05:30	2025-05-27 21:26:20.639502+05:30
23e33055-e22c-41b1-9e59-33f5569cc42c	7478d88f-07bb-4261-b959-a58ed0c098c7	album	album123	aee08f82-a190-44d6-ad30-81a8209b3f6a	\N	Piano Dreams	Beautiful Piano Compositions	This is an amazing piece of work!	5	\N	2025-05-27 21:26:20.639502+05:30	2025-05-27 21:26:20.639502+05:30
\.


--
-- Data for Name: share_links; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.share_links (link_id, post_id, created_by, share_token, expires_at, created_at) FROM stdin;
\.


--
-- Data for Name: user_preferences; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_preferences (preference_id, user_id, genres, languages, favorite_artists, spotify_id, created_at, updated_at) FROM stdin;
44d47d96-87fd-4d75-8eec-6a06c7d4377f	5ef193a5-ff4c-44eb-8b64-b2555a375b41	{e39be6bb-e488-496c-b350-7ca9232c488d}	{ad7266bc-fc6c-483a-9e86-5e1bbea594ec}	{}	\N	2025-05-27 21:26:20.639502+05:30	2025-05-27 21:26:20.639502+05:30
eb5f01a6-ac97-4b32-acd1-7165269bc2c6	7478d88f-07bb-4261-b959-a58ed0c098c7	{e39be6bb-e488-496c-b350-7ca9232c488d}	{ad7266bc-fc6c-483a-9e86-5e1bbea594ec}	{}	\N	2025-05-27 21:26:20.639502+05:30	2025-05-27 21:26:20.639502+05:30
\.


--
-- Data for Name: user_verification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_verification (verification_id, user_id, verification_token, verification_type, expires_at, created_at, is_used) FROM stdin;
\.


--
-- PostgreSQL database dump complete
--



