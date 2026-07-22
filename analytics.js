// O ID de medição é público por natureza; nenhuma credencial fica neste arquivo.
var GOOGLE_ANALYTICS_ID = 'G-F7VFWPM4LR';
var analyticsIniciado = false;
var eventosConfigurados = false;

window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }

function armazenamentoDisponivel() {
  try {
    return window.localStorage;
  } catch (erro) {
    return null;
  }
}

function configurarEventos() {
  if (eventosConfigurados) return;
  eventosConfigurados = true;

  function trackClicks(selector, eventName) {
    document.querySelectorAll(selector).forEach(function (link) {
      link.addEventListener('click', function () {
        if (!analyticsIniciado) return;
        gtag('event', eventName, {
          event_category: 'engagement',
          event_label: link.id || link.getAttribute('aria-label') || link.textContent.trim() || eventName
        });
      });
    });
  }

  trackClicks('a[href*="api.whatsapp.com"], a[href*="wa.me"]', 'whatsapp_click');
  trackClicks('a[href*="instagram.com"]', 'instagram_click');
  trackClicks('a[href="#section-tendencias"]', 'ver_colecao_click');
}

function iniciarAnalytics() {
  if (analyticsIniciado) return;
  analyticsIniciado = true;

  // O script de terceiros ainda não existe neste ponto. O consentimento é
  // atualizado antes de qualquer requisição sair do navegador.
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });
  gtag('consent', 'update', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });
  gtag('js', new Date());
  gtag('config', GOOGLE_ANALYTICS_ID);

  var scriptGoogle = document.createElement('script');
  scriptGoogle.async = true;
  scriptGoogle.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GOOGLE_ANALYTICS_ID);
  document.head.appendChild(scriptGoogle);
  configurarEventos();
}

document.addEventListener('DOMContentLoaded', function () {
  var banner = document.getElementById('cookie-banner');
  var aceitar = document.getElementById('cookie-aceitar');
  var rejeitar = document.getElementById('cookie-rejeitar');
  var armazenamento = armazenamentoDisponivel();
  if (!banner || !aceitar || !rejeitar) return;

  var consentimento = armazenamento ? armazenamento.getItem('consentimento_cookies') : null;
  if (consentimento === 'aceito') {
    iniciarAnalytics();
  } else if (!consentimento) {
    banner.hidden = false;
  }

  aceitar.addEventListener('click', function () {
    if (armazenamento) armazenamento.setItem('consentimento_cookies', 'aceito');
    iniciarAnalytics();
    banner.hidden = true;
  });

  rejeitar.addEventListener('click', function () {
    if (armazenamento) armazenamento.setItem('consentimento_cookies', 'rejeitado');
    banner.hidden = true;
  });
});
