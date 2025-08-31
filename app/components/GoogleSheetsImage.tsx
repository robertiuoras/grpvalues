"use client";

import { useState } from "react";
import OptimizedImage from "./OptimizedImage";

interface GoogleSheetsImageProps {
  imageUrl: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fallbackText?: string;
}

export default function GoogleSheetsImage({
  imageUrl,
  alt,
  width = 300,
  height = 200,
  className = "",
  priority = false,
  fallbackText = "Image from Google Sheets",
}: GoogleSheetsImageProps) {
  const [hasError, setHasError] = useState(false);

  // Handle Google Sheets URL formatting
  const getOptimizedUrl = (url: string) => {
    // If it's already a direct image URL, use it as is
    if (url.includes("drive.google.com") && url.includes("/uc?")) {
      return url;
    }

    // If it's a Google Sheets URL, try to extract the image
    if (url.includes("docs.google.com")) {
      // You might need to implement specific logic for your Google Sheets setup
      // This is a placeholder for the actual implementation
      return url;
    }

    return url;
  };

  if (hasError) {
    return (
      <div
        className={`${className} bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500 text-sm`}
        style={{ width: width, height: height }}
      >
        <div className="text-center">
          <div className="text-2xl mb-2">🖼️</div>
          <div>{fallbackText}</div>
          <div className="text-xs mt-1">Click to retry</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <OptimizedImage
        src={getOptimizedUrl(imageUrl)}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority={priority}
        fallbackSrc="/images/fallback.png"
      />

      {/* Google Sheets indicator */}
      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        📊 Google Sheets
      </div>

      {/* Error retry button */}
      <button
        onClick={() => setHasError(false)}
        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
        style={{ display: hasError ? "flex" : "none" }}
      >
        <span className="text-white text-sm bg-blue-600 px-3 py-1 rounded-lg">
          Retry
        </span>
      </button>
    </div>
  );
}

// Usage example:
/*
import GoogleSheetsImage from "../components/GoogleSheetsImage";

// In your template grid:
<GoogleSheetsImage
  imageUrl={template.imageUrl}
  alt={template.name}
  width={300}
  height={200}
  className="w-full h-48 object-cover rounded-lg mb-3"
  priority={false}
  fallbackText="Template image unavailable"
/>
*/
