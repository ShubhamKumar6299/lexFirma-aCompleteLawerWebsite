import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

let client: twilio.Twilio | null = null;

const getClient = (): twilio.Twilio => {
  if (!client) {
    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials are not configured in environment variables');
    }
    client = twilio(accountSid, authToken);
  }
  return client;
};

/**
 * Send an SMS OTP using Twilio.
 */
export const sendSmsOtp = async (to: string, otp: string): Promise<void> => {
  if (!fromNumber) {
    throw new Error('TWILIO_PHONE_NUMBER is not configured');
  }

  // Ensure phone number starts with country code
  const formattedTo = to.startsWith('+') ? to : `+91${to.replace(/\D/g, '')}`;

  await getClient().messages.create({
    body: `Your LexFirma verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`,
    from: fromNumber,
    to: formattedTo,
  });
};
