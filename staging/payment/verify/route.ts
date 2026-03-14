import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/actions/payment.actions";

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json();

    if (!reference) {
      return NextResponse.json(
        { success: false, error: "Payment reference is required" },
        { status: 400 }
      );
    }

    console.log("🔍 Verifying payment:", reference);

    const result = await verifyPayment(reference);

    if (result.success) {
      console.log("✅ Payment verification successful:", reference);
      
      return NextResponse.json({
        success: true,
        data: result.data
      });
    } else {
      console.log("❌ Payment verification failed:", reference);
      
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 });
    }

  } catch (error) {
    console.error("❌ Payment verification API error:", error);
    
    return NextResponse.json({
      success: false,
      error: "Payment verification failed"
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.json(
      { success: false, error: "Payment reference is required" },
      { status: 400 }
    );
  }

  try {
    console.log("🔍 Verifying payment via GET:", reference);

    const result = await verifyPayment(reference);

    if (result.success) {
      // Redirect to success page or return success response
      return NextResponse.redirect(
        new URL(`/payment/success?reference=${reference}`, request.url)
      );
    } else {
      // Redirect to failure page or return error response
      return NextResponse.redirect(
        new URL(`/payment/failed?error=${encodeURIComponent(result.error || 'Payment verification failed')}`, request.url)
      );
    }

  } catch (error) {
    console.error("❌ Payment verification GET error:", error);
    
    return NextResponse.redirect(
      new URL(`/payment/failed?error=${encodeURIComponent('Payment verification failed')}`, request.url)
    );
  }
}