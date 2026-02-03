
import React from 'react';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: "Sarah Jenkins",
      role: "CEO of FlowHome",
      quote: "Amzify didn't just help me sell; they helped me build a brand. Their analytics are light-years ahead of anything I've used before.",
      avatar: "https://picsum.photos/seed/sarah/100/100"
    },
    {
      name: "Marcus Thorne",
      role: "Founder, PeakGear",
      quote: "The global shipping integration changed our business overnight. We went from local to global in less than a month. Incredible support!",
      avatar: "https://picsum.photos/seed/marcus/100/100"
    },
    {
      name: "Elena Rodriguez",
      role: "Independent Artisan",
      quote: "As a solo creator, the automated marketing tools saved me 20 hours a week. Amzify is like having a whole team behind me.",
      avatar: "https://picsum.photos/seed/elena/100/100"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 italic font-serif">"The best decision for my business."</h2>
          <p className="text-xl text-slate-600">Join thousands of sellers who transitioned to a better platform.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-slate-50 p-10 rounded-[2.5rem] relative">
              <div className="mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-lg text-slate-700 italic mb-8 leading-relaxed">"{t.quote}"</p>
              <div className="flex items-center gap-4">
                <img src={t.avatar} alt={t.name} className="w-14 h-14 rounded-2xl object-cover shadow-lg shadow-indigo-100" />
                <div>
                  <h4 className="font-bold text-slate-900">{t.name}</h4>
                  <p className="text-sm text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
