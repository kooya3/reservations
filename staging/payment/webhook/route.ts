import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { verifyPayment } from "@/lib/actions/payment.actions";
import { updateAppointment } from "@/lib/actions/appointment.actions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!signature) {
      console.error("❌ No signature found in webhook request");
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    // Verify webhook signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY || "")
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      console.error("❌ Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    console.log("🎣 Webhook received:", event.event);

    // Handle different webhook events
    switch (event.event) {
      case "charge.success":
        await handlePaymentSuccess(event.data);
        break;
        
      case "charge.failed":
        await handlePaymentFailed(event.data);
        break;
        
      case "charge.dispute.create":
        await handlePaymentDispute(event.data);
        break;
        
      default:
        console.log(`📝 Unhandled webhook event: ${event.event}`);
    }

    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" }, 
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(data: any) {
  try {
    console.log("✅ Processing successful payment:", data.reference);
    
    // Extract reservation ID from reference
    const reservationId = data.reference.split('_')[1];
    
    if (!reservationId) {
      console.error("❌ Could not extract reservation ID from reference:", data.reference);
      return;
    }

    // Update reservation status to confirmed
    const updateResult = await updateAppointment({
      appointmentId: reservationId,
      appointment: { status: "scheduled" },
      type: "schedule"
    });

    if (updateResult) {
      console.log("✅ Reservation confirmed after payment:", reservationId);
      
      // TODO: Send confirmation email to customer
      // TODO: Send notification to restaurant staff
      // TODO: Store payment transaction in database
      
    } else {
      console.error("❌ Failed to update reservation status for:", reservationId);
    }
    
  } catch (error) {
    console.error("❌ Error handling payment success:", error);
  }
}

async function handlePaymentFailed(data: any) {
  try {
    console.log("❌ Processing failed payment:", data.reference);
    
    // Extract reservation ID from reference
    const reservationId = data.reference.split('_')[1];
    
    if (!reservationId) {
      console.error("❌ Could not extract reservation ID from reference:", data.reference);
      return;
    }

    // Keep reservation in pending status or cancel after timeout
    console.log("⏳ Payment failed for reservation:", reservationId);
    
    // TODO: Send payment failure notification to customer
    // TODO: Implement retry logic or auto-cancellation
    
  } catch (error) {
    console.error("❌ Error handling payment failure:", error);
  }
}

async function handlePaymentDispute(data: any) {
  try {
    console.log("⚠️ Payment dispute created:", data.reference);
    
    // TODO: Notify admin about dispute
    // TODO: Implement dispute resolution workflow
    
  } catch (error) {
    console.error("❌ Error handling payment dispute:", error);
  }
}