import React, { useState } from 'react';
import { X, Database, CheckCircle2, Copy, Sparkles, ExternalLink } from 'lucide-react';
import {
  getFirebaseConfig,
  saveLocalFirebaseConfig,
  clearLocalFirebaseConfig,
  isFirebaseConfigured,
  type FirebaseConfigParams,
} from '../firebase/config';

interface FirebaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseSetupModal: React.FC<FirebaseSetupModalProps> = ({ isOpen, onClose }) => {
  const currentConfig = getFirebaseConfig();

  const [apiKey, setApiKey] = useState(currentConfig?.apiKey || '');
  const [projectId, setProjectId] = useState(currentConfig?.projectId || '');
  const [authDomain, setAuthDomain] = useState(currentConfig?.authDomain || '');
  const [storageBucket, setStorageBucket] = useState(currentConfig?.storageBucket || '');
  const [appId, setAppId] = useState(currentConfig?.appId || '');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey || !projectId) {
      alert('Please enter at least an API Key and Project ID');
      return;
    }

    const newConfig: FirebaseConfigParams = {
      apiKey: apiKey.trim(),
      projectId: projectId.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      storageBucket: storageBucket.trim() || `${projectId.trim()}.appspot.com`,
      messagingSenderId: '',
      appId: appId.trim(),
    };

    saveLocalFirebaseConfig(newConfig);
    alert('Firebase configuration saved! The page will now reload to initialize Firebase.');
    window.location.reload();
  };

  const handleReset = () => {
    if (confirm('Clear custom Firebase configuration and revert to default?')) {
      clearLocalFirebaseConfig();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-lg border border-[#E3E3DC] shadow-modal overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E3E3DC] bg-[#F2F7F4]">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#2D513B]" />
            <div>
              <h2 className="text-base font-semibold text-[#14231A]">
                Connect 100% Free Firebase
              </h2>
              <p className="text-xs text-[#535A55]">
                Enables live real-time cloud sync, Google login & cloud database.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-[#7E8681] hover:text-[#181A19]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {/* Status Banner */}
          <div
            className={`p-3 rounded-md border flex items-center justify-between ${
              isFirebaseConfigured
                ? 'bg-[#E7EFEA] border-[#2D513B]/30 text-[#14231A]'
                : 'bg-[#FDF7F5] border-[#BA4A2B]/30 text-[#842D18]'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-current" />
              <span className="font-semibold">
                {isFirebaseConfigured ? 'Firebase Active & Connected' : 'Running in Offline / Local Mode'}
              </span>
            </div>
            {isFirebaseConfigured && (
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] underline text-[#842D18]"
              >
                Disconnect
              </button>
            )}
          </div>

          {/* Quick 3-Step Setup Instructions */}
          <div className="p-3.5 bg-[#F9F9F6] rounded-md border border-[#E3E3DC] space-y-2 text-[#535A55]">
            <p className="font-semibold text-[#181A19]">How to get free Firebase credentials (0 cost, no card):</p>
            <ol className="list-decimal list-inside space-y-1 text-[11px]">
              <li>
                Go to{' '}
                <a
                  href="https://console.firebase.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#2D513B] underline font-medium"
                >
                  console.firebase.google.com
                </a>{' '}
                and click <strong>"Add project"</strong>.
              </li>
              <li>
                Click the Web icon <code>&lt;/&gt;</code> to register an app.
              </li>
              <li>
                Under <strong>Authentication</strong>, enable <em>Email/Password</em> & <em>Google</em>. Under <strong>Firestore</strong>, create a database in test mode.
              </li>
              <li>Copy and paste the keys below:</li>
            </ol>
          </div>

          {/* Input Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#2C302D] mb-1">
                API Key <span className="text-[#BA4A2B]">*</span>
              </label>
              <input
                type="text"
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSyB..."
                className="w-full px-3 py-1.5 font-mono text-xs rounded bg-white border border-[#E3E3DC] focus:outline-none focus:ring-1 focus:ring-[#2D513B]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#2C302D] mb-1">
                  Project ID <span className="text-[#BA4A2B]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="garbagemedia-12345"
                  className="w-full px-3 py-1.5 font-mono text-xs rounded bg-white border border-[#E3E3DC] focus:outline-none focus:ring-1 focus:ring-[#2D513B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C302D] mb-1">
                  App ID
                </label>
                <input
                  type="text"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="1:123456:web:abcd"
                  className="w-full px-3 py-1.5 font-mono text-xs rounded bg-white border border-[#E3E3DC] focus:outline-none focus:ring-1 focus:ring-[#2D513B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2C302D] mb-1">
                Auth Domain (Optional)
              </label>
              <input
                type="text"
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                placeholder="garbagemedia.firebaseapp.com"
                className="w-full px-3 py-1.5 font-mono text-xs rounded bg-white border border-[#E3E3DC] focus:outline-none focus:ring-1 focus:ring-[#2D513B]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-[#E3E3DC]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-[#535A55] hover:text-[#181A19]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#2D513B] rounded hover:bg-[#233F2E] shadow-sm flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Save & Connect Firebase</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

