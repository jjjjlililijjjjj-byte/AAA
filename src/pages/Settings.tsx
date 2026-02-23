import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Palette, User, Cloud, LogOut, Upload, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { cn } from '../utils/cn';

export const Settings: React.FC = () => {
  const { userStats, setTheme, updateProfile } = useAppContext();
  const [activeTab, setActiveTab] = useState<'appearance' | 'account'>('appearance');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  const handleEditProfile = () => {
    setEditName(userStats.profile.name);
    setEditAvatar(userStats.profile.avatar || '');
    setIsEditingProfile(true);
  };

  const handleSaveProfile = () => {
    if (editName.trim()) {
      updateProfile({ name: editName.trim(), avatar: editAvatar.trim() || undefined });
    }
    setIsEditingProfile(false);
  };

  const themes = [
    { id: 'default', name: '烟雨江南', desc: '灰豆绿与米灰为主，清冷素雅', colors: ['#8F9B8C', '#E8E6DF'] },
    { id: 'wilderness', name: '荒野孤灯', desc: '木质棕与暗灰为主，深沉静谧', colors: ['#6B5B4D', '#3A3A3A'] },
    { id: 'twilight', name: '暮色温柔', desc: '淡茱萸粉与暖陶土，舒缓压力', colors: ['#B87B6A', '#F2DADA'] },
    { id: 'northern', name: '极北之境', desc: '冷雾蓝与雪地白，冷静高效', colors: ['#A4B5C4', '#FFFFFF'] },
    { id: 'matcha', name: '抹茶初雪', desc: '浅绿与纯白，清新自然', colors: ['#7A9A75', '#F6F8F4'] },
    { id: 'lavender', name: '薰衣草田', desc: '灰紫与浅灰，优雅宁静', colors: ['#8E84A3', '#F8F7FA'] },
    { id: 'rose', name: '玫瑰庄园', desc: '暗粉与暖白，浪漫温馨', colors: ['#C48B8D', '#FDF8F6'] },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-1 md:mb-2">设置</h1>
        <p className="text-sm md:text-base text-text-muted">定制你的专属空间。</p>
      </header>

      <div className="flex flex-col md:flex-row gap-4 md:gap-8 flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex flex-row md:flex-col gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0 flex-shrink-0">
          <button
            onClick={() => setActiveTab('appearance')}
            className={cn(
              "flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-xl transition-all text-sm md:text-base whitespace-nowrap",
              activeTab === 'appearance' ? "bg-surface border border-border font-medium shadow-sm" : "text-text-muted hover:bg-surface/50"
            )}
          >
            <Palette size={18} className="md:w-5 md:h-5" />
            外观与主题
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={cn(
              "flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-xl transition-all text-sm md:text-base whitespace-nowrap",
              activeTab === 'account' ? "bg-surface border border-border font-medium shadow-sm" : "text-text-muted hover:bg-surface/50"
            )}
          >
            <User size={18} className="md:w-5 md:h-5" />
            个人账户
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 bg-surface rounded-2xl md:rounded-3xl border border-border shadow-sm p-4 md:p-8 overflow-y-auto">
          {activeTab === 'appearance' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 md:space-y-8">
              <div>
                <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">莫兰迪主题馆</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  {themes.map(theme => (
                    <div
                      key={theme.id}
                      onClick={() => setTheme(theme.id as any)}
                      className={cn(
                        "p-4 md:p-6 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-md group",
                        userStats.theme === theme.id ? "border-primary bg-bg" : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="flex justify-between items-start mb-3 md:mb-4">
                        <div>
                          <h3 className="font-bold text-base md:text-lg mb-0.5 md:mb-1">{theme.name}</h3>
                          <p className="text-xs md:text-sm text-text-muted">{theme.desc}</p>
                        </div>
                        <div className="flex -space-x-2">
                          {theme.colors.map((color, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-surface shadow-sm"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="h-1.5 md:h-2 w-full rounded-full bg-border overflow-hidden">
                        <div
                          className="h-full transition-all duration-500"
                          style={{
                            width: userStats.theme === theme.id ? '100%' : '0%',
                            backgroundColor: theme.colors[0]
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'account' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 md:space-y-8 max-w-2xl">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 pb-6 md:pb-8 border-b border-border text-center sm:text-left">
                <div className="relative group cursor-pointer" onClick={() => !isEditingProfile && handleEditProfile()}>
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl md:text-3xl font-bold overflow-hidden">
                    {userStats.profile.avatar ? (
                      <img src={userStats.profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      userStats.profile.name.charAt(0)
                    )}
                  </div>
                  {!isEditingProfile && (
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload className="text-white md:w-6 md:h-6" size={20} />
                    </div>
                  )}
                </div>
                
                {isEditingProfile ? (
                  <div className="flex-1 w-full space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-muted mb-1">昵称</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-bg border border-border rounded-xl px-3 py-2 text-text focus:outline-none focus:border-primary transition-colors"
                        placeholder="输入昵称"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-muted mb-1">头像链接 (可选)</label>
                      <input
                        type="text"
                        value={editAvatar}
                        onChange={(e) => setEditAvatar(e.target.value)}
                        className="w-full bg-bg border border-border rounded-xl px-3 py-2 text-text focus:outline-none focus:border-primary transition-colors"
                        placeholder="https://..."
                      />
                    </div>
                    <div className="flex gap-2 justify-end sm:justify-start">
                      <button 
                        onClick={() => setIsEditingProfile(false)}
                        className="px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-bg transition-colors"
                      >
                        取消
                      </button>
                      <button 
                        onClick={handleSaveProfile}
                        disabled={!editName.trim()}
                        className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50"
                      >
                        保存
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <h2 className="text-xl md:text-2xl font-bold mb-1">{userStats.profile.name}</h2>
                      <p className="text-sm md:text-base text-text-muted">138****8888</p>
                    </div>
                    <button 
                      onClick={handleEditProfile}
                      className="px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-bg transition-colors w-full sm:w-auto"
                    >
                      编辑资料
                    </button>
                  </>
                )}
              </div>

              <div className="space-y-3 md:space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-bg rounded-2xl border border-border gap-4 sm:gap-0">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
                      <Cloud size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm md:text-base">云端同步</h4>
                      <p className="text-xs md:text-sm text-text-muted">上次同步：今天 08:30</p>
                    </div>
                  </div>
                  <button className="text-primary font-medium text-sm hover:underline w-full sm:w-auto text-center sm:text-right">
                    立即同步
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-bg rounded-2xl border border-border cursor-pointer hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-text-muted flex-shrink-0">
                      <User size={20} />
                    </div>
                    <h4 className="font-medium text-sm md:text-base">账号安全</h4>
                  </div>
                  <ChevronRight className="text-text-muted" size={20} />
                </div>

                <button className="w-full flex items-center justify-center gap-2 p-3 md:p-4 mt-6 md:mt-8 text-red-500 hover:bg-red-50 rounded-2xl transition-colors font-medium text-sm md:text-base">
                  <LogOut size={18} className="md:w-5 md:h-5" />
                  退出登录
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
