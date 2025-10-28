import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Zap, Calendar, Search, Download } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Draw } from '../../types';
import { formatSlotTime, TIME_SLOTS } from '../../utils/time';
import { manualPublishDraw } from '../../utils/automation';
import GlassCard from '../GlassCard';

export default function AdminDraws() {
  const { draws, addDraw, updateDraw, deleteDraw } = useData();
  const [activeTab, setActiveTab] = useState<'today' | 'history'>('today');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDraw, setEditingDraw] = useState<Draw | null>(null);
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlineEditForm, setInlineEditForm] = useState({
    digit1: '',
    digit2: '',
    digit3: '',
    digit4: '',
    digit5: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const today = new Date().toISOString().split('T')[0];
  const [filters, setFilters] = useState({
    month: new Date().toISOString().slice(0, 7),
    search: '',
  });
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

  const todayDraws = draws
    .filter(draw => draw.date === today)
    .sort((a, b) => a.slot.localeCompare(b.slot));

  let historyDraws = draws.filter(draw => draw.date !== today);
  if (filters.month) {
    historyDraws = historyDraws.filter(draw => draw.date.startsWith(filters.month));
  }
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    historyDraws = historyDraws.filter(draw =>
      draw.drawNo.toLowerCase().includes(searchLower) ||
      draw.digit1.includes(filters.search) ||
      draw.digit2.includes(filters.search) ||
      draw.digit3.includes(filters.search) ||
      draw.digit4.includes(filters.search) ||
      draw.digit5.includes(filters.search)
    );
  }
  historyDraws.sort((a, b) =>
    new Date(b.date + ' ' + b.slot).getTime() - new Date(a.date + ' ' + a.slot).getTime()
  );

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

  const handleInlineEdit = (draw: Draw) => {
    setInlineEditingId(draw.id);
    setInlineEditForm({
      digit1: draw.digit1,
      digit2: draw.digit2,
      digit3: draw.digit3,
      digit4: draw.digit4,
      digit5: draw.digit5,
    });
  };

  const handleSaveInlineEdit = async (drawId: string) => {
    try {
      await updateDraw(drawId, inlineEditForm);
      setInlineEditingId(null);
    } catch (error) {
      console.error('Error updating draw:', error);
      alert('Error updating result. Please try again.');
    }
  };

  const handleModalEdit = (draw: Draw) => {
    setEditingDraw(draw);
    setFormData({
      date: draw.date,
      slot: draw.slot,
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

  const exportToCSV = () => {
    const dataToExport = activeTab === 'today' ? todayDraws : historyDraws;
    const csvContent = [
      ['Date', 'Time', 'Draw No', 'Digit 1', 'Digit 2', 'Digit 3', 'Digit 4', 'Digit 5', 'Status'],
      ...dataToExport.map(draw => [
        draw.date,
        formatSlotTime(draw.slot),
        draw.drawNo,
        draw.digit1,
        draw.digit2,
        draw.digit3,
        draw.digit4,
        draw.digit5,
        draw.published ? 'Published' : 'Draft',
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-draws-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-2">Manage Results</h1>
          <p className="text-gray-300 text-sm md:text-base">Add, edit, and publish lottery draw results</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 inline mr-2" />
          Add Result
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setActiveTab('today')}
          className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'today'
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
              : 'bg-white/5 text-gray-400 hover:text-yellow-400 hover:bg-white/10'
          }`}
        >
          Today's Draws
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'history'
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
              : 'bg-white/5 text-gray-400 hover:text-yellow-400 hover:bg-white/10'
          }`}
        >
          History
        </button>
      </div>

      {activeTab === 'today' ? (
        <>
          {/* Today's Draws - Card View */}
          {todayDraws.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayDraws.map((draw) => (
                <GlassCard key={draw.id} className="p-4 sm:p-6">
                  {inlineEditingId === draw.id ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-base sm:text-lg font-bold text-yellow-400">{draw.drawNo}</h3>
                        <span className="text-xs sm:text-sm text-gray-400">{formatSlotTime(draw.slot)}</span>
                      </div>
                      <div className="grid grid-cols-5 gap-1 sm:gap-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <input
                            key={i}
                            type="text"
                            maxLength={1}
                            value={inlineEditForm[`digit${i}` as keyof typeof inlineEditForm]}
                            onChange={(e) => setInlineEditForm(prev => ({ ...prev, [`digit${i}`]: e.target.value }))}
                            className="input-field text-center font-mono font-bold text-sm sm:text-base"
                          />
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveInlineEdit(draw.id)}
                          className="flex-1 btn-primary py-2 text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setInlineEditingId(null)}
                          className="flex-1 btn-secondary py-2 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-base sm:text-lg font-bold text-yellow-400">{draw.drawNo}</h3>
                        <span className="text-xs sm:text-sm text-gray-400">{formatSlotTime(draw.slot)}</span>
                      </div>
                      <div className="flex justify-center space-x-1 sm:space-x-2">
                        {[draw.digit1, draw.digit2, draw.digit3, draw.digit4, draw.digit5].map((digit, idx) => (
                          <span
                            key={idx}
                            className="text-xl sm:text-2xl px-2 sm:px-3 py-1 sm:py-2 min-w-[40px] sm:min-w-[48px] text-center bg-gradient-to-br from-gray-900 via-black to-gray-800 border border-yellow-600/30 rounded-lg text-yellow-200 font-mono font-bold"
                          >
                            {digit}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-white/10 gap-3">
                        <span className={`text-xs px-2 py-1 rounded ${draw.published ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {draw.published ? 'Published' : 'Draft'}
                        </span>
                        <div className="flex space-x-2 w-full sm:w-auto">
                          {!draw.published && (
                            <button
                              onClick={() => handleQuickPublish(draw)}
                              disabled={publishingId === draw.id}
                              className="flex-1 sm:flex-none p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
                              title="Quick Publish"
                            >
                              <Zap className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => togglePublished(draw)}
                            className="flex-1 sm:flex-none p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-yellow-400 transition-colors"
                            title={draw.published ? 'Unpublish' : 'Publish'}
                          >
                            {draw.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleInlineEdit(draw)}
                            className="flex-1 sm:flex-none p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-blue-400 transition-colors"
                            title="Quick Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(draw.id)}
                            className="flex-1 sm:flex-none p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard className="p-12 text-center">
              <div className="text-gray-400 mb-4 text-lg">No draws for today</div>
              <p className="text-gray-500 mb-6">Add a new draw to get started</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-primary"
              >
                <Plus className="h-4 w-4 inline mr-2" />
                Add Result
              </button>
            </GlassCard>
          )}
        </>
      ) : (
        <>
          {/* History Tab - Filters */}
          <GlassCard className="p-4 sm:p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />Month
                </label>
                <input
                  type="month"
                  value={filters.month}
                  onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Search className="h-4 w-4 inline mr-1" />
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Draw no. or numbers..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="input-field w-full"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={exportToCSV}
                  className="btn-primary w-full"
                >
                  <Download className="h-4 w-4 inline mr-2" />
                  Export CSV
                </button>
              </div>
            </div>
          </GlassCard>

          {/* History Table */}
          <GlassCard className="overflow-hidden">
            {historyDraws.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-white/10">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-300">Date</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-300">Time</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-300">Draw No.</th>
                      <th className="px-2 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-medium text-gray-300">Numbers</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-medium text-gray-300">Status</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-medium text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {historyDraws.map((draw) => (
                      <tr key={draw.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-300">
                          <div className="md:hidden">{new Date(draw.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}</div>
                          <div className="hidden md:block">{new Date(draw.date).toLocaleDateString()}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-cyan-400 font-medium">
                          {formatSlotTime(draw.slot)}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-white">
                          {draw.drawNo}
                        </td>
                        <td className="px-2 sm:px-6 py-3 sm:py-4 text-center">
                          <div className="flex justify-center space-x-0.5 sm:space-x-1">
                            {[draw.digit1, draw.digit2, draw.digit3, draw.digit4, draw.digit5].map((digit, idx) => (
                              <span key={idx} className="text-xs px-1 py-0.5 sm:px-2 sm:py-1 min-w-[20px] sm:min-w-[28px] bg-gradient-to-br from-gray-900 via-black to-gray-800 border border-yellow-600/30 rounded text-yellow-200 font-mono font-bold">
                                {digit}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            draw.published
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-orange-500/20 text-orange-400'
                          }`}>
                            {draw.published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                          <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                            <button
                              onClick={() => handleModalEdit(draw)}
                              className="text-yellow-400 hover:text-yellow-300 p-1"
                              title="Edit Draw"
                            >
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                            <button
                              onClick={() => togglePublished(draw)}
                              className={`p-1 ${draw.published ? 'text-orange-400 hover:text-orange-300' : 'text-green-400 hover:text-green-300'}`}
                              title={draw.published ? 'Unpublish' : 'Publish'}
                            >
                              {draw.published ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
                            </button>
                            <button
                              onClick={() => handleDelete(draw.id)}
                              className="text-red-400 hover:text-red-300 p-1"
                              title="Delete Draw"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="text-gray-400 mb-4 text-lg">No results found</div>
                <p className="text-gray-500 mb-6">
                  Try adjusting your filters or check back later
                </p>
                <button
                  onClick={() => setFilters({ month: new Date().toISOString().slice(0, 7), search: '' })}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </GlassCard>
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <GlassCard className="w-full max-w-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">
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
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i}>
                      <input
                        type="text"
                        value={formData[`digit${i}` as keyof typeof formData] as string}
                        onChange={(e) => setFormData(prev => ({ ...prev, [`digit${i}`]: e.target.value }))}
                        className="input-field w-full text-center text-xl font-bold"
                        placeholder="0"
                        maxLength={1}
                        pattern="[0-9]"
                        required
                      />
                      <div className="text-xs text-center text-gray-400 mt-1">{i}</div>
                    </div>
                  ))}
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
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-sm disabled:opacity-50"
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
