import { NextResponse } from 'next/server';
import { User, CommunitySubscription, Community, Artist } from '@/models';
import { Model, InferAttributes, InferCreationAttributes } from 'sequelize';

// Define interfaces for Sequelize models with associations
interface CommunitySubscriptionInstance extends Model<InferAttributes<CommunitySubscription>, InferCreationAttributes<CommunitySubscription>> {
  Community: {
    name: string;
    Artist: {
      artist_name: string;
      profile_picture_url?: string;
    };
  };
}

interface UserInstance extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  CommunitySubscriptions?: CommunitySubscriptionInstance[];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await User.findOne({
      where: { email },
      attributes: [
        'full_name',
        'username',
        'gender',
        'email',
        'mobile_number',
        'date_of_birth',
        'city',
        'country',
        'profile_picture_url',
        'spotify_linked',
      ],
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch subscriptions
    const userWithSubscriptions = await User.findOne({
      where: { email },
      attributes: ['username', 'email'],
      include: [
        {
          model: CommunitySubscription,
          include: [
            {
              model: Community,
              include: [{ model: Artist, attributes: ['artist_name', 'profile_picture_url'] }],
            },
          ],
        },
      ],
    }) as UserInstance | null;

    const subscriptions = userWithSubscriptions?.CommunitySubscriptions?.map((sub) => ({
      name: sub.Community.name,
      image: sub.Community.Artist.profile_picture_url || '/default-community.jpg',
    })) || [];

    return NextResponse.json({
      ...user.get({ plain: true }),
      subscriptions,
    });
  } catch (error: unknown) {
    console.error('Profile fetch error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const {
      email,
      full_name,
      username,
      gender,
      mobile_number,
      date_of_birth,
      city,
      country,
      profile_picture_url,
      spotify_linked,
    } = await request.json();

    if (!email || !full_name || !username) {
      return NextResponse.json({ error: 'Email, full_name, and username are required' }, { status: 400 });
    }

    const updated = await User.update(
      {
        full_name,
        username,
        gender,
        mobile_number,
        date_of_birth,
        city,
        country,
        profile_picture_url,
        spotify_linked,
      },
      { where: { email } }
    );

    if (updated[0] === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error: unknown) {
    console.error('Profile update error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}