const openFile = (file) => {
    let fileURL = file;
    if (fileURL instanceof File) fileURL = URL.createObjectURL(file);
    window.open(fileURL, '_blank');
};

const saveFile = async (fileURL, filename = 'download') => {
	try {
		const response = await fetch(fileURL, { mode: 'cors' });
		if (!response.ok) return;

		const blob = await response.blob();
		const objectUrl = URL.createObjectURL(blob);

		const link = document.createElement('a');
		link.href = objectUrl;
		link.download = filename;

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		URL.revokeObjectURL(objectUrl);
	} catch (error) {
		console.error('Download failed:', error);
	}
};

export {
	openFile,
	saveFile,
};