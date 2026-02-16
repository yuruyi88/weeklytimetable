import React from 'react';
import { motion } from 'framer-motion';
import type { Event } from '../services/api';

interface EventCardProps {
  event: Event;
  onClick?: () => void;
  compact?: boolean;
  showTime?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  onClick,
  compact = false,
  showTime = false,
}) => {
  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      '#3B82F6': 'event-color-blue',
      '#10B981': 'event-color-green',
      '#F59E0B': 'event-color-orange',
      '#8B5CF6': 'event-color-purple',
      '#EC4899': 'event-color-pink',
      '#EF4444': 'event-color-red',
      '#14B8A6': 'event-color-teal',
      '#6B7280': 'event-color-gray',
    };
    return colorMap[color] || 'event-color-blue';
  };
  
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };
  
  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`event-card ${getColorClass(event.color)} cursor-pointer`}
      >
        <div className="flex items-center gap-1">
          <span className="text-base">{event.icon}</span>
          <span className="text-xs font-medium truncate">{event.title}</span>
        </div>
        <div className="text-[10px] opacity-80 mt-0.5">
          {formatTime(event.start_time)}
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`card p-4 cursor-pointer border-l-4 ${getColorClass(event.color).replace('event-color-', 'border-')}`}
      style={{ borderLeftColor: event.color }}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${getColorClass(event.color)}`}
        >
          {event.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 truncate">{event.title}</h3>
          
          {showTime && (
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <span className="font-medium">
                {formatTime(event.start_time)}
              </span>
              {event.end_time && (
                <>
                  <span>→</span>
                  <span>{formatTime(event.end_time)}</span>
                </>
              )}
            </div>
          )}
          
          {event.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {event.description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;
