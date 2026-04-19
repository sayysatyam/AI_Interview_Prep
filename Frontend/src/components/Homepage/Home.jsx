import React from 'react'
import Navbar from './Navbar'
import Hero from './Hero'
import Footer from './Footer'

const Home = () => {
  return (
    <div className='w-full min-h-screen bg-[#F0EBE3] '>
      <div className='flex items-center justify-center mt-10'>
        <Hero/>
      </div>
    </div>
  )
}

export default Home
