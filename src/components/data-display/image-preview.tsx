'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, ExternalLink } from 'lucide-react';

interface ImagePreviewProps {
  src: string;
  alt: string;
  className?: string;
  showPreview?: boolean;
  showExternalLink?: boolean;
  externalUrl?: string;
}

export function ImagePreview({
  src,
  alt,
  className = '',
  showPreview = true,
  showExternalLink = false,
  externalUrl,
}: ImagePreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!src) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">No image</span>
      </div>
    );
  }

  const imageElement = (
    <img
      src={src}
      alt={alt}
      className={`object-cover rounded-lg ${className}`}
      onError={(e) => {
        e.currentTarget.src = '/placeholder-image.png';
      }}
    />
  );

  if (!showPreview) {
    return imageElement;
  }

  return (
    <div className="relative group">
      {imageElement}
      <div className="absolute inset-0 bg-red bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
        <div className="flex space-x-2">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="secondary">
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
              <img
                src={src}
                alt={alt}
                className="w-full h-auto rounded-lg"
              />
            </DialogContent>
          </Dialog>
          {showExternalLink && externalUrl && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => window.open(externalUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Open
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
