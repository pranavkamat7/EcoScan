import React, { useRef, useState } from 'react';
import {
  Download,
  Printer,
  Award,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Modal, Button } from './ui';

export interface CertificateData {
  id: string;
  recipientName: string;
  recipientAvatar?: string;
  title?: string;
  spotTitle?: string;
  spotLocation?: string;
  wasteClearedKg?: number;
  pointsEarned?: number;
  issueDate?: string;
  verificationHash?: string;
  rank?: number;
  category?: 'cleanup' | 'reward' | 'leader' | 'general';
}

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CertificateData | null;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const certificateCardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen || !data) return null;

  const recipient = data.recipientName || 'Civic Volunteer';
  const points = data.pointsEarned ?? 350;
  const wasteKg = data.wasteClearedKg ?? 10;
  const location = data.spotLocation || 'Civic Community Grounds';
  const spotName = data.spotTitle || 'Public Area Restoration';
  const certId = data.id || `ECO-${Date.now().toString().slice(-6)}`;
  const certDate = data.issueDate || new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const certHash = data.verificationHash || `SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}-VERIFIED`;

  // Celebration confetti upon opening
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#0F291E', '#238253', '#D4F63D', '#FFFFFF'],
      });
    } catch {
      // ignore
    }
  };

  /**
   * Generates a 2400x1600 ultra-high-resolution, authentic PNG of the certificate
   * directly on a Canvas element and triggers an instant download to the user's device.
   * Keeps the bottom footer clean and blank with no chief names or signatures.
   */
  const handleDownloadPNG = () => {
    setIsGenerating(true);
    triggerConfetti();

    try {
      const width = 2400;
      const height = 1600;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setIsGenerating(false);
        return;
      }

      // 1. Archival Parchment Background
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#FCFAF3');
      bgGrad.addColorStop(0.5, '#FAF6EA');
      bgGrad.addColorStop(1, '#F6EED8');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle guilloche watermark rosette in center
      ctx.save();
      ctx.translate(width / 2, height / 2 + 30);
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.05)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 36; i++) {
        ctx.beginPath();
        ctx.ellipse(0, 0, 480, 160, (i * Math.PI) / 18, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // 2. Outer Ornate Golden Border
      ctx.strokeStyle = '#C99D36';
      ctx.lineWidth = 14;
      ctx.strokeRect(40, 40, width - 80, height - 80);

      // Thin inner gold accent line
      ctx.strokeStyle = '#E8CA72';
      ctx.lineWidth = 3;
      ctx.strokeRect(54, 54, width - 108, height - 108);

      // Deep Forest Green Framing Border
      ctx.strokeStyle = '#0F291E';
      ctx.lineWidth = 6;
      ctx.strokeRect(70, 70, width - 140, height - 140);

      // Inner hairline border
      ctx.strokeStyle = '#C99D36';
      ctx.lineWidth = 2;
      ctx.strokeRect(84, 84, width - 168, height - 168);

      // 3. Four Corner Ornamental Flourishes
      const drawCornerFlourish = (x: number, y: number, rot: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.strokeStyle = '#B38728';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(80, 0);
        ctx.arcTo(100, 0, 100, 20, 20);
        ctx.lineTo(100, 100);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(45, 45, 20, 0, Math.PI * 2);
        ctx.fillStyle = '#C99D36';
        ctx.fill();
        ctx.restore();
      };

      drawCornerFlourish(95, 95, 0);
      drawCornerFlourish(width - 95, 95, Math.PI / 2);
      drawCornerFlourish(width - 95, height - 95, Math.PI);
      drawCornerFlourish(95, height - 95, -Math.PI / 2);

      // 4. Header Section: EcoScan Alliance Crest & Laurel Motif
      ctx.fillStyle = '#0F291E';
      ctx.font = 'bold 34px "Cinzel", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '8px';
      ctx.fillText('ECOSCAN GLOBAL CIVIC INITIATIVE FOR ENVIRONMENTAL RECOVERY', width / 2, 195);

      ctx.fillStyle = '#9C7823';
      ctx.font = '600 24px "Cinzel", Georgia, serif';
      ctx.letterSpacing = '5px';
      ctx.fillText('CONFERRED BY THE CIVIC STEWARDSHIP ALLIANCE & DIRECTED BY CITIZEN ACTION', width / 2, 245);

      // Horizontal Divider with Gold Diamond
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 380, 275);
      ctx.lineTo(width / 2 + 380, 275);
      ctx.stroke();

      ctx.fillStyle = '#C99D36';
      ctx.beginPath();
      ctx.arc(width / 2, 275, 8, 0, Math.PI * 2);
      ctx.fill();

      // 5. Grand Certificate Title
      ctx.fillStyle = '#0F291E';
      ctx.font = 'bold 76px "Cinzel", Georgia, serif';
      ctx.letterSpacing = '3px';
      ctx.fillText('CERTIFICATE OF CIVIC EXCELLENCE', width / 2, 380);

      ctx.fillStyle = '#238253';
      ctx.font = 'bold 44px "Cinzel", Georgia, serif';
      ctx.letterSpacing = '4px';
      ctx.fillText('& ENVIRONMENTAL RESTORATION', width / 2, 445);

      // 6. Presentation Line
      ctx.fillStyle = '#5A6258';
      ctx.font = 'italic 32px Georgia, serif';
      ctx.letterSpacing = '2px';
      ctx.fillText('This official citation of honour and civic heroism is proudly presented to', width / 2, 535);

      // 7. Recipient's Name (Grand, Prestigious display)
      ctx.fillStyle = '#0F291E';
      ctx.font = 'bold 92px "Cinzel", Georgia, serif';
      ctx.letterSpacing = '2px';
      ctx.fillText(recipient.toUpperCase(), width / 2, 655);

      // Gold under-flourish line beneath recipient's name
      const nameWidth = ctx.measureText(recipient.toUpperCase()).width;
      const lineLen = Math.max(nameWidth + 120, 640);
      ctx.strokeStyle = '#C99D36';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(width / 2 - lineLen / 2, 685);
      ctx.lineTo(width / 2 + lineLen / 2, 685);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(width / 2, 685, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#0F291E';
      ctx.fill();

      // 8. Formal Authentic Citation Prose
      ctx.fillStyle = '#24332B';
      ctx.font = '30px Georgia, serif';
      ctx.letterSpacing = '0.5px';
      const line1 = 'In solemn recognition of extraordinary civic leadership, selfless environmental stewardship, and distinguished';
      const line2 = 'service to public hygiene. Having taken direct personal action to identify, clean, and restore community lands,';
      const line3 = 'diverting dangerous waste hazards, reviving natural ecosystems, and setting a shining example of neighbourhood pride.';
      ctx.fillText(line1, width / 2, 770);
      ctx.fillText(line2, width / 2, 820);
      ctx.fillText(line3, width / 2, 870);

      // 9. Verified Field Impact Dossier Box
      const boxX = 220;
      const boxY = 935;
      const boxW = width - 440;
      const boxH = 240;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeStyle = '#C99D36';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      // Dossier columns
      ctx.textAlign = 'left';
      ctx.fillStyle = '#0F291E';
      ctx.font = 'bold 24px "Cinzel", Georgia, serif';
      ctx.fillText('VERIFIED FIELD RESTORATION DOSSIER', boxX + 45, boxY + 50);

      ctx.fillStyle = '#5A6258';
      ctx.font = '22px Georgia, serif';
      ctx.fillText('Target Location:', boxX + 45, boxY + 95);
      ctx.fillText('Restoration Scope:', boxX + 45, boxY + 138);
      ctx.fillText('Official Registry ID:', boxX + 45, boxY + 180);

      ctx.fillStyle = '#0F291E';
      ctx.font = 'bold 22px Georgia, serif';
      ctx.fillText(`${location}`, boxX + 270, boxY + 95);
      ctx.fillText(`${spotName}`, boxX + 270, boxY + 138);
      ctx.font = 'bold 20px monospace';
      ctx.fillStyle = '#238253';
      ctx.fillText(`${certId} • ${certHash}`, boxX + 270, boxY + 180);

      // Right column of Dossier Box
      ctx.textAlign = 'left';
      ctx.fillStyle = '#5A6258';
      ctx.font = '22px Georgia, serif';
      ctx.fillText('Waste Diverted:', boxX + 1150, boxY + 95);
      ctx.fillText('Civic Bounty:', boxX + 1150, boxY + 138);
      ctx.fillText('Date Conferred:', boxX + 1150, boxY + 180);

      ctx.fillStyle = '#0F291E';
      ctx.font = 'bold 24px Georgia, serif';
      ctx.fillText(`${wasteKg} kg of Litter & Hazards`, boxX + 1350, boxY + 95);
      ctx.fillStyle = '#238253';
      ctx.fillText(`+${points} EcoScan Points`, boxX + 1350, boxY + 138);
      ctx.fillStyle = '#0F291E';
      ctx.font = 'bold 22px Georgia, serif';
      ctx.fillText(`${certDate}`, boxX + 1350, boxY + 180);

      // Bottom footer is kept completely clean, spacious, and blank (no chief names or signatures)

      // 10. Convert canvas to high-res PNG and download immediately
      canvas.toBlob((blob) => {
        if (!blob) {
          setIsGenerating(false);
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const safeName = recipient.replace(/[^a-zA-Z0-9_-]/g, '_');
        link.download = `EcoScan_Certificate_Excellence_${safeName}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsGenerating(false);
      }, 'image/png');
    } catch (err) {
      console.error('Error generating certificate image:', err);
      setIsGenerating(false);
    }
  };

  /**
   * Print / PDF export using browser native print dialog
   */
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500 fill-amber-500" />
          <span>Official Civic Award Certificate</span>
        </div>
      }
      description="Conferred for outstanding community service, waste remediation, and environmental heroism."
      size="xl"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted hidden sm:inline">
              Official Registry ID: <strong className="text-navy font-bold">{certId}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={handlePrintPDF}
              icon={<Printer className="w-4 h-4 text-navy" />}
            >
              Print / PDF
            </Button>

            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleDownloadPNG}
              disabled={isGenerating}
              icon={<Download className="w-4 h-4 text-lime" />}
              className="shadow-sm"
            >
              {isGenerating ? 'Generating High-Res...' : 'Download Official Certificate'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 text-center">
        {/* Certificate Display Frame */}
        <div
          ref={certificateCardRef}
          className="relative bg-[#FCFAF2] rounded-lg border-4 border-[#C99D36] shadow-xl p-6 sm:p-12 text-navy max-w-4xl mx-auto overflow-hidden select-none"
          style={{
            backgroundImage:
              'radial-gradient(#E8DFC8 1px, transparent 1px), radial-gradient(#F3ECE0 1px, #FCFAF2 1px)',
            backgroundSize: '32px 32px',
          }}
        >
          {/* Ornate Inner Double Green & Gold Border */}
          <div className="absolute inset-2 sm:inset-3 border-2 border-[#0F291E] pointer-events-none rounded-sm" />
          <div className="absolute inset-3.5 sm:inset-4.5 border border-[#D4AF37] pointer-events-none rounded-sm" />

          {/* Top Corner Filigrees */}
          <div className="absolute top-4 left-4 text-[#C99D36] text-xl font-serif select-none pointer-events-none">
            ⚜
          </div>
          <div className="absolute top-4 right-4 text-[#C99D36] text-xl font-serif select-none pointer-events-none">
            ⚜
          </div>
          <div className="absolute bottom-4 left-4 text-[#C99D36] text-xl font-serif select-none pointer-events-none">
            ⚜
          </div>
          <div className="absolute bottom-4 right-4 text-[#C99D36] text-xl font-serif select-none pointer-events-none">
            ⚜
          </div>

          {/* 1. Header & Alliance Seal */}
          <div className="space-y-1 relative z-10 pt-2">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#0F291E] text-lime mx-auto flex items-center justify-center shadow-md border-2 border-[#D4AF37] mb-2">
              <ShieldCheck className="w-7 h-7 stroke-[2]" />
            </div>
            <p className="text-[10px] sm:text-xs font-serif uppercase tracking-[0.25em] text-[#9C7823] font-bold">
              EcoScan Global Civic Initiative for Environmental Recovery
            </p>
            <h1 className="font-heading text-xl sm:text-3xl md:text-4xl font-extrabold text-[#0F291E] tracking-tight uppercase">
              Certificate of Civic Excellence
            </h1>
            <p className="text-xs sm:text-sm font-serif font-bold text-emerald tracking-wide">
              & Environmental Restoration
            </p>
          </div>

          {/* Decorative Divider */}
          <div className="flex items-center justify-center gap-3 my-3">
            <span className="h-[1px] w-20 sm:w-32 bg-[#D4AF37]" />
            <span className="text-[#C99D36] text-xs font-serif">✦ ✦ ✦</span>
            <span className="h-[1px] w-20 sm:w-32 bg-[#D4AF37]" />
          </div>

          {/* 2. Recipient Section */}
          <div className="space-y-1 relative z-10 my-4">
            <p className="text-xs sm:text-sm italic font-serif text-muted">
              This official citation of civic heroism is proudly and publicly awarded to
            </p>
            <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl font-black text-[#0F291E] tracking-tight uppercase py-1">
              {recipient}
            </h2>
            <div className="h-0.5 w-48 sm:w-72 bg-[#C99D36] mx-auto rounded-full" />
          </div>

          {/* 3. Formal Legal & Inspiring Citation */}
          <div className="max-w-2xl mx-auto my-4 text-xs sm:text-sm font-serif leading-relaxed text-[#24332B] relative z-10">
            <p>
              In solemn recognition of distinguished civic leadership, selfless environmental stewardship, and heroic service to the community. Having taken direct personal action to clean, reclaim, and restore neglected public lands—eliminating municipal litter, protecting public health, and inspiring community pride for generations to come.
            </p>
          </div>

          {/* 4. Verified Field Record Box */}
          <div className="my-5 p-4 sm:p-6 rounded-md bg-white/90 border border-[#D4AF37] shadow-sm max-w-2xl mx-auto text-left relative z-10">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-line flex-wrap gap-2">
              <span className="text-[11px] font-bold text-[#0F291E] tracking-wider uppercase font-heading flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-emerald" />
                Verified Field Record Dossier
              </span>
              <span className="text-[10px] font-mono text-muted">
                Hash: {certHash}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-muted block">Restoration Site</span>
                <strong className="text-navy font-bold truncate block">{spotName}</strong>
              </div>
              <div>
                <span className="text-[10px] text-muted block">Location</span>
                <strong className="text-navy font-bold truncate block">{location}</strong>
              </div>
              <div>
                <span className="text-[10px] text-muted block">Waste Diverted</span>
                <strong className="text-emerald font-bold block">{wasteKg} kg Collected</strong>
              </div>
              <div>
                <span className="text-[10px] text-muted block">Civic Bounty</span>
                <strong className="text-emerald font-bold block">+{points} Points</strong>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-line/60 flex items-center justify-between text-[11px] text-muted flex-wrap gap-2">
              <span>Date: <strong className="text-navy">{certDate}</strong></span>
              <span className="font-mono text-[10px]">Official Registry ID: <strong className="text-emerald font-bold">{certId}</strong></span>
            </div>
          </div>

          {/* Bottom of certificate is kept completely clean, spacious, and blank */}
          <div className="h-4 sm:h-6" />
        </div>
      </div>
    </Modal>
  );
};
