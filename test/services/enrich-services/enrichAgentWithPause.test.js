const enrichAgentWithPause = require('../../../src/services/enrich-services/enrichAgentWithPause');

describe('Service [enrichAgentWithPause]', () => {
  test('Should enrich agents with pause', () => {
    const agents = [
      { kw_uid: 1 },
      { kw_uid: 2 },
    ];
    const pausedAgents = [
      { agent_kwuid: 1, pause_until_ts: 1584030276747 },
    ];

    enrichAgentWithPause(agents, pausedAgents);

    expect(agents).toStrictEqual([
      { kw_uid: 1, pause_until_ts: 1584030276747 },
      { kw_uid: 2, pause_until_ts: 0 },
    ]);
  });
});
