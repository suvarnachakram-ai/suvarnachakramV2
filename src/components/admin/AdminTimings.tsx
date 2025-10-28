import React, { useState } from 'react';
import { Clock, Save, RotateCcw, AlertTriangle, Bell, Play, Pause } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { ANNOUNCEMENT_SCHEDULE } from '../../utils/time';
import { getAutomationStatus, updateAutomationConfig, manualCreateDrafts } from '../../utils/automation';
import GlassCard from '../GlassCard';

export default function AdminTimings() {
  const { timeSlots } = useData();
  const automationStatus = getAutomationStatus();
  const [settings, setSettings] = useState({
    autoPublish: automationStatus.enabled,
    publishDelay: 15, // minutes
    enableNotifications: true,
    maintenanceMode: false,
    generateTime: automationStatus.generateTime,
  });
  
  const [hasChanges, setHasChanges] = useState(false);
  const [isCreatingDrafts, setIsCreatingDrafts] = useState(false);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Update automation config
    updateAutomationConfig({
      enabled: settings.autoPublish,
      generateTime: settings.generateTime,
      publishDelayMinutes: settings.publishDelay,
    });
    console.log('Saving settings:', settings);
    setHasChanges(false);
  };

  const handleReset = () => {
    setSettings({
      autoPublish: true,
      publishDelay: 15,
      enableNotifications: true,
      maintenanceMode: false,
      generateTime: "06:00",
    });
    setHasChanges(false);
  };

  const handleCreateDrafts = async () => {
    setIsCreatingDrafts(true);
    try {
      await manualCreateDrafts();
      alert('Daily drafts created successfully!');
    } catch (error) {
      console.error('Error creating drafts:', error);
      alert('Error creating drafts. Please try again.');
    } finally {
      setIsCreatingDrafts(false);
    }
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Draw Timings & Settings</h1>
          <p className="text-gray-300">Configure draw schedules and system settings</p>
        </div>
        {hasChanges && (
          <div className="flex space-x-3">
            <button onClick={handleReset} className="px-4 py-2 text-gray-300 hover:text-white transition-colors">
              <RotateCcw className="h-4 w-4 inline mr-2" />
              Reset
            </button>
            <button onClick={handleSave} className="btn-primary">
              <Save className="h-4 w-4 inline mr-2" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Automation Control */}
      <GlassCard className="p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Play className="h-6 w-6 text-green-400" />
            <h2 className="text-xl font-bold text-white">Daily Automation</h2>
          </div>
          <button
            onClick={handleCreateDrafts}
            disabled={isCreatingDrafts}
            className="btn-primary disabled:opacity-50"
          >
            {isCreatingDrafts ? 'Creating...' : 'Create Today\'s Drafts'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 glass-card">
            <h3 className="font-semibold text-white mb-2">Draft Generation</h3>
            <p className="text-sm text-gray-400 mb-3">
              Automatically creates 3 draft results every morning at {settings.generateTime}
            </p>
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${settings.autoPublish ? 'bg-green-400' : 'bg-red-400'}`}></span>
              <span className="text-sm text-gray-300">
                {settings.autoPublish ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          
          <div className="p-4 glass-card">
            <h3 className="font-semibold text-white mb-2">Auto Publishing</h3>
            <p className="text-sm text-gray-400 mb-3">
              Results published {settings.publishDelay} minutes after draw time
            </p>
            <div className="text-sm text-cyan-400">
              12:15 PM • 2:15 PM • 5:15 PM
            </div>
          </div>
          
          <div className="p-4 glass-card">
            <h3 className="font-semibold text-white mb-2">Next Generation</h3>
            <p className="text-sm text-gray-400 mb-3">
              Tomorrow's drafts will be created at
            </p>
            <div className="text-sm text-yellow-400 font-mono">
              {settings.generateTime} AM
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Daily Schedule */}
      <GlassCard className="p-6 mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <Clock className="h-6 w-6 text-yellow-400" />
          <h2 className="text-xl font-bold text-white">Daily Draw Schedule</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {timeSlots.map((slot, index) => (
            <div key={slot.id} className="text-center p-4 glass-card">
              <div className="text-lg font-bold text-yellow-400 mb-2">{slot.label}</div>
              <div className="text-sm text-gray-400 mb-3">Draw #{index + 1}</div>
              <div className="flex items-center justify-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={slot.enabled}
                    onChange={() => {/* Toggle slot */}}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                </label>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Result Announcement Schedule */}
      <GlassCard className="p-6 mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <Bell className="h-6 w-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">Result Announcement Schedule</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ANNOUNCEMENT_SCHEDULE.map((schedule, index) => (
            <div key={index} className="p-4 glass-card">
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-400 mb-2">Draw #{index + 1}</div>
                <div className="text-xl font-semibold text-white mb-1">{schedule.drawTime}</div>
                <div className="text-xs text-gray-400 mb-3">Draw Time</div>
                <div className="border-t border-white/10 pt-3">
                  <div className="text-lg font-semibold text-cyan-400 mb-1">{schedule.announcementTime}</div>
                  <div className="text-xs text-gray-400">Result Announcement</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
          <p className="text-cyan-400 text-sm text-center">
            Results are automatically announced 30 minutes after each draw completion
          </p>
        </div>
      </GlassCard>

      {/* System Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">Publication Settings</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">Auto-publish Results</div>
                <div className="text-sm text-gray-400">Automatically publish results after draws</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoPublish}
                  onChange={(e) => handleSettingChange('autoPublish', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Draft Generation Time
              </label>
              <input
                type="time"
                value={settings.generateTime}
                onChange={(e) => handleSettingChange('generateTime', e.target.value)}
                className="input-field w-full"
              />
              <div className="text-xs text-gray-400 mt-1">
                Time to create daily draft results
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Publication Delay (minutes)
              </label>
              <input
                type="number"
                value={settings.publishDelay}
                onChange={(e) => handleSettingChange('publishDelay', parseInt(e.target.value))}
                className="input-field w-full"
                min="0"
                max="60"
              />
              <div className="text-xs text-gray-400 mt-1">
                Delay before auto-publishing results
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">Enable Notifications</div>
                <div className="text-sm text-gray-400">Send alerts for new results</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableNotifications}
                  onChange={(e) => handleSettingChange('enableNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
              </label>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">System Status</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">Maintenance Mode</div>
                <div className="text-sm text-gray-400">Temporarily disable public access</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>

            {settings.maintenanceMode && (
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
                <div className="flex items-center space-x-2 text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Maintenance Mode Active</span>
                </div>
                <p className="text-red-300 text-sm mt-1">
                  Public website is currently unavailable
                </p>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Database Status</span>
                <span className="text-green-400 text-sm">Connected</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Automation Status</span>
                <span className={`text-sm ${settings.autoPublish ? 'text-green-400' : 'text-red-400'}`}>
                  {settings.autoPublish ? 'Running' : 'Stopped'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Last Backup</span>
                <span className="text-gray-400 text-sm">2 hours ago</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">System Load</span>
                <span className="text-yellow-400 text-sm">Normal</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Active Users</span>
                <span className="text-cyan-400 text-sm">1,247</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}