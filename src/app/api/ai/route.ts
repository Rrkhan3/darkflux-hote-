import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message, context } = await request.json();
    
    // Dynamic import of z-ai-web-dev-sdk
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();

    const systemPrompt = `You are the DARKFLUX HOTEL AI Assistant - a smart, friendly, and knowledgeable hotel concierge. You help guests with:

1. Room recommendations - suggest rooms based on budget, group size, and preferences
2. Food recommendations - suggest popular dishes, combos, and dietary options
3. Hotel information - facilities, location, policies
4. General assistance - check-in/check-out, services, local attractions

Hotel Details:
- Name: DARKFLUX HOTEL
- Location: Kathmandu, Nepal
- Facilities: Free WiFi, Swimming Pool, Spa, Restaurant, Bar, Gym, Rooftop Terrace, 24/7 Room Service, Conference Room, Parking
- Room Types: Single (NPR 2,500-3,500), Deluxe (NPR 5,500-6,500), Suite (NPR 12,000), Presidential (NPR 25,000)
- Popular Dishes: Chicken Mo:Mo, Chicken Biryani, Butter Chicken, Thukpa, Masala Chai, Mango Lassi
- Check-in: 2:00 PM, Check-out: 12:00 PM
- Payment: Esewa, Khalti, Card, Pay at Hotel

Be warm, helpful, and concise. Use emojis occasionally. If asked about prices, use Nepali Rupees (NPR). Mix English and Nepali naturally if the user does so.`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = completion.choices[0]?.message?.content || 'I apologize, I could not process your request. Please try again.';
    
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json({ 
      reply: 'I\'m having trouble connecting right now. Please try again in a moment! 🙏' 
    }, { status: 200 });
  }
}
