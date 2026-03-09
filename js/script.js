(() => {
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const notify = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'error' : ''}`;
    toast.textContent = message;
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
  };

  const createModal = ({ title, fields, onSubmit }) => {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox open';
    overlay.innerHTML = `
      <section class="section-card" style="width:min(92vw,460px)">
        <h2 class="section-title">${title}</h2>
        <form id="dynamic-modal-form"></form>
        <div class="button-row" style="margin-top:.75rem">
          <button class="btn" type="submit" form="dynamic-modal-form">Submit</button>
          <button class="btn secondary" type="button" data-close>Close</button>
        </div>
      </section>
    `;

    const form = overlay.querySelector('#dynamic-modal-form');
    fields.forEach((field) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'field';
      wrapper.innerHTML = `<label for="${field.id}">${field.label}</label>`;
      const input = field.type === 'textarea'
        ? document.createElement('textarea')
        : document.createElement('input');
      input.id = field.id;
      input.name = field.name;
      input.required = true;
      if (field.type && field.type !== 'textarea') input.type = field.type;
      if (field.type === 'number') input.min = '1';
      if (field.value) input.value = field.value;
      wrapper.appendChild(input);
      form.appendChild(wrapper);
    });

    overlay.querySelector('[data-close]').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) overlay.remove();
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      onSubmit(new FormData(form), overlay);
    });

    document.body.appendChild(overlay);
    const first = form.querySelector('input, textarea');
    if (first) first.focus();
  };

  window.signUp = () => {
    createModal({
      title: 'Sign up',
      fields: [
        { id: 'signup-name', name: 'name', label: 'Name', type: 'text' },
        { id: 'signup-email', name: 'email', label: 'Email', type: 'email' }
      ],
      onSubmit: (data, overlay) => {
        const email = `${data.get('email') || ''}`.trim();
        if (!EMAIL_REGEX.test(email)) {
          notify('Please enter a valid email.', 'error');
          return;
        }
        overlay.remove();
        notify('Thanks for signing up. We’ll be in touch soon.');
      }
    });
  };

  window.order = () => {
    createModal({
      title: 'Place order',
      fields: [
        { id: 'order-name', name: 'name', label: 'Name', type: 'text' },
        { id: 'order-email', name: 'email', label: 'Email', type: 'email' },
        { id: 'order-product', name: 'product', label: 'Product', type: 'text' },
        { id: 'order-qty', name: 'quantity', label: 'Quantity', type: 'number', value: '1' }
      ],
      onSubmit: (data, overlay) => {
        const email = `${data.get('email') || ''}`.trim();
        if (!EMAIL_REGEX.test(email)) {
          notify('Please enter a valid email.', 'error');
          return;
        }
        overlay.remove();
        notify('Order request received. Our sales team will contact you.');
      }
    });
  };

  const setFieldError = (input, message) => {
    const field = input.closest('.field');
    const errorEl = field?.querySelector('.field-error');
    if (!errorEl) return;
    errorEl.textContent = message || '';
  };

  const validateForm = (form) => {
    let valid = true;
    const fields = form.querySelectorAll('input, select, textarea');
    fields.forEach((input) => {
      const value = input.value.trim();
      let message = '';

      if (input.hasAttribute('required') && !value) {
        message = 'This field is required.';
      } else if (input.type === 'email' && value && !EMAIL_REGEX.test(value)) {
        message = 'Please enter a valid email address.';
      } else if (input.id.toLowerCase().includes('phone') && value && value.length < 7) {
        message = 'Please enter a valid phone number.';
      }

      setFieldError(input, message);
      if (message) valid = false;
    });

    return valid;
  };

  const bindForm = (selector, successMessage) => {
    const form = document.querySelector(selector);
    if (!form) return;

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!validateForm(form)) {
        notify('Please correct highlighted fields.', 'error');
        return;
      }
      form.reset();
      form.querySelectorAll('.field-error').forEach((el) => { el.textContent = ''; });
      notify(successMessage);
    });

    form.querySelectorAll('input, select, textarea').forEach((input) => {
      input.addEventListener('blur', () => validateForm(form));
    });
  };

  const bindQuotes = () => {
    document.querySelectorAll('.quote').forEach((button) => {
      button.addEventListener('click', () => {
        notify('Thanks! We will contact you with a tailored quote.');
      });
    });
  };

  const bindSearch = () => {
    const input = document.getElementById('searchBar');
    if (!input) return;
    const cards = document.querySelectorAll('#products .card');

    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      cards.forEach((card) => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(query) ? '' : 'none';
      });
    });
  };

  const setupGallery = () => {
    const gallery = document.getElementById('gallery');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    if (!gallery || !lightbox || !lightboxImg) return;

    const images = Array.from(gallery.querySelectorAll('img'));
    let index = 0;

    const openAt = (i) => {
      index = (i + images.length) % images.length;
      lightboxImg.src = images[index].src;
      lightboxImg.alt = images[index].alt;
      lightbox.classList.add('open');
    };

    const close = () => lightbox.classList.remove('open');

    images.forEach((img, i) => img.addEventListener('click', () => openAt(i)));
    lightbox.querySelector('.close')?.addEventListener('click', close);
    lightbox.querySelector('.prev')?.addEventListener('click', () => openAt(index - 1));
    lightbox.querySelector('.next')?.addEventListener('click', () => openAt(index + 1));
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) close();
    });
    document.addEventListener('keydown', (event) => {
      if (!lightbox.classList.contains('open')) return;
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowLeft') openAt(index - 1);
      if (event.key === 'ArrowRight') openAt(index + 1);
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    bindForm('#contact-form', 'Message sent successfully. We’ll get back to you soon.');
    bindForm('#enquiryForm', 'Enquiry submitted. Thank you for contacting us.');
    bindQuotes();
    bindSearch();
    setupGallery();
  });
})();
