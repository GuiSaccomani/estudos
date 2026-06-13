'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function FileUpload({ onUploadComplete }: { onUploadComplete?: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError(null);
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você deve selecionar uma imagem ou PDF para enviar.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('uploads').getPublicUrl(filePath);

      if (onUploadComplete && data?.publicUrl) {
        onUploadComplete(data.publicUrl);
      }

      alert('Upload feito com sucesso!');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
      <label className="cursor-pointer flex flex-col items-center">
        <span className="text-gray-600 font-medium mb-2">
          {uploading ? 'Enviando...' : 'Clique para enviar Imagem ou PDF'}
        </span>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
      </label>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
