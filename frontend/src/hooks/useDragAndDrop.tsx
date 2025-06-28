
import { useState, useCallback, DragEvent } from 'react';

interface UseDragAndDropProps {
  onFilesAdded: (files: File[]) => void;
  acceptedTypes?: string[];
  maxFileSize?: number;
}

export const useDragAndDrop = ({ onFilesAdded, acceptedTypes = [], maxFileSize }: UseDragAndDropProps) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const validateFile = (file: File): boolean => {
    if (acceptedTypes.length > 0) {
      const isValidType = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return file.type.toLowerCase().includes(type.toLowerCase());
      });
      if (!isValidType) return false;
    }

    if (maxFileSize && file.size > maxFileSize) {
      return false;
    }

    return true;
  };

  const handleDrag = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setIsDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev - 1);
    if (dragCounter - 1 === 0) {
      setIsDragActive(false);
    }
  }, [dragCounter]);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    setDragCounter(0);

    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const validFiles = files.filter(validateFile);
      onFilesAdded(validFiles);
    }
  }, [onFilesAdded, acceptedTypes, maxFileSize]);

  const dragProps = {
    onDrag: handleDrag,
    onDragStart: handleDrag,
    onDragEnd: handleDrag,
    onDragOver: handleDrag,
    onDragEnter: handleDragIn,
    onDragLeave: handleDragOut,
    onDrop: handleDrop,
  };

  return {
    dragProps,
    isDragActive,
  };
};
