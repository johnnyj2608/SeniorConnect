const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        timeZone: 'UTC',
    });
};
  
const formatPhone = (phone) => {
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

export { formatDate, formatPhone, formatGender };