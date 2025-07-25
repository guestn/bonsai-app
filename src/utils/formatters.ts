export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};

export const formatAge = (
  years: number,
  t: (key: string, options?: any) => string,
) => {
  if (years < 1) {
    const months = Math.floor(years * 12);
    return t('TIME.UNITS.MONTH', {
      count: months,
      plural: months === 1 ? '' : 's',
    });
  } else if (years < 2) {
    const remainingMonths = Math.floor((years - Math.floor(years)) * 12);
    if (remainingMonths === 0) {
      return t('TIME.UNITS.YEAR', { count: 1, plural: '' });
    } else {
      return `${t('TIME.UNITS.YEAR', { count: 1, plural: '' })} ${t('TIME.UNITS.MONTH', { count: remainingMonths, plural: remainingMonths === 1 ? '' : 's' })}`;
    }
  } else {
    const wholeYears = Math.floor(years);
    const remainingMonths = Math.floor((years - wholeYears) * 12);

    let ageString = t('TIME.UNITS.YEAR', {
      count: wholeYears,
      plural: wholeYears === 1 ? '' : 's',
    });

    if (remainingMonths > 0) {
      ageString += ` ${t('TIME.UNITS.MONTH', { count: remainingMonths, plural: remainingMonths === 1 ? '' : 's' })}`;
    }

    return ageString;
  }
};

export function getTimeAgo(
  dateString: string,
  t: (key: string, options?: any) => string,
): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // If the date is in the future or today, return "Today"
  if (diff <= 0) {
    return t('TIME.TODAY');
  }

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (years > 0) {
    const remMonths = months % 12;
    return remMonths > 0
      ? t('TIME.YEARS_MONTHS', { years, months: remMonths })
      : t('TIME.YEARS', { years });
  }
  if (months > 0) {
    const remDays = days % 30;
    return remDays > 0
      ? t('TIME.MONTHS_DAYS', { months, days: remDays })
      : t('TIME.MONTHS', { months });
  }
  if (days > 0) {
    return t('TIME.DAYS', { days });
  }
  if (hours > 0) {
    return t('TIME.HOURS', { hours });
  }
  if (minutes > 0) {
    return t('TIME.MINUTES', { minutes });
  }
  return t('TIME.SECONDS', { seconds });
}
