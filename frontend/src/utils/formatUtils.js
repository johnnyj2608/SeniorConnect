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

const formatTime = (time) => {
  if (!time) return null;

  const isoString = `1970-01-01T${time}Z`;
  const d = new Date(isoString);

  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  });
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return null;
  const d = new Date(timestamp);
  return d.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
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
    return 'unknown';
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
  if (start > today) return 'upcoming';
  if (end && end < today) return 'completed';
  if (start <= today && (!end || end >= today)) return 'ongoing';

  return '';
}

const normalizeField = (str) => {
  if (!str) return '';
  return str.toLowerCase().replace(/\s+/g, '_');
};

const formatObjectDisplay = (entry, t) => {
  const model = entry.model_name;

  if (model === 'absence') {
    // Expected format: "vacation: 05/01/2024 — 05/05/2024"
    const parts = entry.object_display.split(/:|—/); 
    const absenceType = parts[0]?.trim();
    const start = parts[1]?.trim();
    const end = parts[2]?.trim();

    return (
      <>
        <strong>
            {t(`member.absences.${absenceType}`)}: {start}
            {end && <> — {end}</>}
        </strong>
        <br />
      </>
    );
  }

  if (model === 'authorization') {
    // Example: "MLTC: 05/01/2024 — 07/01/2024"
    const parts = entry.object_display.split(/:|—/); 
    const mltc = parts[0]?.trim();
    const start = parts[1]?.trim();
    const end = parts[2]?.trim();

    return (
      <>
        <strong>
          {mltc}: {start} — {end}
        </strong>
        <br />
      </>
    );
  }

  if (model === 'contact') {
    // Example: "pharmacy: name"
    const parts = entry.object_display.split(':');
    const contactType = parts[0]?.trim();
    const name = parts[1]?.trim(); 

    return (
      <>
        <strong>
          {t(`member.contacts.contact_type.${contactType}`)}: {name}
        </strong>
        <br />
      </>
      
    );
  }

  if (model === 'file') {
    // Example: "File: insurance.pdf"
    const parts = entry.object_display.split(':');
    const name = parts[1]?.trim();
  
    return (
      <>
        <strong>
          {t('model.file_str', { name })}
        </strong>
        <br />
      </>
    );
  }

  return null;
}

export {
  formatDate,
  formatTime,
  formatPhone,
  formatGender,
  formatSchedule,
  sortSchedule,
  formatSSN,
  formatPhoto,
  formatStatus,
  normalizeField,
  formatObjectDisplay,
  formatTimestamp,
};