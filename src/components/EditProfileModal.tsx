import React, { useState } from 'react';
import {
  X,
  Camera,
  Upload,
  User,
  AtSign,
  MapPin,
  FileText,
  Check,
  Sparkles,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import type { UserProfile } from '../types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AVATAR_PRESETS = [
  {
    name: 'Eco Scout',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Forest Ranger',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Ocean Defender',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Green Innovator',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Civic Steward',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Eco Bot',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=EcoHero',
  },
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateProfile,
}) => {
  const [name, setName] = useState(currentUser.name || '');
  const [handle, setHandle] = useState(
    (currentUser.handle || '').replace(/^@/, '')
  );
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [city, setCity] = useState(currentUser.city || '');
  const [isCustomUrl, setIsCustomUrl] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyCustomUrl = () => {
    if (customUrlInput.trim()) {
      setAvatar(customUrlInput.trim());
      setIsCustomUrl(false);
      setCustomUrlInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onUpdateProfile({
        name: name.trim(),
        handle: handle.trim() ? `@${handle.trim().replace(/^@/, '')}` : `@${name.toLowerCase().replace(/[^a-z0-9_]/g, '')}`,
        avatar: avatar || currentUser.avatar,
        bio: bio.trim(),
        city: city.trim(),
      });

      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
        onClose();
      }, 600);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1C2B24]/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#FFFDF8] rounded-[12px] border border-[#E2DCCD] shadow-modal overflow-hidden my-4 sm:my-6 text-[#1C2B24]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#E2DCCD] bg-[#F4F1EA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-[#1E6B4B] text-white flex items-center justify-center font-bold text-sm shadow-subtle flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-[#1C2B24]">Edit civic profile</h2>
              <p className="text-xs text-[#6B7468]">
                Update your photo, display name, handle, and location.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-[4px] text-[#6B7468] hover:text-[#1C2B24] hover:bg-[#E2DCCD] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* Avatar Section */}
          <div className="p-3.5 rounded-[6px] bg-[#F4F1EA] border border-[#E2DCCD] space-y-3">
            <label className="block text-xs font-semibold text-[#1C2B24]">
              Profile photo
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-3.5">
              {/* Photo Preview */}
              <div className="relative flex-shrink-0">
                <img
                  src={avatar || currentUser.avatar}
                  alt="Profile preview"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white shadow-subtle"
                />
                <label className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#1E6B4B] hover:bg-[#18553B] text-white shadow-subtle cursor-pointer transition-colors">
                  <Camera className="w-3.5 h-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-1.5 text-center sm:text-left w-full">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <label className="px-3 py-1.5 rounded-[4px] bg-[#FFFDF8] hover:bg-[#F4F1EA] border border-[#E2DCCD] text-xs font-medium text-[#1C2B24] cursor-pointer flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-[#1E6B4B]" />
                    <span>Upload photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsCustomUrl(!isCustomUrl)}
                    className="px-3 py-1.5 rounded-[4px] bg-[#FFFDF8] hover:bg-[#F4F1EA] border border-[#E2DCCD] text-xs font-medium text-[#6B7468] flex items-center gap-1.5 transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Image URL</span>
                  </button>
                </div>

                <p className="text-[11px] text-[#6B7468]">
                  Upload from camera/library or choose a preset below.
                </p>
              </div>
            </div>

            {/* Custom URL Input Box (if toggled) */}
            {isCustomUrl && (
              <div className="flex items-center gap-2 pt-2 border-t border-[#E2DCCD]">
                <input
                  type="url"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="flex-1 px-3 py-1.5 text-xs rounded-[4px] bg-[#FFFDF8] border border-[#E2DCCD] text-[#1C2B24] focus:outline-none focus:border-[#1E6B4B]"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomUrl}
                  className="px-3 py-1.5 text-xs font-medium bg-[#1E6B4B] text-white rounded-[4px] hover:bg-[#18553B]"
                >
                  Apply
                </button>
              </div>
            )}

            {/* Avatar Presets */}
            <div className="pt-2 border-t border-[#E2DCCD]">
              <span className="text-[11px] text-[#6B7468] block mb-1.5">
                Quick presets:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {AVATAR_PRESETS.map((preset) => {
                  const isSelected = avatar === preset.url;
                  return (
                    <button
                      type="button"
                      key={preset.name}
                      onClick={() => setAvatar(preset.url)}
                      className={`relative flex-shrink-0 rounded-full transition-transform ${
                        isSelected ? 'ring-2 ring-[#1E6B4B] ring-offset-1' : 'opacity-80 hover:opacity-100'
                      }`}
                      title={preset.name}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-8 h-8 rounded-full object-cover border border-[#E2DCCD]"
                      />
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#1E6B4B] text-white flex items-center justify-center text-[7px]">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Name & Handle Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1C2B24] mb-1">
                Display name <span className="text-[#B3432E]">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-[#6B7468] absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!handle) {
                      setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                    }
                  }}
                  placeholder="e.g. Pranav Kamat"
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-[6px] bg-[#FFFDF8] border border-[#E2DCCD] text-[#1C2B24] focus:outline-none focus:border-[#1E6B4B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C2B24] mb-1">
                Username / Handle
              </label>
              <div className="relative">
                <AtSign className="w-3.5 h-3.5 text-[#6B7468] absolute left-3 top-3" />
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.replace(/^@/, ''))}
                  placeholder="pranav_kamat"
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-[6px] bg-[#FFFDF8] border border-[#E2DCCD] text-[#1C2B24] focus:outline-none focus:border-[#1E6B4B]"
                />
              </div>
            </div>
          </div>

          {/* Location / City */}
          <div>
            <label className="block text-xs font-semibold text-[#1C2B24] mb-1">
              City / Community area
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-[#6B7468] absolute left-3 top-3" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Margao, Goa or Mumbai"
                className="w-full pl-8 pr-3 py-2 text-xs rounded-[6px] bg-[#FFFDF8] border border-[#E2DCCD] text-[#1C2B24] focus:outline-none focus:border-[#1E6B4B]"
              />
            </div>
          </div>

          {/* Bio / Civic Mission */}
          <div>
            <label className="block text-xs font-semibold text-[#1C2B24] mb-1">
              Bio / Note
            </label>
            <div className="relative">
              <FileText className="w-3.5 h-3.5 text-[#6B7468] absolute left-3 top-3" />
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Neighbourhood volunteer helping restore local public spaces..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-[6px] bg-[#FFFDF8] border border-[#E2DCCD] text-[#1C2B24] placeholder:text-[#A39E93] focus:outline-none focus:border-[#1E6B4B] resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2DCCD]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 text-xs font-medium text-[#6B7468] hover:text-[#1C2B24] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-4 py-2 text-xs font-medium bg-[#1E6B4B] hover:bg-[#18553B] text-white rounded-[6px] shadow-subtle disabled:opacity-40 transition-colors flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : successMessage ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Save profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
