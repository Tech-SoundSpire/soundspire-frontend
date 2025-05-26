'use client';

import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    age: '',
    gender: '',
    email: user?.email || ''
  });

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1625]">
      <main className="ml-16 px-8 py-6">
        {/* Logout Button */}
        <div className="flex justify-between items-center mb-8">
          <div className="relative w-full max-w-2xl items-center mx-auto">
            <h1 className="text-3xl font-bold text-white mx-auto">Profile</h1>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 ml-4 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200"
          >
            Logout
          </button>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-[#2d2838] rounded-lg p-8">
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-md bg-[#1a1625] text-white border border-gray-700 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Age */}
              <div>
                <label className="block text-gray-300 mb-2">Age</label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-md bg-[#1a1625] text-white border border-gray-700 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-gray-300 mb-2">Gender</label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-md bg-[#1a1625] text-white border border-gray-700 focus:outline-none focus:border-purple-500"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-2 rounded-md bg-[#1a1625] text-white border border-gray-700"
                />
              </div>

              {/* Edit/Save Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors duration-200"
                >
                  {isEditing ? 'Save' : 'Edit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 