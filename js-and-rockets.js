const SPACEX_API_URL = 'https://api.spacexdata.com/v3';
const NASA = 'NASA';

// Get data
const getAPI = url => endpoint => cb =>
    fetch(`${url}${endpoint}`)
        .then(res => res.json())
        .then(data => cb(data))
        .catch(err => console.error(err.message));

const getFromSpaceX = getAPI(SPACEX_API_URL);
const getLaunchesPast = getFromSpaceX('/launches/past');

// Prepare data
const checkCustomer = customer => value => {
  const regex = new RegExp(customer,"g");
  return value.match(regex) !== null;
}
const filterByYear = year => data => data.filter(value => parseInt(value.launch_year) === year);
const filterByCustomer = customer => data => data.filter((value) => {
  return value.rocket.second_stage.payloads.find(stages => stages.customers.some(value => checkCustomer(customer)(value)));
});
const sortByAmount = (missions, property) => missions.sort((prev, next) => prev[property] - next[property]).reverse();

const reduceData = data => data.reduce((acc, value) => {
  acc.push({
    flight_number: value.flight_number,
    mission_name: value.mission_name,
    payloads_count: value.rocket.second_stage.payloads.length
  });
  return acc;
}, []);

export const prepareData = (payload) => {
  const byYear = filterByYear(2018)(payload);
  const byCustomer = filterByCustomer(NASA)(byYear);
  const reduced = reduceData(byCustomer);
  return sortByAmount(reduced, 'payloads_count');
};

export const renderData = (data) => document.querySelector('#out').innerHTML = JSON.stringify(data, null, 2);

export const init = () => {
  getLaunchesPast(data => {
    renderData(prepareData(data));
  });
};
