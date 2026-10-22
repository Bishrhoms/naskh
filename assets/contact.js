// Contact form: sends in place and shows the result. Without JavaScript the
// form still posts to the same service, which shows its own confirmation page.
(() => {
  const form = document.querySelector('.form');
  if (!form || !window.fetch) return;
  const status = form.querySelector('.status');
  const button = form.querySelector('button[type="submit"]');
  const label = button.textContent;

  const show = (kind, text) => {
    status.className = `status ${kind}`;
    status.textContent = text;
    status.hidden = false;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));

    // Until the Web3Forms access key is in place, hand the message to the
    // visitor's own mail app instead.
    if (!data.access_key || data.access_key === 'WEB3FORMS_ACCESS_KEY') {
      const body = [data.message, '', data.name, data.email].filter((line) => line !== undefined).join('\n').trim();
      location.href = `mailto:hello@bishr.me?subject=${encodeURIComponent(data.subject || '')}&body=${encodeURIComponent(body)}`;
      return;
    }

    button.disabled = true;
    button.textContent = form.dataset.sending;
    status.hidden = true;
    try {
      const response = await fetch(form.dataset.endpoint || form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || String(result.success) !== 'true') throw new Error(result.message);
      form.reset();
      show('success', form.dataset.success);
    } catch {
      show('error', form.dataset.error);
    } finally {
      button.disabled = false;
      button.textContent = label;
    }
  });
})();
