'use client';

import { useAuth } from '@/context/AuthContext';

import Navbar from '@/components/Navbar';
import { useState, useEffect, useRef } from 'react'; 
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { countriesWithCities } from '@/lib/locationData';
import { getImageUrl, getDefaultProfileImageUrl } from '@/utils/userProfileImageUtils';

// Define User interface for the auth user
interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  photoURL?: string;
  displayName?: string | null;
  provider: 'google' | 'spotify';
  accessToken?: string;
  refreshToken?: string;
}

// Types for our profile data
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
  subscriptions: Array<{
    name: string;
    profileImage: string;
  }>;
}

// Helper to get an initial avatar from email if displayName is missing
const getInitialAvatar = (email: string) => {
  return getDefaultProfileImageUrl();
};

// Simulated database of existing usernames
// In a real app, this would be a server API call
const existingUsernames = ['john_doe', 'jane_smith', 'edsheeran', 'test_user'];




export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isValidatingUsername, setIsValidatingUsername] = useState(false);
  
  // Initialize profile state with default values
  const [profile, setProfile] = useState<ProfileData>({
    fullName: user?.displayName || user?.name || '',
    userName: user?.email ? user.email.split('@')[0].toLowerCase() : '',
    gender: 'Prefer not to say',
    email: user?.email || '',
    phoneNumber: '',
    dob: '2000-01-01',
    city: 'New York',
    country: 'United States',
    profileImage: getDefaultProfileImageUrl(),
    spotifyLinked: false,
    subscriptions: Array(6).fill({
      name: 'Ed Sheeran',
      profileImage: getDefaultProfileImageUrl()
    })
  });

  useEffect(() => {
    if (user) {
      console.log("Auth user data:", user);
      
      const fullName = user.name || user.displayName || '';
      
      setProfile(prev => ({
        ...prev,
        fullName: fullName && fullName.trim() !== '' 
                  ? fullName 
                  : user.email 
                    ? user.email.split('@')[0] 
                    : 'User',
        userName: user.email 
                  ? user.email.split('@')[0].toLowerCase() 
                  : '',
        email: user.email || '',
        profileImage: user.photoURL || user.image || '',
      }));
    }
  }, [user]);

  // Temporary state for editing
  const [editableProfile, setEditableProfile] = useState<ProfileData>({...profile});
  
  // Update editable profile when profile changes
  useEffect(() => {
    setEditableProfile({...profile});
  }, [profile]);
  
  // Get a list of all countries from the array
  const countries = countriesWithCities.map(country => country.name);
  
  // Find cities for the selected country (for read-only view)
  const cities = (() => {
    const countryData = countriesWithCities.find(c => c.name === profile.country);
    return countryData ? countryData.cities : [];
  })();
  
  // For editable profile cities
  const editableCities = (() => {
    const countryData = countriesWithCities.find(c => c.name === editableProfile.country);
    return countryData ? countryData.cities : [];
  })();
  
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  const toggleEdit = () => {
    if (!isEditing) {
      setEditableProfile({...profile});
      setUsernameError(null);
    }
    setIsEditing(!isEditing);
  };

  // Check if username is unique
  const checkUsernameUniqueness = async (username: string): Promise<boolean> => {
    setIsValidatingUsername(true);
    
    try {
      // Simulate API call to check username
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // In a real app, this would be a server API call
      const isUnique = !existingUsernames.includes(username.toLowerCase()) || 
                        username.toLowerCase() === profile.userName.toLowerCase();
      
      return isUnique;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    } finally {
      setIsValidatingUsername(false);
    }
  };
  
  const handleSave = async () => {
    setIsLoading(true);
    setUsernameError(null);
    
    try {
      // Validate username format
      if (editableProfile.userName.trim() === '') {
        setUsernameError('Username cannot be empty');
        setIsLoading(false);
        return;
      }
      
      if (!/^[a-zA-Z0-9_]+$/.test(editableProfile.userName)) {
        setUsernameError('Username can only contain letters, numbers, and underscores');
        setIsLoading(false);
        return;
      }
      
      // Check if username is unique (only if it changed)
      if (editableProfile.userName.toLowerCase() !== profile.userName.toLowerCase()) {
        const isUnique = await checkUsernameUniqueness(editableProfile.userName);
        
        if (!isUnique) {
          setUsernameError('This username is already taken');
          setIsLoading(false);
          return;
        }
      }
      
      // Ensure user is available
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Update profile in database
      const dbResponse = await fetch('/api/users/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleId: user!.id,
          profileData: {
            fullName: editableProfile.fullName,
            profilePictureUrl: editableProfile.profileImage ? 
              (editableProfile.profileImage.startsWith('/api/images/') ? 
                // Convert API URL back to S3 path
                `s3://soundspirewebsiteassets/images/${editableProfile.profileImage.replace('/api/images/', '')}` :
                editableProfile.profileImage.startsWith('s3://') ? 
                  editableProfile.profileImage : 
                  null
              ) : null,
            city: editableProfile.city,
            country: editableProfile.country,
          },
        }),
      });

      if (!dbResponse.ok) {
        throw new Error('Failed to update profile in database');
      }

      // Save to localStorage to persist data between page reloads
      localStorage.setItem('userProfile', JSON.stringify(editableProfile));
      
      // Update profile state
      setProfile(editableProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load profile from localStorage on initial page load
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        // First try to load from database
        const response = await fetch(`/api/users/profile?googleId=${user.id}`);
        if (response.ok) {
          const dbProfile = await response.json();
          if (dbProfile) {
            // Convert S3 path to API URL for display
            const profileImageUrl = dbProfile.profile_picture_url ? 
              getImageUrl(dbProfile.profile_picture_url) : 
              getDefaultProfileImageUrl();
            
            const updatedProfile = {
              fullName: dbProfile.full_name || user.name || '',
              userName: user.email ? user.email.split('@')[0].toLowerCase() : '',
              gender: 'Prefer not to say',
              email: user.email || '',
              phoneNumber: '',
              dob: '2000-01-01',
              city: dbProfile.city || 'New York',
              country: dbProfile.country || 'United States',
              profileImage: profileImageUrl,
              spotifyLinked: false,
              subscriptions: Array(6).fill({
                name: 'Ed Sheeran',
                profileImage: getDefaultProfileImageUrl()
              })
            };
            
            setProfile(updatedProfile);
            return;
          }
        }
      } catch (error) {
        console.error('Failed to load profile from database:', error);
      }
      
      // Fallback to localStorage
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        
        // Only update if we have a user and the saved profile matches the user's email
        if (user && user.email && parsedProfile.email === user.email) {
          setProfile(prev => ({
            ...parsedProfile,
            // Keep certain fields from auth if they're more up-to-date
            email: user.email || parsedProfile.email,
            profileImage: user.photoURL || user.image || parsedProfile.profileImage
          }));
        }
      }
    };
    
    loadProfile();
  }, [user]);
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditableProfile({...profile});
    setUsernameError(null);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Clear username error when user types
    if (name === 'userName' && usernameError) {
      setUsernameError(null);
    }
    
    setEditableProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleImageClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsLoading(true);

      // Generate a unique filename
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${profile.fullName.toLowerCase().replace(/\s+/g, '-')}-${user.id}.${fileExtension}`;

      // Get presigned URL for upload
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName,
          fileType: file.type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, key } = await response.json();

      // Upload file to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      // Update profile in database
      const s3Path = `s3://soundspirewebsiteassets/images/users/${fileName}`;
      console.log('S3 Path:', s3Path); // Debug log
      const dbResponse = await fetch('/api/users/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleId: user.id,
          profileData: {
            fullName: profile.fullName,
            profilePictureUrl: s3Path,
            city: profile.city,
            country: profile.country,
          },
        }),
      });

      if (!dbResponse.ok) {
        throw new Error('Failed to update profile in database');
      }

      // Update local state with the correct URL
      const imageUrl = getImageUrl(s3Path);
      console.log('Image URL:', imageUrl); // Debug log
      setEditableProfile(prev => ({
        ...prev,
        profileImage: imageUrl,
      }));

      setProfile(prev => ({
        ...prev,
        profileImage: imageUrl,
      }));

    } catch (error) {
      console.error('Error uploading image:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };
  
  const syncSpotify = async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedProfile = { ...profile, spotifyLinked: true };
      
      // Save to localStorage
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Failed to connect Spotify:', error);
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
      <main className="ml-16 px-8 py-6">
        <div className="max-w-5xl mx-auto">
          {/* Header with Title and Edit/Save Buttons */}
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
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors duration-200"
                  >
                    Logout
                  </button>
                  <button
                    onClick={toggleEdit}
                    className="px-6 py-2 bg-[#ff5733] hover:bg-[#e64a2e] text-white rounded-md transition-colors duration-200 flex items-center"
                  >
                    Edit Profile
                    <svg className="ml-2 w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Profile Information */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Profile Image and Username */}
              <div className="w-full md:w-auto flex flex-col items-center">
                {/* Profile Image */}
                <div 
                  className={`w-28 h-28 rounded-full overflow-hidden mb-4 ${isEditing ? 'cursor-pointer relative' : ''}`}
                  onClick={handleImageClick}
                >
                  {profile.profileImage ? (
                    <Image
                      src={isEditing ? (editableProfile.profileImage || getDefaultProfileImageUrl()) : (profile.profileImage || getDefaultProfileImageUrl())}
                      alt="Profile picture"
                      width={112}
                      height={112}
                      className="object-cover"
                    />
                  ) : user?.photoURL || user?.image ? (
                    <Image
                      src={user.photoURL || user.image || getDefaultProfileImageUrl()}
                      alt="Google profile picture"
                      width={112}
                      height={112}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-[#2a2438] flex items-center justify-center">
                      <span className="text-4xl text-white">
                        {profile.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
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
                
                {/* Full Name - Non-editable */}
                <div className="text-center w-full">
                  <h2 className="text-xl font-bold text-white mb-2">{profile.fullName}</h2>
                </div>
                
                {/* Username - Now Editable */}
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
                      {usernameError && (
                        <p className="text-red-500 text-sm mt-1">{usernameError}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-400">@{profile.userName}</p>
                  )}
                </div>
              </div>

              {/* Profile Fields */}
              <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Gender */}
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
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  ) : (
                    <div className="w-full px-4 py-3 rounded-md bg-[#1a1625] text-white border border-gray-800">
                      {profile.gender}
                    </div>
                  )}
                </div>

                {/* Email - non-editable */}
                <div>
                  <label className="block text-gray-400 mb-2">Email Address</label>
                  <div className="w-full px-4 py-3 rounded-md bg-[#1a1625] text-white border border-gray-800">
                    {profile.email}
                  </div>
                </div>

                {/* Phone - non-editable */}
                <div>
                  <label className="block text-gray-400 mb-2">Phone Number</label>
                  <div className="w-full px-4 py-3 rounded-md bg-[#1a1625] text-white border border-gray-800">
                    {profile.phoneNumber}
                  </div>
                </div>

                {/* DOB */}
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
                      {new Date(profile.dob).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </div>
                  )}
                </div>

                {/* City */}
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
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full px-4 py-3 rounded-md bg-[#1a1625] text-white border border-gray-800 flex justify-between items-center">
                      {profile.city}
                      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                  )}
                </div>

                {/* Country */}
                <div>
                  <label className="block text-gray-400 mb-2">Country</label>
                  {isEditing ? (
                    <select
                      name="country"
                      value={editableProfile.country}
                      onChange={(e) => {
                        const newCountry = e.target.value;
                        setEditableProfile(prev => {
                          const countryData = countriesWithCities.find(c => c.name === newCountry);
                          const defaultCity = countryData && countryData.cities.length > 0 ? 
                            countryData.cities[0] : '';
                          
                          return {
                            ...prev,
                            country: newCountry,
                            city: defaultCity
                          };
                        });
                      }}
                      className="w-full px-4 py-3 rounded-md bg-[#2a2435] text-white border border-gray-700"
                    >
                      {countries.map((country) => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full px-4 py-3 rounded-md bg-[#1a1625] text-white border border-gray-800 flex justify-between items-center">
                      {profile.country}
                      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Divider */}
          <hr className="border-gray-800 my-8" />

          {/* Subscriptions Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-8">My Subscriptions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {profile.subscriptions.map((subscription, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-2">
                    <Image
                      src={subscription.profileImage}
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
          </div>

          {/* Divider */}
          <hr className="border-gray-800 my-8" />

          {/* Spotify Link Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-bold text-white">Link your</h2>
              <span className="text-2xl font-bold text-[#1DB954]">SPOTIFY</span>
              <span className="text-2xl font-bold text-white">!</span>
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
