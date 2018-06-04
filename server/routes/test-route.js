const router = require('express').Router();
const { Pool, Client } = require('pg');
const pool = new Pool();

const toMNQuery = `SELECT 
	fc.geoid AS "geoid",
	(0-SUM(m.quantity)) AS "movement"
FROM "movement" m
JOIN "counties" fc ON m.from = fc.geoid
JOIN "states" f on fc.state_id = f.state_id
JOIN "counties" tc ON m.to = tc.geoid
JOIN "states" t on tc.state_id = t.state_id
GROUP BY fc.geoid ORDER BY fc.geoid;`

const fromMNQuery = `SELECT 
	tc.geoid AS "geoid",
	SUM(m.quantity) AS "movement"
FROM "movement" m
JOIN "counties" fc on m.from = fc.geoid
JOIN "states" f on fc.state_id = f.state_id
JOIN "counties" tc on m.to = tc.geoid
JOIN "states" t on tc.state_id = t.state_id
GROUP BY tc.geoid ORDER BY tc.geoid;`

router.get('/test',(req,res) => {
  Promise.all([
    query(toMNQuery),
    query(fromMNQuery)
  ])
  .then(values => {
    let result = {}
    values.forEach(rows => {
      rows.forEach(row => {
        if (!result[row.geoid]){
          result[row.geoid] = 0;
        }
        result[row.geoid] += parseInt(row.movement);
      })
    })
    res.send(result);
  })
  .catch(error => {
    console.log(error);
    res.status(500).send(error);
  });
});

function query(queryText) {
  return new Promise((resolve,reject) => {
    pool.connect()
    .then(client => {
      return client.query(queryText)
      .then(result => {
        client.release();
        resolve(result.rows);
      })
      .catch(error => {
        reject(error);
      })
    })
  })
}

module.exports = router;