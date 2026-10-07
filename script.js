/* =========================================================
   Тёпка — интерактив
   1. Мобильное меню
   2. Плавная прокрутка (с учётом prefers-reduced-motion)
   3. Модальное окно (фокус, Escape)
   4. Валидация форм
   ========================================================= */

(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Мобильное меню ---------- */
  const burger = document.querySelector(".burger");
  const nav = document.getElementById("nav");

  if (burger && nav) {
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    });

    // закрываем меню при клике по ссылке
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- 2. Плавная прокрутка ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();

      const header = document.querySelector(".header");
      const offset = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;

      window.scrollTo({
        top,
        behavior: prefersReduced ? "auto" : "smooth",
      });

      // доступность: переводим фокус на секцию
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });

  /* ---------- 3. Модальное окно ---------- */
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modal-title");
  const modalText = document.getElementById("modal-text");
  let lastFocused = null;

  function getFocusable(container) {
    return container.querySelectorAll(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
  }

  function openModal(courseName) {
    if (!modal) return;
    lastFocused = document.activeElement;

    if (courseName) {
      modalTitle.textContent = "Запись: " + courseName;
      modalText.textContent = "Оставьте контакты — мы свяжемся и подберём удобное время.";
    }

    modal.hidden = false;
    document.body.classList.add("modal-open");

    const focusable = getFocusable(modal);
    if (focusable.length) focusable[0].focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    if (lastFocused) lastFocused.focus();
  }

  // кнопки «Записаться» в карточках
  document.querySelectorAll(".btn--card").forEach((btn) => {
    btn.addEventListener("click", () => {
      openModal(btn.dataset.course || "");
    });
  });

  // закрытие
  if (modal) {
    modal.querySelectorAll("[data-close]").forEach((el) => {
      el.addEventListener("click", closeModal);
    });

    // Escape + ловушка фокуса
    modal.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeModal();
        return;
      }
      if (e.key === "Tab") {
        const focusable = Array.from(getFocusable(modal));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  /* ---------- 4. Валидация форм ---------- */
  const phonePattern = /^[\d\s()+-]{10,}$/;

  function showError(field, message) {
    field.setAttribute("aria-invalid", "true");
    const error = document.querySelector(`[data-error-for="${field.id}"]`);
    if (error) error.textContent = message;
  }

  function clearError(field) {
    field.removeAttribute("aria-invalid");
    const error = document.querySelector(`[data-error-for="${field.id}"]`);
    if (error) error.textContent = "";
  }

  function validateForm(form) {
    let valid = true;
    const name = form.querySelector('input[name="name"]');
    const phone = form.querySelector('input[name="phone"]');
    const course = form.querySelector('select[name="course"]');

    if (name) {
      if (!name.value.trim()) {
        showError(name, "Пожалуйста, укажите имя");
        valid = false;
      } else {
        clearError(name);
      }
    }

    if (phone) {
      if (!phone.value.trim()) {
        showError(phone, "Пожалуйста, укажите телефон");
        valid = false;
      } else if (!phonePattern.test(phone.value.trim())) {
        showError(phone, "Похоже, номер неполный");
        valid = false;
      } else {
        clearError(phone);
      }
    }

    if (course) {
      if (!course.value) {
        showError(course, "Выберите курс");
        valid = false;
      } else {
        clearError(course);
      }
    }

    return valid;
  }

  // основная форма
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validateForm(contactForm)) {
        const firstInvalid = contactForm.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      const success = document.getElementById("form-success");
      if (success) success.hidden = false;
      contactForm.reset();

      // сбрасываем сообщение через время (демо)
      setTimeout(() => {
        if (success) success.hidden = true;
      }, 6000);
    });

    // снимаем ошибку при вводе
    contactForm.querySelectorAll("input, select").forEach((el) => {
      el.addEventListener("input", () => clearError(el));
      el.addEventListener("change", () => clearError(el));
    });
  }

  // форма в модалке
  const modalForm = document.getElementById("modal-form");
  if (modalForm) {
    modalForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validateForm(modalForm)) {
        const firstInvalid = modalForm.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      const success = document.getElementById("modal-success");
      if (success) success.hidden = false;
      modalForm.reset();

      setTimeout(() => {
        if (success) success.hidden = true;
        closeModal();
      }, 1800);
    });

    modalForm.querySelectorAll("input").forEach((el) => {
      el.addEventListener("input", () => clearError(el));
    });
  }
})();