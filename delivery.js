document.addEventListener("DOMContentLoaded", () => {
  /* === Carousel === */
  const slidesContainer = document.querySelector(".slides");
  const slides = document.querySelectorAll(".slide");
  const prevBtn = document.querySelector(".prev");
  const nextBtn = document.querySelector(".next");
  let index = 0;
  let timer;
  const AUTO_MS = 4000;

  function showSlide(n) {
    if (n >= slides.length) index = 0;
    else if (n < 0) index = slides.length - 1;
    else index = n;
    slidesContainer.style.transform = `translateX(${-index * 100}%)`;
  }

  function nextSlide() { index++; showSlide(index); }
  function prevSlide() { index--; showSlide(index); }

  function startAuto() { timer = setInterval(nextSlide, AUTO_MS); }
  function stopAuto() { clearInterval(timer); }

  nextBtn.addEventListener("click", () => { nextSlide(); stopAuto(); startAuto(); });
  prevBtn.addEventListener("click", () => { prevSlide(); stopAuto(); startAuto(); });

  showSlide(0);
  startAuto();

  /* === Scrollspy === */
  const links = document.querySelectorAll(".header2-scroll a");
  const sections = document.querySelectorAll(".section");
  const HEADER_HEIGHT = 60 + 35;
  const SCROLL_OFFSET = 350; // glow triggers 95px above section

  // Smooth scroll on click
  links.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const targetId = link.getAttribute("href").substring(1);
      const target = document.getElementById(targetId);
      if (target) {
        window.scrollTo({ top: target.offsetTop - HEADER_HEIGHT, behavior: "smooth" });
      }
    });
  });

  // Scrollspy highlights link correctly even on fast scroll
  window.addEventListener("scroll", () => {
    const scrollPos = window.scrollY + HEADER_HEIGHT + SCROLL_OFFSET;

    sections.forEach((section, idx) => {
      const id = section.id;
      const link = document.querySelector(`.header2-scroll a[href="#${id}"]`);

      if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
        links.forEach(l => l.classList.remove("active"));
        if (idx !== 0 && link) { // skip first section
          link.classList.add("active");
        }
      }
    });
  });
});
