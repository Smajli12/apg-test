(function () {
  console.log('[apg-test] Loaded. Install GTM + APG tag on this page to test end-to-end.');

  function $(id) { return document.getElementById(id); }

  const btnEnable = $('btn-enable-mock');
  const btnDisable = $('btn-disable-gpt');

  const btnSlotNotRegistered = $('btn-slot-not-registered');
  const btnWrongNetwork = $('btn-wrong-network');
  const btnEmpty = $('btn-empty');
  const btnUnexpected = $('btn-unexpected-size');

  if (btnEnable) {
    btnEnable.addEventListener('click', function () {
      if (window.__mockGPT && typeof window.__mockGPT.enable === 'function') {
        window.__mockGPT.enable();
      } else {
        // Fallback: try calling global function if mock exposes it differently
        if (typeof window.enableMockGPT === 'function') window.enableMockGPT();
      }

      console.log('[apg-test] Mock GPT enabled. Refresh page once so the APG tag can bind listeners if needed.');

      // ✅ CRUCIAL: tell APG tag to flush googletag.cmd queue and bind listeners NOW
      window.dispatchEvent(new Event('apg:mock-gpt-enabled'));
    });
  }

  if (btnDisable) {
    btnDisable.addEventListener('click', function () {
      if (window.__mockGPT && typeof window.__mockGPT.disable === 'function') {
        window.__mockGPT.disable();
      } else {
        if (typeof window.disableMockGPT === 'function') window.disableMockGPT();
      }
      console.log('[apg-test] Mock GPT disabled.');
    });
  }

  function safeCall(fnName) {
    try {
      if (window.__mockGPT && typeof window.__mockGPT[fnName] === 'function') {
        window.__mockGPT[fnName]();
        return;
      }
      // fallback global functions (if mock exposes them)
      const g = window[fnName];
      if (typeof g === 'function') g();
    } catch (e) {
      console.warn('[apg-test] trigger failed', fnName, e);
    }
  }

  if (btnSlotNotRegistered) {
    btnSlotNotRegistered.addEventListener('click', function () {
      safeCall('triggerSlotNotRegistered');
    });
  }

  if (btnWrongNetwork) {
    btnWrongNetwork.addEventListener('click', function () {
      safeCall('triggerWrongNetwork');
    });
  }

  if (btnEmpty) {
    btnEmpty.addEventListener('click', function () {
      safeCall('triggerEmpty');
    });
  }

  if (btnUnexpected) {
    btnUnexpected.addEventListener('click', function () {
      safeCall('triggerUnexpectedSize');
    });
  }
})();
