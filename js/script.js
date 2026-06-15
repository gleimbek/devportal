let currentLang = "en";

function setLang(lang) {
  currentLang = lang;

  document.querySelectorAll("[data-en]").forEach(el => {
    el.textContent = el.getAttribute(`data-${lang}`);
  });
}