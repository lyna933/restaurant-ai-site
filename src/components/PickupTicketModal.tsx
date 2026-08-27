import React, { useState } from 'react';
import { StoreLocation, CartItem, Language, PaymentDetails } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  X, 
  QrCode, 
  Share2, 
  Coffee,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Receipt,
  Download,
  Check
} from 'lucide-react';

interface PickupTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  store: StoreLocation;
  items: CartItem[];
  orderType: 'pickup' | 'delivery';
  total: number;
  customerName: string;
  customerPhone: string;
  language: Language;
  paymentDetails?: PaymentDetails | null;
  onShowToast: (msg: string) => void;
}

export const PickupTicketModal: React.FC<PickupTicketModalProps> = ({
  isOpen,
  onClose,
  orderNumber,
  store,
  items,
  orderType,
  total,
  customerName,
  customerPhone,
  language,
  paymentDetails,
  onShowToast
}) => {
  const [kitchenStatus, setKitchenStatus] = useState<'preparing' | 'ready'>('preparing');
  if (!isOpen) return null;

  const isZh = language === 'zh';
  const isStarbucks = store.name.toLowerCase().includes('starbucks') || store.nameZh.includes('星巴克');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Banner */}
        <div className={`text-white p-5 text-center relative shadow-xs ${
          isStarbucks 
            ? 'bg-gradient-to-r from-[#004D34] via-[#006241] to-[#00754A]' 
            : 'bg-gradient-to-r from-red-800 via-red-600 to-rose-700'
        }`}>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center mx-auto mb-2 shadow-lg font-bold ${
            isStarbucks ? 'text-[#006241]' : 'text-red-600'
          }`}>
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <h3 className="font-bold text-lg text-white">
            {isZh 
              ? (isStarbucks ? '🎉 支付成功！星巴克咖啡大师接单现萃' : '🎉 支付成功！已接单现制') 
              : '🎉 Payment Approved & Order Placed!'}
          </h3>
          <p className="text-xs text-emerald-100 mt-0.5">
            {orderType === 'pickup'
              ? (isZh 
                  ? (isStarbucks ? '请凭【啡快】数字化取单口令与条形码到吧台取餐' : '请凭数字化提货条形码到门店吧台极速取餐') 
                  : 'Your drinks are being handcrafted. Pick up at counter.')
              : (isZh 
                  ? (isStarbucks ? '专星送专属骑手已前往门店取餐配送' : '专送骑手已接单前往门店取餐配送') 
                  : 'Express delivery driver is on the way')}
          </p>
        </div>

        {/* Digital Ticket Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-neutral-800">
          
          {/* Pickup Callout Box with Barcode */}
          <div className={`rounded-xl p-4 text-center relative overflow-hidden border ${
            isStarbucks 
              ? 'bg-emerald-50/80 border-emerald-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${
              isStarbucks ? 'text-emerald-900' : 'text-red-800'
            }`}>
              {isZh ? (isStarbucks ? '☕️ 星巴克【啡快】数字化取单号' : '数字化门店自提取餐码') : 'Digital Pickup Code'}
            </span>
            <div className={`text-3xl font-black font-mono tracking-widest my-1 ${
              isStarbucks ? 'text-emerald-950' : 'text-red-950'
            }`}>
              #{orderNumber}
            </div>

            {/* Simulated Barcode */}
            <div className="my-2.5 bg-white p-2.5 rounded-lg border border-neutral-200 flex flex-col items-center">
              <div className="h-10 w-full flex items-center justify-center gap-0.5 overflow-hidden">
                {[3,2,4,1,3,5,2,4,2,1,4,2,3,5,1,2,4,3,1,5,2,4,2,1,3,4,2,5,1,3,4,2,3,1,4,2,5,3,1,2].map((w, i) => (
                  <div 
                    key={i} 
                    className="bg-neutral-900 h-full" 
                    style={{ width: `${w * 1.5}px` }} 
                  />
                ))}
              </div>
              <span className="font-mono text-[10px] text-neutral-500 mt-1 tracking-widest">
                9823 8810 5928 {orderNumber.replace(/[^0-9]/g, '')}
              </span>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>
                {kitchenStatus === 'preparing'
                  ? (isZh ? '吧台制作中 (预计 3-4 分钟出餐)' : 'Baristas Handcrafting (~3-4 min)')
                  : (isZh ? '✅ 制作完成，请前往取杯台' : 'Ready at Pickup Counter')}
              </span>
            </div>
          </div>

          {/* Genuine Payment Receipt Stamp Box */}
          {paymentDetails && (
            <div className="bg-neutral-50 rounded-xl p-3.5 border border-neutral-200 text-xs space-y-1.5 font-mono">
              <div className="flex items-center justify-between text-neutral-900 font-bold border-b border-neutral-200 pb-1.5 font-sans">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isZh ? '官方支付核验凭证' : 'Official Payment Proof'}</span>
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                  {paymentDetails.status.toUpperCase()}
                </span>
              </div>

              <div className="flex justify-between pt-1">
                <span>{isZh ? '结算通道:' : 'Channel:'}</span>
                <span className="font-bold text-neutral-800">{paymentDetails.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>{isZh ? '安全核验方式:' : 'Auth Verification:'}</span>
                <span className="text-neutral-800 font-medium">{paymentDetails.verificationMethod}</span>
              </div>
              {paymentDetails.stripePaymentIntentId && (
                <div className="flex justify-between text-indigo-700 bg-indigo-50/60 px-1.5 py-0.5 rounded text-[11px]">
                  <span>{isZh ? 'Stripe 结算凭证:' : 'Stripe Intent:'}</span>
                  <span className="font-mono font-bold">{paymentDetails.stripePaymentIntentId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{isZh ? '银行流水单号:' : 'Transaction ID:'}</span>
                <span className="font-mono text-[10px] text-neutral-500">{paymentDetails.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span>{isZh ? '交易时间戳:' : 'Timestamp:'}</span>
                <span className="text-neutral-600">{new Date(paymentDetails.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          )}

          {/* Store Info */}
          <div className="bg-neutral-50 rounded-xl p-3.5 border border-neutral-200 space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${isStarbucks ? 'text-[#006241]' : 'text-red-600'}`} />
              <div>
                <h4 className="font-bold text-neutral-900">
                  {isZh ? store.nameZh : store.name}
                </h4>
                <p className="text-neutral-500 text-xs mt-0.5">
                  {isZh ? store.addressZh : store.address}
                </p>
                <p className="text-neutral-500 text-[11px] mt-0.5 flex items-center gap-1 font-mono">
                  <Phone className="w-3 h-3 text-neutral-400" />
                  {store.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Order Item List */}
          <div className="border border-neutral-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between font-bold text-neutral-700 pb-1.5 border-b border-neutral-100">
              <span>{isZh ? '已点饮品清单' : 'Drink Items'}</span>
              <span>{items.reduce((s, i) => s + i.quantity, 0)} {isZh ? '杯' : 'Cups'}</span>
            </div>

            <div className="divide-y divide-neutral-100 max-h-36 overflow-y-auto">
              {items.map((it, idx) => (
                <div key={idx} className="py-1.5 first:pt-0 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-neutral-900">
                      {isZh ? it.item.nameZh : it.item.name}
                    </span>
                    <span className="text-neutral-500 ml-1 text-[11px]">
                      ({it.size} / {it.sweetness} / {it.ice})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500">x{it.quantity}</span>
                    <span className="font-mono font-bold text-neutral-900">${it.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-neutral-200 flex items-center justify-between font-bold">
              <span className="text-neutral-700">{isZh ? '实付金额' : 'Total Paid'}</span>
              <span className={`text-base font-black font-mono ${isStarbucks ? 'text-[#006241]' : 'text-red-600'}`}>
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex gap-2">
          <button
            onClick={() => {
              onShowToast(isZh ? '📷 已保存数字化取杯小票至手机相册' : '📷 Pickup receipt saved');
            }}
            className="flex-1 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-300 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isZh ? '保存凭单' : 'Save Receipt'}</span>
          </button>

          <button
            onClick={onClose}
            className={`flex-1 text-white py-2 rounded-xl font-bold text-xs shadow-md transition-colors cursor-pointer ${
              isStarbucks ? 'bg-[#006241] hover:bg-[#004D34]' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isZh ? '完成' : 'Done'}
          </button>
        </div>

      </div>
    </div>
  );
};
