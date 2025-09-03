import React from 'react';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import HomeReviewsTile from '../components/HomeReviewsTile';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <div className='bg-[url("/bg4.jpg")] bg-cover bg-center'>
        <Navbar />
        <Header />
      </div>

      {/* ⭐ Reviews tile */}
      <div className="max-w-6xl mx-auto px-4 pb-10">
        <HomeReviewsTile />
      </div>
    </div>
  );
};

export default Home;
