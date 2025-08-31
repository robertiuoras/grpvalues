"use client";

import Image from "next/image";
import { useState } from "react";

interface FirebaseStorageImageProps {
  src: string; // Firebase Storage URL
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fallbackText?: string;
}

export default function FirebaseStorageImage({
  src,
  alt,
  width = 400,
  height = 300,
  className = "",
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  fallbackText = "Image loading...",
}: FirebaseStorageImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Handle Firebase Storage URL optimization
  const getOptimizedUrl = (firebaseUrl: string) => {
    // If it's already a Firebase Storage URL, Next.js will optimize it
    if (firebaseUrl.includes("firebasestorage.googleapis.com")) {
      return firebaseUrl;
    }

    // If it's a Firebase app URL, convert to storage URL if possible
    if (firebaseUrl.includes("firebaseapp.com")) {
      // You might need to adjust this based on your Firebase setup
      return firebaseUrl;
    }

    return firebaseUrl;
  };

  if (imageError) {
    return (
      <div
        className={`${className} bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500 text-sm`}
        style={{ width: width, height: height }}
      >
        <div className="text-center">
          <div className="text-2xl mb-2">🖼️</div>
          <div>{fallbackText}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Loading overlay */}
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      <Image
        src={getOptimizedUrl(src)}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${
          imageLoading ? "opacity-0" : "opacity-100"
        }`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        priority={priority}
        sizes={sizes}
        quality={85}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      />

      {/* Firebase Storage indicator */}
      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-gray-600 opacity-0 hover:opacity-100 transition-opacity duration-200">
        🔥 Firebase
      </div>
    </div>
  );
}

// Usage example:
/*
import FirebaseStorageImage from "../components/FirebaseStorageImage";

// For your luminous clothing items:
<FirebaseStorageImage
  src="https://firebasestorage.googleapis.com/v0/b/your-project/o/luminous-shirt.jpg"
  alt="Luminous Shirt"
  width={300}
  height={400}
  className="w-full h-96 object-cover rounded-lg"
  priority={false}
/>
*/
