'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Camera, Save, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    websiteUrl: '',
    avatarUrl: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.firstName || '',
        bio: user.publicMetadata?.bio as string || '',
        websiteUrl: user.publicMetadata?.websiteUrl as string || '',
        avatarUrl: user.imageUrl || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/users/${user?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
        <p className="mt-2 text-white/70">Manage your profile and public information</p>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src={formData.avatarUrl || '/placeholder-avatar.png'}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-white/20"
              />
              <button
                type="button"
                className="absolute bottom-0 right-0 p-2 bg-cyan-500 rounded-full hover:bg-cyan-600 transition-colors"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Profile Photo</h3>
              <p className="text-sm text-white/70">Update your profile picture</p>
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-white mb-2">
              Display Name
            </label>
            <input
              type="text"
              id="displayName"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Your display name"
            />
          </div>

          {/* Username (from Clerk, read-only) */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={user?.username || 'Not set'}
              disabled
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/50 cursor-not-allowed"
            />
            <p className="text-xs text-white/50 mt-1">Username can be changed in Clerk settings</p>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-white mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
              placeholder="Tell us about yourself and your art..."
            />
            <p className="text-xs text-white/50 mt-1">{formData.bio.length} / 500 characters</p>
          </div>

          {/* Website URL */}
          <div>
            <label htmlFor="websiteUrl" className="block text-sm font-medium text-white mb-2">
              Website
            </label>
            <input
              type="url"
              id="websiteUrl"
              value={formData.websiteUrl}
              onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="https://your-portfolio.com"
            />
          </div>

          {/* Message */}
          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
