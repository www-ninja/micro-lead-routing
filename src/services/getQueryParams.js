const { get, head } = require('lodash');
const { Op } = require('sequelize');

const ALLOWED_FIELDS = ['source_id', 'route_id'];

// eslint-disable-next-line no-useless-escape
const sanitizeQuery = (str) => str.replace(/[&*()#$@\\\/\s]/gi, '');

const getSequelizeOp = (op) => {
  switch (op) {
    case 'is':
      return 'eq';
    case '!is':
      return 'ne';
    case 'in':
      return 'in';
    case 'gte':
      return 'gte';
    case 'gt':
      return 'gt';
    default:
      return '';
  }
};

const setFilters = (filters) => {
  const fieldNames = Object.keys(filters);
  const result = fieldNames.reduce((obj, fieldName) => {
    const operator = head(Object.keys(filters[fieldName]));
    const searchValue = get(filters, `${fieldName}.${operator}`, '');
    const value = operator === 'in' ? searchValue.split(',') : searchValue;
    const sequelizeOp = getSequelizeOp(operator);
    if (!value || !operator || !ALLOWED_FIELDS.includes(fieldName)) {
      return { ...obj };
    }
    return { ...obj, [fieldName]: { [Op[sequelizeOp]]: value } };
  }, {});

  return result;
};

const getFilters = (queryParams) => {
  const query = JSON.parse(sanitizeQuery(JSON.stringify(queryParams)));
  const filter = get(query, 'filter', '');
  if (!filter || typeof filter !== 'object') {
    return {};
  }
  const filters = setFilters(filter);
  return filters;
};

module.exports = (req) => {
  const { query } = req;
  const offset = Number(get(query, 'page.offset', 0));
  const limit = Number(get(query, 'page.limit', 10));
  const filters = getFilters(query);

  const params = { offset, limit, where: filters };

  return params;
};
