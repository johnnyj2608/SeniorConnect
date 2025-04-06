const getActiveAuthIndex = (data) => {
    const activeIndex = data.findIndex(tab => tab.active === true);
    return activeIndex;
};

export default getActiveAuthIndex;
