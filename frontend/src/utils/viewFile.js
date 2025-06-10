const openFileInNewTab = (file) => {
    let fileURL = file
    if (fileURL instanceof File) fileURL = URL.createObjectURL(file);
    window.open(fileURL, '_blank');
};

export default openFileInNewTab;