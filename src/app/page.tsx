'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Suspense, useState, useEffect } from 'react'
import { FiArrowRight, FiStar, FiCheck, FiUsers, FiVideo, FiImage, FiCode, FiMusic, FiGithub, FiTwitter } from 'react-icons/fi'
import { HiOutlineSparkles, HiCursorClick } from 'react-icons/hi'
import { FaDiscord } from 'react-icons/fa'
import AuthRedirect from '@/components/AuthRedirect'
import { Toaster } from 'react-hot-toast'

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

// Particle colors for more variety
const particleColors = [
  'bg-emerald-500/50',
  'bg-purple-500/50',
  'bg-pink-500/50',
  'bg-blue-500/50',
  'bg-indigo-500/50',
  'bg-cyan-500/50'
];

export default function Home() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorVariant, setCursorVariant] = useState('default');
  const [numParticles, setNumParticles] = useState(20);
  const [numFloatingElements, setNumFloatingElements] = useState(5);
  
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Director",
      company: "CreativeMinds",
      image: "https://randomuser.me/api/portraits/women/32.jpg",
      text: "Working with artists from Editor's Hub transformed our brand identity. The level of creativity and professionalism exceeded our expectations."
    },
    {
      name: "Michael Chen",
      role: "Indie Game Developer",
      company: "PixelDreams",
      image: "https://randomuser.me/api/portraits/men/45.jpg",
      text: "I found the perfect illustrator for my game through Editor's Hub. The collaboration was seamless and the results were outstanding."
    },
    {
      name: "Emma Rodriguez",
      role: "Content Creator",
      company: "Visionary Media",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      text: "Editor's Hub connected me with talented video editors who elevated my content to a professional level. My audience growth has been phenomenal."
    }
  ];

  const services = [
    { 
      icon: <FiVideo className="w-6 h-6 text-purple-400" />, 
      title: "Video Editing", 
      description: "Professional video editing services for content creators, businesses, and filmmakers." 
    },
    { 
      icon: <FiImage className="w-6 h-6 text-indigo-400" />, 
      title: "Graphic Design", 
      description: "Creative graphic design solutions for branding, marketing materials, and digital assets." 
    },
    { 
      icon: <FiCode className="w-6 h-6 text-blue-400" />, 
      title: "Web Desgning", 
      description: "Custom web designing services to bring your digital presence to life." 
    },
    { 
      icon: <FiMusic className="w-6 h-6 text-pink-400" />, 
      title: "Audio Production", 
      description: "Professional audio editing, mixing, and production for various media projects." 
    }
  ];

  // Handle mouse movement for interactive cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Handle window resize
  useEffect(() => {
    const updateElements = () => {
      setNumParticles(window.innerWidth > 768 ? 40 : 20);
      setNumFloatingElements(window.innerWidth > 768 ? 10 : 5);
    };

    updateElements();
    window.addEventListener('resize', updateElements);
    return () => window.removeEventListener('resize', updateElements);
  }, []);

  const cursorVariants = {
    default: {
      x: mousePosition.x - 16,
      y: mousePosition.y - 16,
      opacity: 0.5,
    },
    hover: {
      x: mousePosition.x - 16,
      y: mousePosition.y - 16,
      opacity: 1,
      scale: 1.5,
    },
  };

  return (
    <div className="relative">
      {/* Custom Cursor - Hide on mobile */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-purple-500 mix-blend-screen pointer-events-none z-50 hidden md:block"
        variants={cursorVariants}
        animate={cursorVariant}
      />
      
      <Suspense>
        <AuthRedirect />
      </Suspense>
      <Toaster />

      {/* Hero Section */}
      <section className="relative min-h-screen bg-[#0B1120] overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,219,198,0.3),rgba(255,255,255,0))]"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        
        {/* Enhanced Animated Particles - Reduce on mobile */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          {[...Array(numParticles)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-${Math.random() > 0.5 ? '1' : '2'} h-${Math.random() > 0.5 ? '1' : '2'} rounded-full ${particleColors[i % particleColors.length]}`}
              initial={{ 
                x: Math.random() * 100 + "%", 
                y: -10, 
                opacity: Math.random() * 0.5 + 0.3,
                scale: Math.random() * 0.5 + 0.5
              }}
              animate={{ 
                y: "100vh",
                x: `${Math.sin(i) * 50 + 50}%`,
                opacity: 0,
                scale: 0
              }}
              transition={{ 
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Interactive Floating Elements - Reduce on mobile */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(numFloatingElements)].map((_, i) => (
            <motion.div
              key={`float-${i}`}
              className="absolute w-8 md:w-12 h-8 md:h-12 rounded-lg bg-gradient-to-r from-emerald-500/10 to-purple-500/10 backdrop-blur-sm"
              initial={{
                x: Math.random() * 100 + "%",
                y: Math.random() * 100 + "%",
              }}
              animate={{
                x: [
                  `${Math.random() * 100}%`,
                  `${Math.random() * 100}%`,
                  `${Math.random() * 100}%`
                ],
                y: [
                  `${Math.random() * 100}%`,
                  `${Math.random() * 100}%`,
                  `${Math.random() * 100}%`
                ],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-32 pb-16 md:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-6 md:space-y-8"
            >
              <motion.div variants={fadeIn} className="inline-block">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs md:text-sm font-medium bg-gradient-to-r from-emerald-500/10 to-purple-500/10 text-emerald-300 border border-emerald-500/20">
                  <HiOutlineSparkles className="mr-1 h-3 md:h-4 w-3 md:w-4" />
                  The Next-Gen Creative Marketplace
                </span>
              </motion.div>
              
              <motion.h1 
                variants={fadeIn}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight"
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-purple-400 to-pink-400">
                  Unleash
                </span>
                <br />
                Creative Excellence
              </motion.h1>
              
              <motion.p 
                variants={fadeIn}
                className="text-base md:text-xl text-gray-300 leading-relaxed"
              >
                Connect with elite creative professionals who transform your vision into reality. From stunning visuals to captivating content, find your perfect creative partner.
              </motion.p>
              
              <motion.div 
                variants={fadeIn}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link href="/auth/signup" className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group px-4 md:px-6 py-3 bg-gradient-to-r from-emerald-500 to-purple-500 rounded-xl text-white font-medium
                             hover:from-emerald-600 hover:to-purple-600 transform hover:-translate-y-0.5 transition-all flex items-center gap-2 w-full justify-center"
                  >
                    Get Started Now
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
                <Link href="https://discord.gg/YWFD72HV" target="_blank" className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 md:px-6 py-3 rounded-xl text-gray-300 font-medium backdrop-blur-sm
                             bg-white/5 border border-white/10 hover:bg-white/10 transition-colors w-full justify-center flex items-center gap-2"
                  >
                    <FaDiscord className="w-4 md:w-5 h-4 md:h-5 text-purple-400" />
                    Join Our Community
                  </motion.button>
                </Link>
              </motion.div>

              {/* Authentication Options */}
              <motion.div 
                variants={fadeIn}
                className="flex flex-col sm:flex-row gap-4 mt-4"
              >
                <Link href="/auth/signin" className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group px-4 md:px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white font-medium
                             hover:from-cyan-600 hover:to-blue-600 transform hover:-translate-y-0.5 transition-all flex items-center gap-2 w-full justify-center"
                  >
                    Sign In
                    <HiCursorClick className="group-hover:rotate-12 transition-transform" />
                  </motion.button>
                </Link>
                <Link href="/browse-works" className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 md:px-6 py-3 rounded-xl text-gray-300 font-medium backdrop-blur-sm
                             bg-white/5 border border-white/10 hover:bg-white/10 transition-colors w-full justify-center flex"
                  >
                    Browse Works
                  </motion.button>
                </Link>
              </motion.div>
              
              <motion.div 
                variants={fadeIn}
                className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-400"
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-6 md:w-8 h-6 md:h-8 rounded-full border-2 border-[#0B1120] overflow-hidden">
                      <Image 
                        src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${20 + i}.jpg`} 
                        alt="User" 
                        width={32} 
                        height={32}
                      />
                    </div>
                  ))}
                </div>
                <span>Trusted by <span className="text-white font-medium">10,000+</span> clients worldwide</span>
              </motion.div>

              {/* Social Proof */}
              <motion.div
                variants={fadeIn}
                className="flex items-center gap-6 text-sm text-gray-400 mt-4"
              >
                <div className="flex items-center gap-2">
                  <FiStar className="w-5 h-5 text-yellow-400" />
                  <span>4.9/5 Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiUsers className="w-5 h-5 text-emerald-400" />
                  <span>2500+ Reviews</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheck className="w-5 h-5 text-purple-400" />
                  <span>Verified Artists</span>
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-3xl blur-3xl"></div>
              <div className="relative">
                <div className="relative overflow-hidden rounded-3xl shadow-2xl border border-white/10">
                  <Image
                    src="/hero-image.png"
                    alt="Creative Work"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent"></div>
                </div>
                
                <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-2">
                    <FiStar className="w-5 h-5 text-yellow-300" />
                    <span className="text-white font-medium">4.9/5 from 2,500+ reviews</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={fadeIn}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                Creative Services
              </span> We Offer
            </motion.h2>
            <motion.p 
              variants={fadeIn}
              className="text-xl text-gray-300 max-w-3xl mx-auto"
            >
              Connect with talented professionals across various creative disciplines
            </motion.p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-xl p-6 hover:bg-white/10 transition-colors"
              >
                <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-lg p-3 inline-block mb-4">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                <p className="text-gray-400">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-[#0f172a] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={fadeIn}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              How <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                Editor's Hub
              </span> Works
            </motion.h2>
            <motion.p 
              variants={fadeIn}
              className="text-xl text-gray-300 max-w-3xl mx-auto"
            >
              A simple process to connect with the perfect creative professional
            </motion.p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                number: "01", 
                title: "Create Your Project", 
                description: "Describe your vision, requirements, and budget for your creative project." 
              },
              { 
                number: "02", 
                title: "Connect with Artists", 
                description: "Browse profiles, review portfolios, and chat with talented professionals." 
              },
              { 
                number: "03", 
                title: "Collaborate & Create", 
                description: "Work together seamlessly through our platform to bring your vision to life." 
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="glass-card rounded-xl p-6 h-full">
                  <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-purple-500">
                    <FiArrowRight className="w-6 h-6" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={fadeIn}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                Clients
              </span> Say
            </motion.h2>
            <motion.p 
              variants={fadeIn}
              className="text-xl text-gray-300 max-w-3xl mx-auto"
            >
              Success stories from clients who found their perfect creative match
            </motion.p>
          </motion.div>
          
          <div className="relative">
            <div className="glass-card rounded-xl p-8 md:p-12 max-w-4xl mx-auto">
              <div className="absolute top-6 left-10 text-6xl text-purple-500/20">"</div>
              
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10"
              >
                <p className="text-xl text-gray-300 mb-8 relative z-10">
                  {testimonials[activeTestimonial].text}
                </p>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <Image 
                      src={testimonials[activeTestimonial].image} 
                      alt={testimonials[activeTestimonial].name} 
                      width={48} 
                      height={48}
                    />
                  </div>
                  <div>
                    <h4 className="font-bold">{testimonials[activeTestimonial].name}</h4>
                    <p className="text-gray-400 text-sm">
                      {testimonials[activeTestimonial].role}, {testimonials[activeTestimonial].company}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
            
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === activeTestimonial ? 'bg-purple-500' : 'bg-gray-700'
                  }`}
                  aria-label={`View testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#0f172a] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-xl p-8 md:p-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                Transform
              </span> Your Creative Vision?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Join thousands of clients who have found their perfect creative match on Editor's Hub
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/browse-works">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white font-medium
                           hover:from-purple-600 hover:to-indigo-600 transform hover:-translate-y-0.5 transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  Explore Creative Talent
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <Link href="/auth/signup">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 rounded-xl text-gray-300 font-medium backdrop-blur-sm
                           bg-white/5 border border-white/10 hover:bg-white/10 transition-colors w-full sm:w-auto justify-center flex"
                >
                  Sign Up Now
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Editor's Hub</h3>
              <p className="text-gray-400 mb-4">Connecting creative talent with visionary clients worldwide.</p>
              <div className="flex space-x-4">
                {['twitter', 'facebook', 'instagram', 'linkedin'].map((social) => (
                  <a 
                    key={social} 
                    href="#" 
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label={`${social} link`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                      <span className="sr-only">{social}</span>
                      <FiUsers className="w-4 h-4" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
            
            {[
              {
                title: "For Clients",
                links: ["How It Works", "Browse Artists", "Success Stories", "Pricing"]
              },
              {
                title: "For Artists",
                links: ["Join as Artist", "Artist Resources", "Success Tips", "Community"]
              },
              {
                title: "Company",
                links: [
                  { name: "About Us", href: "/about" },
                  { name: "Services", href: "/services" },
                  { name: "Careers", href: "#" },
                  { name: "Contact Us", href: "/contact" }
                ]
              }
            ].map((column, index) => (
              <div key={index}>
                <h3 className="text-lg font-bold mb-4">{column.title}</h3>
                <ul className="space-y-2">
                  {Array.isArray(column.links) && column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      {typeof link === 'string' ? (
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">
                          {link}
                        </a>
                      ) : (
                        <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                          {link.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Artist Hiring Platform. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy-policy" className="text-gray-400 hover:text-white text-sm">Privacy Policy</Link>
              <Link href="/terms-of-service" className="text-gray-400 hover:text-white text-sm">Terms of Service</Link>
              <Link href="/refund-policy" className="text-gray-400 hover:text-white text-sm">Refund Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 