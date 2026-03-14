"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Heart,
  Sparkles,
  ChefHat,
  Utensils,
  Calendar,
  MapPin
} from "lucide-react";

import { Form, FormControl } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
import { registerPatient } from "@/lib/actions/guest.actions";
import { mapGuestToPatient, validatePatientData } from "@/lib/appwrite-schema-sync";
import { Gender } from "@/constants";
import CustomFormField, { FormFieldType } from "../CustomFormField";
import SubmitButton from "../SubmitButton";

import "react-datepicker/dist/react-datepicker.css";
import "react-phone-number-input/style.css";

// Simplified validation for restaurant context - only essential fields
const RestaurantGuestValidation = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  birthDate: z.coerce.date().optional(),
  preferredReservationDate: z.coerce.date().optional(),
  dietaryPreferences: z.string().optional(),
  favoriteTable: z.string().optional(),
});

const RegisterForm = ({ user }: { user: User }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Add loading state for user data
  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your information...</p>
        </div>
      </div>
    );
  }

  const form = useForm<z.infer<typeof RestaurantGuestValidation>>({
    resolver: zodResolver(RestaurantGuestValidation),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      dietaryPreferences: "None",
      favoriteTable: "Any",
    },
  });

  const onSubmit = async (values: z.infer<typeof RestaurantGuestValidation>) => {
    console.log('🎆 RegisterForm: Starting submission with values:', values);
    setIsLoading(true);

    try {
      // Create minimal restaurant guest data - only essential fields
      const guestData = {
        // Absolute essentials - guaranteed to work
        userId: user?.$id || "",
        name: values.name,
        email: values.email,
        phone: values.phone,
        
        // Optional fields - let the backend handle what's supported
        ...(values.birthDate && { birthDate: values.birthDate }),
        ...(values.favoriteTable && { address: values.favoriteTable }),
        gender: "Other",  // Valid database value instead of "Prefer not to say"
      };
      
      // Skip healthcare validation - use simple guest registration
      console.log('📤 RegisterForm: Calling registerPatient with:', guestData);
      const newPatient = await registerPatient(guestData);
      console.log('💬 RegisterForm: registerPatient response:', newPatient);

      if (newPatient) {
        setShowSuccess(true);
        setTimeout(() => {
          const appointmentUrl = `/guests/${user?.$id}/new-appointment`;
          if (values.preferredReservationDate) {
            const dateParam = values.preferredReservationDate.toISOString();
            router.push(`${appointmentUrl}?preferredDate=${dateParam}`);
          } else {
            router.push(appointmentUrl);
          }
        }, 1500);
      }
    } catch (error) {
      console.error('❌ RegisterForm: Registration error:', error);
      console.error('❌ RegisterForm: Error details:', {
        message: error?.message,
        name: error?.name,
        stack: error?.stack
      });
    }

    setIsLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-8">
        {/* Animated Header */}
        <motion.section 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <motion.div 
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full shadow-xl shadow-amber-500/20"
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0] 
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse" 
            }}
          >
            <Utensils className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
            Almost There!
          </h1>
          <p className="text-gray-400 max-w-md mx-auto">
            Add a few preferences to enhance your dining experience
          </p>
        </motion.section>

        {/* Quick Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Preferred Reservation Date - Optional */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              Preferred Reservation Date (Optional)
            </label>
            <CustomFormField
              fieldType={FormFieldType.CALENDAR}
              control={form.control}
              name="preferredReservationDate"
              placeholder="Select your preferred dining date"
            />
          </div>

          {/* Birthday Field - Optional */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <Heart className="w-4 h-4 text-amber-500" />
              Birthday (Optional - For special surprises!)
            </label>
            <CustomFormField
              fieldType={FormFieldType.DATE_PICKER}
              control={form.control}
              name="birthDate"
              placeholder="Select your birthday for special treats"
              showTimeSelect={false}
            />
          </div>

          {/* Dietary Preferences */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <Heart className="w-4 h-4 text-amber-500" />
              Dietary Preferences
            </label>
            <CustomFormField
              fieldType={FormFieldType.SELECT}
              control={form.control}
              name="dietaryPreferences"
              placeholder="Select dietary preference"
            >
              <SelectItem value="None">No Restrictions</SelectItem>
              <SelectItem value="Vegetarian">🥗 Vegetarian</SelectItem>
              <SelectItem value="Vegan">🌱 Vegan</SelectItem>
              <SelectItem value="Gluten-Free">🌾 Gluten-Free</SelectItem>
              <SelectItem value="Halal">☪️ Halal</SelectItem>
              <SelectItem value="Kosher">✡️ Kosher</SelectItem>
              <SelectItem value="Allergies">⚠️ Food Allergies</SelectItem>
            </CustomFormField>
          </div>

          {/* Seating Preference */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" />
              Preferred Seating
            </label>
            <CustomFormField
              fieldType={FormFieldType.SELECT}
              control={form.control}
              name="favoriteTable"
              placeholder="Where do you prefer to sit?"
            >
              <SelectItem value="Any">😊 Anywhere is fine</SelectItem>
              <SelectItem value="Window">🪟 Window View</SelectItem>
              <SelectItem value="Patio">🌿 Outdoor Patio</SelectItem>
              <SelectItem value="Bar">🍺 Bar Area</SelectItem>
              <SelectItem value="Private">🕯️ Private Booth</SelectItem>
              <SelectItem value="Family">👨‍👩‍👧‍👦 Family Section</SelectItem>
            </CustomFormField>
          </div>
        </motion.div>

        {/* Benefits Reminder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-amber-500/10 to-amber-600/10 rounded-xl p-6 border border-amber-500/20"
        >
          <div className="flex items-start gap-4">
            <Sparkles className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
            <div className="space-y-2">
              <h3 className="text-white font-semibold">Your VIP Benefits</h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                <div>✅ Priority Reservations</div>
                <div>🎁 Birthday Surprises</div>
                <div>🍷 Exclusive Tastings</div>
                <div>📱 Quick Booking</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <SubmitButton
            isLoading={isLoading}
            showSuccess={showSuccess}
            loadingText="Setting up your profile..."
            successText="Welcome to AM | PM Lounge! 🎉"
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02]"
          >
            <motion.span
              className="flex items-center justify-center gap-3"
              whileHover={{ scale: 1.05 }}
            >
              <span>Complete Setup</span>
              <ChefHat className="w-5 h-5" />
            </motion.span>
          </SubmitButton>
        </motion.div>

        {/* Success Animation Overlay */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="bg-gradient-to-br from-amber-500 to-amber-600 p-8 rounded-full"
              >
                <Sparkles className="w-16 h-16 text-white" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </Form>
  );
};

export default RegisterForm;