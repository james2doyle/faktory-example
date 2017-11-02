const faktory = require('faktory-worker');

console.log('working on queue items and logging their args');

// an async function that does work on items
const doWork = function(date, obj) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Doing fake work. args:', date, obj);
      resolve(1);
    }, 4000);
  });
}

// subscribe to jobs with the "process.env.JOB_TYPE" type
faktory.register(process.env.JOB_TYPE, doWork);

// this will block and listen for signals
faktory.work()
  .then((manager) => {
    process.on('SIGINT', () => {
      manager.stop()
        .then(() => {
          process.exit(0);
        });
    });
  });