import React, { useState } from 'react';
import {
  Gift, Users, TrendingUp, Copy, Share2, Mail, MessageSquare, 
  CheckCircle, Award, DollarSign, UserPlus, Sparkles, Trophy,
  Facebook, Twitter, Linkedin, Link2, QrCode, ArrowRight
} from 'lucide-react';

interface Referral {
  id: string;
  referral_code: string;
  referred_friend_email: string;
  referred_friend_name: string;
  status: 'pending' | 'converted' | 'completed';
  reward_earned: number;
  referral_date: string;
  conversion_date?: string;
}

interface ReferralStats {
  total_referrals: number;
  total_converted: number;
  total_rewards: number;
  referral_code: string;
}

const ReferralProgram: React.FC = () => {
  const [referrals, setReferrals] = useState<Referral[]>([
    {
      id: '1',
      referral_code: 'PRIYA123',
      referred_friend_email: 'amit@example.com',
      referred_friend_name: 'Amit Sharma',
      status: 'completed',
      reward_earned: 500,
      referral_date: '2024-01-10',
      conversion_date: '2024-01-12'
    },
    {
      id: '2',
      referral_code: 'PRIYA123',
      referred_friend_email: 'neha@example.com',
      referred_friend_name: 'Neha Patel',
      status: 'converted',
      reward_earned: 0,
      referral_date: '2024-01-15',
      conversion_date: '2024-01-16'
    },
    {
      id: '3',
      referral_code: 'PRIYA123',
      referred_friend_email: 'raj@example.com',
      referred_friend_name: 'Raj Kumar',
      status: 'pending',
      reward_earned: 0,
      referral_date: '2024-01-18'
    }
  ]);

  const stats: ReferralStats = {
    total_referrals: 3,
    total_converted: 2,
    total_rewards: 500,
    referral_code: 'PRIYA123'
  };

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'referrals' | 'rewards'>('overview');
  const [referralEmail, setReferralEmail] = useState('');
  const [referralName, setReferralName] = useState('');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(stats.referral_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvite = () => {
    if (referralEmail && referralName) {
      // Add new referral
      const newReferral: Referral = {
        id: String(referrals.length + 1),
        referral_code: stats.referral_code,
        referred_friend_email: referralEmail,
        referred_friend_name: referralName,
        status: 'pending',
        reward_earned: 0,
        referral_date: new Date().toISOString().split('T')[0]
      };
      setReferrals([...referrals, newReferral]);
      setReferralEmail('');
      setReferralName('');
    }
  };

  const shareUrl = `https://amzify.com/join?ref=${stats.referral_code}`;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white rounded-3xl p-8 overflow-hidden relative">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                <Gift className="w-8 h-8" />
                Referral Program
              </h1>
              <p className="text-purple-100 text-lg">
                Share the love and earn rewards!
              </p>
            </div>
            <Trophy className="w-20 h-20 opacity-20" />
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-sm opacity-80 mb-2">Total Referrals</div>
              <div className="text-4xl font-black">{stats.total_referrals}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-sm opacity-80 mb-2">Converted</div>
              <div className="text-4xl font-black">{stats.total_converted}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-sm opacity-80 mb-2">Total Earned</div>
              <div className="text-4xl font-black">₹{stats.total_rewards}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-sm opacity-80 mb-2">Your Code</div>
              <div className="text-2xl font-black font-mono">{stats.referral_code}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Your Code */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
          <Share2 className="w-6 h-6 text-indigo-600" />
          Share Your Referral Code
        </h2>

        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-6 border-2 border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-2">Your Unique Code</p>
              <p className="text-4xl font-black text-indigo-600 font-mono">{stats.referral_code}</p>
              <p className="text-sm text-slate-600 mt-2 max-w-md">
                Share this code with your friends. They get ₹100 off their first order, you get ₹500 when they complete a purchase!
              </p>
            </div>
            <button
              onClick={handleCopyCode}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="space-y-3">
          <p className="font-bold text-slate-900 mb-4">Share via:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
              <Facebook className="w-5 h-5" />
              Share on Facebook
            </button>
            <button className="flex items-center justify-center gap-3 px-6 py-4 bg-sky-400 text-white rounded-xl font-bold hover:bg-sky-500 transition-all">
              <Twitter className="w-5 h-5" />
              Share on Twitter
            </button>
            <button className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800 transition-all">
              <Linkedin className="w-5 h-5" />
              Share on LinkedIn
            </button>
            <button className="flex items-center justify-center gap-3 px-6 py-4 bg-slate-600 text-white rounded-xl font-bold hover:bg-slate-700 transition-all">
              <Mail className="w-5 h-5" />
              Email to Friends
            </button>
          </div>
        </div>
      </div>

      {/* Invite a Friend */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
          <UserPlus className="w-6 h-6 text-indigo-600" />
          Invite a Friend
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Friend's Name</label>
            <input
              type="text"
              value={referralName}
              onChange={(e) => setReferralName(e.target.value)}
              placeholder="Enter name"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
            <input
              type="email"
              value={referralEmail}
              onChange={(e) => setReferralEmail(e.target.value)}
              placeholder="Enter email"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none"
            />
          </div>
        </div>
        <button
          onClick={handleSendInvite}
          className="mt-6 w-full md:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Mail className="w-4 h-4" />
          Send Invite
        </button>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-indigo-600" />
          How It Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black text-lg">1</div>
              <h3 className="font-black text-lg text-slate-900">Share Your Code</h3>
            </div>
            <p className="text-slate-700">
              Give your friends your unique referral code or click the share buttons to send them an invite.
            </p>
          </div>

          <div className="relative">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-black text-lg">2</div>
              <h3 className="font-black text-lg text-slate-900">They Sign Up</h3>
            </div>
            <p className="text-slate-700">
              Your friends use your code to get ₹100 off their first purchase when they sign up on Amzify.
            </p>
          </div>

          <div className="relative">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center font-black text-lg">3</div>
              <h3 className="font-black text-lg text-slate-900">You Earn ₹500</h3>
            </div>
            <p className="text-slate-700">
              Once they complete their first purchase, you earn ₹500 as reward which you can use or transfer!
            </p>
          </div>
        </div>

        {/* Rewards Breakdown */}
        <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200">
          <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            Reward Tiers
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-xl">
              <span className="font-bold text-slate-900">Friend signs up with your code</span>
              <span className="text-amber-600 font-black">₹100</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-xl">
              <span className="font-bold text-slate-900">Friend completes first purchase (₹500+)</span>
              <span className="text-amber-600 font-black">₹500</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-xl">
              <span className="font-bold text-slate-900">Bonus: 5+ successful referrals</span>
              <span className="text-amber-600 font-black">₹1000 bonus</span>
            </div>
          </div>
        </div>
      </div>

      {/* Referral List */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black flex items-center gap-3">
            <Users className="w-6 h-6 text-indigo-600" />
            Your Referrals
          </h2>
          <span className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-full font-bold">
            {referrals.length} Total
          </span>
        </div>

        {referrals.length > 0 ? (
          <div className="space-y-3">
            {referrals.map((referral) => (
              <div
                key={referral.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 transition-all"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                    {referral.referred_friend_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{referral.referred_friend_name}</h4>
                    <p className="text-sm text-slate-600">{referral.referred_friend_email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs uppercase font-bold text-slate-500">Status</p>
                    <div className="flex items-center gap-1 mt-1">
                      {referral.status === 'completed' && (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="font-bold text-green-600">Completed</span>
                        </>
                      )}
                      {referral.status === 'converted' && (
                        <>
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                          <span className="font-bold text-blue-600">Converted</span>
                        </>
                      )}
                      {referral.status === 'pending' && (
                        <>
                          <TrendingUp className="w-4 h-4 text-amber-600" />
                          <span className="font-bold text-amber-600">Pending</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs uppercase font-bold text-slate-500">Reward</p>
                    <p className={`text-lg font-black ${referral.reward_earned > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                      {referral.reward_earned > 0 ? `₹${referral.reward_earned}` : '—'}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs uppercase font-bold text-slate-500">Date</p>
                    <p className="font-bold text-slate-900">{referral.referral_date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 mb-4">No referrals yet. Start inviting friends!</p>
          </div>
        )}
      </div>

      {/* QR Code Section */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
          <QrCode className="w-6 h-6 text-indigo-600" />
          Quick Share
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center">
            <div className="w-48 h-48 bg-slate-100 rounded-2xl border-2 border-slate-300 flex items-center justify-center mb-4">
              <div className="text-slate-400 text-center">
                <QrCode className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">QR Code</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 text-center">
              Scan to share your referral link
            </p>
          </div>

          <div className="flex flex-col justify-center">
            <h3 className="font-bold text-slate-900 mb-4">Direct Link</h3>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl font-mono text-sm"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  alert('Link copied!');
                }}
                className="px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-slate-600">
              Share this link directly with friends via chat, email, or social media.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralProgram;
