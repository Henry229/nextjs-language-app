'use client';

import React, { useState } from 'react';
import { Category, Subcategory } from '@/types/card';
import { createCategory, updateCategory, createSubcategory, updateSubcategory } from '@/lib/supabase/api';

interface FolderFormProps {
  type: 'category' | 'subcategory';
  folder?: Category | Subcategory;
  categoryId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function FolderForm({ type, folder, categoryId, onSuccess, onCancel }: FolderFormProps) {
  const isEditing = !!folder;
  const isCategory = type === 'category';
  const title = isEditing ? '폴더 수정' : '새 폴더 만들기';
  
  const [name, setName] = useState(folder?.name || '');
  const [description, setDescription] = useState(folder?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('폴더 이름을 입력해주세요.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      if (isCategory) {
        if (isEditing && folder) {
          // 카테고리 수정
          await updateCategory(folder.id, { name, description });
        } else {
          // 새 카테고리 생성
          await createCategory({ name, description });
        }
      } else {
        // 서브카테고리 작업
        const subcategoryParentId = isEditing 
          ? (folder as Subcategory).category_id 
          : categoryId;
          
        if (!subcategoryParentId) {
          throw new Error('카테고리 ID가 필요합니다.');
        }
        
        if (isEditing && folder) {
          // 서브카테고리 수정
          await updateSubcategory(folder.id, { name, description });
        } else {
          // 새 서브카테고리 생성
          await createSubcategory({ 
            name, 
            description, 
            category_id: subcategoryParentId 
          });
        }
      }
      
      onSuccess();
    } catch (err: any) {
      setError(err.message || '폴더를 저장하는 도중 오류가 발생했습니다.');
      console.error('Error saving folder:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            폴더 이름 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="폴더 이름을 입력하세요"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            설명 (선택사항)
          </label>
          <textarea
            id="description"
            value={description || ''}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="폴더에 대한 설명을 입력하세요"
            rows={3}
          />
        </div>
        
        {error && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
            disabled={isSubmitting}
          >
            취소
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? '저장 중...' : isEditing ? '저장' : '만들기'}
          </button>
        </div>
      </form>
    </div>
  );
}
