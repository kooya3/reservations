import { NextRequest, NextResponse } from 'next/server';
import { generateVatRemittanceReport } from '@/lib/actions/vat.actions';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'startDate and endDate are required' }, { status: 400 });
    }

    const result = await generateVatRemittanceReport({
      startDate,
      endDate
    });
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    
    return NextResponse.json(result.report);
  } catch (error) {
    console.error('Error generating VAT report:', error);
    return NextResponse.json({ error: 'Failed to generate VAT report' }, { status: 500 });
  }
}
