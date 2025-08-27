import { NextRequest, NextResponse } from 'next/server';
import Review from '@/models/Review';
import { User } from '@/models/User';
import Artist from '@/models/Artist';
import '@/models/index';

export async function GET() {
  try {
    console.log('🧪 Testing Review associations...');
    
    // Test 1: Check if models are loaded
    console.log('📋 Models loaded:', {
      Review: !!Review,
      User: !!User,
      Artist: !!Artist
    });

    // Test 2: Try to find a single review without associations
    const singleReview = await Review.findOne({
      raw: true
    });
    console.log('📊 Single review (raw):', singleReview);

    // Test 3: Try to find reviews with associations
    const reviewsWithAssociations = await Review.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'username', 'full_name'],
        },
        {
          model: Artist,
          as: 'artist',
          attributes: ['artist_id', 'artist_name'],
        },
      ],
      limit: 1,
    });

    console.log('🔍 Reviews with associations:', reviewsWithAssociations.length);
    if (reviewsWithAssociations.length > 0) {
      const review = reviewsWithAssociations[0];
      console.log('📝 Review data:', {
        review_id: review.review_id,
        title: review.title,
        hasUser: !!review.user,
        hasArtist: !!review.artist,
        userData: review.user,
        artistData: review.artist
      });
    }

    // Test 4: Check if associations are defined
    console.log('🔗 Association check:', {
      ReviewAssociations: Object.keys(Review.associations || {}),
      UserAssociations: Object.keys(User.associations || {}),
      ArtistAssociations: Object.keys(Artist.associations || {})
    });

    return NextResponse.json({
      message: 'Association test completed',
      singleReview,
      reviewsWithAssociations: reviewsWithAssociations.length,
      associations: {
        Review: Object.keys(Review.associations || {}),
        User: Object.keys(User.associations || {}),
        Artist: Object.keys(Artist.associations || {})
      }
    });

  } catch (error) {
    console.error('❌ Association test failed:', error);
    return NextResponse.json(
      { error: 'Association test failed', details: error.message },
      { status: 500 }
    );
  }
}
