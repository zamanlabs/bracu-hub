import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'
import { useRouter } from 'next/router'
import imageCompression from 'browser-image-compression'

type UserProfile = {
  username: string
  full_name: string | null
  avatar_url: string | null
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [userData, setUserData] = useState<UserProfile>({
    username: '',
    full_name: null,
    avatar_url: null,
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('username, full_name, avatar_url')
        .eq('id', user?.id)
        .single()

      if (error) throw error

      setUserData({
        username: data?.username || user?.email?.split('@')[0] || '',
        full_name: data?.full_name || null,
        avatar_url: data?.avatar_url || null,
      })
      setAvatarPreview(data?.avatar_url || null)
    } catch (error) {
      console.error('Error fetching user data:', error)
      setError('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        console.log('Original file:', file)
        // Compress the image
        const options = {
          maxSizeMB: 1, // Max file size in MB
          maxWidthOrHeight: 800, // Max width or height
          useWebWorker: true, // Use Web Worker for better performance
          fileType: 'image/jpeg', // Convert to JPEG for better compression
        }

        const compressedFile = await imageCompression(file, options)
        console.log('Compressed file:', compressedFile)
        setAvatarFile(compressedFile)

        // Create preview
        const reader = new FileReader()
        reader.onloadend = () => {
          console.log('Preview data:', reader.result)
          setAvatarPreview(reader.result as string)
        }
        reader.readAsDataURL(compressedFile)
      } catch (error) {
        console.error('Error compressing image:', error)
        setError('Failed to process image. Please try again.')
      }
    }
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value.trim()
    setUserData(prev => ({
      ...prev,
      username: newUsername || user?.email?.split('@')[0] || '',
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      // Validate username
      const username = userData.username.trim()
      if (!username) {
        setError('Username cannot be empty')
        return
      }

      // Validate full name
      const fullName = userData.full_name?.trim()
      if (fullName && (fullName.length < 2 || !/^[a-zA-Z\s]+$/.test(fullName))) {
        setError('Full name must be at least 2 characters and contain only letters and spaces')
        return
      }

      let avatarUrl = userData.avatar_url

      // Upload new avatar if selected
      if (avatarFile) {
        try {
          // Validate file size (max 1MB after compression)
          if (avatarFile.size > 1 * 1024 * 1024) {
            throw new Error('File size must be less than 1MB')
          }

          // Validate file type
          const validImageTypes = ['image/jpeg', 'image/png', 'image/gif']
          if (!validImageTypes.includes(avatarFile.type)) {
            throw new Error('File must be a JPEG, PNG, or GIF image')
          }

          const fileExt = avatarFile.name.split('.').pop()?.toLowerCase()
          if (!fileExt || !['jpg', 'jpeg', 'png', 'gif'].includes(fileExt)) {
            throw new Error('Invalid file extension')
          }

          const fileName = `${user.id}-${Date.now()}.${fileExt}`
          const filePath = `avatars/${fileName}`

          // Delete old avatar if exists
          if (userData.avatar_url) {
            const oldPath = userData.avatar_url.split('/').pop()
            if (oldPath) {
              await supabase.storage
                .from('avatars')
                .remove([`avatars/${oldPath}`])
            }
          }

          // Upload new avatar
          const { error: uploadError, data: uploadData } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile, {
              cacheControl: '3600',
              upsert: true
            })

          if (uploadError) {
            console.error('Upload error:', uploadError)
            throw new Error('Failed to upload avatar')
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath)

          avatarUrl = publicUrl
        } catch (uploadError) {
          console.error('Avatar upload error:', uploadError)
          throw new Error(uploadError instanceof Error ? uploadError.message : 'Failed to upload avatar. Please try again.')
        }
      }

      // Update user data
      const { error: updateError } = await supabase
        .from('users')
        .update({
          username: username,
          full_name: fullName || null,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Update error:', updateError)
        throw new Error('Failed to update profile')
      }

      setSuccess('Profile updated successfully!')
      setUserData(prev => ({
        ...prev,
        avatar_url: avatarUrl
      }))
      setAvatarPreview(avatarUrl)
    } catch (error) {
      console.error('Error updating profile:', error)
      setError(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 py-8 px-8">
            <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
            <p className="mt-2 text-white/80">Customize your profile information</p>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl text-green-600 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-lg font-medium text-gray-900 mb-4">
                  Profile Picture
                </label>
                <div className="flex items-start space-x-6">
                  <div className="relative group">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Profile"
                        className="w-32 h-32 rounded-2xl object-cover border-2 border-white shadow-xl transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-4xl font-bold transition-transform group-hover:scale-105">
                        {userData.username?.[0].toUpperCase()}
                      </div>
                    )}
                    <label
                      htmlFor="avatar-upload"
                      className="absolute -bottom-3 -right-3 bg-white rounded-xl p-2 shadow-lg cursor-pointer transition-transform hover:scale-110 active:scale-95"
                    >
                      <svg
                        className="w-6 h-6 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-medium text-gray-900">Upload a new profile picture</p>
                    <p className="mt-1 text-sm text-gray-500">Recommended: Square image, max 1MB</p>
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                      <svg
                        className="mr-2 h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      JPG, PNG or GIF files are allowed
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="username"
                    className="block text-lg font-medium text-gray-900"
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={userData.username}
                    onChange={handleUsernameChange}
                    className="mt-2 block w-full rounded-xl border border-gray-200 px-4 py-3 bg-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400 text-gray-600"
                    required
                    minLength={1}
                  />
                </div>

                <div>
                  <label
                    htmlFor="full_name"
                    className="block text-lg font-medium text-gray-900"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    value={userData.full_name || ''}
                    onChange={(e) =>
                      setUserData({ ...userData, full_name: e.target.value })
                    }
                    className="mt-2 block w-full rounded-xl border border-gray-200 px-4 py-3 bg-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400 text-gray-600"
                    required
                  />
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-medium flex items-center justify-center space-x-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>Save Changes</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 