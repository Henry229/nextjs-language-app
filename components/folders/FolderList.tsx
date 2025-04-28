'use client';

import React, { useState, useEffect } from 'react';
import { Category, Subcategory } from '@/types/card';
import FolderItem from './FolderItem';
import FolderForm from './FolderForm';

interface FolderListProps {
  folders: (Category | Subcategory)[];
  type: 'category' | 'subcategory';
  categoryId?: string;
  refreshAction?: (id?: string) => Promise<(Category | Subcategory)[]>;
  emptyMessage?: string;
}

export default function FolderList({ 
  folders: initialFolders, 
  type, 
  categoryId,
  refreshAction,
  emptyMessage = '폴더가 없습니다. 새 폴더를 만들어보세요.'
}: FolderListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Category | Subcategory | null>(null);
  const [folders, setFolders] = useState<(Category | Subcategory)[]>(initialFolders);

  // initialFolders가 변경되면 state 업데이트
  useEffect(() => {
    setFolders(initialFolders);
  }, [initialFolders]);

  const handleAddClick = () => {
    setEditingFolder(null);
    setShowForm(true);
  };

  const handleEditClick = (folder: Category | Subcategory) => {
    setEditingFolder(folder);
    setShowForm(true);
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingFolder(null);
    
    if (refreshAction) {
      try {
        // 서버 액션 호출하여 최신 데이터 가져오기
        const updatedFolders = await refreshAction(categoryId);
        // 데이터를 클라이언트 상태로 업데이트 (페이지 새로고침 없음)
        setFolders(updatedFolders);
      } catch (error) {
        console.error('새로고침 중 오류 발생:', error);
        // 오류 발생시 기본 방식으로 폴백
        window.location.reload();
      }
    } else {
      // 기존 방식: 페이지 새로고침
      window.location.reload();
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingFolder(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {type === 'category' ? '대분류 폴더' : '중분류 폴더'}
        </h2>
        <button
          onClick={handleAddClick}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          새 폴더 만들기
        </button>
      </div>

      {console.log('showForm:', showForm)}
      {showForm && (
        <FolderForm
          type={type}
          folder={editingFolder || undefined}
          categoryId={categoryId}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      {folders.length === 0 ? (
        <div className="p-6 text-center text-gray-500 border border-gray-200 rounded-lg">
          {emptyMessage}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {folders.map((folder) => (
            <FolderItem
              key={folder.id}
              folder={folder}
              type={type}
              onDelete={async () => {
                if (refreshAction) {
                  try {
                    const updatedFolders = await refreshAction(categoryId);
                    setFolders(updatedFolders);
                  } catch (error) {
                    console.error('새로고침 중 오류 발생:', error);
                    window.location.reload();
                  }
                } else {
                  window.location.reload();
                }
              }}
              onEdit={() => handleEditClick(folder)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
