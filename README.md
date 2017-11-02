Faktory Example
===============

> Example usage for contribsys/faktory with node.js and docker.

This is an example project using [contribsys/faktory](https://github.com/contribsys/faktory). The worker and event emitter uses node.js and run faktory in a docker.

### Running

* Run `docker-compose up` to start the faktory service.
* Run `npm run worker` to start a worker that will pluck items off the queue
* Run `npm run` to start pushing fake events to the queue
* Visit `$(docker-machine ip):7420` to view the faktory UI
