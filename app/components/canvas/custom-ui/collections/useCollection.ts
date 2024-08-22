import { useContext, useEffect, useState } from "react";
import { CollectionContext } from "./CollectionProvider";
import { BaseCollection } from "./BaseCollection";

export const useCollection = <T extends BaseCollection = BaseCollection>(collectionId: string): { collection: T; size: number } => {
  const context = useContext(CollectionContext);
  if (!context) {
    throw new Error("CollectionContext not found.");
  }

  const collection = context.get(collectionId);
  if (!collection) {
    // console.warn("No Collection")
  }

  const [size, setSize] = useState<number>(collection?.size || 0);

  useEffect(() => {
    if(collection){
      // Subscribe to collection changes
    const unsubscribe = collection.subscribe(() => {
      setSize(collection.size);
    });

    // Set initial size
    setSize(collection.size);

    return unsubscribe; // Cleanup on unmount
  }
  }, [collection]);

  return { collection: collection as T, size };
};

