const initRouteSchedule = require('../../src/services/initRouteSchedule');
// const { clearDatabase } = require('../utils/db-handler');

describe('Service [initRouteSchedule]', () => {
  beforeEach(async (done) => {
    done();
  });
  test('Should extract ids of sources from aray of routes', () => {
    const routeSettings = {
      active_days: 127,
      active_from: 0,
      active_until: 0,
      timezone: 'UTC-5',
    };
    const routeSchedule = initRouteSchedule(
      routeSettings.active_days,
      routeSettings.active_from,
      routeSettings.active_until,
      routeSettings.timezone,
      0,
    );

    expect(routeSchedule).toStrictEqual([{ active_from: 0, active_until: 604799, route_id: 0 }]);
  });
});
