import React, { useState } from 'react';
import { Plus, Edit, Trash2, Calendar, User } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { NewsPost } from '../../types';
import GlassCard from '../GlassCard';

export default function AdminNews() {
  const { news, addNews, updateNews, deleteNews } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsPost | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    author: 'Kerala Lottery Department',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const submitData = async () => {
      try {
        if (editingNews) {
          await updateNews(editingNews.id, formData);
        } else {
          await addNews(formData);
        }
        
        setIsModalOpen(false);
        setEditingNews(null);
        setFormData({
          title: '',
          body: '',
          author: 'Suvarna Chakram Department',
        });
      } catch (error) {
        console.error('Error saving news:', error);
        alert('Error saving article. Please try again.');
      } finally {
        setSubmitting(false);
      }
    };
    
    submitData();
  };

  const handleEdit = (post: NewsPost) => {
    setEditingNews(post);
    setFormData({
      title: post.title,
      body: post.body,
      author: post.author,
    });
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Manage News</h1>
          <p className="text-gray-300">Create and manage news articles and announcements</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 inline mr-2" />
          Add News
        </button>
      </div>

      {/* News List */}
      <div className="space-y-4">
        {news.map((post) => (
          <GlassCard key={post.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">{post.title}</h3>
                <p className="text-gray-300 mb-4 line-clamp-3">{post.body}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{post.author}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handleEdit(post)}
                  className="text-yellow-400 hover:text-yellow-300 p-2"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteNews(post.id)}
                  className="text-red-400 hover:text-red-300 p-2"
                  title="Delete Article"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

{/* Modal */}
{isModalOpen && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <GlassCard className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingNews ? 'Edit News Article' : 'Add News Article'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="input-field w-full"
                  placeholder="Article title..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Author
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  className="input-field w-full"
                  placeholder="Author name..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                  className="input-field w-full resize-none"
                  rows={8}
                  placeholder="Article content..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingNews(null);
                  }}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="btn-primary disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingNews ? 'Update' : 'Publish'} Article
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}