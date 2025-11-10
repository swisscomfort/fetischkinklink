import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Heart, Search, Filter, Sparkles } from 'lucide-react';
import { api } from '../api/client';
import { Character8D } from '../types';
import { MatchCard } from './MatchCard';

interface DashboardProps {
  userId: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ userId }) => {
  const [myCharacters, setMyCharacters] = useState<Character8D[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character8D | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [minScore, setMinScore] = useState(65);
  const [activeTab, setActiveTab] = useState<'characters' | 'matches'>('characters');

  useEffect(() => {
    loadMyCharacters();
  }, [userId]);

  const loadMyCharacters = async () => {
    setLoading(true);
    setError(null);
    try {
      const characters = await api.getCharactersByUser(userId);
      setMyCharacters(characters);
      if (characters.length > 0 && !selectedCharacter) {
        setSelectedCharacter(characters[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Characters');
    } finally {
      setLoading(false);
    }
  };

  const findMatches = async () => {
    if (!selectedCharacter) {
      setError('Bitte wähle zuerst einen Character aus');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const foundMatches = await api.findMatches(userId, minScore);
      setMatches(foundMatches);
      setActiveTab('matches');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Finden von Matches');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-purple-300">Verwalte deine Characters und finde Matches</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('characters')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === 'characters'
              ? 'bg-purple-600 text-white'
              : 'bg-purple-900/30 text-purple-300 hover:bg-purple-900/50'
          }`}
        >
          <Users className="w-5 h-5" />
          Meine Characters ({myCharacters.length})
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('matches')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === 'matches'
              ? 'bg-pink-600 text-white'
              : 'bg-pink-900/30 text-pink-300 hover:bg-pink-900/50'
          }`}
        >
          <Heart className="w-5 h-5" />
          Matches ({matches.length})
        </motion.button>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300"
        >
          {error}
        </motion.div>
      )}

      {/* Characters Tab */}
      {activeTab === 'characters' && (
        <div>
          {/* Match Finder Controls */}
          {myCharacters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl p-6 border border-purple-500/30 mb-6"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Search className="w-5 h-5" />
                Finde Matches
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Aktiver Character
                  </label>
                  <select
                    value={selectedCharacter?.username || ''}
                    onChange={(e) => {
                      const char = myCharacters.find(c => c.username === e.target.value);
                      setSelectedCharacter(char || null);
                    }}
                    className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {myCharacters.map((char) => (
                      <option key={char.username} value={char.username}>
                        {char.username} - {char.archetype.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    <Filter className="w-4 h-4 inline mr-1" />
                    Minimum Score: {minScore}%
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="90"
                    step="5"
                    value={minScore}
                    onChange={(e) => setMinScore(parseInt(e.target.value))}
                    className="w-full h-2 bg-black/30 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={findMatches}
                disabled={loading || !selectedCharacter}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                {loading ? 'Suche Matches...' : 'Matches Finden'}
              </motion.button>
            </motion.div>
          )}

          {/* Character List */}
          {loading && myCharacters.length === 0 ? (
            <div className="text-center py-12 text-purple-300">
              Lade Characters...
            </div>
          ) : myCharacters.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-purple-900/20 rounded-2xl border border-purple-500/20"
            >
              <Users className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Keine Characters gefunden</h3>
              <p className="text-purple-300">Erstelle deinen ersten Character im Character Creator!</p>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCharacters.map((character, index) => (
                <motion.div
                  key={character.username}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl p-6 border cursor-pointer transition-all ${
                    selectedCharacter?.username === character.username
                      ? 'border-purple-400 ring-2 ring-purple-400'
                      : 'border-purple-500/30 hover:border-purple-400/50'
                  }`}
                  onClick={() => setSelectedCharacter(character)}
                >
                  <h3 className="text-xl font-bold text-white mb-1">{character.username}</h3>
                  <p className="text-purple-300 text-sm mb-4">{character.archetype.name}</p>
                  
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {Object.entries(character.big5).slice(0, 3).map(([trait, value]) => (
                      <div key={trait} className="bg-black/30 rounded-lg p-2 text-center">
                        <div className="text-xs text-purple-300 mb-1 capitalize">{trait.slice(0, 4)}</div>
                        <div className="text-lg font-bold text-white">{Math.round(value)}</div>
                      </div>
                    ))}
                  </div>

                  <div className="text-xs text-purple-400">
                    {character.selectedTags.length} Tags
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Matches Tab */}
      {activeTab === 'matches' && (
        <div>
          {loading ? (
            <div className="text-center py-12 text-purple-300">
              Suche nach Matches...
            </div>
          ) : matches.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-pink-900/20 rounded-2xl border border-pink-500/20"
            >
              <Heart className="w-16 h-16 text-pink-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Keine Matches gefunden</h3>
              <p className="text-pink-300">Klicke auf "Matches Finden" um potenzielle Partner zu entdecken!</p>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((match, index) => (
                <motion.div
                  key={`${match.character.userId}-${match.character.username}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <MatchCard
                    character={match.character}
                    matchScore={match.score}
                    onViewDetails={() => {
                      console.log('View details:', match.character);
                    }}
                    onAccept={() => {
                      console.log('Accept match:', match.character);
                    }}
                    onDecline={() => {
                      console.log('Decline match:', match.character);
                      setMatches(matches.filter(m => m.character.username !== match.character.username));
                    }}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
