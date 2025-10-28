import React, { useState } from 'react';
import { Plus, Edit, Trash2, Lock, Unlock, Zap } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Draw } from '../../types';
import { formatSlotTime, TIME_SLOTS } from '../../utils/time';
import { manualPublishDraw } from '../../utils/automation';
import GlassCard from '../GlassCard';

export default function AdminDraws() {
  const { draws, addDraw, updateDraw, deleteDraw } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDraw, setEditingDraw] = useState<Draw | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Draw, 'id' | 'createdAt' | 'updatedAt'>>({
    date: new Date().toISOString().split('T')[0],
    slot: '12:00',
    drawNo: '',
    digit1: '',
    digit2: '',
    digit3: '',
    digit4: '',
    digit5: '',
    published: false,
  });

  // avoid mutating context array
  const sortedDraws = [...draws].sort((a, b) => 
    new Date(b.date + ' ' + b.slot).getTime() - new Date(a.date + ' ' + a.slot).getTime()
  );
  
  // Pagination for results table
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(sortedDraws.length / rowsPerPage));
  const pagedDraws = sortedDraws.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (editingDraw) {
        await updateDraw(editingDraw.id, formData);
      } else {
        await addDraw(formData);
      }
      
      setIsModalOpen(false);
      setEditingDraw(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        slot: '12:00',
        drawNo: '',
        digit1: '',
        digit2: '',
        digit3: '',
        digit4: '',
        digit5: '',
        published: false,
      });
    } catch (error) {
      console.error('Error saving draw:', error);
      alert('Error saving result. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (draw: Draw) => {
    setEditingDraw(draw);
    setFormData({
      date: draw.date,
      slot: draw.slot, // <-- use actual draw.slot instead of hardcoded '12:30'
      drawNo: draw.drawNo,
      digit1: draw.digit1,
      digit2: draw.digit2,
      digit3: draw.digit3,
      digit4: draw.digit4,
      digit5: draw.digit5,
      published: draw.published,
    });
    setIsModalOpen(true);
  };

  const togglePublished = async (draw: Draw) => {
    try {
      await updateDraw(draw.id, { published: !draw.published });
    } catch (error) {
      console.error('Error updating draw:', error);
      alert('Error updating publication status. Please try again.');
    }
  };

  const handleQuickPublish = async (draw: Draw) => {
    setPublishingId(draw.id);
    try {
      await manualPublishDraw(draw.id);
    } catch (error) {
      console.error('Error publishing draw:', error);
      alert('Error publishing result. Please try again.');
    } finally {
      setPublishingId(null);
    }
  };
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this result?')) {
      try {
        await deleteDraw(id);
      } catch (error) {
        console.error('Error deleting draw:', error);
        alert('Error deleting result. Please try again.');
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Manage Results</h1>
          <p className="text-gray-300">Add, edit, and publish lottery draw results</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 inline mr-2" />
          Add Result
        </button>
      </div>

      {/* Results Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Time</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Draw No.</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">Digit 1</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">Digit 2</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">Digit 3</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">Digit 4</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">Digit 5</th>
        
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">Status</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {sortedDraws.map((draw) => (
                <tr key={draw.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {new Date(draw.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-cyan-400 font-medium">
                    {formatSlotTime(draw.slot)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-white">
                    {draw.drawNo}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="number-display">
                      {draw.digit1}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="number-display">
                      {draw.digit2}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="number-display">
                      {draw.digit3}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="number-display">
                      {draw.digit4}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="number-display">
                      {draw.digit5}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      draw.published 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {draw.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleEdit(draw)}
                        className="text-yellow-400 hover:text-yellow-300"
                        title="Edit Draw"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {!draw.published && (
                        <button
                          onClick={() => handleQuickPublish(draw)}
                          disabled={publishingId === draw.id}
                          className="text-green-400 hover:text-green-300 disabled:opacity-50"
                          title="Quick Publish"
                        >
                          <Zap className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => togglePublished(draw)}
                        className={draw.published ? 'text-orange-400 hover:text-orange-300' : 'text-green-400 hover:text-green-300'}
                        title={draw.published ? 'Unpublish' : 'Publish'}
                      >
                        {draw.published ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(draw.id)}
                        className="text-red-400 hover:text-red-300"
                        title="Delete Draw"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile list view */}
        <div className="sm:hidden space-y-3 p-3">
          {pagedDraws.map((draw) => (
            <div key={draw.id} className="p-3 glass-card">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-white">{draw.drawNo}</div>
                  <div className="text-sm text-gray-400">{new Date(draw.date).toLocaleDateString()} • {formatSlotTime(draw.slot)}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-cyan-400/20 text-cyan-400 px-2 py-1 rounded">{draw.digit1}</span>
                  <span className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded">{draw.digit2}</span>
                  <span className="text-xs bg-green-400/20 text-green-400 px-2 py-1 rounded">{draw.digit3}</span>
                  <span className="text-xs bg-purple-400/20 text-purple-400 px-2 py-1 rounded">{draw.digit4}</span>
                  <span className="text-xs bg-pink-400/20 text-pink-400 px-2 py-1 rounded">{draw.digit5}</span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-sm">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${draw.published ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>{draw.published ? 'Published' : 'Draft'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => handleEdit(draw)} className="text-cyan-400 hover:text-cyan-300">Edit</button>
                  <button onClick={() => togglePublished(draw)} className="text-yellow-400 hover:text-yellow-300">Toggle</button>
                  <button onClick={() => handleDelete(draw.id)} className="text-red-400 hover:text-red-300">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination controls */}
        <div className="mt-4 p-4 flex items-center justify-between text-sm text-gray-300">
          <div>
            Showing {sortedDraws.length === 0 ? 0 : currentPage * rowsPerPage + 1} - {Math.min((currentPage + 1) * rowsPerPage, sortedDraws.length)} of {sortedDraws.length}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="px-3 py-1 glass-card disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-2">Page {currentPage + 1} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-1 glass-card disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <GlassCard className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingDraw ? 'Edit Result' : 'Add New Result'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="input-field w-full"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Time Slot
                  </label>
                  <select
                    value={formData.slot}
                    onChange={(e) => setFormData(prev => ({ ...prev, slot: e.target.value as any }))}
                    className="input-field w-full"
                    required
                  >
                    {TIME_SLOTS.map(slot => (
                      <option key={slot} value={slot}>
                        {formatSlotTime(slot)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Draw Number
                </label>
                <input
                  type="text"
                  value={formData.drawNo}
                  onChange={(e) => setFormData(prev => ({ ...prev, drawNo: e.target.value }))}
                  className="input-field w-full"
                  placeholder="SC12345"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Winning Numbers (5 Digits)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  <div>
                    <input
                      type="text"
                      value={formData.digit1}
                      onChange={(e) => setFormData(prev => ({ ...prev, digit1: e.target.value }))}
                      className="input-field w-full text-center text-xl font-bold"
                      placeholder="0"
                      maxLength={1}
                      pattern="[0-9]"
                      required
                    />
                    <div className="text-xs text-center text-cyan-400 mt-1">1st</div>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.digit2}
                      onChange={(e) => setFormData(prev => ({ ...prev, digit2: e.target.value }))}
                      className="input-field w-full text-center text-xl font-bold"
                      placeholder="0"
                      maxLength={1}
                      pattern="[0-9]"
                      required
                    />
                    <div className="text-xs text-center text-yellow-400 mt-1">2nd</div>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.digit3}
                      onChange={(e) => setFormData(prev => ({ ...prev, digit3: e.target.value }))}
                      className="input-field w-full text-center text-xl font-bold"
                      placeholder="0"
                      maxLength={1}
                      pattern="[0-9]"
                      required
                    />
                    <div className="text-xs text-center text-green-400 mt-1">3rd</div>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.digit4}
                      onChange={(e) => setFormData(prev => ({ ...prev, digit4: e.target.value }))}
                      className="input-field w-full text-center text-xl font-bold"
                      placeholder="0"
                      maxLength={1}
                      pattern="[0-9]"
                      required
                    />
                    <div className="text-xs text-center text-purple-400 mt-1">4th</div>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.digit5}
                      onChange={(e) => setFormData(prev => ({ ...prev, digit5: e.target.value }))}
                      className="input-field w-full text-center text-xl font-bold"
                      placeholder="0"
                      maxLength={1}
                      pattern="[0-9]"
                      required
                    />
                    <div className="text-xs text-center text-pink-400 mt-1">5th</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                  className="h-4 w-4 text-cyan-500 border-gray-600 rounded focus:ring-cyan-500"
                />
                <label htmlFor="published" className="text-sm text-gray-300">
                  Publish immediately
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingDraw(null);
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
                  {submitting ? 'Saving...' : editingDraw ? 'Update' : 'Add'} Result
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}