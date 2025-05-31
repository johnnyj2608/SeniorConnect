const formatDate = (date) => {
  if (!date) {
    return null;
  }

  const d = new Date(date);

  return d.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
  });
};
  
const formatPhone = (phone) => {
  if (!phone) return phone;
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
};

const formatGender = (gender) => {
  if (gender === 'M') {
    return 'Male';
  } else if (gender === 'F') {
    return 'Female';
  } else {
    return 'Unknown';
  }
};

const formatSchedule = (schedule, digits = false) => {
  const dayMap = {
    "Monday": digits ? "1" : "Mon",
    "Tuesday": digits ? "2" : "Tue",
    "Wednesday": digits ? "3" : "Wed",
    "Thursday": digits ? "4" : "Thu",
    "Friday": digits ? "5" : "Fri",
    "Saturday": digits ? "6" : "Sat",
    "Sunday": digits ? "7" : "Sun"
  };

  if (typeof schedule === "string") {
    return dayMap[schedule.trim()] || schedule;
  }

  if (Array.isArray(schedule)) {
    const formattedDays = [...new Set(schedule.map(day => day.trim()))]
      .map(day => dayMap[day] || day);
    return digits ? formattedDays.join(".") : formattedDays.join(", ");
  }
  return "N/A";
}

const sortSchedule = (schedule) => {
  if (!schedule) return [];

  const daySet = new Set(schedule.filter(day => day !== ''));

  const daysOfWeek = [
    "Monday", "Tuesday", "Wednesday", "Thursday", 
    "Friday", "Saturday", "Sunday"
  ];

  return daysOfWeek.filter(day => daySet.has(day));
};

const formatSSN = (ssn) => {
  if (!ssn || typeof ssn !== "string") {
    return "";
  }

  return ssn.replace(/(\d{3})(\d{2})(\d{4})/, "$1-$2-$3");
};

const formatPhoto = (photo) => {
  if (photo instanceof File) {
      return URL.createObjectURL(photo);
  }
  if (photo) {
      return photo;
  }
  return "/default-profile.jpg";
};

function formatStatus(startDateStr, endDateStr) {
  const today = new Date();
  const start = startDateStr ? new Date(startDateStr) : null;
  const end = endDateStr ? new Date(endDateStr) : null;

  if (!start) return '';
  if (start > today) return 'Upcoming';
  if (end && end < today) return 'Completed';
  if (start <= today && (!end || end >= today)) return 'Ongoing';

  return '';
}

const normalizeField = (str) => {
  if (!str) return '';
  return str.toLowerCase().replace(/\s+/g, '_');
};

export {
  formatDate,
  formatPhone,
  formatGender,
  formatSchedule,
  sortSchedule,
  formatSSN,
  formatPhoto,
  formatStatus,
  normalizeField,
};