const leadRouting = require('leadrouting-common/models/leadRoutings');
const sequelize = require('leadrouting-common/libs/sequelize');
const getSources = require('leadrouting-common/requests/getSources');
const { uniq, find, get } = require('lodash');
const moment = require('moment');
const { Op } = require('sequelize');


module.exports = async (req, res, next) => {
  const defaultStartDate = moment().startOf('month').format('YYYY-MM-DD HH:mm:ss');
  const defaultEndDate = moment().format('YYYY-MM-DD HH:mm:ss');

  const {
    query: { startDate = defaultStartDate, endDate = defaultEndDate },
    params: { teamId },
    headers: { authorization },
  } = req;

  const headers = { authorization };

  const dateQuery = {
    lead_routed_at: {
      [Op.gte]: moment(startDate).format('YYYY-MM-DD HH:mm:ss'),
      [Op.lte]: moment(endDate).format('YYYY-MM-DD HH:mm:ss'),
    },
  };

  const whereQuery = {
    route_team_id: teamId,
    ...dateQuery,
  };

  try {
    const routings = await leadRouting.findAll({
      attributes: [
        'lead_source_ids',
        [sequelize.fn('COUNT', sequelize.col('lead_id')), 'lead_count'],
      ],
      group: ['lead_source_ids'],
      where: whereQuery,
      order: [[sequelize.col('lead_count'), 'DESC']],
      limit: 10,
      raw: true,
    });

    let sourceIds = [];

    // [TODO] fix counter for multiple sources in one lead
    routings.reduce((c, routing, idx) => {
      const ids = routing.lead_source_ids.split(',');

      sourceIds = uniq(sourceIds.concat(ids.map((id) => +id)));

      return {
        ...c, [idx]: {},
      };
    }, {});

    const sourcesData = await getSources(headers, sourceIds);

    const sourceRanks = routings.reduce((rank, routing, idx) => {
      const sourceId = routing.lead_source_ids.split(',');

      const sourceData = find(sourcesData, { id: +sourceId[0] });

      const label = get(sourceData, 'label.display', undefined);

      if (label) {
        return rank.concat([
          {
            rank: idx + 1,
            id: sourceId[0],
            label,
            usage: routing.lead_count,
          },
        ]);
      }

      return rank;
    }, []);

    res.status(200).json({
      source_ranks: sourceRanks,
    });

    return;
  } catch (e) {
    next(e);
  }
};
