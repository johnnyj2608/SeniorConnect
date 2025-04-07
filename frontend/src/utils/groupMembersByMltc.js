const groupMembersByMltc = (members) => {
  return members.reduce((acc, member) => {
    const mltcName = member.mltc || "Unknown";

    if (!acc[mltcName]) {
      acc[mltcName] = [];
    }
    acc[mltcName].push(member);
    return acc;
  }, {});
};

export default groupMembersByMltc;