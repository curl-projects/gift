import React, { createContext, useEffect, useMemo, useState } from 'react';
import { TLShape, TLRecord, Editor, useEditor } from '@tldraw/tldraw';
import { BaseCollection } from './BaseCollection';

interface CollectionContextValue {
  get: (id: string) => BaseCollection | undefined;
  upsert: (id: string, shape: TLShape) => void;
}

type Collection = (new (editor: Editor) => BaseCollection)

interface CollectionProviderProps {
  editor: Editor;
  collections: Collection[];
  children: React.ReactNode;
}

const CollectionContext = createContext<CollectionContextValue | undefined>(undefined);

const CollectionProvider: React.FC<CollectionProviderProps> = ({ editor, collections: collectionClasses, children }) => {
  const [collections, setCollections] = useState<Map<string, BaseCollection> | null>(null);

  // Handle shape property changes
  const handleShapeChange = (prev: TLShape, next: TLShape) => {
    if (!collections) return; // Ensure collections is not null
    for (const collection of collections.values()) {
      if (collection.getShapes().has(next.id)) {
        collection._onShapeChange(prev, next);
      }
    }
  };

  // Handle shape deletions
  const handleShapeDelete = (shape: TLShape) => {
    if (!collections) return; // Ensure collections is not null
    for (const collection of collections.values()) {
      collection.remove([shape]);
    }
  };

  useEffect(() => {
    if (editor) {
      const initializedCollections = new Map<string, BaseCollection>();
      for (const ColClass of collectionClasses) {
        const instance = new ColClass(editor);
        initializedCollections.set(instance.id, instance);
      }
      setCollections(initializedCollections);
    }
  }, [editor, collectionClasses]);

  // Subscribe to shape changes in the editor
  useEffect(() => {
    if (editor && collections) {
      editor.sideEffects.registerAfterChangeHandler('shape', (prev: TLRecord, next: TLRecord) => {
        if (next.typeName !== 'shape') return;
          const prevShape = prev as TLShape;
          const nextShape = next as TLShape;
        handleShapeChange(prevShape, nextShape);
      });
    }
  }, [editor, collections]);

  // Subscribe to shape deletions in the editor
  useEffect(() => {
    if (editor && collections) {
      editor.sideEffects.registerAfterDeleteHandler('shape', (prev: TLRecord, _: string) => {
        if (prev.typeName === 'shape')
          handleShapeDelete(prev);
      })
    }
  }, [editor, collections]);

  const startSimulation = (id: string) => {
    const collection = collections?.get(id);
    if (collection && collection instanceof GraphLayoutCollection) {
      collection.startSimulation();
    }
  };

  const stopSimulation = (id: string) => {
    const collection = collections?.get(id);
    if (collection && collection instanceof GraphLayoutCollection) {
      collection.stopSimulation();
    }
  };

  const upsert = (id: string, shape: TLShape) => {
    const collection = collections?.get(id);
    if (collection && collection instanceof GraphLayoutCollection) {
      collection.upsert(shape);
    }
  };

  const value = useMemo(() => ({
    get: (id: string) => collections?.get(id),
    startSimulation,
    stopSimulation,
    upsert,
  }), [collections]);

  return (
    <CollectionContext.Provider value={value}>
      {collections ? children : null}
    </CollectionContext.Provider>
  );
};

export { CollectionContext, CollectionProvider, type Collection };