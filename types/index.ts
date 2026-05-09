export type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed' | 'timeout';
export type CardType = 'visa' | 'mastercard' | 'amex' | 'unknown';
export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY';

export interface PaymentFormValues {
    cardholderName: string;
    cardNumber: string;
    expiry: string;
    cvv: string;
    amount: string;
    currency: Currency;
}

export interface FormErrors {
    cardholderName?: string;
    cardNumber?: string;
    expiry?: string;
    cvv?: string;
    amount?: string;
}

export interface PaymentPayload {
    transactionId: string;
    cardholderName: string;
    cardNumberLast4: string;
    expiry: string;
    amount: number;
    currency: Currency;
}

export interface Transaction {
    id: string;
    amount: number;
    currency: Currency;
    status: PaymentStatus;
    timestamp: string;
    failureReason?: string;
    attempts: number;
    cardholderName: string;
    cardNumberLast4: string;
}

export interface GatewayResponse {
    success: boolean;
    reason?: string;
}