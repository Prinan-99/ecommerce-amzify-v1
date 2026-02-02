import React, { useState, useEffect } from 'react';
import { 
  Facebook, Twitter, Instagram, Youtube, Linkedin, Globe,
  Plus, Link, Unlink, BarChart3, Users, Heart, MessageCircle,
  Share, TrendingUp, Calendar, Image, Video, FileText, Send,
  Settings, Eye, Edit, Trash2, RefreshCw, ExternalLink
} from 'lucide-react';
import { sellerApiService } from '../services/sellerApi';

interface SocialMediaManagerProps {
  onClose?: () => void;
}

const SocialMediaManager: React.FC<SocialMediaManagerProps> = ({ onClose }) => {
  const [connectedAccounts, setConnectedAccounts] = useState<any>({});
  const [socialStats, setSocialStats] = useState<any>({});
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'accounts' | 'posts' | 'analytics' | 'create'>('accounts');
  const [newPost, setNewPost] = useState({
    content: '',
    platforms: [] as string[],
    image: null as File | null,
    scheduled_at: ''
  });

  useEffect(() => {
    loadSocialData();
  }, []);

  const loadSocialData = async () => {
    try {
      setIsLoading(true);
      const [statsResponse] = await Promise.all([
        sellerApiService.getSocialMediaStats().catch(() => ({ stats: {} }))
      ]);
      
      setSocialStats(statsResponse.stats || {});
      
      // Mock connected accounts data
      setConnectedAccounts({
        facebook: {
          connected: true,
          username: '@acmeelectronics',
          followers: 12500,
          engagement: 4.2
        },
        instagram: {
          connected: true,
          username: '@acme_electronics',
          followers: 8900,
          engagement: 6.8
        },
        twitter: {
          connected: false,
          username: '',
          followers: 0,
          engagement: 0
        },
        youtube: {
          connected: false,
          username: '',
          followers: 0,
          engagement: 0
        },
        linkedin: {
          connected: true,
          username: 'Acme Electronics Inc',
          followers: 3400,
          engagement: 3.1
        }
      });

      // Mock posts data
      setPosts([
        {
          id: '1',
          content: 'Check out our latest wireless headphones! 🎧 Premium sound quality at an affordable price.',
          platforms: ['facebook', 'instagram'],
          created_at: '2024-02-01T10:00:00Z',
          engagement: { likes: 45, comments: 12, shares: 8 },
          status: 'published'
        },
        {
          id: '2',
          content: 'New smart fitness watch now available! Track your health goals with style. 💪',
          platforms: ['instagram', 'linkedin'],
          created_at: '2024-01-30T15:30:00Z',
          engagement: { likes: 67, comments: 23, shares: 15 },
          status: 'published'
        },
        {
          id: '3',
          content: 'Behind the scenes: How we test our products for quality assurance.',
          platforms: ['facebook', 'linkedin'],
          created_at: '2024-01-28T09:15:00Z',
          engagement: { likes: 89, comments: 34, shares: 22 },
          status: 'published'
        }
      ]);
    } catch (error) {
      console.error('Load social data error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectAccount = async (platform: string) => {
    try {
      // In a real app, this would open OAuth flow
      await sellerApiService.connectSocialMedia(platform, { 
        access_token: 'mock_token',
        username: `@${platform}_account`
      });
      loadSocialData();
    } catch (error) {
      console.error('Connect account error:', error);
    }
  };

  const handleDisconnectAccount = async (platform: string) => {
    try {
      await sellerApiService.disconnectSocialMedia(platform);
      setConnectedAccounts(prev => ({
        ...prev,
        [platform]: { ...prev[platform], connected: false }
      }));
    } catch (error) {
      console.error('Disconnect account error:', error);
    }
  };

  const handleCreatePost = async () => {
    try {
      setIsLoading(true);
      await sellerApiService.postToSocialMedia(newPost.platforms, {
        content: newPost.content,
        image: newPost.image,
        scheduled_at: newPost.scheduled_at
      });
      
      setNewPost({
        content: '',
        platforms: [],
        image: null,
        scheduled_at: ''
      });
      
      loadSocialData();
      setActiveTab('posts');
    } catch (error) {
      console.error('Create post error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const socialPlatforms = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200'
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: Twitter,
      color: 'text-blue-400',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: Youtube,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    }
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Social Media Manager</h2>
          <p className="text-slate-600">Connect and manage your social media presence</p>
        </div>
        <button
          onClick={loadSocialData}
          className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-100">
        {[
          { id: 'accounts', label: 'Connected Accounts', icon: Link },
          { id: 'posts', label: 'Posts', icon: FileText },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'create', label: 'Create Post', icon: Plus }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'accounts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {socialPlatforms.map(platform => {
            const account = connectedAccounts[platform.id];
            const Icon = platform.icon;
            
            return (
              <div key={platform.id} className={`p-6 rounded-2xl border ${platform.borderColor} ${platform.bgColor}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-8 h-8 ${platform.color}`} />
                    <div>
                      <h3 className="font-bold text-slate-900">{platform.name}</h3>
                      {account?.connected && (
                        <p className="text-sm text-slate-600">{account.username}</p>
                      )}
                    </div>
                  </div>
                  {account?.connected ? (
                    <button
                      onClick={() => handleDisconnectAccount(platform.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                    >
                      <Unlink className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnectAccount(platform.id)}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all"
                    >
                      <Link className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {account?.connected ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Followers</span>
                      <span className="font-bold text-slate-900">{formatNumber(account.followers)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Engagement</span>
                      <span className="font-bold text-green-600">{account.engagement}%</span>
                    </div>
                    <div className="pt-3 border-t border-slate-200">
                      <button className="w-full py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-all text-sm font-medium">
                        <ExternalLink className="w-4 h-4 inline mr-2" />
                        View Profile
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-slate-500 mb-3">Not connected</p>
                    <button
                      onClick={() => handleConnectAccount(platform.id)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all text-sm font-medium"
                    >
                      Connect Account
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'posts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">Recent Posts</h3>
            <button
              onClick={() => setActiveTab('create')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Create Post
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {posts.map(post => (
              <div key={post.id} className="bg-white p-6 rounded-2xl border border-slate-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {post.platforms.map((platform: string) => {
                      const platformData = socialPlatforms.find(p => p.id === platform);
                      if (!platformData) return null;
                      const Icon = platformData.icon;
                      return (
                        <Icon key={platform} className={`w-4 h-4 ${platformData.color}`} />
                      );
                    })}
                  </div>
                  <span className="text-xs text-slate-500">{formatDate(post.created_at)}</span>
                </div>

                <p className="text-slate-900 mb-4">{post.content}</p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{post.engagement.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.engagement.comments}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Share className="w-4 h-4" />
                      <span>{post.engagement.shares}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1 text-slate-400 hover:text-slate-600">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-slate-400 hover:text-slate-600">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-slate-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-blue-600" />
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">24.8K</h3>
              <p className="text-slate-600">Total Followers</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <Heart className="w-8 h-8 text-red-600" />
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">4.2%</h3>
              <p className="text-slate-600">Avg Engagement</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <FileText className="w-8 h-8 text-purple-600" />
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">156</h3>
              <p className="text-slate-600">Posts This Month</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <BarChart3 className="w-8 h-8 text-green-600" />
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">89K</h3>
              <p className="text-slate-600">Total Reach</p>
            </div>
          </div>

          {/* Platform Performance */}
          <div className="bg-white p-8 rounded-2xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Platform Performance</h3>
            <div className="space-y-4">
              {socialPlatforms.filter(p => connectedAccounts[p.id]?.connected).map(platform => {
                const account = connectedAccounts[platform.id];
                const Icon = platform.icon;
                
                return (
                  <div key={platform.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <Icon className={`w-6 h-6 ${platform.color}`} />
                      <div>
                        <h4 className="font-medium text-slate-900">{platform.name}</h4>
                        <p className="text-sm text-slate-600">{account.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 text-sm">
                      <div className="text-center">
                        <p className="font-bold text-slate-900">{formatNumber(account.followers)}</p>
                        <p className="text-slate-600">Followers</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-green-600">{account.engagement}%</p>
                        <p className="text-slate-600">Engagement</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-blue-600">+12%</p>
                        <p className="text-slate-600">Growth</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-8 rounded-2xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Create New Post</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Post Content</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="What's happening with your business?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Platforms</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {socialPlatforms.filter(p => connectedAccounts[p.id]?.connected).map(platform => {
                    const Icon = platform.icon;
                    const isSelected = newPost.platforms.includes(platform.id);
                    
                    return (
                      <button
                        key={platform.id}
                        onClick={() => {
                          if (isSelected) {
                            setNewPost({
                              ...newPost,
                              platforms: newPost.platforms.filter(p => p !== platform.id)
                            });
                          } else {
                            setNewPost({
                              ...newPost,
                              platforms: [...newPost.platforms, platform.id]
                            });
                          }
                        }}
                        className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                          isSelected
                            ? `${platform.bgColor} ${platform.borderColor} ${platform.color}`
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{platform.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Schedule Post (Optional)</label>
                <input
                  type="datetime-local"
                  value={newPost.scheduled_at}
                  onChange={(e) => setNewPost({...newPost, scheduled_at: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <button
                  onClick={() => setActiveTab('posts')}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePost}
                  disabled={!newPost.content || newPost.platforms.length === 0 || isLoading}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 inline mr-2" />
                      {newPost.scheduled_at ? 'Schedule Post' : 'Post Now'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialMediaManager;