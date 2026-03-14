import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Doctors } from "@/constants";
import { getAppointment } from "@/lib/actions/appointment.actions";
import { formatDateTime } from "@/lib/utils";
import { extractPartySize } from "@/lib/export-utils";
import { CheckCircle, Calendar, Clock, Users, Sparkles, ArrowRight } from "lucide-react";

const ReservationSuccess = async ({
  searchParams,
  params,
}: SearchParamProps) => {
  const searchParamsData = await searchParams;
  const { userId } = await params;
  const appointmentId = (searchParamsData?.appointmentId as string) || "";
  const appointment = await getAppointment(appointmentId);

  const welcomeDrink = Doctors.find(
    (drink) => drink.name === appointment?.primaryPhysician
  );

  if (!appointment) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 items-center justify-center">
        <p className="text-white">Loading reservation details...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 via-transparent to-amber-500/5" />

        {/* Gradient Orbs for celebration effect */}
        <div className="absolute top-40 -left-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 -right-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <div className="flex items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-amber-400">
                  Reservation Confirmed!
                </h1>
              </div>
            </Link>
          </div>

          {/* Success Animation */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <Image
                src="/assets/gifs/success.gif"
                height={200}
                width={200}
                unoptimized
                alt="Success"
                className="rounded-full"
              />
              <div className="absolute inset-0 rounded-full border-4 border-green-400/50 animate-pulse" />
            </div>
          </div>

          {/* Glass Card with Details */}
          <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 p-8 shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-white mb-2">
                We Can't Wait to Serve You!
              </h2>
              <p className="text-gray-400">
                Your table has been reserved at AM | PM Lounge
              </p>
            </div>

            {/* Reservation Details */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-xl p-4 border border-amber-500/20">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-amber-400 mt-1" />
                  <div>
                    <p className="text-gray-400 text-sm">Date & Time</p>
                    <p className="text-white font-medium">
                      {formatDateTime(appointment.schedule).dateTime}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-4 border border-blue-500/20">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-blue-400 mt-1" />
                  <div>
                    <p className="text-gray-400 text-sm">Party Size</p>
                    <p className="text-white font-medium">
                      {extractPartySize(appointment.partySize, appointment.note)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Welcome Drink Card */}
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl p-4 border border-green-500/20 mb-6">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-green-400 mt-1" />
                <div className="flex-1">
                  <p className="text-gray-400 text-sm mb-1">Complimentary Welcome Drink</p>
                  <p className="text-white font-medium text-lg">
                    {welcomeDrink?.name || "House Special"}
                  </p>
                  {welcomeDrink?.description && (
                    <p className="text-gray-500 text-sm mt-1">{welcomeDrink.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Special Message */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20 mb-6">
              <p className="text-center text-white">
                🎉 <span className="font-semibold">Congratulations!</span> Your complimentary {welcomeDrink?.name || "welcome drink"} will be waiting for you!
              </p>
            </div>

            {/* Important Information */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Clock className="w-4 h-4" />
                <span>Please arrive 5 minutes before your reservation time</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Users className="w-4 h-4" />
                <span>Your table will be held for 15 minutes</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 hover:from-amber-600 hover:to-amber-700"
                asChild
              >
                <Link href={`/guests/${userId}/new-appointment`} className="flex items-center justify-center gap-2">
                  Make Another Reservation
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>

              <Button
                variant="outline"
                className="flex-1 bg-white/10 text-white border-white/20 hover:bg-white/20"
                asChild
              >
                <Link href="/">
                  Return Home
                </Link>
              </Button>
            </div>
          </div>

          {/* Confirmation Number */}
          <div className="text-center mt-6">
            <p className="text-gray-500 text-sm">
              Confirmation #: <span className="text-amber-400 font-mono">{appointment.$id?.slice(0, 8).toUpperCase()}</span>
            </p>
          </div>

          {/* Footer */}
          <p className="text-center text-gray-500 text-sm mt-8">
            © 2024 AM | PM Lounge • Premium Dining Experience
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReservationSuccess;