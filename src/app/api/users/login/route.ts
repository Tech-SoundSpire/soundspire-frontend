import { connectionTestingAndHelper } from "@/utils/temp";
import { User } from "@/models/User";
// import UserPreferences from "@/models/UserPreferences";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import Artist from "@/models/Artist";

export async function POST(request: NextRequest) {
  try {
    await connectionTestingAndHelper();
    const reqBody = await request.json(); //getting all the parameter in the body we don't need middleware here

    //things we need
    const { email, password_hash } = reqBody; //taking what is needed

    //validation
    console.log(reqBody);

    //Getting the user
    const user = await User.findOne({
      where: {
        email,
      },
    });

    //Checking if the user exists
    if (!user) {
      return NextResponse.json(
        { message: "User does not exists" },
        { status: 401 },
      );
    }
    console.log("User Exists");

    if (!user.password_hash) {
      return NextResponse.json(
        {
          message: "Please reset your Password!!",
        },
        { status: 400 },
      );
    }

    //Checking the password
    const validPassword = await bcryptjs.compare(
      password_hash,
      user.password_hash!,
    );

    if (!validPassword) {
      console.log("Incorrect password!");
      return NextResponse.json(
        { message: "Check your password or password is wrong!" },
        { status: 401 },
      );
    }
    console.log("password validated");

    await user.update({
      last_login: new Date(),
    });

    // Check if user has preferences
    // const preferences = await UserPreferences.findOne({
    //   where: { user_id: user.user_id },
    // });

    // let redirectPath = user.is_artist ? "/artist/dashboard" : "/feed"; // Default to feed for normal user and artist dashboard for the artists
    // if (
    //   !preferences ||
    //   (preferences.genres.length === 0 &&
    //     preferences.languages.length === 0 &&
    //     preferences.favorite_artists.length === 0)
    // ) {
    //   redirectPath = "/PreferenceSelectionPage";
    // }

    // const token = jwt.sign(
    //   { id: user.user_id, email: user.email, role: user.is_artist ? "artist" : "user" },
    //   process.env.JWT_SECRET!,
    //   { expiresIn: "7d" },
    // );

    const token = jwt.sign(
      {
        id: user.user_id,
        email: user.email,
        role: user.is_artist ? "artist" : "user"
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );
    const redirectPath = user.is_artist ? "/artist/dashboard" : "/feed";

    let artistId: string | null = null;
    if (user.is_artist) {
      const artist = await Artist.findOne({ where: { user_id: user.user_id } });
      if (artist) {
        artistId = artist.artist_id;
      }
    }

    //creating response
    const response = NextResponse.json({
      message: "Logged In Success",
      user: {
        id: user.user_id,
        name: user.full_name,
        email: user.email,
        role: user.is_artist ? "artist" : "user",
        ...(artistId ? { artist_id: artistId } : {}),
      },
      redirect: redirectPath,
    });

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    if (artistId) {
      response.cookies.set({
        name: "artist_id",
        value: artistId,
        httpOnly: true,
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
        sameSite: "lax",
      });
    }

    return response; //seding response and user is loggedin
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}
