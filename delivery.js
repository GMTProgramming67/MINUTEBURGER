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
  const HEADER_HEIGHT = 105;
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
      else if (index === 2 && cartBox) cartBox.classList.toggle('hidden');
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
  const TRANSITION_MS = 800;

  document.querySelectorAll(".add-cart-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();

      const button = e.currentTarget;
      if (button.dataset.busy === "1") return;
      button.dataset.busy = "1";
      setTimeout(() => { delete button.dataset.busy; }, 300);

      const box = button.closest(".box");
      const title = box.querySelector(".box-title").textContent.trim();
      const price = parseInt(box.getAttribute("data-price"), 10) || 0;
      const imgEl = box.querySelector("img");
      const imgSrc = imgEl ? imgEl.getAttribute("src") : "";

      // Fly-to-cart animation starting at + button position
      if (imgEl) {
        const imgClone = imgEl.cloneNode(true);

        const btnRect = button.getBoundingClientRect();
        imgClone.style.position = "fixed";
        imgClone.style.left = btnRect.left + "px";
        imgClone.style.top = btnRect.top + "px";
        imgClone.style.width = "40px";
        imgClone.style.height = "40px";
        imgClone.style.transition = "all " + (TRANSITION_MS / 1000) + "s ease-in-out";
        imgClone.style.zIndex = 10000;
        document.body.appendChild(imgClone);

        const cartRect = cart.getBoundingClientRect();
        requestAnimationFrame(() => {
          imgClone.style.left = cartRect.left + "px";
          imgClone.style.top = cartRect.top + "px";
          imgClone.style.width = "20px";
          imgClone.style.height = "20px";
          imgClone.style.opacity = "0.5";
        });

        setTimeout(() => {
          if (imgClone && imgClone.parentNode) imgClone.parentNode.removeChild(imgClone);

          if (!cartData[title]) cartData[title] = { price: price, quantity: 0, img: imgSrc };
          cartData[title].quantity++;

          count = Object.values(cartData).reduce((s, it) => s + (it.quantity || 0), 0);
          cartCount.textContent = count;

          cart.style.transform = "translateX(-10px)";
          setTimeout(() => { cart.style.transform = "translateX(10px)"; }, 50);
          setTimeout(() => { cart.style.transform = "translateX(0)"; }, 100);

          updateCartDisplay();
        }, TRANSITION_MS + 50);
      } else {
        if (!cartData[title]) cartData[title] = { price: price, quantity: 0, img: "" };
        cartData[title].quantity++;
        count = Object.values(cartData).reduce((s, it) => s + (it.quantity || 0), 0);
        cartCount.textContent = count;

        cart.style.transform = "translateX(-10px)";
        setTimeout(() => { cart.style.transform = "translateX(10px)"; }, 50);
        setTimeout(() => { cart.style.transform = "translateX(0)"; }, 100);

        updateCartDisplay();
      }
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
        <img src="${item.img || 'placeholder.jpg'}" alt="${itemName}">
        <div class="cart-item-info">
          <div class="cart-item-name">${itemName}</div>
          <div class="cart-item-meta">
            <span class="cart-item-quantity">${item.quantity}x</span>
            <button class="cart-item-minus">-</button>
          </div>
        </div>
        <div class="cart-item-price">₱${item.price * item.quantity}</div>
      `;

      const minusBtn = itemEl.querySelector(".cart-item-minus");
      minusBtn.addEventListener("click", () => {
        item.quantity--;
        if (item.quantity <= 0) delete cartData[itemName];

        count = Object.values(cartData).reduce((s, it) => s + (it.quantity || 0), 0);
        cartCount.textContent = count;

        updateCartDisplay();
      });

      cartItemsContainer.appendChild(itemEl);
    });

    cartTotalEl.textContent = `Total: ₱${total}`;
  }
});
/* === Draggable Cart Box (robust, pointer events, auto-initializes) === */
document.addEventListener('DOMContentLoaded', () => {
  const cartBox = document.getElementById('cart-box') || document.querySelector('.cart-box');
  if (!cartBox) return;

  // Use the header as the drag handle if available
  const handle = cartBox;

  // If the cart is currently centered with transform, convert that to left/top so dragging works.
  const cs = window.getComputedStyle(cartBox);
  const rect = cartBox.getBoundingClientRect();
  if (!cartBox.style.left || !cartBox.style.top || (cs.transform && cs.transform !== 'none')) {
    cartBox.style.left = rect.left + 'px';
    cartBox.style.top  = rect.top + 'px';
    cartBox.style.right = 'auto';
    cartBox.style.bottom = 'auto';
    cartBox.style.transform = 'none'; // remove translate(...) centering if present
    cartBox.style.position = 'fixed';
  } else {
    // ensure we have pixel values (fallback)
    cartBox.style.position = 'fixed';
  }

  // Dragging state
  let dragging = false;
  let startX = 0, startY = 0;
  let origLeft = 0, origTop = 0;

  // Make handle show grab cursor
  handle.style.cursor = 'grab';

  // pointerdown covers mouse & touch in one API
  handle.addEventListener('pointerdown', (e) => {
    // ignore non-left clicks
    if (e.button && e.button !== 0) return;

    // if user clicks an interactive element inside (button, input, etc.), don't start drag
    const ignoreTags = ['button','input','a','select','textarea','label'];
    if (ignoreTags.includes(e.target.tagName.toLowerCase())) return;

    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    origLeft = parseFloat(cartBox.style.left) || 0;
    origTop  = parseFloat(cartBox.style.top) || 0;

    // pointer capture so we keep receiving events
    try { handle.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }

    cartBox.style.transition = 'none';
    handle.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  });

  // Move
  document.addEventListener('pointermove', (e) => {
    if (!dragging) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    let newLeft = origLeft + dx;
    let newTop  = origTop + dy;

    // Constrain inside the viewport (optional, prevents the cart from being dragged off-screen)
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const boxRect = cartBox.getBoundingClientRect();
    newLeft = Math.min(Math.max(0, newLeft), Math.max(0, vw - boxRect.width));
    newTop  = Math.min(Math.max(0, newTop),  Math.max(0, vh - boxRect.height));

    cartBox.style.left = Math.round(newLeft) + 'px';
    cartBox.style.top  = Math.round(newTop)  + 'px';
  });

  // End dragging
  document.addEventListener('pointerup', (e) => {
    if (!dragging) return;
    dragging = false;
    try { handle.releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    cartBox.style.transition = ''; // restore any CSS transition
    handle.style.cursor = 'grab';
    document.body.style.userSelect = '';
  });

  // If the user hides/shows the cart via your existing code, it will still keep left/top pos.
  // OPTIONAL: snap-to-edge on release (uncomment to enable)
  /*
  document.addEventListener('pointerup', () => {
    if (!dragging) return;
    dragging = false;
    const vw = window.innerWidth;
    const boxRect = cartBox.getBoundingClientRect();
    const left = parseFloat(cartBox.style.left) || 0;
    // snap to left or right whichever is closer
    const snapLeft = (left < vw/2);
    cartBox.style.transition = 'left 0.18s ease, top 0.18s ease';
    cartBox.style.left = (snapLeft ? 10 : (vw - boxRect.width - 10)) + 'px';
  });
  */
});
document.addEventListener('DOMContentLoaded', () => {
  const cartBox = document.getElementById('cart-box') || document.querySelector('.cart-box');
  if (!cartBox) return;

  // --- Create resize handles ---
  const resizers = ['se','e','s','ne','nw','n','w','sw'].map(dir => {
    const div = document.createElement('div');
    div.className = 'resizer resizer-' + dir;
    cartBox.appendChild(div);
    return div;
  });

  let resizing = false;
  let resizeDir = '';
  let startX = 0, startY = 0, startW = 0, startH = 0, startL = 0, startT = 0;

  resizers.forEach(handle => {
    handle.addEventListener('pointerdown', (e) => {
      e.stopPropagation(); // don’t trigger dragging
      resizing = true;
      resizeDir = [...handle.classList].find(c => c.startsWith('resizer-')).replace('resizer-','');

      startX = e.clientX;
      startY = e.clientY;
      startW = cartBox.offsetWidth;
      startH = cartBox.offsetHeight;
      startL = parseFloat(cartBox.style.left) || cartBox.getBoundingClientRect().left;
      startT = parseFloat(cartBox.style.top)  || cartBox.getBoundingClientRect().top;

      try { handle.setPointerCapture(e.pointerId); } catch(err) {}
      document.body.style.userSelect = 'none';
    });
  });

  document.addEventListener('pointermove', (e) => {
    if (!resizing) return;

    let dx = e.clientX - startX;
    let dy = e.clientY - startY;

    if (resizeDir.includes('e')) {
      cartBox.style.width = Math.max(150, startW + dx) + 'px';
    }
    if (resizeDir.includes('s')) {
      cartBox.style.height = Math.max(250, startH + dy) + 'px';
    }
    if (resizeDir.includes('w')) {
      cartBox.style.width = Math.max(150, startW - dx) + 'px';
      cartBox.style.left = (startL + dx) + 'px';
    }
    if (resizeDir.includes('n')) {
      cartBox.style.height = Math.max(250, startH - dy) + 'px';
      cartBox.style.top = (startT + dy) + 'px';
    }
  });

  document.addEventListener('pointerup', (e) => {
    if (resizing) {
      resizing = false;
      resizeDir = '';
      document.body.style.userSelect = '';
    }
  });
});

