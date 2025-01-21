import React, { useState } from 'react';
import Image from 'next/image';
import { Work } from '@/app/types/supabase';

interface FeaturedWorksProps {
  works: Work[];
}

export default function FeaturedWorks({ works }: FeaturedWorksProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? works.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === works.length - 1 ? 0 : prev + 1));
  };

  if (!works.length) {
    return null;
  }

  const currentWork = works[currentIndex];

  return (
    <div className="relative">
      <div className="aspect-video relative rounded-lg overflow-hidden">
        {currentWork.images[0] && (
          <Image
            src={currentWork.images[0]}
            alt={currentWork.title}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h3 className="text-white text-xl font-bold">{currentWork.title}</h3>
          <p className="text-white/80">{currentWork.description}</p>
        </div>
      </div>
      
      <div className="absolute top-1/2 -translate-y-1/2 left-4">
        <button
          onClick={handlePrevious}
          className="bg-white/80 hover:bg-white p-2 rounded-full shadow-lg"
          aria-label="Previous work"
        >
          ←
        </button>
      </div>
      
      <div className="absolute top-1/2 -translate-y-1/2 right-4">
        <button
          onClick={handleNext}
          className="bg-white/80 hover:bg-white p-2 rounded-full shadow-lg"
          aria-label="Next work"
        >
          →
        </button>
      </div>

      <div className="flex justify-center mt-4 gap-2">
        {works.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full ${
              index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
            }`}
            aria-label={`Go to work ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
} 