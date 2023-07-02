import {
  AdapterFormats,
  AdapterUnits,
  FieldFormatTokenMap,
  MuiPickersAdapter,
  PickersTimezone,
  AdapterOptions
} from '@mui/x-date-pickers/'
import {
  I18nSettings,
  Timezone,
  addDays,
  addHours,
  addMinutes,
  addMonths,
  addSeconds,
  addYears,
  daysInMonth,
  diffInCalDays,
  diffInCalMonths,
  diffInCalYears,
  diffInHours,
  diffInMilliseconds,
  diffInMinutes,
  diffInSeconds,
  endOfDay,
  endOfMonth,
  endOfWeekday,
  endOfYear,
  formatDate,
  getLocaleInfo,
  isDateAfter,
  isDateBefore,
  isDateOnOrAfter,
  isDateOnOrBefore,
  parseDate,
  startOfDay,
  startOfMonth,
  startOfWeekday,
  startOfYear,
  tzLocal,
  weekOfYear
} from '@jetblack/date'

interface AdapterJetBlackDateOptions {
  locale?: string
  tz?: Timezone
  formats?: Partial<AdapterFormats>
}

const formatTokenMap: FieldFormatTokenMap = {
  // Year
  y: { sectionType: 'year', contentType: 'digit', maxLength: 4 },
  yy: 'year',
  yyy: { sectionType: 'year', contentType: 'digit', maxLength: 4 },
  yyyy: { sectionType: 'year', contentType: 'digit', maxLength: 4 },

  // Month
  m: { sectionType: 'month', contentType: 'digit', maxLength: 2 },
  mm: 'month',
  mmmm: { sectionType: 'month', contentType: 'letter' },
  mmm: { sectionType: 'month', contentType: 'letter' },

  // Day of the month
  d: { sectionType: 'day', contentType: 'digit', maxLength: 2 },
  dd: 'day',
  DD: { sectionType: 'day', contentType: 'digit-with-letter' },

  // Day of the week
  ddd: { sectionType: 'weekDay', contentType: 'letter' },
  dddd: { sectionType: 'weekDay', contentType: 'letter' },

  // Meridiem
  t: 'meridiem',

  // Hours
  H: { sectionType: 'hours', contentType: 'digit', maxLength: 2 },
  HH: 'hours',
  h: { sectionType: 'hours', contentType: 'digit', maxLength: 2 },
  hh: 'hours',

  // Minutes
  M: { sectionType: 'minutes', contentType: 'digit', maxLength: 2 },
  MM: 'minutes',

  // Seconds
  S: { sectionType: 'seconds', contentType: 'digit', maxLength: 2 },
  SS: 'seconds'
}

const defaultFormats: AdapterFormats = {
  dayOfMonth: 'd',
  fullDate: 'mmm d, yyyy',
  fullDateWithWeekday: 'dddd, mmmm d, yyyy',
  fullDateTime: 'mmm d, yyyy hh:MM t',
  fullDateTime12h: 'mmm d, yyyy hh:MM t',
  fullDateTime24h: 'mmm d, yyyy HH:MM',
  fullTime: 'hh:MM t',
  fullTime12h: 'hh:MM t',
  fullTime24h: 'HH:MM',
  hours12h: 'hh',
  hours24h: 'HH',
  keyboardDate: 'mm/dd/yyyy',
  keyboardDateTime: 'mm/dd/yyyy hh:MM t',
  keyboardDateTime12h: 'mm/dd/yyyy hh:MM t',
  keyboardDateTime24h: 'mm/dd/yyyy HH:MM',
  minutes: 'MM',
  month: 'mmmm',
  monthAndDate: 'mmmm d',
  monthAndYear: 'mmmm yyyy',
  monthShort: 'mmm',
  weekday: 'dddd',
  weekdayShort: 'ddd',
  normalDate: 'd mmm',
  normalDateWithWeekday: 'ddd, mmm d',
  seconds: 'SS',
  shortDate: 'mmm d',
  year: 'yyyy',
  meridiem: 't'
}

export class AdapterJetBlackDate implements MuiPickersAdapter<Date, I18nSettings> {

  public isMUIAdapter = true
  public isTimezoneCompatible = false
  public formats: AdapterFormats
  public locale: I18nSettings
  public lib: string = '@jetblack/date'
  public escapedCharacters = { start: "'", end: "'" }
  public formatTokenMap = formatTokenMap

  private tz: Timezone

  constructor({ locale, formats, instance }: AdapterOptions<I18nSettings, Timezone> = {}) {
    this.locale = getLocaleInfo(
      locale || Intl.DateTimeFormat().resolvedOptions().locale
    )
    this.formats = { ...defaultFormats, ...formats }
    this.tz = instance || tzLocal
  }

  date(value?: any): Date | null {
    if (typeof value === 'undefined') {
      return new Date()
    }

    if (value === null) {
      return null
    }

    return new Date(value)
  }

  dateWithTimezone = (value: string | null | undefined, timezone: PickersTimezone): Date | null =>
    this.date(value)

  getTimezone = (value: Date): string => this.tz.name

  public setTimezone = (value: Date, timezone: PickersTimezone): Date => value

  toJsDate = (value: Date): Date => value
  parseISO = (isString: string): Date => new Date(isString)
  toISO = (value: Date): string => value.toISOString()
  parse(value: string, format: string): Date | null {
    if (value === '') {
      return null
    }
    return parseDate(value, format, this.locale)
  }
  getCurrentLocaleCode = (): string => this.locale.locale
  is12HourCycleInCurrentLocale = (): boolean => true
  expandFormat = (format: string): string => format
  getFormatHelperText = (format: string): string => format
  isNull = (value: Date | null): boolean => value === null
  isValid = (value: any): boolean =>
    value instanceof Date && !Number.isNaN(value.valueOf())
  format = (value: Date, formatKey: keyof AdapterFormats): string =>
    this.formatByString(value, this.formats[formatKey])
  formatByString = (value: Date, formatString: string): string =>
    formatDate(value, formatString, this.tz, this.locale)
  formatNumber = (numberToFormat: string): string => numberToFormat
  getDiff(
    value: Date,
    comparing: string | Date,
    unit?: AdapterUnits | undefined
  ): number {
    const other = comparing instanceof Date ? comparing : new Date(comparing)

    switch (unit) {
      case 'years':
        return diffInCalYears(value, other, this.tz)
      case 'quarters':
        return Math.trunc(diffInCalMonths(value, other, this.tz) / 3)
      case 'months':
        return diffInCalMonths(value, other, this.tz)
      case 'weeks':
        return Math.trunc(diffInCalDays(value, other, this.tz) / 7)
      case 'days':
        return diffInCalDays(value, other, this.tz)
      case 'hours':
        return diffInHours(value, other)
      case 'minutes':
        return diffInMinutes(value, other)
      case 'seconds':
        return diffInSeconds(value, other)
      default: {
        return diffInMilliseconds(value, other)
      }
    }
  }
  isEqual(value: any, comparing: any): boolean {
    return (
      (value == null && comparing == null) ||
      (value instanceof Date &&
        comparing instanceof Date &&
        value.valueOf() === comparing.valueOf())
    )
  }
  isSameYear = (value: Date, comparing: Date): boolean =>
    this.tz.year(value) === this.tz.year(comparing)
  isSameMonth(value: Date, comparing: Date): boolean {
    const lhs = this.tz.dateParts(value)
    const rhs = this.tz.dateParts(comparing)
    return lhs.year === rhs.year && lhs.monthIndex === rhs.monthIndex
  }
  isSameDay(value: Date, comparing: Date): boolean {
    const lhs = this.tz.dateParts(value)
    const rhs = this.tz.dateParts(comparing)
    return (
      lhs.year === rhs.year &&
      lhs.monthIndex === rhs.monthIndex &&
      lhs.day === rhs.day
    )
  }
  isSameHour(value: Date, comparing: Date): boolean {
    const lhs = this.tz.dateParts(value)
    const rhs = this.tz.dateParts(comparing)
    return (
      lhs.year === rhs.year &&
      lhs.monthIndex === rhs.monthIndex &&
      lhs.day === rhs.day &&
      lhs.hours === rhs.hours
    )
  }

  isAfter = (value: Date, comparing: Date): boolean =>
    value == null || (comparing != null && isDateAfter(value, comparing))
  isAfterYear = (value: Date, comparing: Date): boolean =>
    isDateAfter(startOfYear(value, this.tz), startOfYear(comparing, this.tz))
  isAfterDay = (value: Date, comparing: Date): boolean =>
    isDateAfter(startOfDay(value, this.tz), startOfDay(comparing, this.tz))

  isBefore = (value: Date, comparing: Date): boolean =>
    comparing == null || (value != null && isDateBefore(value, comparing))
  isBeforeYear = (value: Date, comparing: Date): boolean => {
    return isDateBefore(
      startOfYear(value, this.tz),
      startOfYear(comparing, this.tz)
    )
  }
  // isBeforeDay = (value: Date, comparing: Date): boolean =>
  //   isDateBefore(startOfDay(value, this.tz), startOfDay(comparing, this.tz))
  isBeforeDay = (value: Date, comparing: Date): boolean => {
    const d1 = startOfDay(value, this.tz)
    const d2 = startOfDay(comparing, this.tz)
    return isDateBefore(d1, d2)
  }

  isWithinRange = (value: Date, range: [Date, Date]): boolean =>
    isDateOnOrAfter(value, range[0]) && isDateOnOrBefore(value, range[1])

  startOfYear = (value: Date): Date => startOfYear(value, this.tz)
  startOfMonth = (value: Date): Date => startOfMonth(value, this.tz)
  startOfWeek = (value: Date): Date => startOfWeekday(value, 1, this.tz)
  startOfDay = (value: Date): Date => startOfDay(value, this.tz)
  endOfYear = (value: Date): Date => endOfYear(value, this.tz)
  endOfMonth = (value: Date): Date => endOfMonth(value, this.tz)
  endOfWeek = (value: Date): Date => endOfWeekday(value, 1, this.tz)
  endOfDay = (value: Date): Date => endOfDay(value, this.tz)

  addYears = (value: Date, count: number): Date =>
    addYears(value, count, this.tz)
  addMonths = (value: Date, count: number): Date =>
    addMonths(value, count, this.tz)
  addWeeks = (value: Date, count: number): Date =>
    addDays(value, count * 7, this.tz)
  addDays = (value: Date, count: number): Date => addDays(value, count, this.tz)
  addHours = (value: Date, count: number): Date => addHours(value, count)
  addMinutes = (value: Date, count: number): Date => addMinutes(value, count)
  addSeconds = (value: Date, count: number): Date => addSeconds(value, count)

  getYear = (value: Date): number => this.tz.year(value)
  getMonth = (value: Date): number => this.tz.monthIndex(value)
  getDate = (value: Date): number => this.tz.day(value)
  getHours = (value: Date): number => this.tz.hours(value)
  getMinutes = (value: Date): number => this.tz.minutes(value)
  getSeconds = (value: Date): number => this.tz.seconds(value)
  getMilliseconds = (value: Date) => this.tz.milliseconds(value)

  setYear = (value: Date, count: number): Date => {
    const { monthIndex, day, hours, minutes, seconds, milliseconds } =
      this.tz.dateParts(value)
    return this.tz.makeDate(
      count,
      monthIndex,
      day,
      hours,
      minutes,
      seconds,
      milliseconds
    )
  }
  setMonth = (value: Date, count: number): Date => {
    const { year, day, hours, minutes, seconds, milliseconds } =
      this.tz.dateParts(value)
    return this.tz.makeDate(
      year,
      count,
      day,
      hours,
      minutes,
      seconds,
      milliseconds
    )
  }
  setDate = (value: Date, count: number): Date => {
    const { year, monthIndex, hours, minutes, seconds, milliseconds } =
      this.tz.dateParts(value)
    return this.tz.makeDate(
      year,
      monthIndex,
      count,
      hours,
      minutes,
      seconds,
      milliseconds
    )
  }
  setHours = (value: Date, count: number): Date => {
    const { year, monthIndex, day, minutes, seconds, milliseconds } =
      this.tz.dateParts(value)
    return this.tz.makeDate(
      year,
      monthIndex,
      day,
      count,
      minutes,
      seconds,
      milliseconds
    )
  }
  setMinutes = (value: Date, count: number): Date => {
    const { year, monthIndex, day, hours, seconds, milliseconds } =
      this.tz.dateParts(value)
    return this.tz.makeDate(
      year,
      monthIndex,
      day,
      hours,
      count,
      seconds,
      milliseconds
    )
  }
  setSeconds = (value: Date, count: number): Date => {
    const { year, monthIndex, day, hours, minutes, milliseconds } =
      this.tz.dateParts(value)
    return this.tz.makeDate(
      year,
      monthIndex,
      day,
      hours,
      minutes,
      count,
      milliseconds
    )
  }
  setMilliseconds = (value: Date, count: number): Date => {
    const { year, monthIndex, day, hours, minutes, seconds } =
      this.tz.dateParts(value)
    return this.tz.makeDate(
      year,
      monthIndex,
      day,
      hours,
      minutes,
      seconds,
      count
    )
  }

  getDaysInMonth = (value: Date): number =>
    daysInMonth(this.tz.year(value), this.tz.monthIndex(value))
  getNextMonth = (value: Date): Date => addMonths(value, 1, this.tz)
  getPreviousMonth = (value: Date): Date => addMonths(value, -1, this.tz)

  getMonthArray = (value: Date): Date[] => {
    const year = this.tz.year(value)
    return [
      this.tz.makeDate(year, 0),
      this.tz.makeDate(year, 1),
      this.tz.makeDate(year, 2),
      this.tz.makeDate(year, 3),
      this.tz.makeDate(year, 4),
      this.tz.makeDate(year, 5),
      this.tz.makeDate(year, 6),
      this.tz.makeDate(year, 7),
      this.tz.makeDate(year, 8),
      this.tz.makeDate(year, 9),
      this.tz.makeDate(year, 10),
      this.tz.makeDate(year, 11)
    ]
  }

  mergeDateAndTime = (date: Date, time: Date): Date => {
    const { year, monthIndex, day } = this.tz.dateParts(date)
    const { hours, minutes, seconds, milliseconds } = this.tz.dateParts(time)
    return this.tz.makeDate(
      year,
      monthIndex,
      day,
      hours,
      minutes,
      seconds,
      milliseconds
    )
  }

  getWeekdays = (): string[] => this.locale.weekday.narrow
  getWeekArray = (date: Date): Date[][] => {
    const start = startOfWeekday(startOfMonth(date, this.tz), 0, this.tz)
    const end = endOfWeekday(endOfMonth(date, this.tz), 0, this.tz)

    let count = 0
    let current = start
    const nestedWeeks: Date[][] = []
    let lastDay = null
    while (isDateBefore(current, end)) {
      const weekNumber = Math.floor(count / 7)
      nestedWeeks[weekNumber] = nestedWeeks[weekNumber] || []
      const day = this.tz.weekday(current)
      if (lastDay !== day) {
        lastDay = day
        nestedWeeks[weekNumber].push(current)
        count += 1
      }
      current = addDays(current, 1)
    }
    return nestedWeeks
  }
  getWeekNumber = (value: Date): number => weekOfYear(value, this.tz)
  getYearRange = (start: Date, end: Date): Date[] => {
    const startDate = startOfYear(start, this.tz)
    const endDate = endOfYear(end, this.tz)
    const years: Date[] = []

    let current = startDate
    while (isDateBefore(current, endDate)) {
      years.push(current)
      current = addYears(current, 1, this.tz)
    }

    return years
  }
  getMeridiemText = (ampm: 'am' | 'pm'): string => ampm.toUpperCase()
}
