const enrichRoutesWithAgents = require('../../../src/services/enrich-services/enrichRoutesWithAgents');

describe('Service [enrichRoutesWithAgents]', () => {
  test('Should enrich routes with agents', () => {
    const routes = [{
      route_agents: [{ agent_id: 1, weight: 50, order: 1 }, { agent_id: 2, weight: 50, order: 2 }],
    }, {
      route_agents: [{ agent_id: 3, weight: 100, order: 3 }],
    }];
    const agents = [
      { kw_uid: 1, first_name: 'Chris' },
      { kw_uid: 2, first_name: 'Shinske' },
      { kw_uid: 3, first_name: 'Mike' },
    ];

    enrichRoutesWithAgents(routes, agents);

    expect(routes).toStrictEqual([
      {
        route_agents: [{
          kw_uid: 1, first_name: 'Chris', weight: 50, order: 1,
        }, {
          kw_uid: 2, first_name: 'Shinske', weight: 50, order: 2,
        }],
      },
      {
        route_agents: [{
          kw_uid: 3, first_name: 'Mike', weight: 100, order: 3,
        }],
      },
    ]);
  });

  test('Should ignore irrelevant agents', () => {
    const routes = [{
      route_agents: [{ agent_id: 1, weight: 100 }],
    }];
    const agents = [
      { kw_uid: 2, first_name: 'Chris' },
    ];

    enrichRoutesWithAgents(routes, agents);

    expect(routes).toStrictEqual([{ route_agents: [] }]);
  });
});
