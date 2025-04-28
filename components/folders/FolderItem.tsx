'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Category, Subcategory } from '@/types/card';
import { deleteCategory, deleteSubcategory } from '@/lib/supabase/api';

interface FolderItemProps {
  folder: Category | Subcategory;
  type: 'category' | 'subcategory';
  onDelete?: () => void;
  onEdit?: () => void;
}

export default function FolderItem({ folder, type, onDelete, onEdit }: FolderItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCategory = type === 'category';
  const folderLink = isCategory 
    ? `/folders/${folder.id}` 
    : `/folders/${(folder as Subcategory).category_id}/${folder.id}`;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm(`정말로 ${folder.name} 폴더를 삭제하시겠습니까?`)) {
      try {
        setIsDeleting(true);
        setError(null);

        if (isCategory) {
          await deleteCategory(folder.id);
        } else {
          await deleteSubcategory(folder.id);
        }

        if (onDelete) {
          onDelete();
        }
      } catch (err: any) {
        setError(err.message || '폴더를 삭제하는 도중 오류가 발생했습니다.');
        console.error('Error deleting folder:', err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit();
    }
  };

  return (
    <div className="relative group">
      <Link href={folderLink} className="block">
        <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3">
          {/* 폴더 아이콘 */}
          <div className="text-blue-600">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
            </svg>
          </div>
          
          {/* 폴더 정보 */}
          <div className="flex-1">
            <h3 className="font-medium">{folder.name}</h3>
            {folder.description && (
              <p className="text-gray-500 text-sm">{folder.description}</p>
            )}
          </div>
          
          {/* 폴더 메타데이터 */}
          <div className="text-sm text-gray-500">
            {new Date(folder.created_at).toISOString().split('T')[0].replace(/-/g, '/')}
          </div>
        </div>
      </Link>

      {/* 액션 버튼 */}
      <div className="absolute top-2 right-2 hidden group-hover:flex space-x-1">
        <button
          onClick={handleEdit}
          className="p-1 text-gray-500 hover:text-gray-700 bg-white rounded"
          title="편집"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-1 text-red-500 hover:text-red-700 bg-white rounded"
          title="삭제"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      </div>

      {/* 오류 메시지 */}
      {error && (
        <div className="mt-2 p-2 text-sm text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
}
