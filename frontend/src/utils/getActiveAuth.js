const getActiveAuth = (data) => {
    return data.find(tab => tab.active === true);
};

export default getActiveAuth;