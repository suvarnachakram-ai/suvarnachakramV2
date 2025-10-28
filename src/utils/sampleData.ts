import { Draw, NewsPost, FAQ } from '../types';
import { format, subDays } from 'date-fns';

export function generateSampleData() {
  const timeSlots = ['12:30', '14:00', '17:00'] as const;
  const draws: Draw[] = [];
  
  // Generate last 7 days of results
  for (let i = 0; i < 7; i++) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    
    timeSlots.forEach((slot, slotIndex) => {
      const draw: Draw = {
        id: `${date}-${slot}`,
        date,
        slot,
        drawNo: `SC${format(subDays(new Date(), i), 'ddMM')}${slotIndex + 1}`,
        digit1: Math.floor(Math.random() * 10).toString(),
        digit2: Math.floor(Math.random() * 10).toString(),
        digit3: Math.floor(Math.random() * 10).toString(),
        digit4: Math.floor(Math.random() * 10).toString(),
        digit5: Math.floor(Math.random() * 10).toString(),
        published: i > 0 || new Date().getHours() > parseInt(slot.split(':')[0]),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      draws.push(draw);
    });
  }

  const news: NewsPost[] = [
    {
      id: '1',
      title: 'Festival Season Special Draws Announced',
      body: 'In celebration of the upcoming festival season, additional special draws have been scheduled. Check the official schedule for updated timings and prize structures.',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      author: 'Swarna Chakra Department',
    },
    {
      id: '2',
      title: 'System Maintenance Notice',
      body: 'Scheduled maintenance will be performed on our result publication system this weekend. Results may be delayed by up to 15 minutes during this period.',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      author: 'Technical Team',
    },
    {
      id: '3',
      title: 'Prize Claim Deadline Reminder',
      body: 'Winners are reminded that lottery prizes must be claimed within 30 days of the draw date. Please visit the nearest lottery office with your winning ticket and valid ID.',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      author: 'Swarna Chakra Department',
    },
  ];

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I read the lottery results?',
      answer: 'Each draw has five separate digits displayed individually. Match digits in exact order to win different prize tiers: 5-digit (₹50,000), 4-digit (₹5,000), 3-digit (₹500), 2-digit (₹100), 1-digit (₹20).',
      order: 1,
    },
    {
      id: '2',
      question: 'What are the daily draw timings?',
      answer: 'There are three daily draws: 12:00 PM, 02:00 PM, and 05:00 PM (IST). Results are announced 30 minutes after each draw completion.',
      order: 2,
    },
    {
      id: '3',
      question: 'How long do I have to claim my prize?',
      answer: 'All lottery prizes must be claimed within 30 days of the draw date. After this period, prizes are forfeited.',
      order: 3,
    },
    {
      id: '4',
      question: 'Where can I verify the official results?',
      answer: 'Always verify results with official Suvarna Chakra sources. This website is for quick reference only and should not be considered the final authority.',
      order: 4,
    },
    {
      id: '5',
      question: 'What documents do I need to claim a prize?',
      answer: 'You need the original winning ticket and a valid government-issued photo ID. For prizes above ₹10,000, additional documentation may be required.',
      order: 5,
    },
  ];

  return { draws, news, faqs };
}