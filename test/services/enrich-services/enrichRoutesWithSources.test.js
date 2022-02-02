const enrichRoutesWithSources = require('../../../src/services/enrich-services/enrichRoutesWithSources');

describe('Service [enrichRoutesWithSources]', () => {
  test('Should enrich routes with sources', () => {
    const routes = [
      { route_sources: [{ source_id: 1 }, { source_id: 2 }] },
      { route_sources: [{ source_id: 3 }] },
    ];
    const sources = [
      { id: '1', label: 'Facebook' },
      { id: '2', label: 'Instagram' },
      { id: '3', label: 'Twitter' },
    ];

    enrichRoutesWithSources(routes, sources);

    expect(routes).toStrictEqual([
      { route_sources: [{ id: '1', label: 'Facebook' }, { id: '2', label: 'Instagram' }] },
      { route_sources: [{ id: '3', label: 'Twitter' }] },
    ]);
  });

  test('Should enrich routes with sources', () => {
    const routes = [
      { route_sources: [{ source_id: 3 }] },
    ];
    const sources = [
      { id: '1', label: 'Facebook' },
    ];

    enrichRoutesWithSources(routes, sources);

    expect(routes).toStrictEqual([{ route_sources: [] }]);
  });
});
