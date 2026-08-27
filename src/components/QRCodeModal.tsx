import React, { useState } from 'react';
import { BrandConfig, Language } from '../types';
import { X, Copy, Check, QrCode, Download, Share2 } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand: BrandConfig;
  language: Language;
  onShowToast: (msg: string) => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  brand,
  language,
  onShowToast
}) => {
  if (!isOpen) return null;

  const isZh = language === 'zh';
  const currentUrl = window.location.href;
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    onShowToast(isZh ? '已复制主页链接！可分享至微信/社媒' : 'Link copied! Ready to share');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-emerald-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-sm">
              {isZh ? '主页二维码与分享' : 'Share Brand Hub'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-emerald-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="p-6 text-center space-y-4">
          <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl border-2 border-emerald-800 shadow-md flex items-center justify-center relative">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}&color=006241`}
              alt="QR Code"
              className="w-full h-full object-contain"
            />
          </div>

          <div>
            <h4 className="font-bold text-sm text-neutral-900">
              {isZh ? brand.nameZh : brand.name}
            </h4>
            <p className="text-xs text-neutral-500 mt-0.5">
              {isZh ? '扫码快速访问社媒、AI 点评润色、在线点餐与热线' : 'Scan to view social links, rate with AI & mobile order'}
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleCopyLink}
              className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>{isZh ? '已复制链接' : 'Copied Link'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{isZh ? '复制主页链接' : 'Copy Share Link'}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
