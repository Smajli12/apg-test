(function () {
  const $ = (id) => document.getElementById(id);

  function info(msg) { console.log('[apg-test]', msg); }

  $('btn-enable-mock').addEventListener('click', () => {
    window.__apgMock && window.__apgMock.enableMockGpt();
    info('Mock GPT enabled. Refresh page once so the APG tag can bind listeners if needed.');
  });

  $('btn-disable-gpt').addEventListener('click', () => {
    window.__apgMock && window.__apgMock.disableGpt();
    info('GPT disabled. Refresh page to trigger gpt_not_loaded.');
  });

  $('btn-slot-not-registered').addEventListener('click', () => {
    window.__apgMock && window.__apgMock.triggerSlotNotRegistered();
    info('If your APG tag post-load scan already ran, refresh page to re-run scan (or clear dedupe).');
  });

  $('btn-wrong-network').addEventListener('click', () => {
    window.__apgMock && window.__apgMock.triggerWrongNetwork();
    info('Wrong-network slot injected. Refresh page so APG post-load scan catches it (or clear dedupe).');
  });

  $('btn-empty').addEventListener('click', () => {
    window.__apgMock && window.__apgMock.triggerEmpty();
  });

  $('btn-unexpected-size').addEventListener('click', () => {
    window.__apgMock && window.__apgMock.triggerUnexpectedSize();
  });

  info('Loaded. Install GTM + APG tag on this page to test end-to-end.');
})();
