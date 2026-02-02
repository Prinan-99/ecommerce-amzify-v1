
import React, { useState } from 'react';
import { X, Star, MessageSquare, Send, Sparkles } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { rating: number; comment: string }) => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit({ rating, comment });
      setIsSubmitting(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="p-10 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-2xl font-black tracking-tight">Experience Audit</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Help us refine the Amzify experience protocol</p>
            </div>
            <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Satisfaction Rating</p>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="transition-all active:scale-90"
                  >
                    <Star 
                      className={`w-10 h-10 transition-all ${
                        (hoverRating || rating) >= star 
                        ? 'fill-amber-400 text-amber-400 scale-110' 
                        : 'text-slate-100 fill-slate-100'
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Collaborative Insights</p>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[8px] font-black uppercase tracking-widest">
                  <Sparkles className="w-2.5 h-2.5" /> AI ENHANCED
                </div>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us about your journey..."
                className="w-full h-32 bg-slate-50 border-none rounded-3xl p-6 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-indigo-600 transition-all disabled:opacity-30 active:scale-95"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                TRANSMITTING...
              </div>
            ) : (
              <>SUBMIT FEEDBACK <Send className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
