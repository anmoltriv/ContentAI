import React from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets';
import {motion} from 'framer-motion';


const Hero = () => {
    const navigate = useNavigate();
  return (
    <div className='px-4 sm:px-20 xl:px-32 relative inline-flex flex-col w-full justify-center bg-[url(/gradientBackground.png)] bg-cover bg-norepeat min-h-screen'>
      <div className='hero-wave-field pointer-events-none absolute inset-x-0 bottom-0 h-[42%] overflow-hidden'>
        <svg
          className='hero-wave hero-wave-back'
          viewBox='0 0 1440 320'
          preserveAspectRatio='none'
          aria-hidden='true'
        >
          <path
            d='M0,192L48,186.7C96,181,192,171,288,181.3C384,192,480,224,576,218.7C672,213,768,171,864,154.7C960,139,1056,149,1152,165.3C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'
            fill='rgba(80, 68, 229, 0.10)'
          />
        </svg>
        <svg
          className='hero-wave hero-wave-mid'
          viewBox='0 0 1440 320'
          preserveAspectRatio='none'
          aria-hidden='true'
        >
          <path
            d='M0,224L40,218.7C80,213,160,203,240,181.3C320,160,400,128,480,122.7C560,117,640,139,720,165.3C800,192,880,224,960,234.7C1040,245,1120,235,1200,213.3C1280,192,1360,160,1400,144L1440,128L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z'
            fill='rgba(56, 189, 248, 0.12)'
          />
        </svg>
        <svg
          className='hero-wave hero-wave-front'
          viewBox='0 0 1440 320'
          preserveAspectRatio='none'
          aria-hidden='true'
        >
          <path
            d='M0,160L34.3,149.3C68.6,139,137,117,206,128C274.3,139,343,181,411,186.7C480,192,549,160,617,165.3C685.7,171,754,213,823,229.3C891.4,245,960,235,1029,208C1097.1,181,1166,139,1234,133.3C1302.9,128,1371,160,1406,176L1440,192L1440,320L1406,320C1371,320,1303,320,1234,320C1166,320,1097,320,1029,320C960,320,891,320,823,320C754,320,686,320,617,320C549,320,480,320,411,320C343,320,274,320,206,320C137,320,69,320,34,320L0,320Z'
            fill='rgba(255, 255, 255, 0.22)'
          />
        </svg>
      </div>
      <div className='relative z-10 text-center mb-6'>
        <h1 className='mt-1 text-3xl sm:text-5xl md:text-6xl 2xl:text-7xl font-semibold mx-auto leading-[1.2]'>Zero Friction<br/><span className='text-primary text-center'>Smarter Content</span></h1>
        <motion.p>Transform your content creation journey with our suite of premium AI Tools.
            <br/>
            Write articles, generate images, and enhance your workflow.</motion.p>
      </div>

      <div className='relative z-10 flex flex-wrap justify-center gap-4 text-sm max-sm:text-xs'>
        <button onClick={()=>navigate('/ai')}className='bg-primary text-white px-10 py-3 rounded-lg hover:scale-102 active:scale-95 transition cursor-pointer'>Start Creating Now</button>
        <button className='bg-white px-10 py-3 rounded-lg hover:scale-102 active:scale-95 transition cursor-pointer'>Watch Demo</button>
      </div>
      <div className='relative z-10 flex items-center gap-4 mt-8 justify-center text-gray-600'> 
        <img src = {assets.user_group} alt = "" className = 'h-8'/>Trusted by 10k+ people
      </div>
    </div>
  )
}

export default Hero
