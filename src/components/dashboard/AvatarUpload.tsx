'use client';

import React, { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

const DEFAULT_AVATAR = "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/OIP-1767294362062.webp?width=8000&height=8000&resize=contain";

interface AvatarUploadProps {
  uid: string;
  url?: string;
  onUpload: (url: string) => void;
  isDemo?: boolean;
}

export function AvatarUpload({ uid, url, onUpload, isDemo = false }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${uid}/${Math.random()}.${fileExt}`;

      if (isDemo) {
        // Mock upload for demo
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockUrl = URL.createObjectURL(file);
        onUpload(mockUrl);
        return;
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', uid);

      if (updateError) {
        throw updateError;
      }

      onUpload(publicUrl);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
      <div className="w-32 h-32 rounded-full border-4 border-primary/30 p-1 relative z-10 bg-[#121212] overflow-hidden">
        <div className="w-full h-full rounded-full bg-secondary overflow-hidden relative">
          <img
            src={url || DEFAULT_AVATAR}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
          {uploading ? (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>
          )}
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={uploadAvatar}
        disabled={uploading}
        accept="image/*"
        className="hidden"
      />
      <div className="absolute inset-0 rounded-full border border-primary/50 animate-pulse pointer-events-none" />
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -inset-4 border border-dashed border-primary/20 rounded-full pointer-events-none"
      />
    </div>
  );
}
