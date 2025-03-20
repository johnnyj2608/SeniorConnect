import React, {useState, useEffect} from 'react'
import { ReactComponent as DownloadIcon } from '../assets/download.svg';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const DownloadButton = () => {
  const [mltcMap, setMltcMap] = useState({});

  useEffect(() => {
    const fetchMltcNames = async () => {
      try {
        const response = await fetch('/core/mltc/');
        const mltcList = await response.json();
        const map = mltcList.reduce((acc, mltc) => {
          acc[mltc.id] = mltc.name;
          return acc;
        }, {});
        setMltcMap(map);
      } catch (error) {
        console.error("Error fetching MLTC names:", error);
      }
    };

    fetchMltcNames();
  }, []);

  const handleDownload = async () => {
    try {
      const response = await fetch('/core/members/');
      const members = await response.json();

      const membersByMltc = members.reduce((acc, member) => {
        const mltcName = mltcMap[member.mltc] || "Unknown";
        if (!acc[mltcName]) {
          acc[mltcName] = [];
        }
        acc[mltcName].push(member);
        return acc;
      }, {});

      const spreadsheet = XLSX.utils.book_new();

      Object.entries(membersByMltc).forEach(([mltc, members]) => {
        const sanitizedData = members.map(({ mltc, photo, ...rest }) => rest);

        const sheet = XLSX.utils.json_to_sheet(sanitizedData);
        XLSX.utils.book_append_sheet(spreadsheet, sheet, `${mltc}`);
      });

      const currentDate = new Date().toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
      const fileName = `members_${currentDate}.xlsx`;

      const excelBuffer = XLSX.write(spreadsheet, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, fileName);

    } catch (error) {
      console.error("Error downloading members:", error);
    }
  };

  return (
    <button onClick={handleDownload} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
      <DownloadIcon width={32} height={32} />
    </button>
  );
};

export default DownloadButton;
