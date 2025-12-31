/**
 * Mock GPT for testing APG tag without a real GAM setup.
 * - Provides googletag.apiReady=true
 * - Provides googletag.cmd.push(fn) to execute immediately
 * - Supports pubads().addEventListener('slotRenderEnded', cb)
 * - Supports pubads().getSlots() for wrong_network tests
 */
(function () {
  const state = {
    enabled: false,
    listeners: {
      slotRenderEnded: []
    },
    slots: []
  };

  function makeSlot(slotId, adUnitPath) {
    return {
      getSlotElementId: () => slotId,
      getAdUnitPath: () => adUnitPath,
      getSizes: () => ([{ getWidth: () => 300, getHeight: () => 250 }])
    };
  }

  function enableMockGpt() {
    state.enabled = true;

    // Create one "registered" slot
    state.slots = [
      makeSlot('div-gpt-ad-test-1', '/12345678/test/unit1') // network 12345678 (matches expectedNetworkId if set)
    ];

    window.googletag = window.googletag || {};
    window.googletag.apiReady = true;
    window.googletag.cmd = {
      push: function (fn) {
        try { fn(); } catch (e) {}
      }
    };

    window.googletag.pubads = function () {
      return {
        __apgStartBound: window.googletag.pubads().__apgStartBound,
        addEventListener: function (name, cb) {
          if (name === 'slotRenderEnded') state.listeners.slotRenderEnded.push(cb);
        },
        getSlots: function () {
          return state.slots.slice();
        }
      };
    };

    console.log('[mock-gpt] enabled');
  }

  function disableGpt() {
    // Simulate no GPT loaded
    state.enabled = false;
    try { delete window.googletag; } catch (_) { window.googletag = undefined; }
    console.log('[mock-gpt] disabled (googletag removed)');
  }

  // Public triggers
  window.__apgMock = {
    enableMockGpt,
    disableGpt,
    triggerSlotNotRegistered: function () {
      if (!window.googletag || !window.googletag.apiReady) {
        console.warn('[mock-gpt] enable first');
        return;
      }
      // Leave getSlots() returning only div-gpt-ad-test-1; page has other DOM slots -> triggers slot_not_registered on scan
      console.log('[mock-gpt] slot_not_registered should be detected on postLoadScan (refresh or trigger scan logic via tag timing).');
    },
    triggerWrongNetwork: function () {
      if (!window.googletag || !window.googletag.apiReady) {
        console.warn('[mock-gpt] enable first');
        return;
      }
      // Add a slot with mismatching network id
      state.slots.push(makeSlot('div-gpt-ad-test-2', '/99999999/test/unit2'));
      console.log('[mock-gpt] wrong_network slot added (network=99999999).');
    },
    triggerEmpty: function () {
      const cbs = state.listeners.slotRenderEnded.slice();
      if (!cbs.length) return console.warn('[mock-gpt] no slotRenderEnded listener registered yet (did APG tag load?)');
      const slot = makeSlot('div-gpt-ad-test-1', '/12345678/test/unit1');
      cbs.forEach(cb => cb({ slot, isEmpty: true }));
      console.log('[mock-gpt] emitted slotRenderEnded isEmpty=true');
    },
    triggerUnexpectedSize: function () {
      const cbs = state.listeners.slotRenderEnded.slice();
      if (!cbs.length) return console.warn('[mock-gpt] no slotRenderEnded listener registered yet (did APG tag load?)');
      const slot = {
        getSlotElementId: () => 'div-gpt-ad-test-1',
        getAdUnitPath: () => '/12345678/test/unit1',
        getSizes: () => ([{ getWidth: () => 300, getHeight: () => 250 }]) // defined size 300x250
      };
      cbs.forEach(cb => cb({ slot, isEmpty: false, size: [728, 90] })); // rendered size 728x90 -> unexpected
      console.log('[mock-gpt] emitted slotRenderEnded unexpected size 728x90');
    }
  };
})();
