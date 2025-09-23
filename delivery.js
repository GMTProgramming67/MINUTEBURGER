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

  if (nextBtn) nextBtn.addEventListener("click", () => { nextSlide(); stopAuto(); startAuto(); });
  if (prevBtn) prevBtn.addEventListener("click", () => { prevSlide(); stopAuto(); startAuto(); });

  showSlide(0);
  startAuto();

  /* === Scrollspy & Glow Titles === */
  const links = document.querySelectorAll(".header2-scroll a");
  const sections = document.querySelectorAll(".section");
  const HEADER_HEIGHT = 105; // 60 + 45
  const GLOW_OFFSET = 95;

  links.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const targetId = link.getAttribute("href").substring(1);
      const target = document.getElementById(targetId);
      if (target) window.scrollTo({ top: target.offsetTop - HEADER_HEIGHT, behavior: "smooth" });
    });
  });

  window.addEventListener("scroll", () => {
    const scrollPos = window.scrollY + HEADER_HEIGHT + GLOW_OFFSET;
    sections.forEach(section => {
      const id = section.id;
      const link = document.querySelector(`.header2-scroll a[href="#${id}"]`);
      if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
        links.forEach(l => l.classList.remove("active"));
        if (link) {
          link.classList.add("active");
          const header2 = document.querySelector(".header2");
          const linkRect = link.getBoundingClientRect();
          const headerRect = header2.getBoundingClientRect();
          if (linkRect.left < headerRect.left || linkRect.right > headerRect.right) {
            header2.scrollBy({ left: linkRect.left - headerRect.left - 10, behavior: "smooth" });
          }
        }
      }
    });
  });

  /* === Search/Filter === */
  const searchInput = document.querySelector(".search-bar input");
  if (searchInput) {
    searchInput.addEventListener("keyup", function () {
      const filter = searchInput.value.trim().toLowerCase();
      sections.forEach(section => {
        const boxes = Array.from(section.querySelectorAll(".box"));
        let hasVisibleBox = false;
        boxes.forEach(box => {
          const title = (box.querySelector(".box-title")?.textContent || "").toLowerCase();
          const description = (box.querySelector(".box-description")?.textContent || "").toLowerCase();
          const matches = title.includes(filter) || description.includes(filter);

          if (matches) {
            hasVisibleBox = true;
            if (box.classList.contains("hidden")) {
              box.classList.remove("hidden");
              box.classList.add("hiding");
              requestAnimationFrame(() => box.classList.remove("hiding"));
            } else if (box.classList.contains("hiding")) {
              box.classList.remove("hiding");
            }
          } else {
            if (!box.classList.contains("hidden") && !box.classList.contains("hiding")) {
              box.classList.add("hiding");
              box.addEventListener("transitionend", function handler() {
                box.classList.add("hidden");
                box.classList.remove("hiding");
              }, { once: true });
            }
          }
        });

        if (!hasVisibleBox) {
          if (!section.classList.contains("hidden") && !section.classList.contains("hiding")) {
            section.classList.add("hiding");
            section.addEventListener("transitionend", function handler() {
              section.classList.add("hidden");
              section.classList.remove("hiding");
            }, { once: true });
          }
        } else {
          if (section.classList.contains("hidden")) {
            section.classList.remove("hidden");
            section.classList.add("hiding");
            requestAnimationFrame(() => section.classList.remove("hiding"));
          } else if (section.classList.contains("hiding")) {
            section.classList.remove("hiding");
          }
        }
      });
    });
  }

  /* === Top Menu & Cart Box Toggle === */
  const topMenuLinks = document.querySelectorAll('.menu a');
  const header2Links = document.querySelectorAll('.header2-scroll a');
  const cartBox = document.getElementById('cart-box');
  const cartClose = document.getElementById('cart-close');

  topMenuLinks.forEach((link, index) => {
    link.addEventListener('click', e => {
      e.preventDefault();
      if (index === 0) window.scrollTo({ top: 0, behavior: 'smooth' });
      else if (index === 1) {
        const randomIndex = Math.floor(Math.random() * header2Links.length);
        const targetId = header2Links[randomIndex].getAttribute('href').substring(1);
        const target = document.getElementById(targetId);
        if (target) window.scrollTo({ top: target.offsetTop - HEADER_HEIGHT, behavior: 'smooth' });
      }
      else if (index === 3 && cartBox) cartBox.classList.toggle('hidden'); // 4th = Cart
    });
  });

  if (cartClose && cartBox) {
    cartClose.addEventListener('click', () => cartBox.classList.add('hidden'));
  }

  /* === Cart Functionality === */
  const cart = document.getElementById("cart");
  const cartCount = document.getElementById("cart-count");
  const cartItemsContainer = document.querySelector("#cart-box .cart-items");
  const cartTotalEl = document.getElementById("cart-total");
  let count = 0;
  const cartData = {};

  document.querySelectorAll(".add-cart-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const box = e.target.closest(".box");
      const title = box.querySelector(".box-title").textContent;
      const price = parseInt(box.getAttribute("data-price"), 10);

      // Fly-to-cart animation
      const img = box.querySelector("img");
      const imgClone = img.cloneNode(true);
      const rect = img.getBoundingClientRect();
      imgClone.style.position = "fixed";
      imgClone.style.left = rect.left + "px";
      imgClone.style.top = rect.top + "px";
      imgClone.style.width = rect.width + "px";
      imgClone.style.height = rect.height + "px";
      imgClone.style.transition = "all 0.8s ease-in-out";
      imgClone.style.zIndex = 1000;
      document.body.appendChild(imgClone);

      const cartRect = cart.getBoundingClientRect();
      requestAnimationFrame(() => {
        imgClone.style.left = cartRect.left + "px";
        imgClone.style.top = cartRect.top + "px";
        imgClone.style.width = "20px";
        imgClone.style.height = "20px";
        imgClone.style.opacity = 0.5;
      });

      imgClone.addEventListener("transitionend", () => {
        imgClone.remove();

        // Update count badge
        count++;
        cartCount.textContent = count;

        // Shake cart
        cart.style.transform = "translateX(-10px)";
        setTimeout(() => { cart.style.transform = "translateX(10px)"; }, 50);
        setTimeout(() => { cart.style.transform = "translateX(0)"; }, 100);

        // Add/update cart item
        if (!cartData[title]) cartData[title] = { price: price, quantity: 0 };
        cartData[title].quantity++;

        updateCartDisplay();
      });
    });
  });

  function updateCartDisplay() {
    cartItemsContainer.innerHTML = "";
    let total = 0;

    if (Object.keys(cartData).length === 0) {
      cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
      cartTotalEl.textContent = `Total: ₱0`;
      return;
    }

    Object.keys(cartData).forEach(itemName => {
      const item = cartData[itemName];
      total += item.price * item.quantity;

      const itemEl = document.createElement("div");
      itemEl.classList.add("cart-item");
      itemEl.innerHTML = `
        <span class="cart-item-name">${itemName}</span>
        <span class="cart-item-quantity">${item.quantity}x</span>
        <span class="cart-item-price">₱${item.price * item.quantity}</span>
        <button class="cart-item-minus">-</button>
      `;

      // Minus button functionality
      itemEl.querySelector(".cart-item-minus").addEventListener("click", () => {
        item.quantity--;
        count--;
        cartCount.textContent = count;

        if (item.quantity <= 0) delete cartData[itemName];
        updateCartDisplay();
      });

      cartItemsContainer.appendChild(itemEl);
    });

    cartTotalEl.textContent = `Total: ₱${total}`;
  }
});
