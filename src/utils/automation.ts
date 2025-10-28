import supabase from '../lib/supabase';
import { TIME_SLOTS } from './time';

// Validate environment variables
function validateEnvironment(): boolean {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables. Please check your .env file.');
    console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
    return false;
  }
  
  if (supabaseUrl === 'undefined' || supabaseAnonKey === 'undefined') {
    console.error('Supabase environment variables are set to "undefined". Please check your .env file.');
    return false;
  }
  
  return true;
}

interface AutoDrawConfig {
  enabled: boolean;
  generateTime: string; // Time to generate drafts (e.g., "06:00")
  publishDelayMinutes: number; // Minutes after draw time to publish
}

const AUTO_DRAW_CONFIG: AutoDrawConfig = {
  enabled: true,
  generateTime: "06:00", // 6 AM daily
  publishDelayMinutes: 15, // Publish 15 minutes after draw time
};

// Generate a random 5-digit number
function generateRandomDigits(): { digit1: string; digit2: string; digit3: string; digit4: string; digit5: string } {
  return {
    digit1: Math.floor(Math.random() * 10).toString(),
    digit2: Math.floor(Math.random() * 10).toString(),
    digit3: Math.floor(Math.random() * 10).toString(),
    digit4: Math.floor(Math.random() * 10).toString(),
    digit5: Math.floor(Math.random() * 10).toString(),
  };
}

// Generate draw number based on date and slot
function generateDrawNumber(date: string, slotIndex: number): string {
  const dateObj = new Date(date);
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear().toString();
  return `SC${day}${month}${year}${slotIndex + 1}`;
}

// Create daily draft results
export async function createDailyDrafts(targetDate?: string): Promise<void> {
  if (!AUTO_DRAW_CONFIG.enabled) {
    console.log('Auto-draw generation is disabled');
    return;
  }

  if (!validateEnvironment()) {
    console.error('Supabase environment variables are not configured. Skipping draft creation.');
    return;
  }

  const date = targetDate || new Date().toISOString().split('T')[0];
  
  try {
    // Check if drafts already exist for this date
    const { data: existingDraws, error: checkError } = await supabase
      .from('draws')
      .select('id')
      .eq('date', date);

    if (checkError) {
      console.error('Error checking existing drafts:', checkError);
      throw checkError;
    }

    if (existingDraws && existingDraws.length > 0) {
      console.log(`Drafts already exist for ${date}`);
      return;
    }

    // Create drafts for each time slot
    const drafts = TIME_SLOTS.map((slot, index) => {
      const digits = generateRandomDigits();
      return {
        date,
        slot,
        draw_no: generateDrawNumber(date, index),
        digit_1: digits.digit1,
        digit_2: digits.digit2,
        digit_3: digits.digit3,
        digit_4: digits.digit4,
        digit_5: digits.digit5,
        published: false,
      };
    });

    const { error: insertError } = await supabase
      .from('draws')
      .insert(drafts);

    if (insertError) {
      console.error('Error inserting drafts:', insertError);
      throw insertError;
    }

    console.log(`Created ${drafts.length} draft results for ${date}`);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('Network error: Unable to connect to Supabase. Please check your internet connection and Supabase configuration.');
    } else {
      console.error('Error creating daily drafts:', error);
    }
    // Don't throw error to prevent app crash
  }
}

// Publish results automatically based on timing
export async function autoPublishResults(): Promise<void> {
  if (!AUTO_DRAW_CONFIG.enabled) {
    return;
  }

  if (!validateEnvironment()) {
    console.error('Supabase environment variables are not configured');
    return;
  }

  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  const today = now.toISOString().split('T')[0];

  try {
    // Get unpublished draws for today
    const { data: unpublishedDraws, error: fetchError } = await supabase
      .from('draws')
      .select('*')
      .eq('date', today)
      .eq('published', false);

    if (fetchError) throw fetchError;

    if (!unpublishedDraws || unpublishedDraws.length === 0) {
      return;
    }

    // Check which draws should be published
    for (const draw of unpublishedDraws) {
      const drawTime = draw.slot;
      const publishTime = addMinutesToTime(drawTime, AUTO_DRAW_CONFIG.publishDelayMinutes);
      
      if (currentTime >= publishTime) {
        // Publish this draw
        const { error: updateError } = await supabase
          .from('draws')
          .update({ published: true, updated_at: new Date().toISOString() })
          .eq('id', draw.id);

        if (updateError) {
          console.error(`Error publishing draw ${draw.draw_no}:`, updateError);
        } else {
          console.log(`Auto-published draw ${draw.draw_no} at ${currentTime}`);
        }
      }
    }
  } catch (error) {
    console.error('Error in auto-publish:', error);
  }
}

// Helper function to add minutes to time string
function addMinutesToTime(timeStr: string, minutes: number): string {
  const [hours, mins] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, mins + minutes, 0, 0);
  return date.toTimeString().slice(0, 5);
}

// Initialize automation system
export function initializeAutomation(): void {
  if (!AUTO_DRAW_CONFIG.enabled) {
    console.log('Automation system is disabled');
    return;
  }

  if (!validateEnvironment()) {
    console.error('Cannot initialize automation: Supabase environment variables are missing or invalid');
    console.error('Please ensure your .env file contains:');
    console.error('VITE_SUPABASE_URL=your_supabase_project_url');
    console.error('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
    return;
  }

  console.log('Initializing draw automation system...');

  // Check for draft creation every minute
  const draftInterval = setInterval(async () => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    
    if (currentTime === AUTO_DRAW_CONFIG.generateTime) {
      try {
        await createDailyDrafts();
      } catch (error) {
        console.error('Failed to create daily drafts:', error);
      }
    }
  }, 60000); // Check every minute

  // Check for auto-publishing every minute
  const publishInterval = setInterval(async () => {
    try {
      await autoPublishResults();
    } catch (error) {
      console.error('Failed to auto-publish results:', error);
    }
  }, 60000); // Check every minute

  // Create initial drafts if none exist for today
  setTimeout(async () => {
    try {
      await createDailyDrafts();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('Failed to create initial drafts: Network connection error');
      } else {
        console.error('Failed to create initial drafts:', error);
      }
      // Don't throw here to prevent breaking the app initialization
    }
  }, 2000); // Increased delay to ensure Supabase client is ready

  console.log('Automation system initialized successfully');
  
  // Return cleanup function
  return () => {
    clearInterval(draftInterval);
    clearInterval(publishInterval);
  };
}

// Manual functions for admin use
export async function manualCreateDrafts(date?: string): Promise<void> {
  await createDailyDrafts(date);
}

export async function manualPublishDraw(drawId: string): Promise<void> {
  const { error } = await supabase
    .from('draws')
    .update({ published: true, updated_at: new Date().toISOString() })
    .eq('id', drawId);

  if (error) throw error;
}

// Get automation status
export function getAutomationStatus(): AutoDrawConfig {
  return { ...AUTO_DRAW_CONFIG };
}

// Update automation config
export function updateAutomationConfig(config: Partial<AutoDrawConfig>): void {
  Object.assign(AUTO_DRAW_CONFIG, config);
}