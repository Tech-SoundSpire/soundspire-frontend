"use client";
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { validateFile } from '@/utils/fileUtils';
import { toast } from 'react-hot-toast';

interface ReviewFormData {
  title: string;
  content: string;
  date: string;
  type: 'album' | 'single';
  artist: string;
  author: string;
  image: File | null;
}

export default function SubmitReviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ReviewFormData>({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    type: 'album',
    artist: '',
    author: '',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Check if user has @soundspire.online email
  const canSubmitReview = user?.email?.endsWith('@soundspire.online');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      toast.error(validation.error || "Invalid file");
      return;
    }

    setFormData(prev => ({ ...prev, image: file }));

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload image to S3
    try {
      setIsSubmitting(true);
      
      // Generate unique filename
      const extension = file.name.split('.').pop();
      const fileName = `review-${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;

      // Get presigned URL
      const res = await fetch('/api/reviews/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          fileType: file.type,
          fileSize: file.size
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to get upload URL');
      }

      const { uploadUrl, s3Path } = await res.json();

      // Upload to S3
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload image to S3');
      }

      setImageUrl(s3Path);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      toast.error((error as Error).message || 'Image upload failed');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canSubmitReview) {
      toast.error('Only users with @soundspire.online email can submit reviews');
      return;
    }

    if (!formData.title || !formData.content || !formData.artist) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          date: formData.date,
          type: formData.type,
          artist: formData.artist,
          author: formData.author,
          imageUrl: imageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit review');
      }

      toast.success('Review submitted successfully!');
      router.push('/reviews');
    } catch (error) {
      toast.error((error as Error).message || 'Failed to submit review');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canSubmitReview) {
    return (
      <div className="min-h-screen bg-[#1a1625] ml-16 px-8 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#231b32] rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Access Restricted</h1>
            <p className="text-gray-300 mb-6">
              Only users with @soundspire.online email domain can submit reviews.
            </p>
            <p className="text-gray-400 text-sm">
              Your current email: {user?.email}
            </p>
            <button
              onClick={() => router.push('/reviews')}
              className="mt-6 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded font-semibold"
            >
              Back to Reviews
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1625] ml-16 px-8 py-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Submit a Review</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#231b32] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Review Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#2a2139] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Review title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Artist *
                </label>
                <input
                  type="text"
                  name="artist"
                  value={formData.artist}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#2a2139] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Artist name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#2a2139] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="album">Album</option>
                  <option value="single">Single</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#2a2139] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Author
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[#2a2139] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Your name (optional)"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Content *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-3 py-2 bg-[#2a2139] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Write your review here..."
                required
              />
            </div>
          </div>

          <div className="bg-[#231b32] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Review Image</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 bg-[#2a2139] border border-gray-600 rounded-md text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600"
              />
              <p className="text-xs text-gray-400 mt-1">
                Supported formats: JPEG, PNG, GIF, WebP (Max 3MB)
              </p>
            </div>

            {imagePreview && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Preview
                </label>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-w-md h-48 object-cover rounded-md"
                />
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/reviews')}
              className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white rounded-md font-semibold transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
