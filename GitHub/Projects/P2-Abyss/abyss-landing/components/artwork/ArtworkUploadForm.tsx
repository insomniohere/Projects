'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Image as ImageIcon, FileText, Shield, Eye, Loader2, X, Check } from 'lucide-react';

const CATEGORIES = [
  'Digital Art',
  'Painting',
  'Photography',
  '3D Art',
  'Illustration',
  'Sculpture',
  'Mixed Media',
  'Other',
];

const PROTECTION_LEVELS = [
  { value: 'basic', label: 'Basic', description: 'Standard watermark' },
  { value: 'standard', label: 'Standard', description: 'Multiple watermarks + metadata' },
  { value: 'enhanced', label: 'Enhanced', description: 'Maximum protection with quality reduction' },
];

const LICENSE_TYPES = [
  { value: 'all-rights-reserved', label: 'All Rights Reserved' },
  { value: 'cc-by', label: 'CC BY (Attribution)' },
  { value: 'cc-by-nc', label: 'CC BY-NC (Attribution-NonCommercial)' },
  { value: 'cc-by-sa', label: 'CC BY-SA (Attribution-ShareAlike)' },
];

type Step = 'select' | 'metadata' | 'protection' | 'review';

export default function ArtworkUploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('select');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: [] as string[],
    protectionLevel: 'standard',
    licenseType: 'all-rights-reserved',
    status: 'published' as 'draft' | 'published',
  });
  const [tagInput, setTagInput] = useState('');

  // Handle file selection
  const handleFileSelect = (file: File) => {
    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    setStep('metadata');
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  // Add tag
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      // Create FormData for file upload
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('category', formData.category);
      uploadFormData.append('tags', JSON.stringify(formData.tags));
      uploadFormData.append('protectionLevel', formData.protectionLevel);
      uploadFormData.append('licenseType', formData.licenseType);
      uploadFormData.append('status', formData.status);

      const response = await fetch('/api/artworks', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();

      // Redirect to gallery
      router.push('/gallery');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setIsUploading(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 'select':
        return (
          <div
            className="border-2 border-dashed border-white/20 rounded-xl p-12 text-center hover:border-cyan-500 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Drop your artwork here
            </h3>
            <p className="text-white/70 mb-4">
              or click to browse (JPEG, PNG, WEBP, max 10MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
          </div>
        );

      case 'metadata':
        return (
          <div className="space-y-6">
            {/* Preview */}
            {previewUrl && (
              <div className="relative aspect-video bg-black/50 rounded-lg overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Give your artwork a title"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                placeholder="Describe your artwork..."
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              >
                <option value="" disabled>Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat.toLowerCase().replace(' ', '-')}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Add tags..."
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white/10 rounded-full text-sm text-white flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep('select')}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep('protection')}
                disabled={!formData.title || !formData.category}
                className="flex-1 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Protection Settings
              </button>
            </div>
          </div>
        );

      case 'protection':
        return (
          <div className="space-y-6">
            {/* Protection Level */}
            <div>
              <label className="block text-sm font-medium text-white mb-4">
                Protection Level *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PROTECTION_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, protectionLevel: level.value })}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      formData.protectionLevel === level.value
                        ? 'border-cyan-500 bg-cyan-500/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-white">{level.label}</span>
                      {formData.protectionLevel === level.value && (
                        <Check className="w-5 h-5 text-cyan-400" />
                      )}
                    </div>
                    <p className="text-sm text-white/70">{level.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* License Type */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                License Type *
              </label>
              <select
                value={formData.licenseType}
                onChange={(e) => setFormData({ ...formData, licenseType: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              >
                {LICENSE_TYPES.map((license) => (
                  <option key={license.value} value={license.value}>
                    {license.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Visibility
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: 'draft' })}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    formData.status === 'draft'
                      ? 'border-cyan-500 bg-cyan-500/20'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="font-semibold text-white mb-1">Save as Draft</div>
                  <div className="text-sm text-white/70">Only you can see it</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: 'published' })}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    formData.status === 'published'
                      ? 'border-cyan-500 bg-cyan-500/20'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="font-semibold text-white mb-1">Publish</div>
                  <div className="text-sm text-white/70">Make it public</div>
                </button>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep('metadata')}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep('review')}
                className="flex-1 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
              >
                Review & Upload
              </button>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            {/* Preview */}
            {previewUrl && (
              <div className="relative aspect-video bg-black/50 rounded-lg overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {/* Summary */}
            <div className="bg-white/5 rounded-lg p-6 space-y-4">
              <div>
                <div className="text-sm text-white/70">Title</div>
                <div className="text-white font-semibold">{formData.title}</div>
              </div>
              <div>
                <div className="text-sm text-white/70">Category</div>
                <div className="text-white">{formData.category}</div>
              </div>
              <div>
                <div className="text-sm text-white/70">Protection</div>
                <div className="text-white capitalize">{formData.protectionLevel}</div>
              </div>
              <div>
                <div className="text-sm text-white/70">License</div>
                <div className="text-white">{LICENSE_TYPES.find(l => l.value === formData.licenseType)?.label}</div>
              </div>
              {formData.tags.length > 0 && (
                <div>
                  <div className="text-sm text-white/70 mb-2">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-white/10 rounded-full text-sm text-white">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
                {error}
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep('protection')}
                disabled={isUploading}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>Upload Artwork</span>
                  </>
                )}
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { key: 'select', label: 'Select Image', icon: ImageIcon },
            { key: 'metadata', label: 'Details', icon: FileText },
            { key: 'protection', label: 'Protection', icon: Shield },
            { key: 'review', label: 'Review', icon: Eye },
          ].map((s, index) => {
            const Icon = s.icon;
            const isCurrent = step === s.key;
            const isCompleted = ['select', 'metadata', 'protection', 'review'].indexOf(step) > index;

            return (
              <div key={s.key} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                    isCurrent || isCompleted
                      ? 'border-cyan-500 bg-cyan-500 text-white'
                      : 'border-white/20 bg-white/5 text-white/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="ml-2 text-sm font-medium text-white hidden md:block">
                  {s.label}
                </div>
                {index < 3 && (
                  <div
                    className={`w-12 md:w-24 h-0.5 mx-2 ${
                      isCompleted ? 'bg-cyan-500' : 'bg-white/20'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-8">
        {renderStepContent()}
      </div>
    </div>
  );
}
