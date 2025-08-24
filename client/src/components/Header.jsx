import React from 'react'
import { assets } from '../assets/assets'

const Header = () => {
  return (
    <div className='flex flex-col items-center mt-20 px-4 text-center text-gray-800 drop-shadow-[0_0_2px_white]'>
      <img src={assets.header_img} alt='' className='w-36 h-36 rounded-full mb-6'/>

      <h2 className='flex items-center gap-2 text-xl sm:text-3xl font-semibold mb-15'>Welcome to Pink Aura — where style meets care.<img className='w-8 aspect-square' src= {assets.hand_wave} alt=''/></h2>
    
    <button className='border border-gray-500 rounded-full px-8 py-2.5 hover:bg-gray-100 transition-all'>Get Started</button>
    </div>
  )
}

export default Header
