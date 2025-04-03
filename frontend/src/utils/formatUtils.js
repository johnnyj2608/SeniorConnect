const formatDate = (date) => {
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return '';
  }

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

const formatSchedule = (schedule) => {
  const dayMap = {
    "monday": "Mon",
    "tuesday": "Tue",
    "wednesday": "Wed",
    "thursday": "Thu",
    "friday": "Fri",
    "saturday": "Sat",
    "sunday": "Sun"
  };

  if (typeof schedule === "string") {
    return dayMap[schedule.toLowerCase().trim()] || schedule;
  }

  if (Array.isArray(schedule)) {
    const formattedDays = [...new Set(schedule.map(day => day.toLowerCase().trim()))]
      .map(day => dayMap[day] || day);
    return formattedDays.join(", ");
  }
  return "N/A";
}

const sortSchedule = (schedule) => {
  const daysOfWeek = [
    "monday", "tuesday", "wednesday", "thursday", 
    "friday", "saturday", "sunday"
  ];

  const sortedSchedule = schedule.sort((a, b) => 
    daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b)
  );

  return sortedSchedule;
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