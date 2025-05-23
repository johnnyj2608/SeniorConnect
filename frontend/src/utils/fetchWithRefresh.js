const fetchWithRefresh = async (url, options = {}, retry = true) => {
  try {
    const res = await fetch(url, {
      ...options,
      credentials: 'include',
    });

    if (res.status !== 401) {
      return res;
    }

    if (res.status === 401 && retry) {
      const refreshRes = await fetch('/user/auth/refresh/', {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshRes.ok) {
        return fetchWithRefresh(url, options, false);
      } else {
        throw new Error('Unauthorized - refresh failed');
      }
    }

    return res;
  } catch (error) {
    throw error;
  }
};

export default fetchWithRefresh