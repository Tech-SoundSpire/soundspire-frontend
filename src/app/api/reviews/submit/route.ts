import { NextRequest, NextResponse } from 'next/server';
import { getDataFromToken } from '@/utils/getDataFromToken';
import Review from '@/models/Review';
import { User } from '@/models/User';
import '@/models/index';

export async function POST(request: NextRequest) {
  try {
    // Get user ID from token
    const userId = await getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database to verify
    const user = await User.findOne({ where: { user_id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has @soundspire.online email domain
    if (!user.email || !user.email.endsWith('@soundspire.online')) {
      return NextResponse.json(
        { error: 'Only users with @soundspire.online email domain can submit reviews' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      content,
      date,
      type,
      artist,
      author,
      imageUrl
    } = body;

    // Validate required fields
    if (!title || !content || !type || !artist) {
      return NextResponse.json(
        { error: 'Title, content, type, and artist are required' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['album', 'single'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either "album" or "single"' },
        { status: 400 }
      );
    }

    // Create review
    const review = await Review.create({
      user_id: userId,
      content_type: 'review',
      content_id: `review_${Date.now()}`,
      content_name: title,
      title: title,
      text_content: content,
      rating: 5, // Default rating, can be made configurable later
      artist_name: artist,
      author: author || user.full_name || user.username,
      review_date: date ? new Date(date) : new Date(),
      review_type: type,
      image_urls: imageUrl ? [imageUrl] : null,
    });

    return NextResponse.json({
      success: true,
      review: {
        review_id: review.review_id,
        title: review.title,
        content: review.text_content,
        author: review.author,
        artist: review.artist_name,
        type: review.review_type,
        date: review.review_date,
        image_url: review.image_urls?.[0] || null,
        created_at: review.created_at
      }
    });

  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}