'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/auth/AuthProvider';

interface StudyNote {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string;
  sort_order: number;
}

function NoteCard({
  note,
  isPremium,
  isSuperuser,
  onDelete,
}: {
  note: StudyNote;
  isPremium: boolean;
  isSuperuser: boolean;
  onDelete: (id: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = note.image_url;
    link.download = `${note.title.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div
        className="relative rounded-xl overflow-hidden cursor-pointer"
        style={{
          transition: 'box-shadow 0.3s ease',
          background: 'linear-gradient(180deg, rgba(15, 20, 35, 0.95) 0%, rgba(10, 14, 26, 0.95) 100%)',
          border: isHovered
            ? isPremium
              ? '1px solid rgba(255, 216, 0, 0.3)'
              : '1px solid rgba(103, 232, 249, 0.3)'
            : '1px solid rgba(103, 232, 249, 0.12)',
          boxShadow: isHovered
            ? isPremium
              ? '0 0 30px rgba(255, 216, 0, 0.15), 0 10px 40px rgba(0, 0, 0, 0.4)'
              : '0 0 30px rgba(103, 232, 249, 0.15), 0 10px 40px rgba(0, 0, 0, 0.4)'
            : '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => isPremium && setIsViewing(true)}
      >
        {/* Delete Button for Superusers */}
        {isSuperuser && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete "${note.title}"?`)) {
                onDelete(note.id);
              }
            }}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-[#f87171]/20"
            style={{
              background: 'rgba(248, 113, 113, 0.15)',
              border: '1px solid rgba(248, 113, 113, 0.3)',
            }}
          >
            <svg className="w-4 h-4 text-[#f87171]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}

        {/* Category Badge */}
        <div
          className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
          style={{
            background: 'rgba(103, 232, 249, 0.15)',
            color: '#67e8f9',
            border: '1px solid rgba(103, 232, 249, 0.2)',
          }}
        >
          {note.category}
        </div>

        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={note.image_url}
            alt={note.title}
            fill
            className={`object-cover transition-all duration-500 ${
              isPremium ? (isHovered ? 'scale-105' : 'scale-100') : 'blur-sm scale-100'
            }`}
          />

          {/* Gradient Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: isPremium
                ? 'linear-gradient(180deg, transparent 40%, rgba(10, 14, 26, 0.95) 100%)'
                : 'linear-gradient(180deg, rgba(10, 14, 26, 0.5) 0%, rgba(10, 14, 26, 0.95) 100%)',
            }}
          />

          {/* Lock Overlay for Non-Premium */}
          {!isPremium && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(255, 216, 0, 0.15)',
                  border: '2px solid rgba(255, 216, 0, 0.3)',
                  boxShadow: '0 0 30px rgba(255, 216, 0, 0.2)',
                }}
              >
                <svg
                  className="w-7 h-7 text-[#ffd800]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Divider line */}
        <div
          style={{
            height: '1px',
            background: 'rgba(255, 255, 255, 0.1)',
          }}
        />

        {/* Content */}
        <div style={{ padding: '28px 28px 28px 28px' }}>
          <h3 className="text-white font-semibold text-lg mb-3">{note.title}</h3>
          <p className="text-[#6b7a90] text-sm leading-relaxed">{note.description}</p>

          {/* Action Button */}
          <div
            style={{ marginTop: '24px', marginLeft: '12px', marginRight: '12px' }}
          >
            {isPremium ? (
              <button
                className="w-full py-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
                style={{
                  background: isHovered
                    ? 'linear-gradient(135deg, rgba(103, 232, 249, 0.15) 0%, rgba(30, 150, 252, 0.1) 100%)'
                    : 'rgba(103, 232, 249, 0.08)',
                  color: '#67e8f9',
                  border: '1px solid rgba(103, 232, 249, 0.2)',
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                View Study Material
              </button>
            ) : (
              <div
                className="w-full py-3 rounded-lg text-sm font-medium text-center"
                style={{
                  background: 'rgba(255, 216, 0, 0.08)',
                  color: '#ffd800',
                  border: '1px solid rgba(255, 216, 0, 0.2)',
                }}
              >
                Pro Members Only
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {isViewing && isPremium && (
        <div
          className="fixed inset-0 z-[100] overflow-y-auto"
          style={{ background: 'rgba(0, 0, 0, 0.95)' }}
          onClick={() => { setIsViewing(false); setZoom(1); }}
        >
          {/* Top right controls - fixed position */}
          <div className="fixed top-6 right-6 z-[110] flex items-center gap-3">
            {/* Zoom controls */}
            <div
              className="flex items-center gap-1 px-2 py-1.5 rounded-full"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all disabled:opacity-40"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <button
                className="px-3 py-1 text-white text-sm font-medium hover:bg-white/10 rounded-full transition-all"
                onClick={handleResetZoom}
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all disabled:opacity-40"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Close button */}
            <button
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white/10"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              onClick={() => { setIsViewing(false); setZoom(1); }}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Download button - bottom right */}
          <button
            className="fixed bottom-6 right-6 z-[110] flex items-center gap-2 px-5 py-3 rounded-full transition-all duration-200 hover:bg-white/15"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
            onClick={(e) => { e.stopPropagation(); handleDownload(); }}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="text-white text-sm font-medium">Download</span>
          </button>

          {/* Scrollable content */}
          <div
            className="min-h-full pt-24 pb-20 px-4 overflow-x-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title */}
            <div className="text-center mb-6">
              <h3 className="text-white font-semibold text-2xl">{note.title}</h3>
              <p className="text-[#67e8f9] text-sm mt-2">{note.category}</p>
            </div>

            {/* Image with zoom */}
            <div className="flex justify-center">
              <Image
                src={note.image_url}
                alt={note.title}
                width={1200}
                height={1600}
                className="rounded-xl"
                style={{
                  width: `${zoom * 100}%`,
                  maxWidth: `${zoom * 900}px`,
                  height: 'auto',
                  boxShadow: '0 0 60px rgba(103, 232, 249, 0.15)',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AddNoteModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (note: { title: string; description: string; category: string; image_url: string }) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/notes/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.url) {
        setImageUrl(data.url);
      } else {
        alert(data.error || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !category || !imageUrl) return;

    setSaving(true);
    await onAdd({ title, description, category, image_url: imageUrl });
    setSaving(false);
    setTitle('');
    setDescription('');
    setCategory('');
    setImageUrl('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.8)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(15, 20, 35, 0.98) 0%, rgba(10, 14, 26, 0.98) 100%)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          boxShadow: '0 0 60px rgba(168, 85, 247, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="py-6 border-b flex items-center justify-between"
          style={{ paddingLeft: '28px', paddingRight: '28px', borderColor: 'rgba(168, 85, 247, 0.2)' }}
        >
          <h2
            className="text-xl font-bold"
            style={{
              background: 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Add Study Note
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6b7a90] hover:text-white hover:bg-white/10 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6" style={{ padding: '28px' }}>
          <div>
            <label className="block text-[#a855f7] text-sm font-medium mb-3">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., The Four Elements"
              className="w-full py-3 rounded-xl bg-[#0a0e1a] border border-[#a855f7]/20 text-white placeholder-[#4a5568] focus:outline-none focus:border-[#a855f7]/50 transition-colors"
              style={{ paddingLeft: '7px', paddingRight: '7px' }}
              required
            />
          </div>

          <div>
            <label className="block text-[#a855f7] text-sm font-medium mb-3">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the study material..."
              rows={3}
              className="w-full py-3 rounded-xl bg-[#0a0e1a] border border-[#a855f7]/20 text-white placeholder-[#4a5568] focus:outline-none focus:border-[#a855f7]/50 transition-colors resize-none"
              style={{ paddingLeft: '7px', paddingRight: '7px' }}
              required
            />
          </div>

          <div>
            <label className="block text-[#a855f7] text-sm font-medium mb-3">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Fundamentals, Aspects, Houses"
              className="w-full py-3 rounded-xl bg-[#0a0e1a] border border-[#a855f7]/20 text-white placeholder-[#4a5568] focus:outline-none focus:border-[#a855f7]/50 transition-colors"
              style={{ paddingLeft: '7px', paddingRight: '7px' }}
              required
            />
          </div>

          <div>
            <label className="block text-[#a855f7] text-sm font-medium mb-3">Image</label>

            {/* File Upload Button */}
            <label
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium cursor-pointer transition-all duration-200 mb-3 ${
                uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#a855f7]/20'
              }`}
              style={{
                background: 'rgba(168, 85, 247, 0.1)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                color: '#a855f7',
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              {uploading ? 'Uploading...' : 'Choose File from PC'}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>

            {/* Manual URL Input */}
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Or paste image URL..."
              className="w-full py-3 rounded-xl bg-[#0a0e1a] border border-[#a855f7]/20 text-white placeholder-[#4a5568] focus:outline-none focus:border-[#a855f7]/50 transition-colors"
              style={{ paddingLeft: '7px', paddingRight: '7px' }}
              required
            />
            <p className="text-[#6b7a90] text-xs mt-2">
              Upload an image or enter a URL manually
            </p>
          </div>

          {/* Preview */}
          {imageUrl && (
            <div className="rounded-xl overflow-hidden border border-[#a855f7]/20">
              <div className="relative aspect-video bg-[#0a0e1a]">
                <Image
                  src={imageUrl}
                  alt="Preview"
                  fill
                  className="object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-medium text-[#6b7a90] hover:text-white transition-colors"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !title || !description || !category || !imageUrl}
              className="flex-1 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)',
              }}
            >
              {saving ? 'Adding...' : 'Add Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NotesPage() {
  const { isPremium, isSuperuser, isLoading } = useAuth();
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch notes from API
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch('/api/notes');
        if (response.ok) {
          const data = await response.json();
          setNotes(data.notes || []);
        } else {
          setNotes([]);
        }
      } catch (error) {
        console.error('Failed to fetch notes:', error);
        setNotes([]);
      } finally {
        setLoadingNotes(false);
      }
    };

    fetchNotes();
  }, []);

  const handleAddNote = async (noteData: { title: string; description: string; category: string; image_url: string }) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData),
      });

      if (response.ok) {
        const data = await response.json();
        setNotes((prev) => [...prev, data.note]);
      }
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const response = await fetch(`/api/notes?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-[#67e8f9]/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#ffd800] animate-spin" />
            <div className="absolute inset-2 rounded-full border border-[#67e8f9]/10" />
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,216,0,0.1) 0%, transparent 70%)',
              }}
            />
          </div>
          <p className="text-[#67e8f9] text-sm tracking-wider animate-pulse">
            Gathering celestial knowledge...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          marginTop: '20px',
          marginLeft: '5px',
          marginRight: '5px',
          background: 'linear-gradient(180deg, rgba(15, 20, 35, 0.95) 0%, rgba(10, 14, 26, 0.95) 100%)',
          border: '1px solid rgba(103, 232, 249, 0.15)',
          boxShadow: '0 4px 40px rgba(0, 0, 0, 0.4), 0 0 60px rgba(103, 232, 249, 0.08)',
        }}
      >
        {/* Decorative Background */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% 0%, rgba(103, 232, 249, 0.12) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 80% 100%, rgba(255, 216, 0, 0.06) 0%, transparent 50%)
            `,
          }}
        />

        <div className="relative" style={{ padding: '40px 36px' }}>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{
                  background: isPremium
                    ? 'linear-gradient(135deg, rgba(255, 216, 0, 0.15) 0%, rgba(255, 184, 0, 0.08) 100%)'
                    : 'linear-gradient(135deg, rgba(103, 232, 249, 0.15) 0%, rgba(30, 150, 252, 0.08) 100%)',
                  border: isPremium ? '1px solid rgba(255, 216, 0, 0.2)' : '1px solid rgba(103, 232, 249, 0.2)',
                  boxShadow: isPremium
                    ? '0 0 20px rgba(255, 216, 0, 0.15)'
                    : '0 0 20px rgba(103, 232, 249, 0.15)',
                }}
              >
                <svg
                  className={`w-7 h-7 ${isPremium ? 'text-[#ffd800]' : 'text-[#67e8f9]'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div>
                <h1 className="font-cinzel text-2xl md:text-3xl text-white tracking-wide">
                  Study Notes
                </h1>
                <p className="text-[#6b7a90] text-sm mt-1">
                  {isPremium
                    ? 'Your celestial knowledge library'
                    : 'Unlock premium study materials'}
                </p>
              </div>
            </div>

            {/* Superuser Add Button */}
            {isSuperuser && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-[1.02]"
                style={{
                  marginRight: '12px',
                  paddingLeft: '24px',
                  paddingRight: '24px',
                  background: 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)',
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Note
              </button>
            )}
          </div>

          {/* Premium Badge or Upgrade CTA */}
          {isPremium ? (
            <div
              className="inline-flex items-center gap-2 py-2 rounded-full text-xs font-semibold"
              style={{
                marginTop: '8px',
                marginLeft: '2px',
                paddingLeft: '14px',
                paddingRight: '16px',
                background: 'linear-gradient(135deg, rgba(255, 216, 0, 0.15) 0%, rgba(255, 184, 0, 0.08) 100%)',
                color: '#ffd800',
                border: '1px solid rgba(255, 216, 0, 0.25)',
              }}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              Full Access Unlocked
            </div>
          ) : (
            <div
              className="rounded-xl"
              style={{
                marginTop: '24px',
                padding: '20px 28px',
                background: 'linear-gradient(135deg, rgba(255, 216, 0, 0.08) 0%, rgba(255, 184, 0, 0.03) 100%)',
                border: '1px solid rgba(255, 216, 0, 0.2)',
              }}
            >
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <svg className="w-4 h-4 text-[#ffd800]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                    <span className="text-[#ffd800] font-semibold">Upgrade to Pro</span>
                  </div>
                  <p className="text-[#a1a1aa] text-sm">
                    Get full access to all study materials and future additions
                  </p>
                </div>
                <Link
                  href="/pricing"
                  className="flex-shrink-0 py-3 rounded-lg text-sm font-semibold text-[#0a0e1a] bg-gradient-to-r from-[#ffd800] to-[#ffb800] transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,216,0,0.4)] hover:scale-[1.02]"
                  style={{ paddingLeft: '28px', paddingRight: '28px' }}
                >
                  View Plans
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notes Grid */}
      {loadingNotes ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#67e8f9] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          style={{ marginLeft: '12px', marginRight: '12px', marginTop: '12px' }}
        >
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isPremium={isPremium}
              isSuperuser={isSuperuser}
              onDelete={handleDeleteNote}
            />
          ))}
        </div>
      )}

      {/* Coming Soon Section */}
      <div
        className="rounded-2xl py-10 px-8 text-center"
        style={{
          marginLeft: '12px',
          marginRight: '12px',
          marginBottom: '20px',
          marginTop: '12px',
          background: 'linear-gradient(180deg, rgba(15, 20, 35, 0.9) 0%, rgba(10, 14, 26, 0.9) 100%)',
          border: '1px dashed rgba(103, 232, 249, 0.2)',
        }}
      >
        <h3 className="text-white font-medium text-lg mb-3">More Coming Soon</h3>
        <p className="text-[#6b7a90] text-sm leading-relaxed" style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
          We&apos;re continuously adding new study materials covering aspects, houses, planetary dignities, and more.
        </p>
      </div>

      {/* Add Note Modal */}
      <AddNoteModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddNote}
      />
    </div>
  );
}
