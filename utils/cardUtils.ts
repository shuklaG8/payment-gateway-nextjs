import { CardType } from '@/types';

export function detectCardType(cardNumber: string): CardType {
    const raw = cardNumber.replace(/\s/g, '');
    if (/^4/.test(raw)) return 'visa';
    if (/^5[1-5]/.test(raw)) return 'mastercard';
    if (/^3[47]/.test(raw)) return 'amex';
    return 'unknown';
}

export function formatCardNumber(value: string, cardType: CardType): string {
    const raw = value.replace(/\D/g, '');
    if (cardType === 'amex') {
        const p1 = raw.slice(0, 4);
        const p2 = raw.slice(4, 10);
        const p3 = raw.slice(10, 15);
        return [p1, p2, p3].filter(Boolean).join(' ');
    }
    return raw.slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

export function getCardMaxLength(cardType: CardType): number {
    return cardType === 'amex' ? 15 : 16;
}

export function getCvvMaxLength(cardType: CardType): number {
    return cardType === 'amex' ? 4 : 3;
}

export function maskCardNumber(cardNumber: string): string {
    const raw = cardNumber.replace(/\s/g, '');
    const last4 = raw.slice(-4);
    const masked = raw.slice(0, -4).replace(/\d/g, '•');
    const full = masked + last4;
    return full.replace(/(.{4})/g, '$1 ').trim();
}