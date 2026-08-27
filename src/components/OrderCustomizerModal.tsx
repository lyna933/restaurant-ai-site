import React, { useState } from 'react';
import { MenuItem, CartItem, Language } from '../types';
import { X, Plus, Minus, Check, Coffee, Sparkles } from 'lucide-react';

interface OrderCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  language: Language;
  onAddToCart: (cartItem: CartItem) => void;
  onShowToast: (msg: string) => void;
}

export const OrderCustomizerModal: React.FC<OrderCustomizerModalProps> = ({
  isOpen,
  onClose,
  item,
  language,
  onAddToCart,
  onShowToast
}) => {
  if (!isOpen || !item) return null;

  const isZh = language === 'zh';

  const defaultSize = item.options?.sizes?.[0]?.name || 'Standard';
  const [selectedSize, setSelectedSize] = useState<string>(defaultSize);
  const [selectedMilk, setSelectedMilk] = useState<string>(item.options?.milks?.[0] || 'Whole Milk');
  const [selectedIce, setSelectedIce] = useState<string>(item.options?.iceLevels?.[0] || 'Regular Ice');
  const [selectedSweetness, setSelectedSweetness] = useState<string>(item.options?.sweetness?.[0] || '100% Standard Sweet');
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  // Calculate current unit price based on size
  const sizeOption = item.options?.sizes?.find(s => s.name === selectedSize);
  const extraPrice = sizeOption ? sizeOption.extraPrice : 0;
  const unitPrice = Math.max(0.5, item.price + extraPrice);
  const totalPrice = (unitPrice * quantity).toFixed(2);

  const handleConfirm = () => {
    onAddToCart({
      item,
      size: selectedSize,
      milk: item.options?.milks ? selectedMilk : undefined,
      ice: item.options?.iceLevels ? selectedIce : undefined,
      sweetness: item.options?.sweetness ? selectedSweetness : undefined,
      extraNotes: notes.trim() || undefined,
      quantity,
      itemPrice: unitPrice
    });

    onShowToast(isZh ? `已将 ${item.nameZh} 加入点餐袋！` : `Added ${item.name} to cart!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header with image */}
        <div className="relative h-44 sm:h-52 bg-neutral-900 overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover opacity-90"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-4 right-4 text-white">
            <span className="text-[11px] font-bold bg-red-600 text-white px-2 py-0.5 rounded uppercase">
              {item.category} • {item.calories}
            </span>
            <h3 className="text-lg sm:text-xl font-bold mt-1 leading-tight">
              {isZh ? item.nameZh : item.name}
            </h3>
            <p className="text-xs text-neutral-200 line-clamp-1 mt-0.5">
              {isZh ? item.descriptionZh : item.description}
            </p>
          </div>
        </div>

        {/* Customization Options */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          
          {/* Sizes */}
          {item.options?.sizes && item.options.sizes.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-2">
                {isZh ? '选择杯型 / 规格' : 'Select Size'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {item.options.sizes.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => setSelectedSize(s.name)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedSize === s.name
                        ? 'border-red-600 bg-red-50 text-red-950 font-bold ring-1 ring-red-500'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-white'
                    }`}
                  >
                    <div className="text-xs font-semibold">{s.name}</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      {s.extraPrice === 0 ? (isZh ? '标准售价' : 'Standard') : `+$${s.extraPrice.toFixed(2)}`}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ice Level */}
          {item.options?.iceLevels && (
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-2">
                {isZh ? '冰量温度定制' : 'Ice & Temperature'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {item.options.iceLevels.map((ice) => (
                  <button
                    key={ice}
                    type="button"
                    onClick={() => setSelectedIce(ice)}
                    className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer text-center ${
                      selectedIce === ice
                        ? 'bg-red-600 text-white border-red-600 font-semibold shadow-xs'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-white'
                    }`}
                  >
                    {ice}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sweetness */}
          {item.options?.sweetness && (
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-2">
                {isZh ? '甜度选择' : 'Sweetness Level'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {item.options.sweetness.map((sw) => (
                  <button
                    key={sw}
                    type="button"
                    onClick={() => setSelectedSweetness(sw)}
                    className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer text-center ${
                      selectedSweetness === sw
                        ? 'bg-red-600 text-white border-red-600 font-semibold shadow-xs'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-white'
                    }`}
                  >
                    {sw}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Special Notes */}
          <div className="pt-2 border-t border-neutral-100 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-neutral-800">
                {isZh ? '购买数量' : 'Quantity'}
              </span>
              <div className="flex items-center gap-3 bg-neutral-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 rounded-lg bg-white shadow-xs flex items-center justify-center font-bold text-neutral-700 hover:bg-neutral-200 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-bold text-sm font-mono w-6 text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 rounded-lg bg-red-600 text-white shadow-xs flex items-center justify-center font-bold hover:bg-red-700 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-neutral-500 mb-1">
                {isZh ? '特殊要求备注 (如多加吸管、打包袋等)' : 'Special Instructions (e.g. extra straws, cup carrier)'}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isZh ? '例如：分开放吸管、少糖等' : 'e.g. pack separately, extra straw'}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>

        </div>

        {/* Modal Footer with Price and Add to Cart */}
        <div className="bg-neutral-50 border-t border-neutral-200 p-4 flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] text-neutral-500 block">{isZh ? '合计金额' : 'Total Price'}</span>
            <span className="text-xl font-black text-red-600 font-mono">${totalPrice}</span>
          </div>

          <button
            id="modal-add-to-cart-btn"
            type="button"
            onClick={handleConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>{isZh ? '加入点餐袋' : 'Add to Order Bag'}</span>
            <span className="font-mono">(${totalPrice})</span>
          </button>
        </div>

      </div>
    </div>
  );
};
