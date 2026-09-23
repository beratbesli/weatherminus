import assert from 'node:assert/strict';
import test from 'node:test';
import { getBrowserLocation } from '../src/services/browserLocation.ts';

test('uses coordinates supplied after browser geolocation permission', async () => {
  let options;
  const browserGeolocation = {
    getCurrentPosition(success, _error, requestedOptions) {
      options = requestedOptions;
      success({ coords: { latitude: 41.67, longitude: 26.56 } });
    },
  };

  assert.deepEqual(await getBrowserLocation(browserGeolocation), {
    latitude: 41.67,
    longitude: 26.56,
  });
  assert.deepEqual(options, {
    enableHighAccuracy: false,
    timeout: 10000,
    maximumAge: 300000,
  });
});

test('rejects denied or unavailable browser geolocation', async () => {
  await assert.rejects(getBrowserLocation(null), /unavailable/);
  const denied = {
    getCurrentPosition(_success, error) {
      error(new Error('permission denied'));
    },
  };
  await assert.rejects(getBrowserLocation(denied), /permission denied/);
});
