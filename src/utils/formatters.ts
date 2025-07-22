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

export const getTimeAgo = (
  dateString: string,
  t: (key: string, options?: any) => string,
) => {
  const eventDate = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - eventDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return t('TIME.TODAY');
  } else if (diffInDays === 1) {
    return t('TIME.YESTERDAY');
  } else if (diffInDays < 7) {
    return t('TIME.AGO', {
      time: t('TIME.UNITS.DAY', {
        count: diffInDays,
        plural: diffInDays === 1 ? '' : 's',
      }),
    });
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    const remainingDays = diffInDays % 7;
    if (remainingDays === 0) {
      return t('TIME.AGO', {
        time: t('TIME.UNITS.WEEK', {
          count: weeks,
          plural: weeks === 1 ? '' : 's',
        }),
      });
    } else {
      return t('TIME.AGO', {
        time: `${t('TIME.UNITS.WEEK', { count: weeks, plural: weeks === 1 ? '' : 's' })} ${t('TIME.UNITS.DAY', { count: remainingDays, plural: remainingDays === 1 ? '' : 's' })}`,
      });
    }
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    const remainingDays = diffInDays % 30;
    if (remainingDays === 0) {
      return t('TIME.AGO', {
        time: t('TIME.UNITS.MONTH', {
          count: months,
          plural: months === 1 ? '' : 's',
        }),
      });
    } else {
      return t('TIME.AGO', {
        time: `${t('TIME.UNITS.MONTH', { count: months, plural: months === 1 ? '' : 's' })} ${t('TIME.UNITS.DAY', { count: remainingDays, plural: remainingDays === 1 ? '' : 's' })}`,
      });
    }
  } else {
    const years = Math.floor(diffInDays / 365);
    const remainingDays = diffInDays % 365;
    const remainingMonths = Math.floor(remainingDays / 30);

    let timeString = t('TIME.UNITS.YEAR', {
      count: years,
      plural: years === 1 ? '' : 's',
    });

    if (remainingMonths > 0) {
      timeString += ` ${t('TIME.UNITS.MONTH', { count: remainingMonths, plural: remainingMonths === 1 ? '' : 's' })}`;
    }

    return t('TIME.AGO', { time: timeString });
  }
};
