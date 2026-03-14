// import AfricasTalking from 'africastalking'; // Commented out as currently unused
import axios from 'axios';

// Initialize Africa's Talking with sandbox credentials
const credentials = {
  apiKey: 'atsk_13675ed129a0cc937048e49563e8c271757119720ee123bda4294c61c7967a021067455b',
  username: 'sandbox',
} as const;

// Initialize the SDK
// const africastalking = AfricasTalking(credentials); // Commented out as currently unused

// Create a custom axios instance for Africa's Talking API
const atAPI = axios.create({
  baseURL: 'https://api.sandbox.africastalking.com/version1',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
    'apikey': credentials.apiKey,  // lowercase 'apikey' as per AT documentation
    'Accept-Encoding': 'gzip, deflate, br'
  }
});

// Wrap SMS service with error handling and logging
const smsService = {
  send: async (params: { to: string[], message: string }) => {
    try {
      // Log the SDK instance configuration
      console.log('Africa\'s Talking SDK Configuration:', {
        username: credentials.username,
        apiKey: credentials.apiKey.substring(0, 8) + '...'  // Only log first 8 chars of API key
      });

      // Log the full request parameters
      console.log('Preparing to send SMS:', {
        to: params.to,
        message: params.message,
        environment: 'sandbox'
      });

      // For sandbox testing, make sure the phone number is properly formatted
      const formattedNumbers = params.to.map(number => {
        if (!number.startsWith('+')) {
          return number.startsWith('0') ? `+254${number.slice(1)}` : 
                 number.startsWith('254') ? `+${number}` : 
                 `+254${number}`;
        }
        return number;
      });

      // Prepare the form data
      const formData = new URLSearchParams();
      formData.append('username', credentials.username);
      formData.append('to', formattedNumbers.join(','));
      formData.append('message', params.message);
      formData.append('from', '41355'); // Your shortcode

      // Make the API call
      const response = await atAPI.post('/messaging', formData);

      // Log the full response
      console.log('SMS API Response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (err: any) {
      // Enhanced error logging
      console.error('SMS Sending Error:', {
        message: err.message,
        response: err.response?.data,
        requestParams: {
          to: params.to,
          messageLength: params.message.length
        }
      });
      throw err;
    }
  }
};

export const sms = smsService;
