import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'

const Header = () => {

    const {userData} = useContext(AppContext)


    const handleScroll = () => {
    const section = document.getElementById("services")
    if (section) {
      section.scrollIntoView({ behavior: "smooth" })
    }
  }


  return (
    <div className='flex flex-col items-center mt-20 px-4 text-center text-gray-800 '>
      <img src={assets.logo} alt='' className='w-36 h-36 rounded-full mb-6'/>

      <h1 className='flex items-center gap-2 text-xl sm:text-3xl font-medium mb-2'>Hey {userData ? userData.name :''} </h1>

      <h2 className='text-xl sm:text-3xl font-semibold mb-6'>Welcome to Pink Aura - where style meets care !</h2>
    

    {/* Glass Style */}
    <button 
        onClick={handleScroll}
        className="px-8 py-2.5 rounded-full border border-white/30 
                   bg-white/10 backdrop-blur-md text-gray-800 shadow-lg 
                   hover:bg-white/20 transition-all"
      >
        Get Started
      </button>
    </div>
  )
}


export default Header
