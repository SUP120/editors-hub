import React, { useState } from 'react';
import Image from 'next/image';
import { Work } from '@/app/types/supabase';

interface WorkFormProps {
  initialWork?: Work;
  onSubmit: (work: Partial<Work>) => Promise<void>;
}

export default function WorkForm({ initialWork, onSubmit }: WorkFormProps) {
  const [images, setImages] = useState<string[]>(initialWork?.images || []);
  const [beforeImages, setBeforeImages] = useState<string[]>(initialWork?.before_images || []);
  const [afterImages, setAfterImages] = useState<string[]>(initialWork?.after_images || []);
  const [title, setTitle] = useState(initialWork?.title || '');
  const [description, setDescription] = useState(initialWork?.description || '');
  const [price, setPrice] = useState(initialWork?.price?.toString() || '');
  const [videoUrl, setVideoUrl] = useState(initialWork?.video_url || '');
  const [tags, setTags] = useState<string[]>(initialWork?.tags || []);
  const [loading, setLoading] = useState(false);

  const handleRemoveImage = (index: number, type: 'images' | 'before' | 'after') => {
    switch (type) {
      case 'images':
        setImages(prev => prev.filter((_, i) => i !== index));
        break;
      case 'before':
        setBeforeImages(prev => prev.filter((_, i) => i !== index));
        break;
      case 'after':
        setAfterImages(prev => prev.filter((_, i) => i !== index));
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        title,
        description,
        price: parseFloat(price),
        images,
        before_images: beforeImages,
        after_images: afterImages,
        video_url: videoUrl,
        tags
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Work Images</label>
        <div className="mt-2 grid grid-cols-2 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative">
              <Image
                src={image}
                alt={`Work image ${index + 1}`}
                width={200}
                height={200}
                className="object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index, 'images')}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Before Images</label>
        <div className="mt-2 grid grid-cols-2 gap-4">
          {beforeImages.map((image, index) => (
            <div key={index} className="relative">
              <Image
                src={image}
                alt={`Before image ${index + 1}`}
                width={200}
                height={200}
                className="object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index, 'before')}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">After Images</label>
        <div className="mt-2 grid grid-cols-2 gap-4">
          {afterImages.map((image, index) => (
            <div key={index} className="relative">
              <Image
                src={image}
                alt={`After image ${index + 1}`}
                width={200}
                height={200}
                className="object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index, 'after')}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={4}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Price</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
          min="0"
          step="0.01"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Video URL (Optional)</label>
        <input
          type="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Work'}
      </button>
    </form>
  );
} 