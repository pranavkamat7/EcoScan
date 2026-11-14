import React, { useState } from 'react';
import {
  Camera,
  Upload,
  User,
  AtSign,
  MapPin,
  Check,
  Sparkles,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import type { UserProfile } from '../types';
import { compressImageFile } from '../utils/imageCompressor';
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
  onDeleteAccount?: () => Promise<{ success: boolean; error?: string }>;
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
  onDeleteAccount,
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

  // Danger Zone / Account Deletion State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 250, 0.8);
        setAvatar(compressed);
      } catch {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setAvatar(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

  const handleConfirmDeleteAccount = async () => {
    if (!onDeleteAccount) return;
    setIsDeletingAccount(true);
    try {
      const res = await onDeleteAccount();
      if (res && res.success) {
        onClose();
      }
    } catch (err) {
      console.error('Failed to permanently delete account:', err);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Volunteer Profile"
      description="Update your display name, civic handle, and photo shown across cleanups."
      size="md"
      footer={
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full">
          <Button variant="ghost" size="md" onClick={onClose} disabled={isSubmitting || isDeletingAccount}>
            Cancel
          </Button>

          <Button
            form="edit-profile-form"
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            disabled={isDeletingAccount}
            onClick={(e) => {
              if (name.trim()) handleSubmit(e);
            }}
            icon={
              successMessage ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <Sparkles className="w-4 h-4 text-white" />
              )
            }
          >
            {successMessage ? 'Saved' : 'Save profile'}
          </Button>
        </div>
      }
    >
      <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-5 text-left">
        {/* Avatar Section */}
        <div className="space-y-3 pb-3 border-b border-line">
          <label className="block text-xs font-semibold text-navy">
            Profile photo
          </label>
          <div className="flex items-center gap-4">
            <Avatar
              src={avatar}
              name={name || 'User'}
              size="xl"
            />

            <div className="space-y-2">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-navy-50 text-xs font-semibold text-navy rounded-sm border border-line cursor-pointer transition-colors shadow-sm">
                <Upload className="w-3.5 h-3.5 text-emerald" />
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
                      ? 'border-emerald ring-2 ring-emerald/30 scale-105'
                      : 'border-line hover:border-emerald opacity-80 hover:opacity-100'
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
          startIcon={<User className="w-3.5 h-3.5 text-muted" />}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Civic handle"
            placeholder="e.g. msdhoni"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            startIcon={<AtSign className="w-3.5 h-3.5 text-muted" />}
          />

          <Input
            label="City / Locality"
            placeholder="e.g. Margao, Goa"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            startIcon={<MapPin className="w-3.5 h-3.5 text-muted" />}
          />
        </div>

        <Textarea
          label="Bio / Civic mission"
          placeholder="Share why you love cleaning your local streets, beaches, or trails..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={2}
        />

        {/* DANGER ZONE: Personal Data Safety & Account Erasure */}
        {onDeleteAccount && (
          <div className="pt-4 border-t border-line mt-4">
            <div className="p-4 rounded-lg bg-coral-50/70 border border-coral-200 text-left space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-coral text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-xs sm:text-sm text-coral-900">
                    Personal Data Safety & Permanent Account Erasure
                  </h4>
                  <p className="text-xs text-coral-800/90 leading-relaxed mt-0.5">
                    For your personal data privacy and safety, you can permanently delete your account, authentication records, reported spots, and uploaded images.
                  </p>
                </div>
              </div>

              {!showDeleteConfirm ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-coral hover:bg-coral-100/80 font-bold border border-coral-300 shadow-2xs"
                  icon={<Trash2 className="w-4 h-4 text-coral" />}
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete Account & All Personal Data
                </Button>
              ) : (
                <div className="p-4 bg-white rounded-lg border-2 border-coral-400 space-y-3 animate-fadeIn shadow-sm">
                  <div className="flex items-center gap-2 text-coral font-bold text-xs sm:text-sm">
                    <AlertTriangle className="w-4 h-4 text-coral flex-shrink-0" />
                    <span>Permanent Account Deletion Confirmation</span>
                  </div>

                  <p className="text-xs text-ink/90 leading-relaxed">
                    Are you sure you want to delete your account? The following data will be erased permanently from Cloud Firestore and cannot be recovered:
                  </p>

                  <ul className="text-xs text-ink/80 space-y-1 list-disc list-inside bg-coral-50/40 p-2.5 rounded border border-coral-100">
                    <li>Your volunteer profile details and login credentials</li>
                    <li>All dirty spots reported by you and their before/after photos</li>
                    <li>Your cleanup proof history, earned points, and certificates</li>
                    <li>All cached sessions across this and connected devices</li>
                  </ul>

                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-line">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isDeletingAccount}
                    >
                      Cancel
                    </Button>

                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      className="bg-coral hover:bg-coral-600 text-white border-coral font-bold"
                      onClick={handleConfirmDeleteAccount}
                      disabled={isDeletingAccount}
                      icon={isDeletingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    >
                      {isDeletingAccount ? 'Permanently Deleting...' : 'Yes, Delete Everything'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};
