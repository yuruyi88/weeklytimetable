import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Clock, Calendar, Palette, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import type { Event, EventCreate } from '../services/api';
import confetti from 'canvas-confetti';

interface EventFormProps {
  event: Event | null;
  onClose: () => void;
  onSave: () => void;
  onDelete?: () => void;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const COLORS = [
  { value: '#3B82F6', label: 'School', class: 'event-color-blue' },
  { value: '#10B981', label: 'Sport', class: 'event-color-green' },
  { value: '#F59E0B', label: 'Art', class: 'event-color-orange' },
  { value: '#8B5CF6', label: 'Music', class: 'event-color-purple' },
  { value: '#EC4899', label: 'Play', class: 'event-color-pink' },
  { value: '#EF4444', label: 'Important', class: 'event-color-red' },
  { value: '#14B8A6', label: 'Fun', class: 'event-color-teal' },
  { value: '#6B7280', label: 'Other', class: 'event-color-gray' },
];

const ICONS = ['📚', '⚽', '🎨', '🎵', '🎮', '🏊', '🚴', '🍽️', '🛌', '🎒', '🏫', '🎬', '🎪', '⭐', '💡'];

const EventForm: React.FC<EventFormProps> = ({ event, onClose, onSave, onDelete }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [color, setColor] = useState(COLORS[0].value);
  const [icon, setIcon] = useState(ICONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const isEditing = !!event;
  
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setStartTime(event.start_time);
      setEndTime(event.end_time || '');
      setSelectedDays(event.days);
      setColor(event.color);
      setIcon(event.icon);
    } else {
      // Default to current day
      const today = new Date().getDay();
      const mondayBased = today === 0 ? 6 : today - 1;
      setSelectedDays([mondayBased]);
    }
  }, [event]);
  
  const toggleDay = (dayIndex: number) => {
    setSelectedDays(prev =>
      prev.includes(dayIndex)
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex].sort()
    );
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }
    
    if (selectedDays.length === 0) {
      setError('Please select at least one day');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const eventData: EventCreate = {
        title: title.trim(),
        description: description.trim() || undefined,
        start_time: startTime,
        end_time: endTime || undefined,
        days: selectedDays,
        color,
        icon,
      };
      
      if (isEditing && event) {
        await api.events.update(event.id, eventData);
      } else {
        await api.events.create(eventData);
        // Trigger confetti for new events
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#8B5CF6'],
        });
      }
      
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto m-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-red-400 flex items-center justify-center text-xl">
              {isEditing ? '✏️' : '✨'}
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              {isEditing ? 'Edit Event' : 'New Event'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
            {String(error)}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              What is it? 📝
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Swimming Lessons"
              className="input"
              maxLength={100}
            />
          </div>
          
          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Choose an icon 🎯
            </label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                    icon === emoji
                      ? 'bg-pink-100 ring-2 ring-pink-400 scale-110'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          
          {/* Days Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Which days? <Calendar className="inline w-4 h-4" />
            </label>
            <div className="flex gap-1 flex-wrap">
              {DAYS.map((day, index) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(index)}
                  className={`flex-1 min-w-[40px] py-2 rounded-xl text-sm font-bold transition-all ${
                    selectedDays.includes(index)
                      ? 'bg-gradient-to-r from-pink-400 to-red-400 text-white shadow-md scale-105'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
          
          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start <Clock className="inline w-4 h-4" />
              </label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End (optional)
              </label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="input"
              />
            </div>
          </div>
          
          {/* Color Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Color <Palette className="inline w-4 h-4" />
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-10 h-10 rounded-xl ${c.class} transition-all ${
                    color === c.value
                      ? 'ring-4 ring-offset-2 ring-gray-300 scale-110'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {COLORS.find(c => c.value === color)?.label}
            </p>
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes (optional) <Sparkles className="inline w-4 h-4" />
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Any extra details..."
              className="input min-h-[80px] resize-none"
              maxLength={500}
            />
          </div>
          
          {/* Actions */}
          <div className="space-y-3 pt-4">
            {isEditing && (
              <button
                type="button"
                onClick={async () => {
                  if (confirm('Are you sure you want to delete this event?')) {
                    setIsSubmitting(true);
                    try {
                      if (event) {
                        await api.events.delete(event.id);
                        onDelete?.();
                      }
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Failed to delete');
                      setIsSubmitting(false);
                    }
                  }
                }}
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
              >
                🗑️ Delete Event
              </button>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner w-5 h-5 border-2" />
                    Saving...
                  </span>
                ) : isEditing ? (
                  'Save Changes'
                ) : (
                  'Add Event'
                )}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EventForm;
