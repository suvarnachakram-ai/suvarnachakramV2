import { format, isToday, parseISO } from 'date-fns';

export const TIME_SLOTS = ['10:00', '12:00', '14:00', '17:00', '19:00'] as const;

export function getCurrentTimeSlotState(slot: string): 'waiting' | 'live' | 'revealed' {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight
  
  const [hours, minutes] = slot.split(':').map(Number);
  const slotTime = hours * 60 + minutes;
  const revealTime = slotTime + 15; // 15 minutes after slot time
  
  if (currentTime < slotTime) {
    return 'waiting';
  } else if (currentTime >= slotTime && currentTime < revealTime) {
    return 'live';
  } else {
    return 'revealed';
  }
}

export function getTimeUntilSlot(slot: string): number {
  const now = new Date();
  const [hours, minutes] = slot.split(':').map(Number);
  const slotTime = new Date();
  slotTime.setHours(hours, minutes, 0, 0);
  
  // If slot time has passed today, return 0
  if (slotTime.getTime() <= now.getTime()) {
    return 0;
  }
  
  return slotTime.getTime() - now.getTime();
}

export function getNextDrawTime(): { slot: string; timeUntil: number } | null {
  const now = new Date();
  const currentTime = format(now, 'HH:mm');
  
  for (const slot of TIME_SLOTS) {
    if (currentTime < slot) {
      const [hours, minutes] = slot.split(':').map(Number);
      const nextDraw = new Date();
      nextDraw.setHours(hours, minutes, 0, 0);
      
      return {
        slot,
        timeUntil: nextDraw.getTime() - now.getTime(),
      };
    }
  }
  
  // If all today's draws are over, return tomorrow's first draw
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(12, 0, 0, 0);
  
  return {
    slot: '10:00',
    timeUntil: tomorrow.getTime() - now.getTime(),
  };
}

export function formatTimeRemaining(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

export function formatSlotTime(slot: string): string {
  const [hours, minutes] = slot.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minutes || '00'} ${ampm}`;
}

export function isDrawToday(date: string): boolean {
  return isToday(parseISO(date));
}

// Result announcement schedule - results announced 30 minutes after draw
export function getAnnouncementTime(drawSlot: string): string {
  const [hours, minutes] = drawSlot.split(':').map(Number);
  const drawTime = new Date();
  drawTime.setHours(hours, minutes || 0, 0, 0);
  
  // Add 30 minutes for announcement
  const announcementTime = new Date(drawTime.getTime() + 30 * 60 * 1000);
  
  return formatSlotTime(`${announcementTime.getHours()}:${announcementTime.getMinutes().toString().padStart(2, '0')}`);
}

export const ANNOUNCEMENT_SCHEDULE = TIME_SLOTS.map(slot => ({
  drawTime: formatSlotTime(slot),
  announcementTime: getAnnouncementTime(slot),
  slot
}));