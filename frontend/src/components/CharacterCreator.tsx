import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Search, Sliders, User } from 'lucide-react';
import { api } from '../api/client';
import { Character8D, TagSelection, LifestyleData } from '../types';

interface CharacterCreatorProps {
  userId: string;
  onCharacterCreated?: (character: Character8D) => void;
}

export const CharacterCreator: React.FC<CharacterCreatorProps> = ({ userId, onCharacterCreated }) => {
  const [username, setUsername] = useState('');
  const [selectedTags, setSelectedTags] = useState<TagSelection[]>([]);
  const [taxonomy, setTaxonomy] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [lifestyle, setLifestyle] = useState<LifestyleData>({});
  const [adjustments, setAdjustments] = useState({
    dominance: 50,
    intensity: 50,
    emotional: 50,
    experience: 50,
    publicness: 50,
  });
  const [generatedCharacter, setGeneratedCharacter] = useState<Character8D | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTaxonomy();
  }, []);

  const loadTaxonomy = async () => {
    try {
      const data = await api.getTaxonomy();
      setTaxonomy(data);
    } catch (err) {
      setError('Fehler beim Laden der Taxonomie');
    }
  };

  const handleTagToggle = (categoryId: string, categoryName: string, tagId: string, tagName: string, subcategoryId?: string, subcategoryName?: string) => {
    const existingIndex = selectedTags.findIndex(t => t.tagId === tagId);
    
    if (existingIndex >= 0) {
      setSelectedTags(selectedTags.filter((_, i) => i !== existingIndex));
    } else {
      setSelectedTags([...selectedTags, {
        categoryId,
        categoryName,
        subcategoryId,
        subcategoryName,
        tagId,
        tagName,
      }]);
    }
  };

  const handleGenerate = async () => {
    if (!username.trim()) {
      setError('Bitte gib einen Benutzernamen ein');
      return;
    }

    if (selectedTags.length === 0) {
      setError('Bitte wähle mindestens einen Tag aus');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const character = await api.generateCharacter(userId, username, selectedTags, lifestyle);
      setGeneratedCharacter(character);
      if (onCharacterCreated) {
        onCharacterCreated(character);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Generieren');
    } finally {
      setLoading(false);
    }
  };

  const filteredTags = searchTerm && taxonomy ? 
    taxonomy.categories?.flatMap((cat: any) => 
      cat.subcategories?.flatMap((sub: any) => 
        sub.tags?.filter((tag: any) => 
          tag.name.toLowerCase().includes(searchTerm.toLowerCase())
        ).map((tag: any) => ({ ...tag, categoryId: cat.id, categoryName: cat.name, subcategoryId: sub.id, subcategoryName: sub.name }))
      ) || []
    ) : [];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl p-8 border border-purple-500/30"
      >
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-8 h-8 text-purple-400" />
          <h2 className="text-3xl font-bold text-white">Character Creator</h2>
        </div>

        {/* Username */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-purple-200 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Benutzername
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Dein Character Name"
          />
        </div>

        {/* Tag Search */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-purple-200 mb-2">
            <Search className="w-4 h-4 inline mr-2" />
            Tag Suche
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Suche nach Tags..."
          />
        </div>

        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-purple-200 mb-2">Ausgewählte Tags ({selectedTags.length})</h3>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <motion.button
                  key={tag.tagId}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTagToggle(tag.categoryId, tag.categoryName, tag.tagId, tag.tagName, tag.subcategoryId, tag.subcategoryName)}
                  className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm hover:bg-purple-700 transition-colors"
                >
                  {tag.tagName} ×
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Tag Categories */}
        {searchTerm && filteredTags.length > 0 ? (
          <div className="mb-6 max-h-64 overflow-y-auto">
            <div className="flex flex-wrap gap-2">
              {filteredTags.map((tag: any) => {
                const isSelected = selectedTags.some(t => t.tagId === tag.id);
                return (
                  <motion.button
                    key={tag.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTagToggle(tag.categoryId, tag.categoryName, tag.id, tag.name, tag.subcategoryId, tag.subcategoryName)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      isSelected 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-black/30 text-purple-200 hover:bg-purple-500/30'
                    }`}
                  >
                    {tag.name}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ) : (
          taxonomy?.categories && (
            <div className="mb-6 max-h-96 overflow-y-auto space-y-4">
              {taxonomy.categories.slice(0, 5).map((category: any) => (
                <div key={category.id} className="bg-black/20 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-purple-300 mb-2">{category.name}</h3>
                  {category.subcategories?.slice(0, 3).map((subcategory: any) => (
                    <div key={subcategory.id} className="mb-3">
                      <h4 className="text-sm font-medium text-purple-200 mb-2">{subcategory.name}</h4>
                      <div className="flex flex-wrap gap-2">
                        {subcategory.tags?.slice(0, 10).map((tag: any) => {
                          const isSelected = selectedTags.some(t => t.tagId === tag.id);
                          return (
                            <motion.button
                              key={tag.id}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleTagToggle(category.id, category.name, tag.id, tag.name, subcategory.id, subcategory.name)}
                              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                isSelected 
                                  ? 'bg-purple-600 text-white' 
                                  : 'bg-black/30 text-purple-200 hover:bg-purple-500/30'
                              }`}
                            >
                              {tag.name}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )
        )}

        {/* Dimension Sliders */}
        <div className="mb-6">
          <h3 className="flex items-center text-sm font-medium text-purple-200 mb-4">
            <Sliders className="w-4 h-4 mr-2" />
            Dimension Adjustments
          </h3>
          <div className="space-y-4">
            {Object.entries(adjustments).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between mb-1">
                  <label className="text-sm text-purple-300 capitalize">{key}</label>
                  <span className="text-sm text-purple-400">{value}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={value}
                  onChange={(e) => setAdjustments({ ...adjustments, [key]: parseInt(e.target.value) })}
                  className="w-full h-2 bg-black/30 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Generiere Character...' : '✨ Character Generieren'}
        </motion.button>
      </motion.div>

      {/* Generated Character Display */}
      {generatedCharacter && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-900/50 to-blue-900/50 rounded-2xl p-8 border border-green-500/30"
        >
          <h3 className="text-2xl font-bold text-white mb-4">
            {generatedCharacter.archetype.name}
          </h3>
          <p className="text-green-200 mb-6">{generatedCharacter.archetype.description}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {Object.entries(generatedCharacter.big5).map(([trait, value]) => (
              <div key={trait} className="bg-black/30 rounded-lg p-4 text-center">
                <div className="text-sm text-green-300 mb-1 capitalize">{trait}</div>
                <div className="text-2xl font-bold text-white">{Math.round(value)}</div>
              </div>
            ))}
          </div>

          <div className="text-sm text-green-300">
            Erstellt: {new Date(generatedCharacter.generatedAt).toLocaleString('de-DE')}
          </div>
        </motion.div>
      )}
    </div>
  );
};
