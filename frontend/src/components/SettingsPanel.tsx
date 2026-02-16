import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Bell, Palette, Lock, LogOut, Clock, Type } from 'lucide-react';
import { api } from '../services/api';
import type { Settings } from '../services/api';

interface SettingsPanelProps {
  onClose: () => void;
  onLogout: () => void;
  onPinChange: () => void;
  onTitleChange: (title: string) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose, onLogout, onPinChange, onTitleChange }) => {
  const [_settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [titleInput, setTitleInput] = useState('');

  useEffect(() => {
    loadSettings();
    checkNotificationPermission();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.settings.get();
      setSettings(data);
      setNotificationsEnabled(data.notifications_enabled);
      setTitleInput(data.title || 'My Timetable');
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  };
  
  const handleToggleNotifications = async () => {
    if (!('Notification' in window)) {
      alert('Your browser does not support notifications');
      return;
    }
    
    if (!notificationsEnabled) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        await saveSettings({ notifications_enabled: true });
        // Show test notification
        new Notification('Kids Timetable', {
          body: 'Notifications are now enabled! 🎉',
          icon: '/icon-192x192.png',
        });
      }
    } else {
      setNotificationsEnabled(false);
      await saveSettings({ notifications_enabled: false });
    }
  };
  
  const saveSettings = async (updates: Partial<Settings>) => {
    setIsSaving(true);
    try {
      const updated = await api.settings.update(updates);
      setSettings(updated);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="modal-overlay">
        <div className="bg-white rounded-3xl p-8">
          <div className="spinner mx-auto" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onClick={e => e.stopPropagation()}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Settings ⚙️</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Title */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Type className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Title</h3>
                <p className="text-xs text-gray-500">Customize your timetable name</p>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={titleInput}
                onChange={e => setTitleInput(e.target.value)}
                maxLength={30}
                className="input flex-1"
                placeholder="My Timetable"
              />
              <button
                onClick={async () => {
                  const trimmed = titleInput.trim() || 'My Timetable';
                  await saveSettings({ title: trimmed });
                  onTitleChange(trimmed);
                }}
                disabled={isSaving}
                className="px-4 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 transition-colors disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>

          {/* PIN Settings */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Lock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">PIN Code</h3>
                <p className="text-xs text-gray-500">Protect your timetable</p>
              </div>
            </div>
            <button
              onClick={onPinChange}
              className="w-full py-3 rounded-xl font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              Change PIN
            </button>
          </div>
          
          {/* Notifications */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Notifications</h3>
                <p className="text-xs text-gray-500">Get reminders for events</p>
              </div>
            </div>
            <button
              onClick={handleToggleNotifications}
              disabled={isSaving}
              className={`w-full py-3 rounded-xl font-medium transition-colors ${
                notificationsEnabled
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {notificationsEnabled ? '✅ Enabled' : 'Enable Notifications'}
            </button>
            <p className="text-xs text-gray-400 mt-2">
              You'll get a reminder before each event starts
            </p>
          </div>
          
          {/* Timezone */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Timezone</h3>
                <p className="text-xs text-gray-500">Currently set to</p>
              </div>
            </div>
            <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl font-medium">
              🌏 Pacific/Auckland (NZ Time)
            </div>
          </div>
          
          {/* Theme */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
                <Palette className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Theme</h3>
                <p className="text-xs text-gray-500">Choose your style</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                className="py-3 rounded-xl font-medium bg-gradient-to-r from-pink-400 to-red-400 text-white"
              >
                🌈 Fun
              </button>
              <button
                className="py-3 rounded-xl font-medium bg-gray-100 text-gray-400 cursor-not-allowed"
                disabled
              >
                🌙 Dark (Soon)
              </button>
            </div>
          </div>
          
          {/* About */}
          <div className="card">
            <div className="text-center py-4">
              <div className="text-4xl mb-2">📅</div>
              <h3 className="font-bold text-gray-800">Kids Timetable</h3>
              <p className="text-sm text-gray-500">Version 1.0.0</p>
              <p className="text-xs text-gray-400 mt-2">
                Made with ❤️ for kids everywhere
              </p>
            </div>
          </div>
          
          {/* Logout */}
          <button
            onClick={onLogout}
            className="w-full py-4 rounded-2xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Lock Timetable
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPanel;
