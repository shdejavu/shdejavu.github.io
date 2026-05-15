const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector(".nav-toggle");
const year = document.querySelector("[data-year]");

if (year) {
  year.textContent = new Date().getFullYear();
}

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

navToggle?.addEventListener("click", () => {
  const isOpen = nav?.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

const sections = Array.from(document.querySelectorAll("main section[id]"));
const navLinks = new Map(
  Array.from(document.querySelectorAll(".nav-links a[href^='#']")).map((link) => [
    link.getAttribute("href")?.slice(1),
    link,
  ]),
);

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => link.classList.remove("is-active"));
        navLinks.get(entry.target.id)?.classList.add("is-active");
      });
    },
    { rootMargin: "-30% 0px -55% 0px", threshold: 0.01 },
  );

  sections.forEach((section) => observer.observe(section));
}

const canvas = document.querySelector("[data-material-map]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canvas && !prefersReducedMotion) {
  const ctx = canvas.getContext("2d");
  const points = [];
  const palette = ["#d68a54", "#66b8a8", "#d0b15e", "#af4c43"];
  let width = 0;
  let height = 0;
  let frame = 0;

  const resize = () => {
    const ratio = window.devicePixelRatio || 1;
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    points.length = 0;
    const count = Math.max(36, Math.floor((width * height) / 28000));
    for (let i = 0; i < count; i += 1) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: 1.2 + Math.random() * 2.2,
        color: palette[i % palette.length],
      });
    }
  };

  const draw = () => {
    frame += 1;
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "source-over";

    for (const p of points) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;
    }

    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const a = points[i];
        const b = points[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 145) {
          ctx.strokeStyle = `rgba(246, 244, 238, ${0.11 * (1 - dist / 145)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const p of points) {
      const pulse = Math.sin(frame * 0.018 + p.x * 0.01) * 0.35;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.68;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r + pulse, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(draw);
  };

  resize();
  window.addEventListener("resize", resize, { passive: true });
  requestAnimationFrame(draw);
}
