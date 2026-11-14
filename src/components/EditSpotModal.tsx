import React, { useState, useEffect } from 'react';
import { Camera, Sparkles, Loader2, Save, X } from 'lucide-react';
import type { Spot, SeverityLevel } from '../types';
import { compressImageFile } from '../utils/imageCompressor';
import { Modal, Input, Textarea, Button, Badge } from './ui';

interface EditSpotModalProps {
  spot: Spot | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSpot: Spot) => Promise<void>;
}

export const EditSpotModal: React.FC<EditSpotModalProps> = ({
  spot,
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<SeverityLevel>('medium');
  const [estimatedKg, setEstimatedKg] = useState<number>(10);
  const [tagsInput, setTagsInput] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (spot) {
      setTitle(spot.title || '');
      setDescription(spot.description || '');
      setSeverity(spot.severity || 'medium');
      setEstimatedKg(spot.estimatedWasteKg || 10);
      setTagsInput((spot.tags || []).join(', '));
      setPhotoUrl(spot.beforePhotoUrl || '');
    }
  }, [spot, isOpen]);

  if (!spot) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsCompressingPhoto(true);
        const compressed = await compressImageFile(file, 1200, 0.75);
        setPhotoUrl(compressed);
      } catch (err) {
        console.warn('Fallback reading photo:', err);
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) setPhotoUrl(event.target.result as string);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsCompressingPhoto(false);
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || !spot) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    let bounty = 200;
    if (severity === 'high') bounty = 350;
    else if (severity === 'low') bounty = 100;

    const updatedSpot: Spot = {
      ...spot,
      title: title.trim(),
      description: description.trim(),
      severity,
      rewardPoints: bounty,
      estimatedWasteKg: estimatedKg,
      tags: tags.length > 0 ? tags : ['Litter'],
      beforePhotoUrl: photoUrl || spot.beforePhotoUrl,
    };

    try {
      setIsSaving(true);
      await onSave(updatedSpot);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Reported Spot"
      description="Update spot title, severity, estimated waste, or description."
      size="md"
      footer={
        <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            form="edit-spot-form"
            type="submit"
            variant="primary"
            size="md"
            className="flex-1 sm:flex-initial"
            disabled={!title.trim() || isSaving || isCompressingPhoto}
            onClick={(e) => {
              if (title.trim() && !isSaving && !isCompressingPhoto) {
                handleSubmit(e);
              }
            }}
            icon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      }
    >
      <form id="edit-spot-form" onSubmit={handleSubmit} className="space-y-4 text-left">
        {/* Photo Preview & Change */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-navy">
            Before Spot Photo
          </label>
          <div className="relative aspect-[16/9] rounded-sm overflow-hidden border border-line bg-navy-50/50">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Spot condition"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-muted">
                No photo selected
              </div>
            )}
            <label className="absolute bottom-2.5 right-2.5 px-3 py-1.5 rounded-sm bg-white/95 text-navy border border-line text-xs font-semibold hover:bg-white cursor-pointer shadow-sm flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-emerald" />
              <span>{isCompressingPhoto ? 'Optimizing...' : 'Replace Photo'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={isCompressingPhoto}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Title */}
        <Input
          label="Spot Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Park Walkway Plastic Litter"
          required
        />

        {/* Description */}
        <Textarea
          label="Description & Landmarks"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detail the waste accumulation..."
          rows={3}
        />

        {/* Severity & Waste Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-navy">
              Severity Level
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['low', 'medium', 'high'] as SeverityLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSeverity(level)}
                  className={`py-2 text-xs font-semibold rounded-sm capitalize border transition-colors ${
                    severity === level
                      ? level === 'high'
                        ? 'bg-coral text-white border-coral font-bold'
                        : level === 'medium'
                        ? 'bg-amber-500 text-white border-amber-500 font-bold'
                        : 'bg-emerald text-white border-emerald font-bold'
                      : 'bg-white text-navy border-line hover:border-line-strong'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-navy">
              Est. Waste (kg)
            </label>
            <input
              type="number"
              min={1}
              max={500}
              value={estimatedKg}
              onChange={(e) => setEstimatedKg(Number(e.target.value) || 10)}
              className="w-full h-10 rounded-sm bg-white text-navy text-sm px-3 border border-line outline-none focus:ring-2 focus:ring-emerald focus:border-emerald tabular-nums"
            />
          </div>
        </div>

        {/* Tags */}
        <Input
          label="Tags (comma separated)"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="Beach, Plastics, High Traffic"
        />
      </form>
    </Modal>
  );
};
