export default {
  mounted: (el) => {
    const loadImage = () => {
      el.addEventListener("load", () => {
        setTimeout(() => el.classList.add("loaded"), 100);
      });
      el.addEventListener("error", () => console.log("error"));
      el.src = el.dataset.url;
    };

    const handleIntersect = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadImage();
          observer.unobserve(el);
        }
      });
    };

    const createObserver = () => {
      if (!window["IntersectionObserver"]) {
        return loadImage();
      }
      const options = {
        root: null,
        threshold: "0",
      };
      const observer = new IntersectionObserver(handleIntersect, options);
      observer.observe(el);
    };
    createObserver();
  },
};
