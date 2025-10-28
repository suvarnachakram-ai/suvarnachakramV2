import React, { useState, useEffect } from 'react';
import { Calendar, Download, Search, Filter, ChevronDown } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Draw } from '../types';
import { formatSlotTime, isDrawToday, TIME_SLOTS } from '../utils/time';
import GlassCard from '../components/GlassCard';

export default function Results() {
  const { draws, refreshData } = useData();
  const [filteredDraws, setFilteredDraws] = useState<Draw[]>([]);
  const today = new Date().toISOString().split('T')[0];
  const [filters, setFilters] = useState({
    month: new Date().toISOString().slice(0, 7), // Current month (YYYY-MM)
    search: '',
    showTodayOnly: true,
  });

  useEffect(() => {
    let filtered = draws.filter(draw => draw.published);

    // Filter for today's results only
    if (filters.showTodayOnly) {
      filtered = filtered.filter(draw => draw.date === today);
    } else if (filters.month) {
      filtered = filtered.filter(draw => draw.date.startsWith(filters.month));
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(draw =>
        draw.drawNo.toLowerCase().includes(searchLower) ||
        draw.digit1.includes(filters.search) ||
        draw.digit2.includes(filters.search) ||
        draw.digit3.includes(filters.search) ||
        draw.digit4.includes(filters.search) ||
        draw.digit5.includes(filters.search)
      );
    }

    // Group by date and sort
    const grouped = filtered.reduce((acc, draw) => {
      if (!acc[draw.date]) {
        acc[draw.date] = [];
      }
      acc[draw.date].push(draw);
      return acc;
    }, {} as Record<string, Draw[]>);

    // Sort each date's draws by slot time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => a.slot.localeCompare(b.slot));
    });

    // Convert back to flat array, sorted by date (newest first)
    const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
    const result = sortedDates.flatMap(date => grouped[date]);
    
    setFilteredDraws(result);
  }, [draws, filters]);

  // Group draws by date for table display
  const groupedByDate = filteredDraws.reduce((acc, draw) => {
    if (!acc[draw.date]) {
      acc[draw.date] = {};
    }
    acc[draw.date][draw.slot] = draw;
    return acc;
  }, {} as Record<string, Record<string, Draw>>);

  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Time', 'Draw No', 'Digit 1', 'Digit 2', 'Digit 3', 'Digit 4', 'Digit 5'],
      ...filteredDraws.map(draw => [
        draw.date,
        formatSlotTime(draw.slot),
        draw.drawNo,
        draw.digit1,
        draw.digit2,
        draw.digit3,
        draw.digit4,
        draw.digit5,
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kerala-lottery-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.download = `swarna-chakra-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-4">Charts</h1>
        <p className="text-gray-300 max-w-2xl">
          Browse complete Suvarna Chakram lottery results with advanced filtering. 
          Results are updated within minutes of each draw.
        </p>
      </div>

      {/* Notice Banner */}
      <GlassCard className="p-4 mb-8 border-yellow-500/30">
        <p className="text-yellow-400 text-sm text-center">
          <strong>Notice:</strong> Results are for quick reference only. Please verify with official sources.
        </p>
      </GlassCard>

      {/* Filters */}
      <GlassCard className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-4">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.showTodayOnly}
                onChange={(e) => setFilters(prev => ({ ...prev, showTodayOnly: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-gray-900"
              />
              <span>Show Today's Results Only</span>
            </label>
          </div>

          {!filters.showTodayOnly && (
            <>
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
            </>
          )}

          <div className={`flex items-end ${filters.showTodayOnly ? 'md:col-span-4' : ''}`}>
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

      {/* Month-wise Results Table */}
      <GlassCard className="overflow-hidden">
        {Object.keys(groupedByDate).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr>
                    <th className="px-2 md:px-6 py-2 md:py-4 text-left text-xs md:text-sm font-medium text-gray-300">Date</th>
                    {TIME_SLOTS.map((slot) => (
                      <th key={slot} className="px-1 md:px-6 py-2 md:py-4 text-center text-xs md:text-sm font-medium text-gray-300">
                        {formatSlotTime(slot)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a)).map((date) => (
                    <tr key={date} className="hover:bg-white/5 transition-colors">
                      <td className="px-2 md:px-6 py-2 md:py-4 text-xs md:text-sm text-gray-300">
                        <div className="md:hidden">{new Date(date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}</div>
                        <div className="hidden md:block">{new Date(date).toLocaleDateString()}</div>
                      </td>
                      {TIME_SLOTS.map((slot) => {
                        const draw = groupedByDate[date][slot];
                        return (
                          <td key={slot} className="px-1 md:px-6 py-2 md:py-4 text-center">
                            {draw ? (
                              <div className="space-y-1 md:space-y-2">
                                <div className="text-xs md:text-xs text-gray-400 mb-1 hidden md:block">{draw.drawNo}</div>
                                <div className="flex justify-center space-x-0.5 md:space-x-1">
                                  <span className="text-xs md:text-xs px-0.5 md:px-1 py-0.5 md:py-1 min-w-[16px] md:min-w-[24px] bg-gradient-to-br from-gray-900 via-black to-gray-800 border border-yellow-600/30 rounded text-yellow-200 font-mono font-bold">
                                    {draw.digit1}
                                  </span>
                                  <span className="text-xs md:text-xs px-0.5 md:px-1 py-0.5 md:py-1 min-w-[16px] md:min-w-[24px] bg-gradient-to-br from-gray-900 via-black to-gray-800 border border-yellow-600/30 rounded text-yellow-200 font-mono font-bold">
                                    {draw.digit2}
                                  </span>
                                  <span className="text-xs md:text-xs px-0.5 md:px-1 py-0.5 md:py-1 min-w-[16px] md:min-w-[24px] bg-gradient-to-br from-gray-900 via-black to-gray-800 border border-yellow-600/30 rounded text-yellow-200 font-mono font-bold">
                                    {draw.digit3}
                                  </span>
                                  <span className="text-xs md:text-xs px-0.5 md:px-1 py-0.5 md:py-1 min-w-[16px] md:min-w-[24px] bg-gradient-to-br from-gray-900 via-black to-gray-800 border border-yellow-600/30 rounded text-yellow-200 font-mono font-bold">
                                    {draw.digit4}
                                  </span>
                                  <span className="text-xs md:text-xs px-0.5 md:px-1 py-0.5 md:py-1 min-w-[16px] md:min-w-[24px] bg-gradient-to-br from-gray-900 via-black to-gray-800 border border-yellow-600/30 rounded text-yellow-200 font-mono font-bold">
                                    {draw.digit5}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-400 md:hidden">{draw.drawNo}</div>
                              </div>
                            ) : (
                              <span className="text-gray-500 text-xs md:text-xs">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        ) : (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4 text-lg">No results found</div>
            <p className="text-gray-500 mb-6">
              Try adjusting your filters or check back later for new results
            </p>
            <button
              onClick={() => setFilters({ month: new Date().toISOString().slice(0, 7), search: '', showTodayOnly: true })}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </GlassCard>
    </div>
  );
}