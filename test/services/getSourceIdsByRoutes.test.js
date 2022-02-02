const getSourceIdsByRoutes = require('../../src/services/getSourceIdsByRoutes');
// const { clearDatabase } = require('../utils/db-handler');

describe('Service [getSourceIdsByRoutes]', () => {
  beforeEach(async (done) => {
    done();
  });
  test('Should extract ids of sources from aray of routes', () => {
    const routes = [{
      route_sources: [{ source_id: 1 }, { source_id: 2 }],
    }, {
      route_sources: [{ source_id: 3 }, { source_id: 4 }],
    }];
    const idsOfSources = getSourceIdsByRoutes(routes);

    expect(idsOfSources).toStrictEqual([1, 2, 3, 4]);
  });

  test('Should extract only unique ids', () => {
    const routes = [{
      route_sources: [{ source_id: 1 }],
    }, {
      route_sources: [{ source_id: 1 }],
    }, {
      route_sources: [{ source_id: 1 }],
    }];
    const idsOfSources = getSourceIdsByRoutes(routes);

    expect(idsOfSources).toStrictEqual([1]);
  });
});
