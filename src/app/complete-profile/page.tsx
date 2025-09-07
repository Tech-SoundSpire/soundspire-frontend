"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface FormData {
  full_name: string;
  gender: string;
  date_of_birth: string;
  city: string;
  country: string;
  phone_number: string;
}

interface FormErrors {
  full_name?: string;
  gender?: string;
  date_of_birth?: string;
  city?: string;
  country?: string;
  phone_number?: string;
}

export default function CompleteProfilePage() {
  const [form, setForm] = useState<FormData>({
    full_name: "",
    gender: "",
    date_of_birth: "",
    city: "",
    country: "",
    phone_number: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();

  // Validation functions
  const validateFullName = (name: string): string | undefined => {
    if (!name.trim()) return "Full name is required";
    if (name.trim().length < 2) return "Full name must be at least 2 characters";
    if (!/^[a-zA-Z\s'-]+$/.test(name)) return "Full name can only contain letters, spaces, hyphens, and apostrophes";
    return undefined;
  };

  const validatePhoneNumber = (phone: string): string | undefined => {
    if (!phone.trim()) return "Phone number is required";
    // Remove all non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) return "Phone number must be at least 10 digits";
    if (cleanPhone.length > 15) return "Phone number cannot exceed 15 digits";
    // Basic international format validation
    if (!/^[\+]?[\d\s\-\(\)]+$/.test(phone)) return "Invalid phone number format";
    return undefined;
  };

  const validateDateOfBirth = (date: string): string | undefined => {
    if (!date) return "Date of birth is required";
    const birthDate = new Date(date);
    const today = new Date();
    var age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 13) return "You must be at least 13 years old";
    if (age > 120) return "Please enter a valid date of birth";
    if (birthDate > today) return "Date of birth cannot be in the future";
    
    return undefined;
  };

  const validateCity = (city: string): string | undefined => {
    if (!city.trim()) return "City is required";
    if (city.trim().length < 2) return "City name must be at least 2 characters";
    if (!/^[a-zA-Z\s'-]+$/.test(city)) return "City name can only contain letters, spaces, hyphens, and apostrophes";
    return undefined;
  };

  const validateCountry = (country: string): string | undefined => {
    if (!country.trim()) return "Country is required";
    if (country.trim().length < 2) return "Country name must be at least 2 characters";
    if (!/^[a-zA-Z\s'-]+$/.test(country)) return "Country name can only contain letters, spaces, hyphens, and apostrophes";
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    newErrors.full_name = validateFullName(form.full_name);
    newErrors.phone_number = validatePhoneNumber(form.phone_number);
    newErrors.date_of_birth = validateDateOfBirth(form.date_of_birth);
    newErrors.city = validateCity(form.city);
    newErrors.country = validateCountry(form.country);
    
    if (!form.gender) newErrors.gender = "Gender selection is required";
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== undefined);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Real-time validation for phone number formatting
    let processedValue = value;
    if (name === 'phone_number') {
      // Allow only numbers, spaces, hyphens, parentheses, and plus sign
      processedValue = value.replace(/[^\d\s\-\(\)\+]/g, '');
    }
    
    setForm({ ...form, [name]: processedValue });
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const res = await fetch("/api/users/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        setUser(data.user);
        router.push("/PreferenceSelectionPage");
      } else {
        alert(data.error || "Failed to save profile");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Get max date for date input (today)
  const maxDate = new Date().toISOString().split('T')[0];
  // Get min date (120 years ago)
  const minDate = new Date(new Date().getFullYear() - 120, 0, 1).toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
            <p className="text-gray-600">Help us personalize your experience by completing your profile information</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                name="full_name"
                type="text"
                placeholder="Enter your full name"
                value={form.full_name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.full_name ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                }`}
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.full_name}
                </p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Gender *
              </label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.gender ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                }`}
              >
                <option value="">Select your gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.gender}
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date of Birth *
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={form.date_of_birth}
                onChange={handleChange}
                min={minDate}
                max={maxDate}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.date_of_birth ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                }`}
              />
              {errors.date_of_birth && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.date_of_birth}
                </p>
              )}
            </div>

            {/* Location Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* City */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City *
                </label>
                <input
                  name="city"
                  type="text"
                  placeholder="Enter your city"
                  value={form.city}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.city ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                  }`}
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.city}
                  </p>
                )}
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Country *
                </label>
                <input
                  name="country"
                  type="text"
                  placeholder="Enter your country"
                  value={form.country}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.country ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                  }`}
                />
                {errors.country && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.country}
                  </p>
                )}
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                name="phone_number"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={form.phone_number}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.phone_number ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                }`}
              />
              <p className="mt-1 text-xs text-gray-500">
                Include country code for international numbers
              </p>
              {errors.phone_number && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.phone_number}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving Profile...
                </div>
              ) : (
                "Continue to Preferences"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              All fields marked with * are required
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}