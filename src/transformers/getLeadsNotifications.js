module.exports = (totalCount, listCount) => ({
  meta: {
    total: totalCount,
    count: listCount,

  },
  id: 'id',
  attributes: ['expired_at', 'owner_by', 'name', 'sources'],
  keyForAttribute: 'snake_case',
  sources: {
    ref: 'id',
    included: true,
    attributes: ['id', 'label'],
  },
});
