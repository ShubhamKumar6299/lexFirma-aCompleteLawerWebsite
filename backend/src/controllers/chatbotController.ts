import { Request, Response, NextFunction } from 'express';

// Simple rule-based chatbot with keyword matching
// Designed to be replaced with Dialogflow / OpenAI API

const responses: { keywords: string[]; reply: string }[] = [
  { keywords: ['hello', 'hi', 'hey', 'namaste'], reply: '👋 Hello! Welcome to LawFirm Portal. How can I assist you today? You can ask about lawyers, case types, or how to schedule a meeting.' },
  { keywords: ['lawyer', 'advocate', 'attorney'], reply: '⚖️ We have experienced lawyers across various specializations including Criminal, Family, Civil, Corporate, Property, Cyber, and more. Visit the Lawyers page to find the right one for your needs.' },
  { keywords: ['criminal', 'crime', 'fir', 'police'], reply: '🔒 For criminal cases, our expert criminal lawyers handle FIRs, bail applications, trials, and appeals at District, High Court, and Supreme Court levels.' },
  { keywords: ['family', 'divorce', 'marriage', 'child', 'custody'], reply: '👨‍👩‍👧 Our family law specialists handle divorce proceedings, child custody, maintenance, and domestic disputes with sensitivity and expertise.' },
  { keywords: ['property', 'land', 'real estate', 'rent', 'tenant'], reply: '🏠 Property disputes, title verification, rent agreements, and real estate law matters are handled by our dedicated property lawyers.' },
  { keywords: ['corporate', 'company', 'business', 'startup'], reply: '🏢 Our corporate lawyers assist with company incorporation, contracts, mergers, compliance, and startup legal requirements.' },
  { keywords: ['cyber', 'online', 'fraud', 'hacking', 'internet'], reply: '💻 Cyber law experts at our firm handle online fraud, data breach, cybercrime, and IT Act cases.' },
  { keywords: ['meet', 'meeting', 'call', 'schedule', 'appointment', 'video', 'audio'], reply: '📅 You can schedule an audio or video consultation with any lawyer directly from their profile page. Click "Schedule Meeting" on any lawyer\'s profile.' },
  { keywords: ['contact', 'email', 'mail', 'message'], reply: '📧 You can send a message to any lawyer directly through their profile page using the "Contact" button. They will receive an email notification.' },
  { keywords: ['rating', 'review', 'stars'], reply: '⭐ All lawyer ratings are based on verified client reviews. You can leave a review after your consultation. Higher-rated lawyers have a proven track record.' },
  { keywords: ['court', 'district', 'high court', 'supreme court'], reply: '⚖️ You can filter lawyers by court level - District Court, High Court, Supreme Court, Tribunals, and Consumer Courts. Use the filter on the Lawyers page.' },
  { keywords: ['fee', 'cost', 'charge', 'price', 'money'], reply: '💰 Consultation fees vary by lawyer and are displayed on each lawyer\'s profile. You can filter lawyers by maximum consultation fee.' },
  { keywords: ['news', 'case', 'india', 'legal'], reply: '📰 Visit our "Legal News" section to follow the latest cases and legal developments across India\'s courts.' },
  { keywords: ['lokality', 'locality', 'area', 'city', 'location', 'near'], reply: '📍 Use the location filter on the Lawyers page to find lawyers in your city, district, or state.' },
  { keywords: ['thank', 'thanks', 'bye', 'goodbye'], reply: '🙏 Thank you for visiting LawFirm Portal. We hope you find the legal assistance you need. Feel free to return anytime!' },
];

const defaultReply = '🤔 I\'m not sure about that. You can browse our lawyers by specialization, location, or court level. For urgent matters, contact a lawyer directly through their profile. Is there anything specific I can help you with?';

// POST /api/chatbot/message
export const chatbotReply = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ success: false, message: 'Message is required' });
      return;
    }

    const lowerMessage = message.toLowerCase().trim();
    
    let reply = defaultReply;
    for (const item of responses) {
      if (item.keywords.some(kw => lowerMessage.includes(kw))) {
        reply = item.reply;
        break;
      }
    }

    // Simulate typing delay feel
    setTimeout(() => {
      res.json({ success: true, reply, timestamp: new Date().toISOString() });
    }, 300);
  } catch (err) {
    next(err);
  }
};
