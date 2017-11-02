const faktory = require('faktory-worker');

console.log('sending items to the queue on a 4 second interval');

faktory.connect()
  .then((client) => {
    // ensure the client shuts down gracefully
    process.on('SIGINT', () => {
      client.shutdown()
        .then(() => {
          console.log('Finished client shutdown');
          process.exit(0);
        });
    });

    // fake interval of work being pushed to the queue
    setInterval(() => {
      const args = [
        Date.now().toString(), {
          hello: 'world'
        }
      ];

      console.log('pushed to queue', args);

      client.push({
        queue: 'default', // `default` if omitted
        jobtype: process.env.JOB_TYPE, // push these args with the "process.env.JOB_TYPE" type
        args
      });
    }, 4000);
  });