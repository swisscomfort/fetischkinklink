import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, LayoutDashboard, UserPlus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { CharacterCreator } from './components/CharacterCreator';
import { Dashboard } from './components/Dashboard';
import './styles/index.css';

function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'creator'>('dashboard');
  // In einer echten App würde dies von einem Auth-System kommen
  // Verwende UUID v4 für Datenbank-Kompatibilität
  const [userId] = useState(() => {
    const stored = localStorage.getItem('spiegelmatch_user_id');
    if (stored) return stored;
    const newId = uuidv4();
    localStorage.setItem('spiegelmatch_user_id', newId);
    return newId;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-lg border-b border-purple-500/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <Sparkles className="w-8 h-8 text-purple-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">SpiegelMatch</h1>
                <p className="text-xs text-purple-300">Avatar-based Kink Dating</p>
              </div>
            </motion.div>

            <nav className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveView('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeView === 'dashboard'
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-900/30 text-purple-300 hover:bg-purple-900/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveView('creator')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeView === 'creator'
                    ? 'bg-pink-600 text-white'
                    : 'bg-pink-900/30 text-pink-300 hover:bg-pink-900/50'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                Create Character
              </motion.button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeView === 'dashboard' ? (
            <Dashboard userId={userId} onNavigateToCreator={() => setActiveView('creator')} />
          ) : (
            <CharacterCreator
              userId={userId}
              onCharacterCreated={(character) => {
                console.log('Character created:', character);
                // Nach Erstellung zurück zum Dashboard
                setTimeout(() => setActiveView('dashboard'), 2000);
              }}
            />
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-lg border-t border-purple-500/30 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-purple-300 text-sm">
            <p className="mb-2">
              SpiegelMatch - 8D Character Generation powered by Big5 Psychology
            </p>
            <p className="text-xs text-purple-400">
              Create your first character to get started
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
