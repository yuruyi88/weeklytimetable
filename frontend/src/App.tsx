import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Sparkles } from 'lucide-react';
import WeeklyGrid from './components/WeeklyGrid';
import EventForm from './components/EventForm';
import PINModal from './components/PINModal';
import SettingsPanel from './components/SettingsPanel';
import { getAuthStatus, getToken, clearToken } from './services/auth';
import { api } from './services/api';
import type { Event } from './services/api';

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPINModal, setShowPINModal] = useState(false);
  const [pinMode, setPinMode] = useState<'setup' | 'verify' | 'change'>('verify');
  const [pinCallback, setPinCallback] = useState<(() => void) | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isPinSet, setIsPinSet] = useState(false);

  // Load events on mount
  useEffect(() => {
    loadEvents();
    checkPinStatus();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await api.events.list();
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkPinStatus = async () => {
    try {
      const status = await getAuthStatus();
      setIsPinSet(status.pin_is_set);
      if (!status.pin_is_set) {
        setPinMode('setup');
        setShowPINModal(true);
      }
    } catch (error) {
      console.error('Failed to check PIN status:', error);
    }
  };

  const handleAddEvent = () => {
    if (!isPinSet) {
      setPinMode('setup');
      setShowPINModal(true);
      return;
    }
    
    const token = getToken();
    if (!token) {
      setPinMode('verify');
      setPinCallback(() => () => {
        setEditingEvent(null);
        setShowEventForm(true);
      });
      setShowPINModal(true);
    } else {
      setEditingEvent(null);
      setShowEventForm(true);
    }
  };

  const handleEditEvent = (event: Event) => {
    const token = getToken();
    if (!token) {
      setPinMode('verify');
      setPinCallback(() => () => {
        setEditingEvent(event);
        setShowEventForm(true);
      });
      setShowPINModal(true);
    } else {
      setEditingEvent(event);
      setShowEventForm(true);
    }
  };


  


  const handlePINSuccess = () => {
    setShowPINModal(false);
    setIsPinSet(true);
    if (pinCallback) {
      pinCallback();
      setPinCallback(null);
    }
  };

  const handlePINSetupComplete = () => {
    setIsPinSet(true);
    setShowPINModal(false);
  };

  const handleOpenSettings = () => {
    const token = getToken();
    if (!token) {
      setPinMode('verify');
      setPinCallback(() => () => setShowSettings(true));
      setShowPINModal(true);
    } else {
      setShowSettings(true);
    }
  };

  const handleLogout = () => {
    clearToken();
    setShowSettings(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-red-400 flex items-center justify-center text-2xl shadow-lg">
              📅
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 leading-tight">
                My Timetable
              </h1>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-500" />
                Have a great week!
              </p>
            </div>
          </div>
          
          <button
            onClick={handleOpenSettings}
            className="p-3 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 pb-24">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="spinner" />
          </div>
        ) : events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="empty-state"
          >
            <div className="text-8xl mb-6">🌈</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              No events yet!
            </h2>
            <p className="text-gray-500 mb-6">
              Tap the + button to add your first event
            </p>
          </motion.div>
        ) : (
          <WeeklyGrid
            events={events}
            onEditEvent={handleEditEvent}
            onRefresh={loadEvents}
          />
        )}
      </main>

      {/* Floating Action Button */}
      <motion.button
        onClick={handleAddEvent}
        className="fab"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        +
      </motion.button>

      {/* Modals */}
      <AnimatePresence>
        {showPINModal && (
          <PINModal
            mode={pinMode}
            onSuccess={pinMode === 'setup' ? handlePINSetupComplete : handlePINSuccess}
            onClose={() => {
              if (isPinSet) {
                setShowPINModal(false);
              }
            }}
          />
        )}

        {showEventForm && (
          <EventForm
            event={editingEvent}
            onClose={() => {
              setShowEventForm(false);
              setEditingEvent(null);
            }}
            onSave={async () => {
            await loadEvents();
            setShowEventForm(false);
            setEditingEvent(null);
          }}
          onDelete={async () => {
            await loadEvents();
            setShowEventForm(false);
            setEditingEvent(null);
          }}
          />
        )}

        {showSettings && (
          <SettingsPanel
            onClose={() => setShowSettings(false)}
            onLogout={handleLogout}
            onPinChange={() => {
              setPinMode('change');
              setShowPINModal(true);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
// Auto-deploy test - Mon Feb 16 15:33:08 NZDT 2026
// Auto-deploy test 2 - Mon Feb 16 15:47:00 NZDT 2026
