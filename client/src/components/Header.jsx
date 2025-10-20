import React, { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { motion } from 'framer-motion'

const Header = () => {
  const { userData } = useContext(AppContext)

  const handleScroll = () => {
    const section = document.getElementById("services")
    if (section) section.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="relative flex flex-col items-center justify-between text-center min-h-screen overflow-hidden pt-40 pb-32">

      <motion.h2
  className="text-xl sm:text-3xl font-semibold tracking-tight text-[#8A1F3D] drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]"
  initial={{ opacity: 0, y: 10, scale: 0.985 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  transition={{ duration: 0.9, ease: "easeOut" }}
>
  Welcome to <span className="font-bold">Pink Aura</span> – where style meets care 
</motion.h2>

      
      <motion.button
        onClick={handleScroll}
        className="px-12 py-3 rounded-full bg-white/30 border border-white/50 
                   backdrop-blur-md text-rose-900 font-semibold shadow-lg 
                   hover:bg-white/60 transition-all duration-300 hover:-translate-y-1"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        Get Started
      </motion.button>
    </div>
  )
}

export default Header
