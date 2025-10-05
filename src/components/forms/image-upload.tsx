'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { uploadApi } from '@/lib/api';

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
  const [showUrlInput, setShowUrlInput] = useState(false);
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

    // Validate file size (10MB limit for Cloudinary)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    try {
      // Try Cloudinary first, fallback to local upload
      let response;
      try {
        response = await uploadApi.uploadToCloudinary(file, uploadType);
        console.log('✅ Uploaded to Cloudinary:', response.data);
      } catch (cloudinaryError) {
        console.warn('Cloudinary upload failed, falling back to local upload:', cloudinaryError);
        response = await uploadApi.uploadImage(file, uploadType);
        console.log('✅ Uploaded locally:', response.data);
      }
      
      const imageUrl = response.data.url;
      onChange(imageUrl);
      setPreviewUrl(imageUrl);
      setUrlValue(imageUrl);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
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
      setShowUrlInput(false);
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
        {/* File Upload */}
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
            {isUploading ? 'Uploading...' : 'Upload Image'}
          </Button>
        </div>

        {/* URL Input Toggle */}
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="flex-1"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            {showUrlInput ? 'Hide URL Input' : 'Enter URL Instead'}
          </Button>
        </div>

        {/* URL Input */}
        {showUrlInput && (
          <div className="flex space-x-2">
            <Input
              type="url"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder={placeholder}
              required={required}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleUrlSubmit}
              disabled={!urlValue.trim()}
            >
              Use URL
            </Button>
          </div>
        )}
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

