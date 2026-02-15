'use client';

import { useState } from 'react';
import { AlertTriangle, Upload, X, Loader2, CheckCircle } from 'lucide-react';

interface ViolationReportFormProps {
  artworkId: string;
  artworkTitle: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const VIOLATION_TYPES = [
  { value: 'unauthorized_use', label: 'Unauthorized Use', description: 'My artwork is being used without permission' },
  { value: 'copyright_infringement', label: 'Copyright Infringement', description: 'Someone is claiming ownership of my work' },
  { value: 'ai_training', label: 'AI Training Dataset', description: 'My artwork is being used to train AI models' },
  { value: 'trademark', label: 'Trademark Violation', description: 'Misuse of my brand or trademark' },
  { value: 'impersonation', label: 'Impersonation', description: 'Someone is pretending to be me' },
  { value: 'other', label: 'Other', description: 'Other type of violation' },
];

export default function ViolationReportForm({
  artworkId,
  artworkTitle,
  onSuccess,
  onCancel,
}: ViolationReportFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    violationType: '',
    violationUrl: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/violations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artworkId,
          ...formData,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit report');
      }

      setIsSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Report Submitted Successfully
        </h3>
        <p className="text-white/70">
          We'll review your report and take appropriate action.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Artwork Info */}
      <div className="p-4 bg-white/5 rounded-lg">
        <div className="text-sm text-white/70 mb-1">Reporting violation for:</div>
        <div className="text-white font-semibold">{artworkTitle}</div>
      </div>

      {/* Violation Type */}
      <div>
        <label className="block text-sm font-medium text-white mb-3">
          Violation Type *
        </label>
        <div className="space-y-2">
          {VIOLATION_TYPES.map((type) => (
            <label
              key={type.value}
              className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                formData.violationType === type.value
                  ? 'border-cyan-500 bg-cyan-500/20'
                  : 'border-white/20 bg-white/5 hover:bg-white/10'
              }`}
            >
              <input
                type="radio"
                name="violationType"
                value={type.value}
                checked={formData.violationType === type.value}
                onChange={(e) =>
                  setFormData({ ...formData, violationType: e.target.value })
                }
                className="sr-only"
                required
              />
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-white">{type.label}</div>
                  <div className="text-sm text-white/70 mt-1">{type.description}</div>
                </div>
                {formData.violationType === type.value && (
                  <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Violation URL */}
      <div>
        <label htmlFor="violationUrl" className="block text-sm font-medium text-white mb-2">
          Violation URL
        </label>
        <input
          type="url"
          id="violationUrl"
          value={formData.violationUrl}
          onChange={(e) => setFormData({ ...formData, violationUrl: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder="https://example.com/stolen-artwork"
        />
        <p className="text-xs text-white/50 mt-1">
          Where did you find the violation? (Optional but helpful)
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
          Description *
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={6}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
          placeholder="Please provide details about the violation, including any evidence you have..."
          required
        />
        <p className="text-xs text-white/50 mt-1">
          {formData.description.length} / 1000 characters
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-5 h-5" />
              <span>Submit Report</span>
            </>
          )}
        </button>
      </div>

      {/* Info */}
      <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
        <p className="text-sm text-yellow-200">
          <strong>Note:</strong> False reports may result in account suspension. Please ensure
          your report is accurate and includes all relevant information.
        </p>
      </div>
    </form>
  );
}
