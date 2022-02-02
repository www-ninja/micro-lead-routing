const moment = require('moment');
const { extractActiveDays } = require('leadrouting-common/services');

const SECONDS_IN_HOUR = 3600;
const DAY_DURATION_IN_SECONDS = 86400;
const WEEK_DURATION_IN_SECONDS = DAY_DURATION_IN_SECONDS * 7;

const getSecondsFromStartOfDay = (momentObj) => momentObj.hour() * SECONDS_IN_HOUR
  + momentObj.minute() * 60
  + momentObj.second();

/**
 * Get route schedule
 * @param {number} activeDaysMask
 * @param {number} from
 * @param {number} until
 * @param {string} tz
 * @param {number} routeId
 * @return {(T | {route_id: *})[]}
 */
const initRouteSchedule = (activeDaysMask, from, until, tz, routeId) => {
  // TODO: support non-integer timezones
  const parsedTimezoneHours = parseInt(tz.replace(/UTC/, ''), 10) || 0;
  const msToShift = -parsedTimezoneHours * SECONDS_IN_HOUR * 1000;

  // eslint-disable-next-line prefer-const
  let [utcTimeframeFrom, utcTimeframeUntil] = from === 0 || until === 0
    ? [0, DAY_DURATION_IN_SECONDS - 1]
    : [getSecondsFromStartOfDay(moment.utc(from + msToShift)),
      getSecondsFromStartOfDay(moment.utc(until + msToShift)) - 1];
  if (utcTimeframeFrom > utcTimeframeUntil) {
    utcTimeframeUntil += DAY_DURATION_IN_SECONDS;
  }

  const activeDaysIndexes = extractActiveDays(activeDaysMask);
  const schedule = activeDaysIndexes.map((dayIndex) => ({
    route_id: routeId,
    active_from: utcTimeframeFrom + dayIndex * DAY_DURATION_IN_SECONDS,
    active_until: utcTimeframeUntil + dayIndex * DAY_DURATION_IN_SECONDS,
  // eslint-disable-next-line no-confusing-arrow
  })).sort((a, b) => a.active_until - b.active_until);
  const zippedSchedule = schedule.reduce((acc, curr) => {
    if (!acc) return [curr];
    const prev = acc[acc.length - 1];

    if (curr.active_from - prev.active_until > 1) return [...acc, curr];
    prev.active_until = curr.active_until;

    return acc;
  }, null);

  const lastRange = zippedSchedule[zippedSchedule.length - 1];
  if (lastRange.active_until > WEEK_DURATION_IN_SECONDS) { // handling next week overflow
    zippedSchedule.unshift({
      route_id: routeId,
      active_from: 0,
      active_until: lastRange.active_until - WEEK_DURATION_IN_SECONDS,
    });
    lastRange.active_until = WEEK_DURATION_IN_SECONDS - 1;
  }

  return zippedSchedule;
};

module.exports = initRouteSchedule;
