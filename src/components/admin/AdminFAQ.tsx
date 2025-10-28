import React, { useState } from 'react';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { FAQ } from '../../types';
import GlassCard from '../GlassCard';

export default function AdminFAQ() {
  const { faqs, addFAQ, updateFAQ, deleteFAQ } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    order: 1,
  });

  const sortedFAQs = faqs.sort((a, b) => a.order - b.order);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (editingFAQ) {
        await updateFAQ(editingFAQ.id, formData);
      } else {
        await addFAQ(formData);
      }
      
      setIsModalOpen(false);
      setEditingFAQ(null);
      setFormData({
        question: '',
        answer: '',
        order: Math.max(...faqs.map(f => f.order), 0) + 1,
      });
    } catch (error) {
      console.error('Error saving FAQ:', error);
      alert('Error saving FAQ. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFAQ(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      order: faq.order,
    });
    setIsModalOpen(true);
  };

  const moveUp = async (faq: FAQ) => {
    const prevFAQ = sortedFAQs.find(f => f.order === faq.order - 1);
    if (prevFAQ) {
      try {
        await updateFAQ(faq.id, { order: faq.order - 1 });
        await updateFAQ(prevFAQ.id, { order: prevFAQ.order + 1 });
      } catch (error) {
        console.error('Error reordering FAQ:', error);
      }
    }
  };

  const moveDown = async (faq: FAQ) => {
    const nextFAQ = sortedFAQs.find(f => f.order === faq.order + 1);
    if (nextFAQ) {
      try {
        await updateFAQ(faq.id, { order: faq.order + 1 });
        await updateFAQ(nextFAQ.id, { order: nextFAQ.order - 1 });
      } catch (error) {
        console.error('Error reordering FAQ:', error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      try {
        await deleteFAQ(id);
      } catch (error) {
        console.error('Error deleting FAQ:', error);
        alert('Error deleting FAQ. Please try again.');
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Manage FAQ</h1>
          <p className="text-gray-300">Create and organize frequently asked questions</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 inline mr-2" />
          Add FAQ
        </button>
      </div>

      {/* FAQ List */}
      <div className="space-y-4">
        {sortedFAQs.map((faq, index) => (
          <GlassCard key={faq.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">{faq.question}</h3>
                <p className="text-gray-300 mb-4">{faq.answer}</p>
                <div className="text-sm text-gray-400">Order: {faq.order}</div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => moveUp(faq)}
                  className="text-gray-400 hover:text-cyan-400 p-1"
                  disabled={index === 0}
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => moveDown(faq)}
                  className="text-gray-400 hover:text-cyan-400 p-1"
                  disabled={index === sortedFAQs.length - 1}
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleEdit(faq)}
                  className="text-blue-400 hover:text-blue-300 p-1"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(faq.id)}
                  className="text-red-400 hover:text-red-300 p-1"
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
          <GlassCard className="w-full max-w-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingFAQ ? 'Edit FAQ' : 'Add New FAQ'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Question
                </label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                  className="input-field w-full"
                  placeholder="What is the question?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Answer
                </label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                  className="input-field w-full resize-none"
                  rows={6}
                  placeholder="Provide a detailed answer..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                  className="input-field w-full"
                  min="1"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingFAQ(null);
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
                  {submitting ? 'Saving...' : editingFAQ ? 'Update' : 'Add'} FAQ
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}