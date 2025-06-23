import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { formatPhone, formatDate, formatSchedule } from './formatUtils'
import { t } from 'i18next';
import '../fonts/NotoSansSC-Regular-normal';

const weekdays = [
    'sunday',
    'monday', 
    'tuesday', 
    'wednesday', 
    'thursday', 
    'friday', 
    'saturday', 
]

const calculateDays = (month, year, schedule) => {
    const days = [];
    const totalDays = new Date(year, month, 0).getDate();

    for (let day = 1; day <= totalDays; day++) {
        const dateObj = new Date(year, month - 1, day);
        const weekday = weekdays[dateObj.getDay()];
        if (schedule.includes(weekday)) {
            days.push({
                day: t(`general.days_of_week_long_short.${weekday}`),
                date: formatDate(dateObj)
            });
        }
    }
    return days;
};

const attendanceTemplateOne = (member, month, year, sadc) => {
    const doc = new jsPDF();
	const pageWidth = doc.internal.pageSize.getWidth();
	const marginX = 5;
    let x = pageWidth / 2;
	let y = 10;

    const drawField = (label, value) => {
		if (value == null || value === '') return; 
        const text = `${label}${value}`;
        doc.text(text, x, y);
        x += doc.getTextWidth(text) + 5;
    };

	doc.setFontSize(16);
	doc.setFont('helvetica', 'bold');
  	doc.text(sadc.toUpperCase(), x, y, { align: 'center' });
	doc.text('PARTICIPANT SIGN IN SHEET', x, y+8, { align: 'center' });
    doc.setFontSize(11);

	y = 28;
    x = marginX;
    drawField('NAME: ',  `${member.last_name}, ${member.first_name}`.toUpperCase());
    x = pageWidth - 10;
    doc.text(`GENDER: ${member.gender ?? ''}`, pageWidth - 5, y, { align: 'right' });
    doc.text(`DOB: ${formatDate(member.birth_date)}`, pageWidth - 30, y, { align: 'right' });
    doc.text(`TEL: ${formatPhone(member.phone)}`, pageWidth - 65, y, { align: 'right' });
    

    y = 35;
    x = marginX;
    drawField('PARTICIPANT ADDRESS: ', member.address?.toUpperCase() || '');

    y = 42;
    x = marginX;
    drawField('MLTC INSURANCE: ', member.mltc_name?.toUpperCase() || '');
    drawField('ID: ', member.mltc_member_id);
    doc.text(
        `EFFECTIVE: ${formatDate(member.start_date)} — ${formatDate(member.end_date)}`, 
        pageWidth - 5, y, { align: 'right' }
    );

    y = 49;
    x = marginX;
	drawField('DX CODE: ', member.dx_code);
    drawField('SDC: ', member.sdc_auth_id);
    drawField('TRANSP: ', member.transportation_auth_id);

    y = 56;
    x = marginX;
    drawField('AUTHORIZED DAYS: ', formatSchedule(member.schedule).toUpperCase());

    const days = calculateDays(month, year, member.schedule);
    doc.text(`${days.length} DAYS`, pageWidth - 5, y, { align: 'right' });

    y = 61;
    doc.setFont('helvetica', 'normal');
    const tableHeaders = [
        'Day',
        'Date',
        'Attendance',
        'Transportation',
        'Breakfast',
        'Lunch',
        'Snack',
        'Other Appt'
    ];

    const tableRows = days.map((d) => [
        d.day,
        d.date,
        '',
        '',
        '',
        '',
        '',
        '',
    ]);

    autoTable(doc, {
        head: [tableHeaders],
        body: tableRows,
        startY: y,
        margin: { left: marginX, right: marginX, bottom: 0 },
        tableWidth: 'wrap',
        styles: { 
            fontSize: 11, 
            cellPadding: 1.9, 
            halign: 'center', 
            textColor: [0, 0, 0],
            lineWidth: 0.3,
            lineColor: [0, 0, 0],
        },
        alternateRowStyles: { fillColor: [255, 255, 255] },
        headStyles: { 
            fillColor: [255, 255, 255],
            halign: 'center',
            textColor: [0, 0, 0],
            lineWidth: 0.3,
            lineColor: [0, 0, 0],
        },
        columnStyles: {
            0: { cellWidth: 16, font: 'NotoSansSC-Regular' },
            1: { cellWidth: 25 },   // Date
            2: { cellWidth: 41 },   // Attendance
            3: { cellWidth: 41 },   // Transportation
            4: { cellWidth: 22 },   // Breakfast
            5: { cellWidth: 16 },   // Lunch
            6: { cellWidth: 16 },   // Snack
            7: { cellWidth: 24 },   // Other Appt
        },
    });

    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(96);
    doc.setFont('helvetica', 'bold');
    doc.text(String(member.sadc_member_id), pageWidth - 5, pageHeight - 7, { align: 'right' });

    return doc.output('blob');
};

const attendanceTemplateTwo = (member, month, year, sadc) => {
    const doc = new jsPDF();

    return doc.output('blob');
}

const generateAttendance = async (memberList, monthYear, sadc="SADC", template, preview = false) => {
    if (!monthYear) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        monthYear = `${year}-${month}`;
    }
    const [year, month] = monthYear.split('-');
    const shortYear = year.slice(2);

    if (preview) {
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);

        const start_date = firstDay.toISOString().split('T')[0];
        const end_date = lastDay.toISOString().split('T')[0];

        memberList = {
            'MLTC Insurance': [
                {
                    sadc_member_id: '25',
                    first_name: 'John',
                    last_name: 'Doe',
                    gender: 'M',
                    birth_date: '1980-05-04',
                    phone: '1234567890',
                    address: '123 Main St, City, State',
                    mltc_name: 'MLTC Insurance',
                    mltc_member_id: 'ML12345X',
                    start_date,
                    end_date,
                    dx_code: 'M15.0',
                    sdc_auth_id: 'T2003',
                    transportation_auth_id: 'TRANS001',
                    schedule: ['monday', 'wednesday', 'friday']
                }
            ]
        };
    }
    const zip = new JSZip();
    for (const [mltcName, members] of Object.entries(memberList)) {
        const folder = zip.folder(mltcName);

        for (const member of members) {
            let pdfBlob;
            switch (template) {
                case 2:
                    pdfBlob = attendanceTemplateTwo(member, month, year, sadc);
                    break;
                case 1:
                default:
                    pdfBlob = attendanceTemplateOne(member, month, year, sadc);
            }

            const fileName = `${member.sadc_member_id}. ${member.last_name}, ${member.first_name} - Attendance ${month}_${shortYear}.pdf`
            folder.file(fileName, pdfBlob);

            if (preview && mltcName === Object.keys(memberList)[0] && member === members[0]) {
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