"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api, { User } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const currentUser = api.getCurrentUser();
    if (!currentUser) {
      router.push("/sign-in");
      return;
    }

    fetchUserProfile();
  }, [router]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const profile = await api.getUserProfile();
      setUser(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setUploadingImage(true);
    setError("");

    try {
      await api.uploadProfilePicture(file);
      setSuccess("Profile picture updated successfully!");
      await fetchUserProfile();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to upload profile picture");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (!confirm("Are you sure you want to delete your profile picture?")) return;

    setLoading(true);
    setError("");

    try {
      await api.deleteProfilePicture();
      setSuccess("Profile picture deleted successfully!");
      await fetchUserProfile();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to delete profile picture");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-800">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 flex flex-col items-center bg-gradient-to-br from-blue-900 to-blue-800">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-900">Profile</h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Error / Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Profile Picture */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-blue-200 flex items-center justify-center text-4xl text-blue-600 border-4 border-blue-500">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            )}

            {uploadingImage && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                <div className="text-white text-sm">Uploading...</div>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-3">
            <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              Upload Picture
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                className="hidden"
                disabled={uploadingImage || loading}
              />
            </label>

            {user?.profilePicture && (
              <button
                onClick={handleDeleteProfilePicture}
                disabled={loading}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete Picture
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-2">Max size: 5MB. Formats: JPG, PNG, GIF</p>
        </div>

        {/* READ-ONLY Profile Information */}
        <div className="space-y-4">
          {/* Username */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="text-sm font-semibold text-gray-600">Username</label>
            <p className="text-lg text-gray-800">{user?.username}</p>
          </div>

          {/* Email */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="text-sm font-semibold text-gray-600">Email</label>
            <p className="text-lg text-gray-800">{user?.email}</p>
          </div>

          {/* Member Since */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="text-sm font-semibold text-gray-600">Member Since</label>
            <p className="text-lg text-gray-800">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
