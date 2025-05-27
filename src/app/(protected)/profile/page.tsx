'use client';

import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { countriesWithCities } from '@/lib/locationData';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Subscription {
  name: string;
  image: string | null;
}

interface ProfileData {
  fullName: string;
  userName: string;
  gender: string;
  email: string;
  phoneNumber: string;
  dob: string;
  city: string;
  country: string;
  profileImage: string | null;
  spotifyLinked: boolean;
  subscriptions: Subscription[];
}

interface CommunitySubscription {
  Community: {
    name: string;
    Artist?: {
      profile_picture_url: string | null;
    };
  };
}

interface UserData {
  email: string;
  CommunitySubscriptions?: CommunitySubscription[];
}

const DEFAULT_PROFILE_IMAGE = '/public/images/placeholder.jpg';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isValidatingUsername, setIsValidatingUsername] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    fullName: '',
    userName: '',
    gender: 'primary',
    email: '',
    phoneNumber: '',
    dob: '2000-01-01',
    city: 'New York',
    country: 'United States',
    profileImage: null,
    spotifyLinked: false,
    subscriptions: [],
  });

  const [editableProfile, setEditableProfile] = useState<ProfileData>({ ...profile });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    const fetchProfile = async () => {
      try {
        const profileRes = await fetch(`/api/profile?email=${encodeURIComponent(user.email)}`);
        const profileData = await profileRes.json();
        if (profileData.error) {
          throw new Error(profileData.error);
        }

        const testRes = await fetch('/api/test');
        const testData: UserData[] = await testRes.json();
        const userData = testData.find((u) => u.email === user.email);
        const subscriptions = userData?.CommunitySubscriptions?.map((sub) => ({
          name: sub.Community.name || 'Unknown Community',
          image: sub.Community.Artist?.profile_picture_url || '/default-community.jpg',
        })) || [];

        setProfile({
          fullName: profileData.full_name || user.name || user.displayName || user.email.split('@')[0] || 'User',
          userName: profileData.username || user.email.split('@')[0].toLowerCase() || '',
          gender: profileData.gender || 'primary',
          email: profileData.email || user.email,
          phoneNumber: profileData.phone_number || '',
          dob: profileData.date_of_birth ? new Date(profileData.date_of_birth).toISOString().split('T')[0] : '2000-01-01',
          city: profileData.city || 'New York',
          country: profileData.country || 'United States',
          profileImage: profileData.profile_picture_url || user.photoURL || user.image || null,
          spotifyLinked: profileData.spotify_linked || false,
          subscriptions,
        });
      } catch (error: unknown) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, router]);

  useEffect(() => {
    setEditableProfile({ ...profile });
  }, [profile]);

  const countries = countriesWithCities.map(country => country.name);
  const editableCities = (() => {
    const countryData = countriesWithCities.find(c => c.name === editableProfile.country);
    return countryData ? countryData.cities : [];
  })();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error: unknown) {
      console.error('Failed to logout:', error);
      toast.error('Failed to logout');
    }
  };

  const toggleEdit = () => {
    if (!isEditing) {
      setEditableProfile({ ...profile });
      setUsernameError(null);
    }
    setIsEditing(!isEditing);
  };

  const checkUsernameUniqueness = async (username: string): Promise<boolean> => {
    setIsValidatingUsername(true);
    try {
      const res = await fetch(`/api/check-username?username=${encodeURIComponent(username)}`);
      const data = await res.json();
      return data.isUnique;
    } catch (error: unknown) {
      console.error('Error checking username:', error);
      toast.error('Error checking username');
      return false;
    } finally {
      setIsValidatingUsername(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setUsernameError(null);

    try {
      if (editableProfile.userName.trim() === '') {
        setUsernameError('Username cannot be empty');
        return;
      }

      if (!/^[a-zA-Z0-9_-]+$/.test(editableProfile.userName)) {
        setUsernameError('Username can only contain letters, numbers, underscores, or hyphens');
        return;
      }

      if (editableProfile.userName.toLowerCase() !== profile.userName?.toLowerCase()) {
        const isUnique = await checkUsernameUniqueness(editableProfile.userName);
        if (!isUnique) {
          setUsernameError('This username is already taken');
          return;
        }
      }

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: profile.email,
          full_name: editableProfile.fullName,
          username: editableProfile.userName,
          gender: editableProfile.gender,
          phone_number: editableProfile.phoneNumber,
          date_of_birth: editableProfile.dob,
          city: editableProfile.city,
          country: editableProfile.country,
          profile_image: editableProfile.profileImage,
          spotify_linked: editableProfile.spotifyLinked,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save profile');
      }

      setProfile(editableProfile);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: unknown) {
      console.error('Failed to save profile:', error);
      const message = error instanceof Error ? error.message : 'Error saving profile';
      setUsernameError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditableProfile({ ...profile });
    setUsernameError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUsernameError(null);
    setEditableProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditableProfile((prev) => ({
          ...prev,
          profileImage: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const syncSpotify = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: profile.email,
          spotify_linked: true,
        }),
      });
      if (!res.ok) throw new Error('Failed to connect Spotify');
      setProfile((prev) => ({ ...prev, spotifyLinked: true }));
      toast.success('Spotify connected successfully');
    } catch (error: unknown) {
      console.error('Failed to connect Spotify:', error);
      const message = error instanceof Error ? error.message : 'Failed to connect Spotify';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#1a1625] flex items-center justify-center">
        <p className="text-white text-xl">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1625]">
      <Navbar />
      <main className="ml-16 px-8 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-white">Profile</h1>
            <div className="flex space-x-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancelEdit}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors duration-200"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-[#ff5733] hover:bg-[#e64a2e] text-white rounded-md transition-colors duration-200 flex items-center"
                    disabled={isLoading || isValidatingUsername}
                  >
                    {isLoading ? 'Saving...' : isValidatingUsername ? 'Validating...' : 'Save Edits'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleLogout}
                    className="px-6 py-2 rounded-md bg-gray-600 text-white transition-colors duration-200 hover:bg-gray-700"
                  >
                    Logout
                  </button>
                  <button
                    onClick={toggleEdit}
                    className="px-6 py-2 bg-[#ff5733] hover:bg-[#e64a2e] text-white rounded-md transition-colors duration-200 flex items-center"
                  >
                    Edit Profile
                    <svg
                      className="ml-2 w-5 h-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="mb-12">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="w-full md:w-auto flex flex-col items-center">
                <div
                  className={`w-28 h-28 rounded-full overflow-hidden mb-4 ${isEditing ? 'cursor-pointer relative' : ''}`}
                  onClick={handleImageClick}
                >
                  {profile.profileImage ? (
                    <Image
                      src={isEditing ? editableProfile.profileImage || profile.profileImage : profile.profileImage}
                      alt="Profile picture"
                      width={112}
                      height={112}
                      className="object-cover"
                    />
                  ) : (
                    <Image
                      src={user.photoURL || user.image || DEFAULT_PROFILE_IMAGE}
                      alt="Profile picture"
                      width={112}
                      height={112}
                      className="object-cover"
                    />
                  )}
                  {isEditing && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity duration-200">
                      <span>Change</span>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
                <div className="text-center w-full">
                  <h2 className="text-xl font-bold text-white mb-2">{profile.fullName}</h2>
                </div>
                <div className="text-center w-full">
                  {isEditing ? (
                    <div className="w-full">
                      <div className="relative">
                        <span className="absolute text-gray-400 left-3 top-3">@</span>
                        <input
                          type="text"
                          name="userName"
                          value={editableProfile.userName}
                          onChange={handleChange}
                          className="w-full px-8 py-2 rounded-md bg-[#2a2435] text-white border border-gray-700 text-center"
                          placeholder="username"
                        />
                      </div>
                      {usernameError && <p className="text-red-500 text-sm mt-1">{usernameError}</p>}
                    </div>
                  ) : (
                    <p className="text-gray-400">@{profile.userName}</p>
                  )}
                </div>
              </div>

              <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-gray-400 mb-2">Gender</label>
                  {isEditing ? (
                    <select
                      name="gender"
                      value={editableProfile.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-md bg-[#2a2435] text-white border border-gray-700"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="primary">primary</option>
                    </select>
                  ) : (
                    <div className="w-full px-4 py-3 rounded-md bg-[#1a1625] text-white border border-gray-800">
                      {profile.gender || 'primary'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-400 mb-2">Email Address</label>
                  <div className="w-full px-4 py-3 rounded-md bg-[#1a1625] text-white border border-gray-800">
                    {profile.email || 'Not provided'}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 mb-2">Phone Number</label>
                  <div className="w-full px-4 py-3 rounded-md bg-[#1a1625] text-white border border-gray-800">
                    {profile.phoneNumber || 'Not provided'}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 mb-2">DOB</label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="dob"
                      value={editableProfile.dob}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-md bg-[#2a2435] text-white border border-gray-700"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 rounded-md bg-[#1a1625] text-white border border-gray-800">
                      {profile.dob
                        ? new Date(profile.dob).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })
                        : 'Not provided'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-400 mb-2">City</label>
                  {isEditing ? (
                    <select
                      name="city"
                      value={editableProfile.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-md bg-[#2a2435] text-white border border-gray-700"
                    >
                      {editableCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full px-4 py-3 rounded-md bg-[#1a1625] text-white border border-gray-800 flex justify-between items-center">
                      {profile.city || 'Not provided'}
                      <svg
                        className="w-5 h-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-400 mb-2">Country</label>
                  {isEditing ? (
                    <select
                      name="country"
                      value={editableProfile.country}
                      onChange={(e) => {
                        const newCountry = e.target.value;
                        setEditableProfile((prev) => {
                          const countryData = countriesWithCities.find((c) => c.name === newCountry);
                          const defaultCity = countryData && countryData.cities.length > 0 ? countryData.cities[0] : '';
                          return {
                            ...prev,
                            country: newCountry,
                            city: defaultCity,
                          };
                        });
                      }}
                      className="w-full px-4 py-3 rounded-md bg-[#2a2435] text-white border border-gray-700"
                    >
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full px-4 py-3 rounded-md bg-[#1a1625] text-white border border-gray-800 flex justify-between items-center">
                      {profile.country || 'Not provided'}
                      <svg
                        className="w-5 h-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-800 my-8" />

          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-8">My Subscriptions</h2>
            {profile.subscriptions.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {profile.subscriptions.map((subscription, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-2">
                      <Image
                        src={subscription.image || '/default-community.jpg'}
                        alt={subscription.name}
                        width={96}
                        height={96}
                        className="object-cover"
                      />
                    </div>
                    <p className="text-white text-center">{subscription.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No subscriptions found.</p>
            )}
          </div>

          <hr className="border-gray-800 my-8" />

          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-bold text-white">Link your</h2>
              <span className="text-2xl font-bold text-[#1DB954]">SPOTIFY</span>
              <h2 className="text-2xl font-bold text-white">!</h2>
            </div>
            <button
              onClick={syncSpotify}
              className={`px-6 py-2 ${profile.spotifyLinked ? 'bg-[#1DB954]' : 'bg-[#ff5733] hover:bg-[#e64a2e]'} text-white rounded-md transition-colors duration-200`}
              disabled={isLoading || profile.spotifyLinked}
            >
              {isLoading ? 'Connecting...' : profile.spotifyLinked ? 'Connected' : 'Sync Now'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}