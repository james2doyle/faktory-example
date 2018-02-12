Getting Started With Faktory And Node.js
========================================

In this tutorial, we are going to use Node.js to show how items can be added to the queue and then how a worker can be used to pull items off the queue.

## A Little Bit About Faktory

Faktory, in simple terms, is a background job system. There is a good description on the [Faktory GitHub repo](https://github.com/contribsys/faktory) about exactly what Faktory is:

> At a high level, Faktory is a work server. It is the repository for background jobs within your application. Jobs have a type and a set of arguments and are placed into queues for workers to fetch and execute.
> You can use this server to distribute jobs to one or hundreds of machines. Jobs can be executed with any language by clients using the Faktory API to fetch a job from a queue.

## Faktory and Node.js

Node and Faktory work really well together because of the way Node handles async operations and long-runnning processes. It's incredibly easy to get started creating clients and workers. But first, we need to setup the environment.

## Prerequisites

* An installation of node.js
* Either a Unix system (MacOS or Linux) or Docker (there are instructions [here](https://github.com/contribsys/faktory/wiki/Installation#linux) if you'd like to build Faktory as a RPM/DEB package)

## Installing Faktory Server

Below are instructions for either Mac or Docker, but at the end, you'll need to have Faktory server accessible from `localhost:7419`.

### Installing on Linux

At the moment, there are no pre-build packages for Linux. You will need to build from source in order to get started. If you are unfamiliar with that process, I suggest using Docker to get started quickly.

#### Installing on Mac OS/X

Faktory is distributed via Homebrew on Mac. To install:

```shell
$ brew tap contribsys/faktory
$ brew install faktory
```

At this point, you should be able to run the Faktory server with the following:

```shell
$ faktory -e development
```

By default in development mode, Faktory starts and binds to `localhost:7419` for the server and `localhost:7420` for the web UI.

#### "Installing" with Docker

Faktory is also distributed in a docker image and can easily be run with a single command (assuming you already have the docker daemon setup and running):

```shell
$ docker run --rm -it -p 7419:7419 -p 7420:7420 contribsys/faktory -b 0.0.0.0:7419 -e development
```

This will run the Faktory server in your current terminal session and remove the container when it is exited.

##### Using Docker Compose

```yaml
version: '3'
services:
  faktory:
    image: contribsys/faktory:0.7.0
    entrypoint: /faktory -b 0.0.0.0:7419 -e development
    ports:
      - "7419:7419"
      - "7420:7420"
```

#### Notes About Environments

You may have noticed that there is an `-e development` flag on all of the references to running Faktory. This is actually the default environment. But we set it explicitly as a reminder that it needs to be changed when finally deploying our app.

Using Faktory in production requires a password to be set via the environment. If you are interested in learning more about running Faktory in production, please check out the [GitHub Wiki](https://github.com/contribsys/faktory/wiki/Administration).

Now that we have Faktory up and running we can finally get into the node.js part!

## Setting Up Our Node Project

The easiest way to get started using Faktory with node, is installing the `faktory-worker` npm package:

```
npm install faktory-worker --save
```

This will install the faktory-worker module. This is all we need to create both a client and a worker. Easy!

### The Client

We can create a client that can push jobs to Faktory in just a few lines:

```js
const faktory = require('faktory-worker');
faktory.connect()
  .then((client) => {
    client.push({
      jobtype: 'node-job', // a key for our jobs
      args: [] // an array of "arguments" to be sent along
    });
  });
```

*I have ommited the `catch` function in order to make the code simpler.* Depending on your version of node, you will have to add `catch` handlers as later versions of node do not allow uncaught exceptions.

As you can see, everything is very straight forward. Something that is very important is the "job type". Think of this like a tag for the data that is being sent to be worked on. If the tag is wrong (or no workers exist that can handle that tag) the data will never be processed.

The only non-obvious piece to focus on here is the `args` property on the object that we push to the client.

We use `args` to pass an array of data the worker that is going to process this event. Most likely, you will be sending JSON in this array. We will cover that more when accessing the data using our worker. If you want to learn more about the job data, check out the wiki for ["Job Payload"](https://github.com/contribsys/faktory/wiki/The-Job-Payload).

Before we more forward, let's tweak our client to push some more realistic data:

```js
const faktory = require('faktory-worker');
faktory.connect()
  .then((client) => {
    client.push({
      jobtype: 'node-job', // a key for our jobs
      args: [
        Date.now().toString(), // a timestamp string
        { hello: 'world' } // a simple object
      ]
    });
  });
```

We are now sending an array with a date as the first argument and a small JSON object as the second one. Great! Let's continue.

### The Worker

This is the general design of the worker. Creating workers is just as simple as creating clients, but implements the opposite functionality:

```js
const faktory = require('faktory-worker');
faktory.register('node-job', (date, obj) => {
  console.log('Message sent at', date, 'with', obj);
});
faktory.work();
```

You can see that we register a new register function for the `node-job` job type. This needs to match the same job type we used during our `client.push`. If these values don't match, we aren't going to recieve any data since nothing is going to be sent or recieved because we are listening (or pushing) to the wrong job type.

If you couldn't tell, the data passed to `args` when we did `client.push` is now exposed as a list of arguments on our `register` function. When we sent our data to the client, we had a Date string as the first argument and a small object as the second. Now, we have that data passed to our function and the more items we push to our `args` array, the more arguments we will have in our register function.

#### Registering Multiple Job Functions

There is no limit here for the number of workers you can register. You can have many workers in a single file that listen on many job types. This allows you to make a worker that can process many job types. This can be really useful if you have a lot of smaller workers or you aren't processing too many jobs.

That being said, the docs on the project repo mention an anecdotal benchmark of Faktory running on a laptop as being able to "consume over 5000 jobs/sec steadily". So that is nice to know. As Faktory matures, it is very likely this number will grow as the project becomes more stable.
