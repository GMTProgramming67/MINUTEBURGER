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

  function nextSlide() {
    index++;
    showSlide(index);
  }

  function prevSlide() {
    index--;
    showSlide(index);
  }

  function startAuto() {
    timer = setInterval(nextSlide, AUTO_MS);
  }

  function stopAuto() {
    clearInterval(timer);
  }

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

  showSlide(0);
  startAuto();

  /* === Scrollspy === */
  const links = document.querySelectorAll(".header2-scroll a");
  const sections = document.querySelectorAll(".section");

  const HEADER_HEIGHT = 60 + 45; // header + header2 height
  const GLOW_OFFSET = 95;

  // Smooth scroll
  links.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const targetId = link.getAttribute("href").substring(1);
      const target = document.getElementById(targetId);

      if (target) {
        window.scrollTo({
          top: target.offsetTop - HEADER_HEIGHT,
          behavior: "smooth"
        });
      }
    });
  });

  // Scrollspy and auto-scroll header2
  window.addEventListener("scroll", () => {
    const scrollPos = window.scrollY + HEADER_HEIGHT + GLOW_OFFSET;

    sections.forEach(section => {
      const id = section.id;
      const link = document.querySelector(`.header2-scroll a[href="#${id}"]`);

      if (
        scrollPos >= section.offsetTop &&
        scrollPos < section.offsetTop + section.offsetHeight
      ) {
        links.forEach(l => l.classList.remove("active"));

        if (link) {
          link.classList.add("active");

          // auto-scroll header2 so active link is visible
          const header2 = document.querySelector(".header2");
          const linkRect = link.getBoundingClientRect();
          const headerRect = header2.getBoundingClientRect();

          if (
            linkRect.left < headerRect.left ||
            linkRect.right > headerRect.right
          ) {
            header2.scrollBy({
              left: linkRect.left - headerRect.left - 10,
              behavior: "smooth"
            });
          }
        }
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.querySelector(".search-bar input");
  const sections = document.querySelectorAll(".section");

  searchInput.addEventListener("keyup", function () {
    const filter = searchInput.value.trim().toLowerCase();

    sections.forEach(section => {
      const boxes = Array.from(section.querySelectorAll(".box"));
      let hasVisibleBox = false;

      // check each box and animate in/out
      boxes.forEach(box => {
        const title = (box.querySelector(".box-title")?.textContent || "").toLowerCase();
        const description = (box.querySelector(".box-description")?.textContent || "").toLowerCase();
        const matches = title.includes(filter) || description.includes(filter);

        if (matches) {
          hasVisibleBox = true;

          // if box was removed, bring it back and animate in
          if (box.classList.contains("hidden")) {
            box.classList.remove("hidden");
            // start from hidden visual state
            box.classList.add("hiding");
            // next frame remove 'hiding' so transition plays
            requestAnimationFrame(() => box.classList.remove("hiding"));
          } else if (box.classList.contains("hiding")) {
            // cancel a pending hiding animation
            box.classList.remove("hiding");
          }
        } else {
          // animate box out, then remove from layout after transition finishes
          if (!box.classList.contains("hidden") && !box.classList.contains("hiding")) {
            box.classList.add("hiding");
            box.addEventListener("transitionend", function handler() {
              box.classList.add("hidden");
              box.classList.remove("hiding");
            }, { once: true });
          }
        }
      });

      // Now toggle the whole section (title + boxes)
      if (!hasVisibleBox) {
        // if section is neither hidden nor already hiding, hide it with animation
        if (!section.classList.contains("hidden") && !section.classList.contains("hiding")) {
          // ensure current max-height is respected (helps smooth collapse)
          // optional: set inline maxHeight to computed height before collapsing
          // section.style.maxHeight = section.scrollHeight + 'px';

          section.classList.add("hiding");
          section.addEventListener("transitionend", function handler() {
            section.classList.add("hidden");
            section.classList.remove("hiding");
          }, { once: true });
        }
      } else {
        // show section if previously hidden
        if (section.classList.contains("hidden")) {
          section.classList.remove("hidden");
          // start visual collapsed then animate in
          section.classList.add("hiding");
          requestAnimationFrame(() => section.classList.remove("hiding"));
        } else if (section.classList.contains("hiding")) {
          // if mid-hiding but we now have matches, cancel hiding
          section.classList.remove("hiding");
        }
      }
    });
  });
});



