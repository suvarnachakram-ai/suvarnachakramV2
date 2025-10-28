import React, { createContext, useContext, useState, useEffect } from 'react';
import { Draw, NewsPost, FAQ, ContactMessage, TimeSlot } from '../types';
import supabase from '../lib/supabase';
import { TIME_SLOTS, formatSlotTime } from '../utils/time';

interface DataContextType {
  draws: Draw[];
  news: NewsPost[];
  faqs: FAQ[];
  contacts: ContactMessage[];
  timeSlots: TimeSlot[];
  loading: boolean;
  addDraw: (draw: Omit<Draw, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateDraw: (id: string, draw: Partial<Draw>) => Promise<void>;
  deleteDraw: (id: string) => Promise<void>;
  addNews: (news: Omit<NewsPost, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateNews: (id: string, news: Partial<NewsPost>) => Promise<void>;
  deleteNews: (id: string) => Promise<void>;
  addFAQ: (faq: Omit<FAQ, 'id'>) => Promise<void>;
  updateFAQ: (id: string, faq: Partial<FAQ>) => Promise<void>;
  deleteFAQ: (id: string) => Promise<void>;
  addContact: (contact: Omit<ContactMessage, 'id' | 'createdAt'>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [news, setNews] = useState<NewsPost[]>([]);
  const [faqs, setFAQs] = useState<FAQ[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeSlots] = useState<TimeSlot[]>(
    TIME_SLOTS.map((slot, index) => ({
      id: (index + 1).toString(),
      time: slot,
      label: formatSlotTime(slot),
      enabled: true,
    }))
  );

  // Transform database row to Draw type
  const transformDraw = (row: any): Draw => ({
    id: row.id,
    date: row.date,
    slot: row.slot,
    drawNo: row.draw_no,
    digit1: row.digit_1,
    digit2: row.digit_2,
    digit3: row.digit_3,
    digit4: row.digit_4,
    digit5: row.digit_5,
    published: row.published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });

  // Transform database row to NewsPost type
  const transformNews = (row: any): NewsPost => ({
    id: row.id,
    title: row.title,
    body: row.body,
    author: row.author,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });

  // Transform database row to FAQ type
  const transformFAQ = (row: any): FAQ => ({
    id: row.id,
    question: row.question,
    answer: row.answer,
    order: row.order_index,
  });

  // Transform database row to ContactMessage type
  const transformContact = (row: any): ContactMessage => ({
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    message: row.message,
    createdAt: row.created_at,
  });

  // Load initial data
  const loadData = async () => {
    try {
      setLoading(true);

      // Validate environment variables before making requests
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'undefined' || supabaseAnonKey === 'undefined') {
        console.error('Supabase environment variables are not configured properly');
        console.error('Please ensure your .env file contains:');
        console.error('VITE_SUPABASE_URL=your_supabase_project_url');
        console.error('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
        setLoading(false);
        return;
      }

      // Load draws
      const { data: drawRows, error: drawError } = await supabase
        .from('draws')
        .select('*')
        .order('date', { ascending: false });

      if (drawError) throw drawError;

      const mappedDraws = (drawRows || []).map((row: any) => ({
        id: row.id,
        date: row.date,
        slot: row.slot,
        drawNo: row.draw_no ?? row.drawNo ?? '',
        digit1: row.digit_1 ?? row.digit1 ?? '',
        digit2: row.digit_2 ?? row.digit2 ?? '',
        digit3: row.digit_3 ?? row.digit3 ?? '',
        digit4: row.digit_4 ?? row.digit4 ?? '',
        digit5: row.digit_5 ?? row.digit5 ?? '',
        published: !!row.published,
        createdAt: row.created_at ?? row.createdAt,
        updatedAt: row.updated_at ?? row.updatedAt,
      }));

      setDraws(mappedDraws);

      // Load news
      const { data: newsData, error: newsError } = await supabase
        .from('news_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (newsError) {
        console.error('Error loading news:', newsError);
        throw newsError;
      }
      setNews(newsData?.map(transformNews) || []);

      // Load FAQs
      const { data: faqsData, error: faqsError } = await supabase
        .from('faqs')
        .select('*')
        .order('order_index', { ascending: true });

      if (faqsError) {
        console.error('Error loading FAQs:', faqsError);
        throw faqsError;
      }
      setFAQs(faqsData?.map(transformFAQ) || []);

      // Load contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (contactsError) {
        console.error('Error loading contacts:', contactsError);
        throw contactsError;
      }
      setContacts(contactsData?.map(transformContact) || []);

    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('Network error: Unable to connect to Supabase. Please check your internet connection and Supabase configuration.');
      } else {
        console.error('Error loading data:', error);
      }
      // Set empty arrays to prevent app crash
      setDraws([]);
      setNews([]);
      setFAQs([]);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  // Setup real-time subscriptions
  useEffect(() => {
    loadData();

    // Subscribe to draws changes
    const drawsSubscription = supabase
      .channel('draws-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'draws' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setDraws(prev => [transformDraw(payload.new), ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setDraws(prev => prev.map(draw => 
              draw.id === payload.new.id ? transformDraw(payload.new) : draw
            ));
          } else if (payload.eventType === 'DELETE') {
            setDraws(prev => prev.filter(draw => draw.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Subscribe to news changes
    const newsSubscription = supabase
      .channel('news-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'news_posts' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNews(prev => [transformNews(payload.new), ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setNews(prev => prev.map(item => 
              item.id === payload.new.id ? transformNews(payload.new) : item
            ));
          } else if (payload.eventType === 'DELETE') {
            setNews(prev => prev.filter(item => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Subscribe to FAQs changes
    const faqsSubscription = supabase
      .channel('faqs-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'faqs' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setFAQs(prev => [...prev, transformFAQ(payload.new)].sort((a, b) => a.order - b.order));
          } else if (payload.eventType === 'UPDATE') {
            setFAQs(prev => prev.map(item => 
              item.id === payload.new.id ? transformFAQ(payload.new) : item
            ).sort((a, b) => a.order - b.order));
          } else if (payload.eventType === 'DELETE') {
            setFAQs(prev => prev.filter(item => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Subscribe to contacts changes
    const contactsSubscription = supabase
      .channel('contacts-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'contact_messages' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setContacts(prev => [transformContact(payload.new), ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setContacts(prev => prev.filter(contact => contact.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      drawsSubscription.unsubscribe();
      newsSubscription.unsubscribe();
      faqsSubscription.unsubscribe();
      contactsSubscription.unsubscribe();
    };
  }, []);

  const addDraw = async (drawData: Omit<Draw, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Validate slot timing
    if (!TIME_SLOTS.includes(drawData.slot as any)) {
      throw new Error(`Invalid time slot. Must be one of: ${TIME_SLOTS.join(', ')}`);
    }

    // Persist and return the inserted row, then update local state
    const { data, error } = await supabase
      .from('draws')
      .insert({
        date: drawData.date,
        slot: drawData.slot,
        draw_no: drawData.drawNo,
        digit_1: drawData.digit1,
        digit_2: drawData.digit2,
        digit_3: drawData.digit3,
        digit_4: drawData.digit4,
        digit_5: drawData.digit5,
        published: drawData.published,
      })
      .select('*')
      .single();

    if (error) throw error;

    // Add the new draw to local state using transformDraw
    setDraws(prev => [transformDraw(data), ...prev]);
  };

  const updateDraw = async (id: string, drawData: Partial<Draw>) => {
    const updateData: any = {};
    
    if (drawData.date !== undefined) updateData.date = drawData.date;
    if (drawData.slot !== undefined) updateData.slot = drawData.slot;
    if (drawData.drawNo !== undefined) updateData.draw_no = drawData.drawNo;
    if (drawData.digit1 !== undefined) updateData.digit_1 = drawData.digit1;
    if (drawData.digit2 !== undefined) updateData.digit_2 = drawData.digit2;
    if (drawData.digit3 !== undefined) updateData.digit_3 = drawData.digit3;
    if (drawData.digit4 !== undefined) updateData.digit_4 = drawData.digit4;
    if (drawData.digit5 !== undefined) updateData.digit_5 = drawData.digit5;
    if (drawData.published !== undefined) updateData.published = drawData.published;
    
    updateData.updated_at = new Date().toISOString();

    // Perform update and get the updated row back
    const { data, error } = await supabase
      .from('draws')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    // Replace the updated draw in local state
    setDraws(prev => prev.map(d => d.id === id ? transformDraw(data) : d));
  };

  const deleteDraw = async (id: string) => {
    const { error } = await supabase
      .from('draws')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  const addNews = async (newsData: Omit<NewsPost, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { error } = await supabase
      .from('news_posts')
      .insert({
        title: newsData.title,
        body: newsData.body,
        author: newsData.author,
      });

    if (error) throw error;
  };

  const updateNews = async (id: string, newsData: Partial<NewsPost>) => {
    const updateData: any = {};
    
    if (newsData.title !== undefined) updateData.title = newsData.title;
    if (newsData.body !== undefined) updateData.body = newsData.body;
    if (newsData.author !== undefined) updateData.author = newsData.author;
    
    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('news_posts')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
  };

  const deleteNews = async (id: string) => {
    const { error } = await supabase
      .from('news_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  const addFAQ = async (faqData: Omit<FAQ, 'id'>) => {
    const { error } = await supabase
      .from('faqs')
      .insert({
        question: faqData.question,
        answer: faqData.answer,
        order_index: faqData.order,
      });

    if (error) throw error;
  };

  const updateFAQ = async (id: string, faqData: Partial<FAQ>) => {
    const updateData: any = {};
    
    if (faqData.question !== undefined) updateData.question = faqData.question;
    if (faqData.answer !== undefined) updateData.answer = faqData.answer;
    if (faqData.order !== undefined) updateData.order_index = faqData.order;

    const { error } = await supabase
      .from('faqs')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
  };

  const deleteFAQ = async (id: string) => {
    const { error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  const addContact = async (contactData: Omit<ContactMessage, 'id' | 'createdAt'>) => {
    const { error } = await supabase
      .from('contact_messages')
      .insert({
        name: contactData.name,
        phone: contactData.phone,
        email: contactData.email,
        message: contactData.message,
      });

    if (error) throw error;
  };

  const deleteContact = async (id: string) => {
    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  const refreshData = async () => {
    await loadData();
  };

  return (
    <DataContext.Provider value={{
      draws,
      news,
      faqs,
      contacts,
      timeSlots,
      loading,
      addDraw,
      updateDraw,
      deleteDraw,
      addNews,
      updateNews,
      deleteNews,
      addFAQ,
      updateFAQ,
      deleteFAQ,
      addContact,
      deleteContact,
      refreshData,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}