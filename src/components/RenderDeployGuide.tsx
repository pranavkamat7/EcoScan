import React from 'react';
import { X, CloudUpload, CheckCircle, ExternalLink, Terminal, Copy } from 'lucide-react';

interface RenderDeployGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RenderDeployGuide: React.FC<RenderDeployGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Copied "${text}" to clipboard!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-lg border border-[#E3E3DC] shadow-modal overflow-hidden my-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E3E3DC] bg-[#F2F7F4]">
          <div className="flex items-center gap-2">
            <CloudUpload className="w-5 h-5 text-[#2D513B]" />
            <div>
              <h2 className="text-base font-semibold text-[#14231A]">
                Host for 100% Free on Render
              </h2>
              <p className="text-xs text-[#535A55]">
                Zero cost, no credit card required, instant deployment.
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

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs sm:text-sm text-[#2C302D]">
          <div className="p-3 bg-[#F9F9F6] rounded border border-[#E3E3DC]">
            <p className="font-medium text-[#181A19] mb-1">
              Why Render "Static Site" is 100% Free Forever:
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-xs text-[#535A55]">
              <li>Never goes to sleep (unlike free backend web services that spin down).</li>
              <li>Free automated SSL certificate + custom domains support.</li>
              <li>Continuous deployments directly from your GitHub repository.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-[#181A19]">
              Step-by-Step Instructions:
            </h4>

            {/* Step 1 */}
            <div className="flex gap-3 items-start">
              <span className="w-6 h-6 rounded-full bg-[#181A19] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                1
              </span>
              <div>
                <p className="font-semibold text-[#181A19]">Push this project to GitHub</p>
                <p className="text-xs text-[#535A55] mt-0.5">
                  Initialize git, commit all files, and push to a new public or private repository
                  on GitHub.
                </p>
                <div className="mt-1.5 p-2 bg-[#181A19] text-[#CACECB] rounded font-mono text-[11px] flex justify-between items-center">
                  <span>git init && git add . && git commit -m "initial commit"</span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        'git init && git add . && git commit -m "initial commit"'
                      )
                    }
                    className="text-white hover:text-gray-300 ml-2"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-3 items-start">
              <span className="w-6 h-6 rounded-full bg-[#181A19] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                2
              </span>
              <div>
                <p className="font-semibold text-[#181A19]">Open Render Dashboard</p>
                <p className="text-xs text-[#535A55] mt-0.5">
                  Go to{' '}
                  <a
                    href="https://render.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#2D513B] underline font-medium"
                  >
                    render.com
                  </a>
                  , sign in with GitHub for free, click <strong>"New +"</strong> and choose{' '}
                  <strong className="text-[#2D513B]">"Static Site"</strong>.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-3 items-start">
              <span className="w-6 h-6 rounded-full bg-[#181A19] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                3
              </span>
              <div className="w-full">
                <p className="font-semibold text-[#181A19]">Configure Build Settings</p>
                <div className="mt-1.5 bg-[#F9F9F6] p-2.5 rounded border border-[#E3E3DC] space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#7E8681]">Build Command:</span>
                    <span className="font-mono font-semibold text-[#181A19] bg-white px-2 py-0.5 rounded border border-[#E3E3DC]">
                      npm run build
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#7E8681]">Publish Directory:</span>
                    <span className="font-mono font-semibold text-[#181A19] bg-white px-2 py-0.5 rounded border border-[#E3E3DC]">
                      dist
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-3 items-start">
              <span className="w-6 h-6 rounded-full bg-[#181A19] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                4
              </span>
              <div>
                <p className="font-semibold text-[#181A19]">Hit "Create Static Site"</p>
                <p className="text-xs text-[#535A55] mt-0.5">
                  Render will build Vite and provide a permanent free live URL (e.g.{' '}
                  <code>https://spotclean.onrender.com</code>).
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-[#E3E3DC]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-white bg-[#2D513B] rounded-md hover:bg-[#233F2E]"
            >
              Got it, close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

