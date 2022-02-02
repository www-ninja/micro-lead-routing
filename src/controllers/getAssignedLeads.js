/* eslint-disable quote-props */
/* eslint-disable quotes */
const { Serializer } = require('jsonapi-serializer');
const moment = require('moment');
const { loggerWithPrefix } = require('leadrouting-common/libs');
const {
  getAgentById, getSources, getContacts,
} = require('leadrouting-common/requests');
const { Op: { ne, gt } } = require('sequelize');
const {
  uniq, get, isInteger, set, remove, head,
} = require('lodash');
const { LeadRoutingAgent, LeadRoutings } = require('leadrouting-common/models');
const { ALGORITHMS } = require('leadrouting-common/enums');
const { getLeadNotifications } = require('./../transformers');
const { getQueryParams, errorHandler } = require('../services');
const intToHex = require('../util/intToHex');
const { encodeToBase64 } = require('../util/base64');

const LOGGER_PREFIX = 'agent::leads::fetch =>';
const logger = loggerWithPrefix(LOGGER_PREFIX);

const getContactById = (id = "6135cc695d6473001b3f39e5") => ({
  owner: {
    type: 'TEAM',
    id: '532768',
    name: 'Kelle Test Team',
  },
  author: {
    createdBy: '556396',
    updatedBy: '556396',
  },
  name: {
    first: 'gln',
    last: 'ltest02',
    legal: 'gln ltest02',
    preferred: 'gln ltest02',
  },
  emails: {
    others: [],
  },
  phones: {
    others: [],
  },
  neighborhoods: {
    others: [],
  },
  addresses: {
    others: [],
  },
  metaData: {
    inputChannel: 'API',
  },
  contactTypes: [
    'CONTACT',
    'LEAD',
    'LEAD_ROUTE',
  ],
  inLeadRoute: false,
  createdAt: '2021-09-06T08:08:09.450Z',
  permissions: [
    {
      grantedTo: '556397',
      grantedBy: 'LEAD_POOL',
      type: 'CLAIMED',
      grantedToName: 'Irene Murphy',
      updatedAt: '2021-09-06T10:58:33.938Z',
    },
  ],
  updatedAt: '2021-09-06T10:58:38.968Z',
  customFields: [],
  socialAccounts: [],
  relationships: [],
  id,
  sourcedObject: {
    data: {
      source: {
        owner: {
          type: 'org',
          id: '532768',
        },
        id: '2010491',
        label: 'yf weighted random',
        type: 'source',
      },
      hide: false,
      createdAt: '2021-09-06T08:08:09.648Z',
      updatedAt: '2021-09-06T08:08:09.648Z',
      updatedBy: '556396',
      id: `contacts-${id}`,
    },
  },
  taggedObject: [],
  healthScore: 0.24000000000000002,
});


module.exports = async (req, res, next) => {
  try {
    const {
      params: { agentId },
      headers: { authorization },
    } = req;

    const userId = req.user.id;

    if (userId !== agentId) {
      throw errorHandler(`Mismatch authorization token ${userId} and agentId query params ${agentId}`, 401);
    }

    logger.info(`start: ${JSON.stringify({ agentId })}`);
    const now = moment().utc().format('YYYY-MM-DD HH:mm:ss');
    const availableLeads = await LeadRoutingAgent.findAndCountAll({
      where: {
        agent_kwuid: agentId,
        passed_at: null,
        notified_at: { [ne]: null },
      },
      distinct: true,
      include: [{
        model: LeadRoutings,
        required: true,
        where: {
          claimed_by_kwuid: null,
          route_algorithm: { [ne]: ALGORITHMS.ATA },
          to_check_at: { [gt]: now },
        },
      }],
      order: [[LeadRoutings, 'created_at', 'DESC']],
      ...getQueryParams(req),
    });

    remove(availableLeads.rows, (row) => String(row.agent_kwuid) !== String(agentId));
    remove(availableLeads.rows, (row) => row.passed_at);
    remove(availableLeads.rows, (row) => (moment(row.notified_at || 0).unix() + (row.lead_routing.route_round_delay || 0)) < moment(now).unix());
    const serializer = new Serializer(
      'leadNotification',
      getLeadNotifications(availableLeads.rows.length, availableLeads.rows.length),
    );

    if (!availableLeads.rows.length) {
      return res.send(serializer.serialize([]));
    }

    const {
      sourceIds,
      leadOwnerIds,
      leadIds,
    } = availableLeads.rows.reduce((obj, lead) => {
      const currentSourceIds = lead.lead_routing.lead_source_ids.split(',');
      obj.leadOwnerIds.push(lead.lead_routing.lead_owner_kwuid);
      obj.leadIds.push(lead.lead_routing.lead_id);
      return {
        sourceIds: [...obj.sourceIds, ...currentSourceIds],
        leadOwnerIds: [...obj.leadOwnerIds],
        leadIds: [...obj.leadIds],
      };
    }, {
      sourceIds: [],
      leadOwnerIds: [],
      leadIds: [],
    });

    leadIds.map((leadId) => (isInteger(+leadId) ? intToHex(leadId, 24) : leadId));

    const query = { "filter": [{ "id": { "in": leadIds } }] };
    const flags = {
      "version": 1,
      "onlyArchived": false,
      "withArchived": false,
      "onlyLeadRoute": true,
    };
    const base64Filter = encodeToBase64(query, flags);
    logger.info(`base64 filter to get unassigned contact teams: ${base64Filter}`);
    const headers = {
      authorization,
      'x-api-contacts': process.env.X_API_CONTACTS_TOKEN,
      'Content-Type': 'application/json',
    };

    // let { data: contacts } = await getContacts(
    //   headers,
    //   base64Filter,
    // );

    let contacts = leadIds.map((id) => getContactById(id));

    if (!contacts.length) {
      set(serializer, 'opts.meta.total', 0);
      set(serializer, 'opts.meta.count', 0);
      return res.send(serializer.serialize([]));
    }

    contacts = contacts.reduce((obj, contact) => ({
      ...obj,
      [contact.id]: contact,
    }), {});

    // TODO: rewrite next code when will be ready bulk API for get contacts
    const leadOwners = {};
    const uniqueIds = uniq(leadOwnerIds);
    // TODO: this loop is hack, remove it
    /* eslint-disable no-await-in-loop */
    for (let i = 0; uniqueIds.length > i; i += 1) {
      const ownerData = await getAgentById(uniqueIds[i]);
      if (ownerData) leadOwners[ownerData.kw_uid] = ownerData;
    }

    const uniqueSourceIds = uniq(sourceIds.map((sourceId) => +sourceId));
    let sourcesData;
    if (uniqueSourceIds.length) {
      headers['x-kwri-org'] = get(head(availableLeads.rows), 'lead_routing.route_team_id');
      sourcesData = (await getSources(headers, uniqueSourceIds))
        .reduce((obj, source) => ({
          ...obj,
          [source.id]: source,
        }), {});
    }

    const data = availableLeads.rows.map((lead) => {
      const leadRouting = lead.lead_routing.getShortData(sourcesData);
      const leadOwnerKwuid = leadOwners[lead.lead_routing.lead_owner_kwuid];
      if (!get(contacts, lead.lead_routing.lead_id)) {
        return {};
      }
      const name = decodeURI(get(
        contacts,
        `${lead.lead_routing.lead_id}.preferredName`,
        lead.lead_routing.lead_full_name,
      ) || '');
      return {
        id: lead.lead_routing.lead_id,
        expired_at: moment(lead.notified_at).unix() + lead.lead_routing.route_round_delay,
        owner_by: `${leadOwnerKwuid.first_name} ${leadOwnerKwuid.last_name}`,
        owner_kwuid: lead.lead_routing.lead_owner_kwuid,
        name,
        sources: leadRouting.sources,
      };
    }).filter(Boolean).filter((availableLead) => Object.keys(availableLead).length !== 0);

    res
      .status(200)
      .send(serializer.serialize(data));
    return logger.info(`success: ${JSON.stringify(data)}`);
  } catch (e) {
    return next(e);
  }
};
