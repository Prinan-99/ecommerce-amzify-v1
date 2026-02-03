
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-white">amzify<span className="text-indigo-600">.</span></span>
            </div>
            <p className="max-w-xs text-slate-400 leading-relaxed mb-6">
              The next-generation marketplace platform empowering independent brands to achieve global scale with intelligence and ease.
            </p>
            <div className="flex gap-4">
              {['twitter', 'facebook', 'instagram', 'linkedin'].map((social) => (
                <a key={social} href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 transition-colors text-white">
                  <span className="sr-only">{social}</span>
                  <div className="w-5 h-5 bg-current opacity-50 rounded-sm"></div>
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h5 className="text-white font-bold mb-6">Platform</h5>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Logistics</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">AI Insights</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold mb-6">Support</h5>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Seller Hub</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">API Docs</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Guides</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Status</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold mb-6">Legal</h5>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">GDPR</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">&copy; 2026 Amzify Inc. All rights reserved. Team - Saran, Sowmiya, Pria</p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
