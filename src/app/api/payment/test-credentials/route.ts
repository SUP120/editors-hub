import { NextResponse } from 'next/server';
import { APP_ID, SECRET_KEY } from '@/lib/cashfree';

export async function GET() {
  try {
    // Check if credentials are present
    if (!APP_ID || !SECRET_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Missing Cashfree credentials',
        hasAppId: !!APP_ID,
        hasSecretKey: !!SECRET_KEY
      }, { status: 500 });
    }

    // Make a test request to Cashfree API
    const response = await fetch('https://api.cashfree.com/pg/orders', {
      method: 'GET',
      headers: {
        'x-client-id': APP_ID,
        'x-client-secret': SECRET_KEY,
        'x-api-version': '2022-09-01'
      }
    });

    const data = await response.json();

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      message: response.ok ? 'Credentials are valid' : 'Invalid credentials',
      details: data
    });

  } catch (error: any) {
    console.error('Error testing Cashfree credentials:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 