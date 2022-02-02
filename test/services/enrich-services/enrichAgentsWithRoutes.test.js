const enrichAgentsWithRoutes = require('../../../src/services/enrich-services/enrichAgentsWithRoutes');

describe('Service [enrichAgentsWithRoutes]', () => {
  test('Should enrich agents with routes', () => {
    const agents = [
      { kw_uid: 1 },
      { kw_uid: 2 },
      { kw_uid: 3 },
    ];
    const routes = [
      { id: 1, route_agents: [{ agent_id: 1, weight: 100 }] },
      { id: 2, route_agents: [{ agent_id: 2, weight: 50 }, { agent_id: 3, weight: 50 }] },
    ];

    enrichAgentsWithRoutes(agents, routes);

    /* eslint-disable max-len */
    expect(agents).toStrictEqual([
      { kw_uid: 1, routes: [{ id: 1, route_agents: [{ agent_id: 1, weight: 100 }] }] },
      { kw_uid: 2, routes: [{ id: 2, route_agents: [{ agent_id: 2, weight: 50 }, { agent_id: 3, weight: 50 }] }] },
      { kw_uid: 3, routes: [{ id: 2, route_agents: [{ agent_id: 2, weight: 50 }, { agent_id: 3, weight: 50 }] }] },
    ]);
  });

  test('Should ignore irrelevant routes', () => {
    const agents = [
      { kw_uid: 1 },
    ];
    const routes = [
      { id: 1, route_agents: [{ agent_id: 2, weight: 100 }] },
    ];

    enrichAgentsWithRoutes(agents, routes);

    expect(agents).toStrictEqual([{ kw_uid: 1, routes: [] }]);
  });
});
