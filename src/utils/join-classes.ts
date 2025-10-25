/**
 * Utility function to join CSS class names together, filtering out empty values
 * @param classes - Array of class names to join
 * @returns Joined class names string
 */
export const joinClasses = (
  ...classes: (string | undefined | null | false)[]
): string => {
  return classes.filter(Boolean).join(' ');
};
