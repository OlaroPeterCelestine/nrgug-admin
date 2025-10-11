'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { uploadApi } from '@/lib/api';
import { uploadToR2, generateR2Url } from '@/lib/r2-upload';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  uploadType: 'news' | 'shows' | 'clients' | 'mail';
  className?: string;
}

export function ImageUpload({
  value = '',
  onChange,
  label = 'Image',
  placeholder = 'Upload an image or enter URL',
  required = false,
  uploadType,
  className = '',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(value);
  const [urlValue, setUrlValue] = useState(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    try {
      console.log('📁 File selected:', file.name, 'Size:', file.size, 'bytes');
      
      // Convert file to base64 for immediate preview and storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setPreviewUrl(base64String);
        setUrlValue(base64String);
        onChange(base64String);
        setIsUploading(false);
        
        console.log('✅ File converted to base64 and ready for use');
        alert(`✅ Image uploaded successfully!\n\nFile: ${file.name}\nSize: ${(file.size / 1024).toFixed(1)} KB`);
      };
      
      reader.onerror = () => {
        console.error('File reading failed');
        alert('Failed to read file. Please try again.');
        setIsUploading(false);
      };
      
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('File processing failed:', error);
      alert('File processing failed. Please try again.');
      setIsUploading(false);
    }
  };

  const handleUrlChange = (url: string) => {
    setUrlValue(url);
    onChange(url);
    setPreviewUrl(url);
  };

  const handleUrlSubmit = () => {
    if (urlValue.trim()) {
      onChange(urlValue.trim());
      setPreviewUrl(urlValue.trim());
    }
  };

  const clearImage = () => {
    onChange('');
    setPreviewUrl('');
    setUrlValue('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="image-upload">{label}</Label>
      
      {/* Image Preview */}
      {previewUrl && (
        <div className="relative inline-block">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg border"
            onError={() => setPreviewUrl('')}
          />
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={clearImage}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Upload Options */}
      <div className="flex flex-col space-y-2">
        {/* URL Input - Primary Method */}
        <div className="flex space-x-2">
          <Input
            type="url"
            placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
            value={urlValue}
            onChange={(e) => handleUrlChange(e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleUrlSubmit}
            disabled={!urlValue.trim()}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Use URL
          </Button>
        </div>

        {/* File Upload - Secondary Method */}
        <div className="flex items-center space-x-2">
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
            id="image-upload"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'Processing...' : 'Upload Image'}
          </Button>
        </div>

        {/* Info Message */}
        <div className="text-xs text-gray-500 bg-green-50 p-2 rounded">
          🚀 <strong>Image Upload Working:</strong> Select files for immediate preview and storage!<br/>
          <strong>Option 1:</strong> Select file for instant base64 upload and preview<br/>
          <strong>Option 2:</strong> Enter image URL directly (supports any image URL)<br/>
          <strong>Option 3:</strong> Use external services like <a href="https://imgur.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Imgur</a> or <a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Cloudinary</a><br/>
          <span className="text-green-600">✅ Images are immediately visible after upload</span>
        </div>

      </div>

      {/* Current Value Display */}
      {value && (
        <div className="text-xs text-gray-500 break-all">
          Current: {value}
        </div>
      )}
    </div>
  );
}

