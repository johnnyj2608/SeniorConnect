const groupMembersByMltc = (members, mltcOptions) => {
  const mltcMap = mltcOptions.reduce((acc, mltc) => {
    acc[mltc.id] = mltc.name;
    return acc;
  }, {});

  return members.reduce((acc, member) => {
    const mltcName = mltcMap[member.mltc_id] || "Unknown";
    if (!acc[mltcName]) {
      acc[mltcName] = [];
    }
    acc[mltcName].push(member);
    return acc;
  }, {});
};
  
export default groupMembersByMltc;