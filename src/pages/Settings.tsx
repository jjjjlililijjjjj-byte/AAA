import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Palette, User, Cloud, LogOut, Upload, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { cn } from '../utils/cn';

export const Settings: React.FC = () => {
  const { userStats, setTheme } = useAppContext();
  const [activeTab, setActiveTab] = useState<'appearance' | 'account'>('appearance');

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
    <div className="h-full flex flex-col">
      <header className="mb-8">
        <h1 className="text-4xl font-light tracking-tight mb-2">设置</h1>
        <p className="text-text-muted">定制你的专属空间。</p>
      </header>

      <div className="flex gap-8 flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 flex flex-col gap-2">
          <button
            onClick={() => setActiveTab('appearance')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
              activeTab === 'appearance' ? "bg-surface border border-border font-medium shadow-sm" : "text-text-muted hover:bg-surface/50"
            )}
          >
            <Palette size={20} />
            外观与主题
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
              activeTab === 'account' ? "bg-surface border border-border font-medium shadow-sm" : "text-text-muted hover:bg-surface/50"
            )}
          >
            <User size={20} />
            个人账户
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 bg-surface rounded-3xl border border-border shadow-sm p-8 overflow-y-auto">
          {activeTab === 'appearance' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold mb-6">莫兰迪主题馆</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {themes.map(theme => (
                    <div
                      key={theme.id}
                      onClick={() => setTheme(theme.id as any)}
                      className={cn(
                        "p-6 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-md group",
                        userStats.theme === theme.id ? "border-primary bg-bg" : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg mb-1">{theme.name}</h3>
                          <p className="text-sm text-text-muted">{theme.desc}</p>
                        </div>
                        <div className="flex -space-x-2">
                          {theme.colors.map((color, i) => (
                            <div
                              key={i}
                              className="w-8 h-8 rounded-full border-2 border-surface shadow-sm"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-border overflow-hidden">
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-2xl">
              <div className="flex items-center gap-6 pb-8 border-b border-border">
                <div className="relative group cursor-pointer">
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold overflow-hidden">
                    悦
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="text-white" size={24} />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1">时光旅人</h2>
                  <p className="text-text-muted">138****8888</p>
                </div>
                <button className="ml-auto px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-bg transition-colors">
                  编辑资料
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-bg rounded-2xl border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                      <Cloud size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium">云端同步</h4>
                      <p className="text-sm text-text-muted">上次同步：今天 08:30</p>
                    </div>
                  </div>
                  <button className="text-primary font-medium text-sm hover:underline">
                    立即同步
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-bg rounded-2xl border border-border cursor-pointer hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-text-muted">
                      <User size={20} />
                    </div>
                    <h4 className="font-medium">账号安全</h4>
                  </div>
                  <ChevronRight className="text-text-muted" size={20} />
                </div>

                <button className="w-full flex items-center justify-center gap-2 p-4 mt-8 text-red-500 hover:bg-red-50 rounded-2xl transition-colors font-medium">
                  <LogOut size={20} />
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
