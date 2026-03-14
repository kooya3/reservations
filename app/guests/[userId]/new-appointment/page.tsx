import Image from "next/image";
import { AppointmentForm } from "@/components/forms/AppointmentForm";
import { getPatient } from "@/lib/actions/guest.actions";
import { Calendar, Clock, Users, Sparkles } from "lucide-react";

const NewReservation = async ({ params }: SearchParamProps) => {
  const { userId } = await params;
  const patient = await getPatient(userId);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/5 via-transparent to-amber-500/5" />

        {/* Gradient Orbs */}
        <div className="absolute top-40 -left-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 -right-40 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Left Section - Form */}
      <section className="relative z-10 flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[700px]">
          {/* Premium Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                  Make a Reservation
                </h1>
                <p className="text-gray-400 text-sm">Secure your table at AM | PM Lounge</p>
              </div>
            </div>
          </div>

          {/* Glass Form Container */}
          <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 p-8 shadow-2xl">
            {patient && (
              <div className="mb-6 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <p className="text-amber-400 text-sm font-medium">Welcome back, {patient.name}!</p>
                <p className="text-gray-400 text-xs mt-1">Your preferences have been loaded</p>
              </div>
            )}

            <AppointmentForm
              patientId={patient?.$id}
              userId={userId}
              type="create"
            />
          </div>

          {/* Footer */}
          <p className="text-center text-gray-500 text-sm mt-8">
            © 2024 AM | PM Lounge • Premium Dining Experience
          </p>
        </div>
      </section>

      {/* Right Section - Visual */}
      <section className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 via-amber-500/10 to-transparent z-10" />

        {/* Background Image */}
        <Image
          src="/assets/images/appointment-img.png"
          fill
          alt="Restaurant ambiance"
          className="object-cover"
          priority
        />

        {/* Overlay Content */}
        <div className="absolute inset-0 z-20 flex items-center justify-center p-12">
          <div className="backdrop-blur-md bg-black/40 rounded-3xl p-8 max-w-md">
            <h3 className="text-3xl font-bold text-white mb-6">Why Reserve With Us?</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">Instant Confirmation</h4>
                  <p className="text-gray-300 text-sm">Secure your table in seconds</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">VIP Treatment</h4>
                  <p className="text-gray-300 text-sm">Personalized dining experience</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">Special Perks</h4>
                  <p className="text-gray-300 text-sm">Complimentary drinks & surprises</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <p className="text-amber-400 font-semibold text-center">Operating Hours</p>
              <p className="text-gray-300 text-sm text-center mt-2">Mon-Fri: 8am - 12am</p>
              <p className="text-gray-300 text-sm text-center">Sat-Sun: 10am - 2am</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewReservation;