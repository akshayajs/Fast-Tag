// app/helpers/format-date.js
import { helper } from '@ember/component/helper';

export function formatDate([timestampString]) {
  if (!timestampString) {
    return '';
  }

  try {
    // Attempt to parse the timestamp string from your backend (e.g., "2025-05-23T15:00:13.364315")
    // Note: The +05:30 offset might cause issues with direct Date parsing in some browsers.
    // It's often safer to parse and then format.
    const date = new Date(timestampString);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string passed to formatDate helper: ${timestampString}`);
      return timestampString; // Return original string if parsing fails
    }

    // Example formatting: "May 23, 2025, 3:00 PM"
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    };
    return date.toLocaleString(undefined, options); // Using browser's default locale
  } catch (e) {
    console.error("Error formatting date:", e);
    return timestampString; // Fallback to original string on error
  }
}

export default helper(formatDate);