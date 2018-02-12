const faktory = require('faktory-worker');

console.log('sending items to the queue on a 4 second interval');

faktory.connect()
  .then((client) => {
    // fake interval of work being pushed to the queue
    setInterval(() => {
      const args = [
        Date.now().toString(), {
          hello: 'world'
        }
      ];

      client.push({
        queue: 'default', // `default` if omitted
        jobtype: process.env.JOB_TYPE, // push out this data with the "process.env.JOB_TYPE" type
        args
      })
      .catch((err) => {
        console.log(err);
      });

      console.log('pushed to queue', args);
    }, 4000);
  })
  .catch((err) => {
    console.log(err);
  });