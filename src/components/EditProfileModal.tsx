import React, { useState } from 'react';
import {
  Camera,
  Upload,
  User,
  AtSign,
  MapPin,
  Check,
  Sparkles,
} from 'lucide-react';
import type { UserProfile } from '../types';
import {
  Modal,
  Input,
  Textarea,
  Button,
  Avatar,
} from './ui';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onUpdateProfile({
        name: name.trim(),
        handle: handle.trim() ? `@${handle.trim().replace(/^@/, '')}` : undefined,
        avatar: avatar || undefined,
        bio: bio.trim() || undefined,
        city: city.trim() || undefined,
      });

      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Volunteer Profile"
      description="Update your display name, civic handle, and photo shown across cleanups."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-left">
        {/* Avatar Section */}
        <div className="space-y-3 pb-3 border-b border-border">
          <label className="block text-xs font-medium text-ink">
            Profile photo
          </label>
          <div className="flex items-center gap-4">
            <Avatar
              src={avatar}
              name={name || 'User'}
              size="xl"
            />

            <div className="space-y-2">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface hover:bg-surface-muted text-xs font-medium text-ink rounded-sm border border-border cursor-pointer transition-colors shadow-sm">
                <Upload className="w-3.5 h-3.5 text-forest" />
                <span>Upload device photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {avatar && (
                <button
                  type="button"
                  onClick={() => setAvatar('')}
                  className="block text-xs text-coral hover:underline"
                >
                  Remove custom photo
                </button>
              )}
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] text-muted">Or choose a preset portrait:</span>
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {AVATAR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setAvatar(preset.url)}
                  className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all flex-shrink-0 ${
                    avatar === preset.url
                      ? 'border-forest ring-2 ring-lime scale-105'
                      : 'border-border hover:border-forest opacity-80 hover:opacity-100'
                  }`}
                  title={preset.name}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Inputs */}
        <Input
          label="Full name *"
          placeholder="e.g. Ms dhoni"
          value={name}
          onChange={(e) => setName(e.target.value)}
          startIcon={<User className="w-3.5 h-3.5" />}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Civic handle"
            placeholder="e.g. msdhoni"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            startIcon={<AtSign className="w-3.5 h-3.5" />}
          />

          <Input
            label="City / Locality"
            placeholder="e.g. Margao, Goa"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            startIcon={<MapPin className="w-3.5 h-3.5" />}
          />
        </div>

        <Textarea
          label="Bio / Civic mission"
          placeholder="Share why you love cleaning your local streets, beaches, or trails..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={2}
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            icon={
              successMessage ? (
                <Check className="w-4 h-4 text-lime" />
              ) : (
                <Sparkles className="w-4 h-4 text-lime" />
              )
            }
          >
            {successMessage ? 'Saved' : 'Save profile'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
