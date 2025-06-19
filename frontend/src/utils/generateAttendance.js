import jsPDF from 'jspdf';
import 'jspdf-autotable';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const attendanceTemplateOne = (member, monthYear) => {
    const doc = new jsPDF();
	const pageWidth = doc.internal.pageSize.getWidth();
	const marginX = 10;
	let x = 10, y = 10;

	doc.setFontSize(18);
	doc.setFont('helvetica', 'bold');
  	doc.text('SADC', pageWidth / 2, y, { align: 'center' });
	doc.text('PARTICIPANT SIGN IN SHEET', pageWidth / 2, y+8, { align: 'center' });
	doc.setFont('helvetica', 'normal');

	y = 35
	doc.setFontSize(14);
	const label = 'Name: ';
	const value = `${member.last_name}, ${member.first_name}`;
	doc.text(`${label}${value}`, marginX, y);
	const labelWidth = doc.getTextWidth(label);
	const underlineStartX = marginX + labelWidth;
	const underlineEndX = underlineStartX + doc.getTextWidth(value)+1.5;
	doc.line(underlineStartX, y + 1.5, underlineEndX, y + 1.5);

	// Birth Date, Gender, Phone, Address, Enrollment, MLTC, MLTC_Member_Id, DX, Schedule, Total Days

	// Table: Day (locale), Date, Attendance, Transportation, Breakfast, Lunch, Snack, Other Appt

    return doc.output('blob');
};

const generateAttendance = async (memberList, monthYear) => {
    const zip = new JSZip();
    const [year, month] = monthYear.split('-');
    const shortYear = year.slice(2);

    for (const [mltcName, members] of Object.entries(memberList)) {
        const folder = zip.folder(mltcName);

        for (const member of members) {
            const pdfBlob = attendanceTemplateOne(member, monthYear);

            const fileName = `${member.sadc_member_id}. ${member.last_name}, ${member.first_name} - ${month}/${shortYear}.pdf`
                .replace(/\s+/g, '_');
            folder.file(fileName, pdfBlob);

            // Uncomment to preview instead of download
            if (mltcName === Object.keys(memberList)[0] && member === members[0]) {
                const pdfUrl = URL.createObjectURL(pdfBlob);
                window.open(pdfUrl);
                return;
            }
        }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });

    saveAs(zipBlob, `attendance_${month}_${shortYear}.zip`);
};

export default generateAttendance;