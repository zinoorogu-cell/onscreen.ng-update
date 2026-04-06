import { TimeOfDay, DayType } from '@prisma/client'

export interface OccupancyConfig {
  timeOfDay: TimeOfDay
  dayType: DayType
  occupancyRate: number
}

// Nigerian public holidays
const NIGERIAN_HOLIDAYS_2025 = [
  '2025-01-01', // New Year
  '2025-01-03', // New Year Holiday
  '2025-04-18', // Good Friday
  '2025-04-21', // Easter Monday
  '2025-05-01', // Workers Day
  '2025-06-12', // Democracy Day
  '2025-10-01', // Independence Day
  '2025-12-25', // Christmas
  '2025-12-26', // Boxing Day
]

// Festive periods (high-traffic)
const FESTIVE_PERIODS_2025 = [
  { start: '2025-12-20', end: '2025-12-31' }, // Christmas/New Year
  { start: '2025-03-28', end: '2025-04-05' }, // Easter period
  { start: '2025-06-10', end: '2025-06-15' }, // Democracy Day period
]

export function getDayType(date: Date): DayType {
  const dateStr = date.toISOString().split('T')[0]
  
  // Check festive
  for (const period of FESTIVE_PERIODS_2025) {
    if (dateStr >= period.start && dateStr <= period.end) {
      return DayType.FESTIVE
    }
  }
  
  // Check holiday
  if (NIGERIAN_HOLIDAYS_2025.includes(dateStr)) {
    return DayType.HOLIDAY
  }
  
  // Check weekend
  const dayOfWeek = date.getDay()
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return DayType.WEEKEND
  }
  
  return DayType.WEEKDAY
}

export function getOccupancyRate(
  profiles: OccupancyConfig[],
  timeOfDay: TimeOfDay,
  dayType: DayType
): number {
  const profile = profiles.find(
    p => p.timeOfDay === timeOfDay && p.dayType === dayType
  )
  
  if (!profile) {
    // Default fallback rates
    const defaults: Record<string, Record<string, number>> = {
      MORNING: { WEEKDAY: 0.20, WEEKEND: 0.40, HOLIDAY: 0.55, FESTIVE: 0.70 },
      AFTERNOON: { WEEKDAY: 0.35, WEEKEND: 0.70, HOLIDAY: 0.85, FESTIVE: 0.95 },
      EVENING: { WEEKDAY: 0.65, WEEKEND: 0.90, HOLIDAY: 0.95, FESTIVE: 0.99 },
      ALL_DAY: { WEEKDAY: 0.40, WEEKEND: 0.67, HOLIDAY: 0.78, FESTIVE: 0.88 },
    }
    return defaults[timeOfDay]?.[dayType] || 0.50
  }
  
  return profile.occupancyRate
}

export function calculateDailyImpressions(
  seatingCapacity: number,
  showtimesPerDay: number,
  occupancyRate: number
): number {
  return Math.round(seatingCapacity * occupancyRate * showtimesPerDay)
}

export function calculateCampaignImpressions(
  seatingCapacity: number,
  showtimesPerDay: number,
  profiles: OccupancyConfig[],
  timeSlots: TimeOfDay[],
  startDate: Date,
  endDate: Date,
  slotsPerDay: number = 1
): {
  totalImpressions: number
  dailyBreakdown: Array<{ date: string; impressions: number; dayType: string }>
} {
  const dailyBreakdown = []
  let totalImpressions = 0
  
  const current = new Date(startDate)
  while (current <= endDate) {
    const dayType = getDayType(current)
    
    // Average across requested time slots
    let dayImpressions = 0
    for (const timeSlot of timeSlots) {
      const rate = getOccupancyRate(profiles, timeSlot, dayType)
      const slotShowtimes = Math.max(1, Math.floor(showtimesPerDay / timeSlots.length))
      dayImpressions += calculateDailyImpressions(seatingCapacity, slotShowtimes, rate) * slotsPerDay
    }
    
    dailyBreakdown.push({
      date: current.toISOString().split('T')[0],
      impressions: dayImpressions,
      dayType,
    })
    
    totalImpressions += dayImpressions
    current.setDate(current.getDate() + 1)
  }
  
  return { totalImpressions, dailyBreakdown }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
  return num.toString()
}

// Pricing calculation
export const AGENCY_FEE_RATE = 0.10   // 10%
export const VAT_RATE = 0.075          // 7.5%
export const CONVERSION_FEE = 20000   // ₦20,000

export function calculateQuoteTotal(mediaCost: number) {
  const agencyFee = mediaCost * AGENCY_FEE_RATE
  const subtotalBeforeVAT = mediaCost + agencyFee + CONVERSION_FEE
  const vatAmount = subtotalBeforeVAT * VAT_RATE
  const grandTotal = subtotalBeforeVAT + vatAmount
  
  return {
    mediaCost,
    agencyFee,
    conversionFee: CONVERSION_FEE,
    vatAmount,
    grandTotal,
  }
}
