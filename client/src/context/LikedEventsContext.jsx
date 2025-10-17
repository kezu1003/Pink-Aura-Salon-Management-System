import React, { createContext, useContext, useState, useEffect } from 'react';

const LikedEventsContext = createContext();

export const useLikedEvents = () => {
  const context = useContext(LikedEventsContext);
  if (!context) {
    throw new Error('useLikedEvents must be used within a LikedEventsProvider');
  }
  return context;
};

export const LikedEventsProvider = ({ children }) => {
  const [likedEvents, setLikedEvents] = useState([]);

  // Load liked events from localStorage on component mount
  useEffect(() => {
    const savedLikedEvents = localStorage.getItem('likedEvents');
    if (savedLikedEvents) {
      try {
        setLikedEvents(JSON.parse(savedLikedEvents));
      } catch (error) {
        console.error('Error parsing liked events from localStorage:', error);
        setLikedEvents([]);
      }
    }
  }, []);

  // Save liked events to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('likedEvents', JSON.stringify(likedEvents));
  }, [likedEvents]);

  const toggleLike = (eventId) => {
    setLikedEvents(prev => {
      const isLiked = prev.includes(eventId);
      if (isLiked) {
        return prev.filter(id => id !== eventId);
      } else {
        return [...prev, eventId];
      }
    });
  };

  const isEventLiked = (eventId) => {
    return likedEvents.includes(eventId);
  };

  const getLikedEventsCount = () => {
    return likedEvents.length;
  };

  const clearAllLikedEvents = () => {
    setLikedEvents([]);
  };

  const value = {
    likedEvents,
    toggleLike,
    isEventLiked,
    getLikedEventsCount,
    clearAllLikedEvents
  };

  return (
    <LikedEventsContext.Provider value={value}>
      {children}
    </LikedEventsContext.Provider>
  );
};
