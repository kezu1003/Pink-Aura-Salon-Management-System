import React, { createContext, useContext, useState, useEffect } from 'react';

const LikedCoursesContext = createContext();

export const useLikedCourses = () => {
  const context = useContext(LikedCoursesContext);
  if (!context) {
    throw new Error('useLikedCourses must be used within a LikedCoursesProvider');
  }
  return context;
};

export const LikedCoursesProvider = ({ children }) => {
  const [likedCourses, setLikedCourses] = useState([]);

  // Load liked courses from localStorage on component mount
  useEffect(() => {
    const savedLikedCourses = localStorage.getItem('likedCourses');
    if (savedLikedCourses) {
      try {
        setLikedCourses(JSON.parse(savedLikedCourses));
      } catch (error) {
        console.error('Error parsing liked courses from localStorage:', error);
        setLikedCourses([]);
      }
    }
  }, []);

  // Save liked courses to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('likedCourses', JSON.stringify(likedCourses));
  }, [likedCourses]);

  const toggleLike = (courseId) => {
    setLikedCourses(prev => {
      const isLiked = prev.includes(courseId);
      if (isLiked) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const isCourseLiked = (courseId) => {
    return likedCourses.includes(courseId);
  };

  const getLikedCoursesCount = () => {
    return likedCourses.length;
  };

  const clearAllLikedCourses = () => {
    setLikedCourses([]);
  };

  const value = {
    likedCourses,
    toggleLike,
    isCourseLiked,
    getLikedCoursesCount,
    clearAllLikedCourses
  };

  return (
    <LikedCoursesContext.Provider value={value}>
      {children}
    </LikedCoursesContext.Provider>
  );
};
