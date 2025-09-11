const openFile = async (file) => {
 	try {
		// If file is a File object (just uploaded), open as blob URL
		if (file instanceof File) {
			const fileURL = URL.createObjectURL(file);
			window.open(fileURL, '_blank');
			return;
		}

		// Otherwise, assume 'file' is the relative path in Supabase
		const encodedPath = encodeURIComponent(file);
		const response = await fetch(`/common/${encodedPath}/`)
		if (!response.ok) throw new Error("Could not get signed URL");

		const data = await response.json();
		if (data.url) {
			window.open(data.url, '_blank');
		} else {
			throw new Error("No URL returned from server");
		}
	} catch (err) {
		console.error("Error opening file:", err);
	}
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