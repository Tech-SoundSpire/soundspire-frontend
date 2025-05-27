import { NextResponse } from 'next/server';
     import { User, CommunitySubscription, Community, Artist } from '@/models';

     export async function GET() {
       try {
         console.log('User model:', User);
         console.log('CommunitySubscription model:', CommunitySubscription);
         console.log('Community model:', Community);
         console.log('Artist model:', Artist);

         const users = await User.findAll({
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
         });
         return NextResponse.json(users);
       } catch (error: unknown) {
         console.error('Test route error:', error);
         const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
         return NextResponse.json({ error: errorMessage }, { status: 500 });
       }
     }