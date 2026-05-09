import { NextRequest, NextResponse } from 'next/server';

const FAILURE_REASONS = [
    'Insufficient funds',
    'Card declined by issuer',
    'Transaction limit exceeded',
    'Suspected fraud - contact your bank',
    'Invalid card details',
    'Expired card',
]

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
    const body = await req.json();

    const { transactionId } = body;

    if (!transactionId) {
        return NextResponse.json({ success: false, message: 'Transaction ID is required' }, { status: 400 });
    }

    const roll = Math.random();

    if (roll < 0.15) {
        await sleep(8000);
        return NextResponse.json({ success: false, message: 'Payment processing timed out' }, { status: 504 });
    }

    if (roll < 0.40) {
        const reason = FAILURE_REASONS[Math.floor(Math.random() * FAILURE_REASONS.length)];
        return NextResponse.json({ success: false, message: reason }, { status: 402 });
    }

    await sleep(1500);
    return NextResponse.json({ success: true, message: 'Payment processed successfully' });
}
