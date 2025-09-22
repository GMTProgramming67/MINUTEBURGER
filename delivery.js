document.addEventListener("DOMContentLoaded", () => {
  const slidesContainer = document.querySelector(".slides");
  const slides = document.querySelectorAll(".slide");
  const prevBtn = document.querySelector(".prev");
  const nextBtn = document.querySelector(".next");
  const dots = document.querySelectorAll(".dot");

  let index = 0;
  let timer;
  const AUTO_MS = 4000; // 4 seconds auto-slide

  function showSlide(n) {
    if (n >= slides.length) index = 0;
    else if (n < 0) index = slides.length - 1;
    else index = n;

    slidesContainer.style.transform = `translateX(${-index * 100}%)`;

    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });
  }

  function nextSlide() {
    showSlide(index + 1);
  }

  function prevSlide() {
    showSlide(index - 1);
  }

  function startAuto() {
    timer = setInterval(nextSlide, AUTO_MS);
  }

  function stopAuto() {
    clearInterval(timer);
  }

  // Buttons
  nextBtn.addEventListener("click", () => {
    nextSlide();
    stopAuto();
    startAuto();
  });
  prevBtn.addEventListener("click", () => {
    prevSlide();
    stopAuto();
    startAuto();
  });

  // Dots
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      showSlide(i);
      stopAuto();
      startAuto();
    });
  });

  // Init
  showSlide(0);
  startAuto();
});
