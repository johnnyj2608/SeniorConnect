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
    "monday": digits ? "1" : "Mon",
    "tuesday": digits ? "2" : "Tue",
    "wednesday": digits ? "3" : "Wed",
    "thursday": digits ? "4" : "Thu",
    "friday": digits ? "5" : "Fri",
    "saturday": digits ? "6" : "Sat",
    "sunday": digits ? "7" : "Sun"
  };

  if (typeof schedule === "string") {
    return dayMap[schedule.toLowerCase().trim()] || schedule;
  }

  if (Array.isArray(schedule)) {
    const formattedDays = [...new Set(schedule.map(day => day.toLowerCase().trim()))]
      .map(day => dayMap[day] || day);
    return digits ? formattedDays.join(".") : formattedDays.join(", ");
  }
  return "N/A";
}

const sortSchedule = (schedule) => {
  if (!schedule) return [];

  const daySet = new Set(schedule.filter(day => day !== ''));

  const daysOfWeek = [
    "monday", "tuesday", "wednesday", "thursday", 
    "friday", "saturday", "sunday"
  ];

  return daysOfWeek.filter(day => daySet.has(day));
};

const formatSSN = (ssn) => {
  if (!ssn || typeof ssn !== "string") {
    return "";
  }

  return ssn.replace(/(\d{3})(\d{2})(\d{4})/, "$1-$2-$3");
};

export {
  formatDate,
  formatPhone,
  formatGender,
  formatSchedule,
  sortSchedule,
  formatSSN
};