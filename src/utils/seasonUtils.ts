/**
 * Seasonal Bob variants.
 *
 * Each season defines a name and an `isActive` predicate.
 * To add a new season: append an entry to the SEASONS array below.
 *
 * hasDarkVariant indicates whether a separate dark-mode illustration
 * exists for this season. When false, the light illustration is used
 * in both light and dark mode.
 */

export type SeasonName = "christmas" | "easter" | "summer"

export type Season = {
  name: SeasonName
  hasDarkVariant: boolean
  isActive: (date: Date) => boolean
}

/**
 * Computes Easter Sunday for a given year using the
 * Anonymous Gregorian (Meeus/Jones/Butcher) algorithm.
 */
function getEasterSunday(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1 // 0-indexed
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month, day)
}

/**
 * Computes Palm Sunday for a given year.
 * Palm Sunday is always exactly 7 days before Easter Sunday.
 */
function getPalmSunday(year: number): Date {
  const easter = getEasterSunday(year)
  const palmSunday = new Date(easter)
  palmSunday.setDate(easter.getDate() - 7)
  return palmSunday
}

/** Returns true if `date` falls in [start, start + durationDays). */
function inWindow(date: Date, start: Date, durationDays: number): boolean {
  const end = new Date(start)
  end.setDate(start.getDate() + durationDays)
  return date >= start && date < end
}

/**
 * Ordered list of seasons. The first matching season wins.
 * Add new seasons here to extend the feature.
 */
export const SEASONS: Season[] = [
  {
    name: "christmas",
    hasDarkVariant: true,
    isActive: (date) => {
      const month = date.getMonth() // 0-indexed
      const day = date.getDate()
      // Dec 20 – Dec 31
      return month === 11 && day >= 20
    },
  },
  {
    name: "easter",
    hasDarkVariant: false,
    isActive: (date) => {
      const palmSunday = getPalmSunday(date.getFullYear())
      // Palm Sunday through Easter Saturday (7 days)
      return inWindow(date, palmSunday, 7)
    },
  },
  {
    name: "summer",
    hasDarkVariant: false,
    isActive: (date) => {
      const month = date.getMonth()
      const day = date.getDate()
      // Jun 27 – Jul 31
      return (month === 5 && day >= 27) || month === 6
    },
  },
]

/**
 * Returns the active Season for the given date, or null if no season matches.
 * Accepts an optional date for testing purposes; defaults to today.
 */
export function getCurrentSeason(date: Date = new Date()): Season | null {
  // Normalise to midnight to avoid time-of-day edge cases
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  return SEASONS.find((season) => season.isActive(d)) ?? null
}
