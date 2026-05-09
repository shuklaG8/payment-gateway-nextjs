// hooks/useCardDetect.ts
import { useState, useCallback } from 'react';
import { CardType } from '@/types';
import { detectCardType } from '@/utils/cardUtils';

export function useCardDetect() {
  const [cardType, setCardType] = useState<CardType>('unknown');

  const detect = useCallback((cardNumber: string) => {
    const type = detectCardType(cardNumber);
    setCardType(type);
    return type;
  }, []);

  return { cardType, detect };
}