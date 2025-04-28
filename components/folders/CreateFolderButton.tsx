'use client';

import React, { useState } from 'react';
import FolderForm from './FolderForm';

interface CreateFolderButtonProps {
  type: 'category' | 'subcategory';
  categoryId?: string;
  onSuccess?: () => void;
  buttonText?: string;
}

export default function CreateFolderButton({ 
  type, 
  categoryId, 
  onSuccess,
  buttonText = '새 폴더 만들기'
}: CreateFolderButtonProps) {
  const [showForm, setShowForm] = useState(false);

  const handleButtonClick = () => {
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    if (onSuccess) {
      onSuccess();
    } else {
      // 폴더 목록을 갱신하기 위해 페이지 새로고침
      window.location.reload();
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  return (
    <div>
      {!showForm ? (
        <button
          onClick={handleButtonClick}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded hover:bg-primary-dark"
        >
          {buttonText}
        </button>
      ) : (
        <FolderForm
          type={type}
          categoryId={categoryId}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}
