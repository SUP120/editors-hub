import React from 'react';
import Image from 'next/image';

interface BeforeAfterComparisonProps {
  beforeImage: string;
  afterImage: string;
  title?: string;
}

export default function BeforeAfterComparison({ 
  beforeImage, 
  afterImage, 
  title 
}: BeforeAfterComparisonProps) {
  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-lg font-medium">{title}</h3>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative aspect-square">
          <Image
            src={beforeImage}
            alt="Before"
            fill
            className="object-cover rounded-lg"
          />
          <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded">
            Before
          </div>
        </div>
        <div className="relative aspect-square">
          <Image
            src={afterImage}
            alt="After"
            fill
            className="object-cover rounded-lg"
          />
          <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded">
            After
          </div>
        </div>
      </div>
    </div>
  );
} 