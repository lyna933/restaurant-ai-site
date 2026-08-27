import React, { useState } from 'react';
import { Language } from '../types';
import { X, Send, Calendar, Users, Building, Mail, Phone, CheckCircle2, Sparkles } from 'lucide-react';

interface ConciergeInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onShowToast: (msg: string) => void;
}

export const ConciergeInquiryModal: React.FC<ConciergeInquiryModalProps> = ({
  isOpen,
  onClose,
  language,
  onShowToast
}) => {
  if (!isOpen) return null;

  const isZh = language === 'zh';
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [company, setCompany] = useState('');
  const [eventType, setEventType] = useState('Corporate Meeting Coffee Break');
  const [headcount, setHeadcount] = useState('20-50 People');
  const [eventDate, setEventDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact) {
      onShowToast(isZh ? '请填写您的姓名与联系方式' : 'Please provide your name and contact');
      return;
    }

    setSubmitted(true);
    onShowToast(isZh ? '🎉 商务冷餐与团购咨询已提交！大客户经理将在2小时内与您联系。' : '🎉 Catering inquiry submitted! Our manager will follow up within 2 hours.');
    setTimeout(() => {
      onClose();
      setSubmitted(false);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 to-emerald-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center">
              <Sparkles className="w-5 h-5 fill-amber-950" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {isZh ? '企业团餐与活动定制专属管家' : 'Corporate Catering & Event Concierge'}
              </h3>
              <p className="text-xs text-emerald-200 mt-0.5">
                {isZh ? '支持大额团购优惠、现场移动咖啡车与定制茶歇' : 'Special volume discounts, mobile coffee carts & artisan bakery setups'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-emerald-700/50 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body Form */}
        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-lg text-neutral-900">
              {isZh ? '提交成功！' : 'Inquiry Received!'}
            </h4>
            <p className="text-xs text-neutral-600 max-w-xs mx-auto">
              {isZh 
                ? '我们已收到您的定制茶歇需求，大客户专属咖啡顾问将在 2 小时内致电为您提供定制报价单。' 
                : 'Thank you! Our dedicated catering specialist will contact you with a customized proposal within 2 hours.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  {isZh ? '联系人姓名 *' : 'Your Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isZh ? '例如：王经理' : 'e.g., Sarah Jenkins'}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  {isZh ? '联系电话 / 邮箱 *' : 'Phone / Email *'}
                </label>
                <input
                  type="text"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder={isZh ? '例如：13800000000 / sarah@corp.com' : 'e.g., +1 206-555-0199'}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  {isZh ? '公司 / 机构名称' : 'Company / Organization'}
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder={isZh ? '例如：微软亚太研发集团' : 'e.g., Tech Innovations Inc.'}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  {isZh ? '活动预估人数' : 'Estimated Headcount'}
                </label>
                <select
                  value={headcount}
                  onChange={(e) => setHeadcount(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="10-30 People">{isZh ? '10-30 人 (小型会议)' : '10-30 People'}</option>
                  <option value="30-80 People">{isZh ? '30-80 人 (中型团建)' : '30-80 People'}</option>
                  <option value="80-200+ People">{isZh ? '80-200+ 人 (大型峰会/年会)' : '80-200+ People'}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                {isZh ? '活动类型与具体需求' : 'Event Type & Preferences'}
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isZh ? '例如：需要 50 杯燕麦拿铁与 30 份可颂牛角包，上午 10:00 前送达...' : 'e.g., 50 Oatmilk lattes and 30 artisan pastries delivered by 10 AM...'}
                className="w-full bg-neutral-50 border border-neutral-300 rounded-lg p-3 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 cursor-pointer"
              >
                {isZh ? '取消' : 'Cancel'}
              </button>

              <button
                type="submit"
                className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isZh ? '提交团餐需求' : 'Submit Inquiry'}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
