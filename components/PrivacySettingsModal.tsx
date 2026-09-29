'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Eye,
  Lock,
  Mail,
  Phone,
  UserCheck,
  Users,
  CheckCircle2,
  Save,
  Loader2,
  Info,
} from 'lucide-react';

interface PrivacySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsSaved?: () => void;
}

export default function PrivacySettingsModal({
  isOpen,
  onClose,
  onSettingsSaved,
}: PrivacySettingsModalProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [settings, setSettings] = useState({
    profileVisibility: 'public', // 'public' | 'connections_only'
    showEmail: false,
    showPhone: false,
    allowConnectionRequests: true,
    availableToHelp: true,
    studyBuddyEnabled: true,
  });

  useEffect(() => {
    if (isOpen) {
      fetchPrivacySettings();
    } else {
      setSuccessMsg('');
      setErrorMsg('');
    }
  }, [isOpen]);

  const fetchPrivacySettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profile/privacy');
      const data = await res.json();
      if (res.ok && data.success) {
        setSettings(data.privacy);
      }
    } catch {
      setErrorMsg('Failed to load privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/profile/privacy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Privacy preferences updated successfully!');
        if (onSettingsSaved) onSettingsSaved();
        setTimeout(() => {
          setSuccessMsg('');
          onClose();
        }, 1200);
      } else {
        setErrorMsg(data.error || 'Failed to save settings');
      }
    } catch {
      setErrorMsg('Network error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-[#070b14] border border-cyan-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-dialog-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#0c1427]/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 id="privacy-dialog-title" className="font-heading font-bold text-base text-white">
                Privacy & Availability Settings
              </h3>
              <p className="text-xs text-slate-400">Control your visibility, study partner matching & contact sharing.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            aria-label="Close Privacy Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
              <span className="text-xs">Loading privacy preferences...</span>
            </div>
          ) : (
            <>
              {successMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <Shield className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Study & Help Availability Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase text-cyan-400 font-bold tracking-wider">
                  Matching & Collaboration Availability
                </h4>

                {/* Available to Help Students */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 font-semibold text-xs text-white">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <span>Appear in "People Who Can Help You"</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Allow other students to discover you when you have verified experience in their missing skills.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={settings.availableToHelp}
                      onChange={(e) => setSettings({ ...settings, availableToHelp: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                {/* Study Buddy Matchmaking */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 font-semibold text-xs text-white">
                      <Users className="w-4 h-4 text-cyan-400" />
                      <span>Study Buddy Matchmaking Enabled</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Match with peers learning the same topics for group study and interview practice.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={settings.studyBuddyEnabled}
                      onChange={(e) => setSettings({ ...settings, studyBuddyEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>
              </div>

              {/* Profile Visibility & Contact Sharing */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <h4 className="text-xs font-mono uppercase text-purple-400 font-bold tracking-wider">
                  Profile Visibility & Contact Protection
                </h4>

                {/* Profile Visibility */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white flex items-center gap-2">
                      <Eye className="w-4 h-4 text-purple-400" /> Profile Discovery Mode
                    </span>
                    <select
                      value={settings.profileVisibility}
                      onChange={(e) => setSettings({ ...settings, profileVisibility: e.target.value })}
                      className="bg-[#0c1427] border border-white/20 text-cyan-300 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-cyan-400"
                    >
                      <option value="public">Public (All CareerX Students)</option>
                      <option value="connections_only">Connections Only</option>
                    </select>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {settings.profileVisibility === 'public'
                      ? 'Your skills, projects, and academic background are visible in study searches.'
                      : 'Only students you have explicitly accepted can view your full profile and details.'}
                  </p>
                </div>

                {/* Show Email Toggle */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 font-semibold text-xs text-white">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>Share Email with Accepted Connections</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Never shared with strangers. If enabled, only accepted connections can see your email.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={settings.showEmail}
                      onChange={(e) => setSettings({ ...settings, showEmail: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                  </label>
                </div>

                {/* Show Phone Toggle */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 font-semibold text-xs text-white">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>Share Phone Number with Accepted Connections</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Never shared with strangers. If enabled, only accepted connections can see your phone number.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={settings.showPhone}
                      onChange={(e) => setSettings({ ...settings, showPhone: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                  </label>
                </div>
              </div>

              {/* Server Enforcement Note */}
              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex items-start gap-2 text-[11px] text-cyan-300">
                <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>
                  Privacy is enforced at the server API level. Redacted fields are permanently stripped from server responses before reaching client browsers.
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#0c1427]/90 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 disabled:opacity-40 transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Preferences
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
