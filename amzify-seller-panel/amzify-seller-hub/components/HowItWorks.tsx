
import React from 'react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: "01",
      title: "Join the Hub",
      description: "Create your seller account in minutes. No credit card required to start your journey."
    },
    {
      number: "02",
      title: "Upload Catalog",
      description: "Use our bulk importer or manual listing tools to showcase your unique products."
    },
    {
      number: "03",
      title: "Start Selling",
      description: "Go live and reach millions of customers across our global marketplace immediately."
    },
    {
      number: "04",
      title: "Scale Fast",
      description: "Analyze your performance and use our automated tools to grow your brand exponentially."
    }
  ];

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-end justify-between mb-16 gap-6">
          <div className="lg:w-1/2">
            <h2 className="text-base font-bold text-indigo-600 uppercase tracking-widest mb-4 italic">Process</h2>
            <h3 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
              Start your success story in <span className="text-indigo-600">four simple steps</span>.
            </h3>
          </div>
          <div className="lg:w-1/3">
            <p className="text-slate-600 text-lg">
              We've stripped away the complexity of traditional e-commerce to give you a smooth, frictionless path to revenue.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="relative group">
              <div className="mb-6">
                <span className="text-6xl font-black text-slate-200 group-hover:text-indigo-100 transition-colors duration-300 select-none">
                  {step.number}
                </span>
              </div>
              <h4 className="text-2xl font-bold text-slate-900 mb-4">{step.title}</h4>
              <p className="text-slate-600 leading-relaxed">{step.description}</p>
              
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-px border-t border-dashed border-slate-300 z-0"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
