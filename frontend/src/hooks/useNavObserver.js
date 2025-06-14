import { useEffect, useRef } from 'react';

const useNavObserver = (sections, setActiveSection, options = {}) => {
  const observer = useRef(null);

  useEffect(() => {
    if (!sections || !setActiveSection) return;

    observer.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, options);

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.current.observe(el);
    });

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [sections, setActiveSection, options]);
};

export default useNavObserver;