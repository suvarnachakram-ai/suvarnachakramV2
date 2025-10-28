import React, { useState } from 'react';
import { Calendar, User, Search } from 'lucide-react';
import { useData } from '../context/DataContext';
import GlassCard from '../components/GlassCard';

export default function News() {
  const { news } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNews = news.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.body.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
          Latest News & Updates
        </h1>
        <p className="text-xl text-gray-300">
          Stay informed about important announcements, schedule changes, and lottery updates.
        </p>
      </div>

      {/* Search */}
      <GlassCard className="p-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search news and updates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field w-full pl-10"
          />
        </div>
      </GlassCard>

      {/* News Articles */}
      <div className="space-y-6">
        {filteredNews.length > 0 ? (
          filteredNews.map((post) => (
            <GlassCard key={post.id} hover className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {post.title}
                </h2>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{post.author}</span>
                </div>
              </div>
              
              <p className="text-gray-300 leading-relaxed">{post.body}</p>
            </GlassCard>
          ))
        ) : (
          <GlassCard className="p-12 text-center">
            <div className="text-gray-400 mb-4 text-lg">No news found</div>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'No news articles available at the moment'}
            </p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}