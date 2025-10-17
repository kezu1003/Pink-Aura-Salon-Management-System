import React from 'react';
import { Heart } from 'lucide-react';
import { useLikedEvents } from '../context/LikedEventsContext';

const LikedEventsIndicator = ({ className = "" }) => {
  const { getLikedEventsCount } = useLikedEvents();
  const likedCount = getLikedEventsCount();

  if (likedCount === 0) return null;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Heart className="w-4 h-4 text-red-500 fill-current" />
      <span className="text-sm font-medium text-[#4D423A]">
        {likedCount} liked event{likedCount !== 1 ? 's' : ''}
      </span>
    </div>
  );
};

export default LikedEventsIndicator;
