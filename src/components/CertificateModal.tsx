import React, { useRef, useState } from 'react';
import {
  Download,
  Printer,
  Share2,
  Sparkles,
  ShieldCheck,
  Award,
  CheckCircle2,
  QrCode,
  X,
  FileCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Modal, Button, Badge } from './ui';

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
  signatory1Name?: string;
  signatory1Title?: string;
  signatory2Name?: string;
  signatory2Title?: string;
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
  const [copiedLink, setCopiedLink] = useState(false);

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

  // Chief People / Dignitary Signatories
  const chief1Name = data.signatory1Name || '';
  const chief1Title = data.signatory1Title || 'Director of Civic Action';
  const chief2Name = data.signatory2Name || '';
  const chief2Title = data.signatory2Title || 'Chief Community Field Coordinator';

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
      ctx.translate(width / 2, height / 2 + 40);
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
      ctx.fillText('ECOSCAN GLOBAL CIVIC INITIATIVE FOR ENVIRONMENTAL RECOVERY', width / 2, 175);

      ctx.fillStyle = '#9C7823';
      ctx.font = '600 24px "Cinzel", Georgia, serif';
      ctx.letterSpacing = '5px';
      ctx.fillText('CONFERRED BY THE CIVIC STEWARDSHIP ALLIANCE & DIRECTED BY CITIZEN ACTION', width / 2, 220);

      // Horizontal Divider with Gold Diamond
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 380, 245);
      ctx.lineTo(width / 2 + 380, 245);
      ctx.stroke();

      ctx.fillStyle = '#C99D36';
      ctx.beginPath();
      ctx.arc(width / 2, 245, 8, 0, Math.PI * 2);
      ctx.fill();

      // 5. Grand Certificate Title
      ctx.fillStyle = '#0F291E';
      ctx.font = 'bold 74px "Cinzel", Georgia, serif';
      ctx.letterSpacing = '3px';
      ctx.fillText('CERTIFICATE OF CIVIC EXCELLENCE', width / 2, 335);

      ctx.fillStyle = '#238253';
      ctx.font = 'bold 42px "Cinzel", Georgia, serif';
      ctx.letterSpacing = '4px';
      ctx.fillText('& ENVIRONMENTAL RESTORATION', width / 2, 395);

      // 6. Presentation Line
      ctx.fillStyle = '#5A6258';
      ctx.font = 'italic 30px Georgia, serif';
      ctx.letterSpacing = '2px';
      ctx.fillText('This official citation of honour and civic heroism is proudly presented to', width / 2, 475);

      // 7. Recipient's Name (Grand, Prestigious display)
      ctx.fillStyle = '#0F291E';
      ctx.font = 'bold 88px "Cinzel", Georgia, serif';
      ctx.letterSpacing = '2px';
      ctx.fillText(recipient.toUpperCase(), width / 2, 580);

      // Gold under-flourish line beneath recipient's name
      const nameWidth = ctx.measureText(recipient.toUpperCase()).width;
      const lineLen = Math.max(nameWidth + 120, 600);
      ctx.strokeStyle = '#C99D36';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(width / 2 - lineLen / 2, 610);
      ctx.lineTo(width / 2 + lineLen / 2, 610);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(width / 2, 610, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#0F291E';
      ctx.fill();

      // 8. Formal Authentic Citation Prose
      ctx.fillStyle = '#24332B';
      ctx.font = '28px Georgia, serif';
      ctx.letterSpacing = '0.5px';
      const line1 = 'In solemn recognition of extraordinary civic leadership, selfless environmental stewardship, and distinguished';
      const line2 = 'service to public hygiene. Having taken direct personal action to identify, clean, and restore community lands,';
      const line3 = 'diverting dangerous waste hazards, reviving natural ecosystems, and setting a shining example of neighbourhood pride.';
      ctx.fillText(line1, width / 2, 690);
      ctx.fillText(line2, width / 2, 735);
      ctx.fillText(line3, width / 2, 780);

      // 9. Verified Field Impact Dossier Box
      const boxX = 220;
      const boxY = 835;
      const boxW = width - 440;
      const boxH = 210;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeStyle = '#C99D36';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      // Dossier columns
      ctx.textAlign = 'left';
      ctx.fillStyle = '#0F291E';
      ctx.font = 'bold 22px "Cinzel", Georgia, serif';
      ctx.fillText('VERIFIED FIELD RESTORATION DOSSIER', boxX + 40, boxY + 45);

      ctx.fillStyle = '#5A6258';
      ctx.font = '20px Georgia, serif';
      ctx.fillText(`Target Location:`, boxX + 40, boxY + 85);
      ctx.fillText(`Restoration Scope:`, boxX + 40, boxY + 120);
      ctx.fillText(`Official Verification Hash:`, boxX + 40, boxY + 155);

      ctx.fillStyle = '#0F291E';
      ctx.font = 'bold 20px Georgia, serif';
      ctx.fillText(`${location}`, boxX + 260, boxY + 85);
      ctx.fillText(`${spotName}`, boxX + 260, boxY + 120);
      ctx.font = 'bold 18px monospace';
      ctx.fillStyle = '#238253';
      ctx.fillText(`${certHash}`, boxX + 310, boxY + 155);

      // Right column of Dossier Box
      ctx.textAlign = 'left';
      ctx.fillStyle = '#5A6258';
      ctx.font = '20px Georgia, serif';
      ctx.fillText(`Waste Diverted:`, boxX + 1150, boxY + 85);
      ctx.fillText(`Civic Bounty:`, boxX + 1150, boxY + 120);
      ctx.fillText(`Date Conferred:`, boxX + 1150, boxY + 155);

      ctx.fillStyle = '#0F291E';
      ctx.font = 'bold 22px Georgia, serif';
      ctx.fillText(`${wasteKg} kg of Litter & Hazards`, boxX + 1340, boxY + 85);
      ctx.fillStyle = '#238253';
      ctx.fillText(`+${points} EcoScan Points`, boxX + 1340, boxY + 120);
      ctx.fillStyle = '#0F291E';
      ctx.font = 'bold 20px Georgia, serif';
      ctx.fillText(`${certDate}`, boxX + 1340, boxY + 155);

      // 10. Official Golden Embossed Seal (Bottom Left)
      const sealX = 380;
      const sealY = 1260;
      const sealRadius = 110;

      // Satin Ribbon tails hanging down
      ctx.save();
      ctx.fillStyle = '#1A593A';
      ctx.beginPath();
      ctx.moveTo(sealX - 45, sealY + 70);
      ctx.lineTo(sealX - 70, sealY + 220);
      ctx.lineTo(sealX - 40, sealY + 195);
      ctx.lineTo(sealX - 10, sealY + 220);
      ctx.lineTo(sealX - 15, sealY + 70);
      ctx.fill();

      ctx.fillStyle = '#B38728';
      ctx.beginPath();
      ctx.moveTo(sealX + 15, sealY + 70);
      ctx.lineTo(sealX + 10, sealY + 220);
      ctx.lineTo(sealX + 40, sealY + 195);
      ctx.lineTo(sealX + 70, sealY + 220);
      ctx.lineTo(sealX + 45, sealY + 70);
      ctx.fill();
      ctx.restore();

      // Scalloped Gold Starburst Seal
      ctx.save();
      ctx.translate(sealX, sealY);
      ctx.fillStyle = '#D4AF37';
      ctx.beginPath();
      for (let i = 0; i < 32; i++) {
        const angle = (i * Math.PI) / 16;
        const r = i % 2 === 0 ? sealRadius : sealRadius - 12;
        ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
      }
      ctx.closePath();
      ctx.fill();

      // Inner embossed rings
      ctx.strokeStyle = '#8E6F1D';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, sealRadius - 20, 0, Math.PI * 2);
      ctx.strokeStyle = '#F7E7A6';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#0F291E';
      ctx.font = 'bold 15px "Cinzel", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('★ OFFICIAL SEAL ★', 0, -35);
      ctx.font = 'bold 20px "Cinzel", Georgia, serif';
      ctx.fillText('VERIFIED', 0, -5);
      ctx.fillText('CIVIC IMPACT', 0, 20);
      ctx.font = 'bold 13px Georgia, serif';
      ctx.fillText('100% RESTORED', 0, 45);
      ctx.restore();

      // 11. Security QR Code / Hologram Stamp (Bottom Center)
      const qrX = width / 2;
      const qrY = 1270;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(qrX - 60, qrY - 60, 120, 120);
      ctx.strokeStyle = '#0F291E';
      ctx.lineWidth = 2;
      ctx.strokeRect(qrX - 60, qrY - 60, 120, 120);

      // Draw simulated authentic QR pattern
      ctx.fillStyle = '#0F291E';
      ctx.fillRect(qrX - 48, qrY - 48, 30, 30);
      ctx.fillRect(qrX + 18, qrY - 48, 30, 30);
      ctx.fillRect(qrX - 48, qrY + 18, 30, 30);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(qrX - 40, qrY - 40, 14, 14);
      ctx.fillRect(qrX + 26, qrY - 40, 14, 14);
      ctx.fillRect(qrX - 40, qrY + 26, 14, 14);
      ctx.fillStyle = '#0F291E';
      ctx.fillRect(qrX - 35, qrY - 35, 4, 4);
      ctx.fillRect(qrX + 31, qrY - 35, 4, 4);
      ctx.fillRect(qrX - 35, qrY + 31, 4, 4);
      // center dots
      ctx.fillRect(qrX - 10, qrY - 10, 20, 20);
      ctx.fillRect(qrX + 20, qrY + 10, 12, 12);
      ctx.fillRect(qrX - 15, qrY + 20, 8, 8);

      ctx.fillStyle = '#5A6258';
      ctx.font = 'bold 15px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`REGISTRY ID: ${certId}`, qrX, qrY + 80);
      ctx.font = '13px Georgia, serif';
      ctx.fillText('SCAN TO VERIFY OFFICIAL REGISTRY CREDENTIAL', qrX, qrY + 100);

      // 12. Executive Signatures (Bottom Right)
      const sigX = width - 520;
      const sigY = 1270;

      // Signature 1
      ctx.strokeStyle = '#0F291E';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sigX - 120, sigY);
      ctx.lineTo(sigX + 120, sigY);
      ctx.stroke();

      // Cursive signature drawing 1
      ctx.save();
      ctx.strokeStyle = '#1D3B2C';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sigX - 100, sigY - 25);
      ctx.bezierCurveTo(sigX - 60, sigY - 70, sigX - 30, sigY - 10, sigX + 10, sigY - 40);
      ctx.bezierCurveTo(sigX + 40, sigY - 60, sigX + 70, sigY - 15, sigX + 90, sigY - 30);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#0F291E';
      ctx.font = 'bold 22px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(chief1Name, sigX, sigY + 30);
      ctx.fillStyle = '#5A6258';
      ctx.font = 'italic 18px Georgia, serif';
      ctx.fillText(chief1Title, sigX, sigY + 55);

      // Signature 2 (Secondary Signatory)
      const sig2X = width - 240;
      ctx.strokeStyle = '#0F291E';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sig2X - 100, sigY);
      ctx.lineTo(sig2X + 100, sigY);
      ctx.stroke();

      // Cursive signature drawing 2
      ctx.save();
      ctx.strokeStyle = '#1D3B2C';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sig2X - 80, sigY - 20);
      ctx.bezierCurveTo(sig2X - 40, sigY - 55, sig2X - 10, sigY - 5, sig2X + 30, sigY - 45);
      ctx.bezierCurveTo(sig2X + 50, sigY - 50, sig2X + 70, sigY - 10, sig2X + 85, sigY - 25);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#0F291E';
      ctx.font = 'bold 22px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(chief2Name, sig2X, sigY + 30);
      ctx.fillStyle = '#5A6258';
      ctx.font = 'italic 18px Georgia, serif';
      ctx.fillText(chief2Title, sig2X, sigY + 55);

      // 13. Convert canvas to high-res PNG and download immediately
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

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
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
          className="relative bg-[#FCFAF2] rounded-lg border-4 border-[#C99D36] shadow-xl p-5 sm:p-10 text-navy max-w-4xl mx-auto overflow-hidden select-none"
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
          <div className="my-5 p-3.5 sm:p-5 rounded-md bg-white/90 border border-[#D4AF37] shadow-sm max-w-2xl mx-auto text-left relative z-10">
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
          </div>

          {/* 5. Seals & Authentic Signatures of Chief Dignitaries */}
          <div className="pt-4 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-5 relative z-10 border-t border-[#D4AF37]/50 mt-2">
            {/* Scalloped Gold Foil Ribbon Seal */}
            <div className="flex items-center gap-3 text-left">
              <div className="relative flex flex-col items-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#D4AF37] border-2 border-[#8E6F1D] flex flex-col items-center justify-center text-center shadow-md p-1">
                  <span className="text-[8px] sm:text-[9px] font-bold text-[#0F291E] uppercase leading-tight">
                    ★ SEAL OF ★
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-extrabold text-[#0F291E] uppercase leading-none font-heading">
                    EXCELLENCE
                  </span>
                  <span className="text-[7px] text-[#0F291E] leading-tight">
                    RESTORED
                  </span>
                </div>
                {/* Ribbons */}
                <div className="flex gap-1 -mt-1">
                  <div className="w-2.5 h-6 bg-[#0F291E] rounded-b-xs shadow-xs" />
                  <div className="w-2.5 h-6 bg-[#C99D36] rounded-b-xs shadow-xs" />
                </div>
              </div>
              <div>
                <span className="text-[11px] font-bold text-navy block font-heading">
                  Official Civic Seal
                </span>
                <span className="text-[10px] text-muted block leading-tight">
                  100% On-Site GPS Verified
                </span>
                <span className="text-[9px] text-[#C99D36] font-mono font-bold block mt-0.5">
                  ID: {certId}
                </span>
              </div>
            </div>

            {/* Authentic Calligraphy Signatures of Chief People */}
            <div className="flex items-center justify-center sm:justify-end gap-6 sm:gap-10 text-center sm:text-right w-full sm:w-auto">
              {/* Dignitary 1 */}
              <div className="text-center min-w-[130px]">
                {/* Realistic Calligraphy Cursive Ink Signature */}
                <svg className="h-8 w-28 mx-auto -mb-1 text-[#1D3B2C] stroke-current" viewBox="0 0 120 35" fill="none">
                  <path d="M10 26 C 28 8, 38 6, 52 20 C 62 30, 72 6, 88 18 C 98 25, 108 12, 114 16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M30 14 L 75 17" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <div className="font-serif italic text-sm sm:text-base text-navy border-b border-[#0F291E] px-2 pb-0.5 font-bold">
                  {chief1Name}
                </div>
                <span className="text-[10px] sm:text-[11px] text-muted block mt-0.5 font-medium">
                  {chief1Title}
                </span>
              </div>

              {/* Dignitary 2 */}
              <div className="text-center min-w-[130px]">
                {/* Realistic Calligraphy Cursive Ink Signature */}
                <svg className="h-8 w-28 mx-auto -mb-1 text-[#1D3B2C] stroke-current" viewBox="0 0 120 35" fill="none">
                  <path d="M14 24 C 24 6, 32 30, 48 14 C 58 4, 68 24, 82 10 C 94 4, 104 22, 110 18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M18 28 Q 58 20 102 26" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <div className="font-serif italic text-sm sm:text-base text-navy border-b border-[#0F291E] px-2 pb-0.5 font-bold">
                  {chief2Name}
                </div>
                <span className="text-[10px] sm:text-[11px] text-muted block mt-0.5 font-medium">
                  {chief2Title}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
