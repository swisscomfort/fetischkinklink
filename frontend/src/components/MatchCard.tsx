import React from 'react';
import { motion } from 'framer-motion';
import { Heart, X, TrendingUp, Zap } from 'lucide-react';
import { MatchScore, Character8D } from '../types';

interface MatchCardProps {
  character: Character8D;
  matchScore: MatchScore;
  onAccept?: () => void;
  onDecline?: () => void;
  onViewDetails?: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  character,
  matchScore,
  onAccept,
  onDecline,
  onViewDetails,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'from-green-500 to-emerald-500';
    if (score >= 75) return 'from-blue-500 to-cyan-500';
    if (score >= 65) return 'from-yellow-500 to-orange-500';
    if (score >= 50) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-pink-500';
  };

  const getCompatibilityBadge = (level: string) => {
    const colors = {
      Perfect: 'bg-green-500 text-white',
      Excellent: 'bg-blue-500 text-white',
      Good: 'bg-yellow-500 text-black',
      Okay: 'bg-orange-500 text-white',
      Poor: 'bg-red-500 text-white',
    };
    return colors[level as keyof typeof colors] || colors.Poor;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl p-6 border border-purple-500/30 shadow-2xl"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white mb-1">{character.username}</h3>
          <p className="text-purple-300 text-sm">{character.archetype.name}</p>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className={`px-4 py-2 rounded-full text-sm font-bold ${getCompatibilityBadge(matchScore.compatibilityLevel || 'Poor')}`}
        >
          {matchScore.compatibilityLevel}
        </motion.div>
      </div>

      {/* Overall Score */}
      <div className="mb-6 text-center">
        <div className="relative inline-block">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-700"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="56"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDasharray: '0 352' }}
              animate={{ strokeDasharray: `${(matchScore.overall / 100) * 352} 352` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className="text-purple-500" stopColor="currentColor" />
                <stop offset="100%" className="text-pink-500" stopColor="currentColor" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div>
              <div className="text-4xl font-bold text-white">{Math.round(matchScore.overall)}</div>
              <div className="text-xs text-purple-300">Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dimension Breakdown */}
      <div className="space-y-3 mb-6">
        <h4 className="text-sm font-semibold text-purple-200 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Compatibility Breakdown
        </h4>
        {matchScore.breakdown.map((dimension, index) => (
          <motion.div
            key={dimension.dimension}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-purple-300">{dimension.dimension}</span>
              <span className="text-sm font-semibold text-white">{Math.round(dimension.score)}%</span>
            </div>
            <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${getScoreColor(dimension.score)}`}
                initial={{ width: 0 }}
                animate={{ width: `${dimension.score}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recommendation */}
      {matchScore.recommendation && (
        <div className="mb-6 p-4 bg-black/30 rounded-lg border border-purple-500/20">
          <div className="flex items-start gap-2">
            <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-purple-200">{matchScore.recommendation}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {onDecline && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDecline}
            className="flex-1 py-3 bg-red-600/20 border border-red-500/50 text-red-300 rounded-lg hover:bg-red-600/30 transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            Decline
          </motion.button>
        )}
        {onViewDetails && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onViewDetails}
            className="flex-1 py-3 bg-purple-600/20 border border-purple-500/50 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors"
          >
            Details
          </motion.button>
        )}
        {onAccept && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAccept}
            className="flex-1 py-3 bg-green-600/20 border border-green-500/50 text-green-300 rounded-lg hover:bg-green-600/30 transition-colors flex items-center justify-center gap-2"
          >
            <Heart className="w-5 h-5" />
            Accept
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};
