import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function usePreferences(key, defaultValue = null) {
  const { user } = useContext(AuthContext);

  const localValue = localStorage.getItem(key);
  const backendValue = user?.preferences?.[key];

  if (backendValue !== undefined && backendValue !== null) {
    if (localValue === null) {
      localStorage.setItem(key, JSON.stringify(backendValue));
    }
    return backendValue;
  }

  if (localValue !== null) {
    try {
      return JSON.parse(localValue);
    } catch {
      return localValue;
    }
  }

  return defaultValue;
}

export default usePreferences;