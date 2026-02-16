import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import EventCard from './EventCard';
import type { Event } from '../services/api';

const TIMEZONE = 'Pacific/Auckland';
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface WeeklyGridProps {
  events: Event[];
  onEditEvent: (event: Event) => void;
  onRefresh: () => void;
}

const WeeklyGrid: React.FC<WeeklyGridProps> = ({ events, onEditEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  // Get current date in NZ timezone
  const now = new Date();
  const nzNow = toZonedTime(now, TIMEZONE);
  const currentDayIndex = (nzNow.getDay() + 6) % 7; // Convert to 0=Monday
  
  // Calculate week start (Monday)
  const weekStart = useMemo(() => {
    const base = startOfWeek(currentDate, { weekStartsOn: 1 });
    return base;
  }, [currentDate]);
  
  const weekDays = useMemo(() => {
    return DAYS.map((_, index) => addDays(weekStart, index));
  }, [weekStart]);
  
  const isToday = (dayIndex: number) => {
    const dayDate = weekDays[dayIndex];
    return isSameDay(dayDate, nzNow);
  };
  
  const getEventsForDay = (dayIndex: number) => {
    return events
      .filter(event => event.days.includes(dayIndex))
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  };
  
  const navigateWeek = (direction: 'prev' | 'next') => {
    const days = direction === 'prev' ? -7 : 7;
    setCurrentDate(prev => addDays(prev, days));
  };
  
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };
  
  // Mobile view: show one day at a time
  const effectiveSelectedDay = selectedDay !== null ? selectedDay : currentDayIndex;
  
  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-md">
        <button
          onClick={() => navigateWeek('prev')}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-800">
            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </h2>
          <p className="text-sm text-gray-500">
            Week of {format(weekStart, 'MMMM')}
          </p>
        </div>
        
        <button
          onClick={() => navigateWeek('next')}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
      
      {/* Day Selector (Mobile) */}
      <div className="lg:hidden">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {DAYS.map((day, index) => (
            <button
              key={day}
              onClick={() => setSelectedDay(index)}
              className={`flex-shrink-0 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                effectiveSelectedDay === index
                  ? 'bg-gradient-to-r from-pink-400 to-red-400 text-white shadow-lg scale-105'
                  : isToday(index)
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-white text-gray-600'
              }`}
            >
              {day.slice(0, 3)}
              {isToday(index) && (
                <span className="ml-1 text-xs">•</span>
              )}
            </button>
          ))}
        </div>
        
        {/* Mobile Day View */}
        <motion.div
          key={effectiveSelectedDay}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mt-4"
        >
          <div className={`day-header ${isToday(effectiveSelectedDay) ? 'today' : ''} mb-4`}>
            {DAYS[effectiveSelectedDay]}
            {isToday(effectiveSelectedDay) && (
              <span className="ml-2 text-xs bg-white bg-opacity-30 px-2 py-1 rounded-full">
                Today
              </span>
            )}
          </div>
          
          <div className="space-y-3">
            {getEventsForDay(effectiveSelectedDay).length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl">
                <div className="text-5xl mb-3">🌟</div>
                <p className="text-gray-500">No events for {DAYS[effectiveSelectedDay]}</p>
              </div>
            ) : (
              getEventsForDay(effectiveSelectedDay).map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <EventCard
                    event={event}
                    onClick={() => onEditEvent(event)}
                    showTime={true}
                  />
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Desktop Grid View */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {/* Header Row */}
          <div className="grid grid-cols-7 gap-1 bg-gray-100">
            {DAYS.map((day, index) => (
              <div
                key={day}
                className={`day-header ${isToday(index) ? 'today' : ''}`}
              >
                {day}
              </div>
            ))}
          </div>
          
          {/* Events Grid */}
          <div className="grid grid-cols-7 gap-1 min-h-[500px]">
            {DAYS.map((_, dayIndex) => {
              const dayEvents = getEventsForDay(dayIndex);
              return (
                <div
                  key={dayIndex}
                  className={`p-2 min-h-[150px] ${
                    isToday(dayIndex) ? 'bg-blue-50' : 'bg-white'
                  }`}
                >
                  <div className="space-y-2">
                    {dayEvents.map(event => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onClick={() => onEditEvent(event)}
                        compact={true}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Time Indicator */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Current time: {formatTime(`${nzNow.getHours().toString().padStart(2, '0')}:${nzNow.getMinutes().toString().padStart(2, '0')}`)}</span>
          <span className="text-xs bg-gray-200 px-2 py-1 rounded">NZ Time</span>
        </div>
      </div>
    </div>
  );
};

export default WeeklyGrid;
