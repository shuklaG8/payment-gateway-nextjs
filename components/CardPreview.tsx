'use client';
import { CardType, Currency } from '@/types';
import { maskCardNumber } from '@/utils/cardUtils';

interface Props {
    cardholderName: string;
    cardNumber: string;
    expiry: string;
    cardType: CardType;
    currency: Currency;
}

const CARD_COLORS: Record<CardType, string> = {
    visa: 'from-blue-700 to-blue-900',
    mastercard: 'from-red-600 to-orange-500',
    amex: 'from-green-700 to-teal-800',
    unknown: 'from-gray-600 to-gray-800',
};

const CARD_LABELS: Record<CardType, string> = {
    visa: 'VISA',
    mastercard: 'MASTERCARD',
    amex: 'AMERICAN EXPRESS',
    unknown: '',
};

export default function CardPreview({ cardholderName, cardNumber, expiry, cardType, currency }: Props) {
    const displayNumber = cardNumber
        ? maskCardNumber(cardNumber)
        : '•••• •••• •••• ••••';

    const displayName = cardholderName.trim() || 'FULL NAME';
    const displayExpiry = expiry || 'MM/YY';

    return (
        <div
            className={`relative w-full max-w-sm mx-auto h-48 rounded-2xl bg-gradient-to-br ${CARD_COLORS[cardType]} text-white p-6 shadow-2xl shadow-slate-400/40 select-none transform transition-all duration-500 hover:scale-105 hover:shadow-blue-500/20 cursor-default`}
            aria-label="Card preview"
        >
            <div className="absolute top-4 right-5 text-xs font-bold tracking-widest opacity-90">
                {CARD_LABELS[cardType]}
            </div>

            <div className="w-10 h-7 rounded bg-yellow-300 opacity-80 mb-6" />

            <p className="text-xl tracking-widest font-mono mb-4 truncate">
                {displayNumber}
            </p>

            <div className="flex justify-between items-end">
                <div>
                    <p className="text-xs opacity-60 uppercase tracking-wider">Card Holder</p>
                    <p className="text-sm font-semibold uppercase tracking-wide truncate max-w-[160px]">
                        {displayName}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs opacity-60 uppercase tracking-wider">Expires</p>
                    <p className="text-sm font-semibold">{displayExpiry}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs opacity-60 uppercase">{currency}</p>
                </div>
            </div>
        </div>
    );
}