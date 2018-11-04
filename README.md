# js-shell

Automate your shell with JavaScript.

# Note

This is only a POC project. It may come with a lot of bugs, so **do not use it in any mission-critical systems.**

You should supervise it each time it is run. In other words, run your shell routines manually. It's too dangerous to let `cronjob` and such run shell routines automatically without supervision at the current stage.

If you find a bug, please submit an issue. PRs are welcome!

# Purpose

Writing a `.sh` file is sufficient for most of the tasks. 
However, it still has some limitations.

For example, it would be very difficult to log into another server (which required password auth) and do routine operations there.
It would also be difficult to automate interactive programs.
How are you supposed to do lower level operations / implement complicated data structures / run multiple shells in parallel / debug with confidence?
What if I come from the JavaScript world and just don't like to write `.sh` files.

It occurs to me that Node.js and shell can play together and compliment each other really well.

`js-shell` is like writing shell scripts with Node.js, the best of both worlds.

# Installation

```bash
npm i --save https://github.com/KevinWang15/js-shell.git
```
# DEMO

## Simple .sh
```javascript
const jsShell = require("js-shell");

jsShell(async sh => {
  await sh("echo Hello World");
  await sh("cd /");
  await sh("pwd");
});
```

## With Node.js control flow
```javascript
const jsShell = require("js-shell");

jsShell(async sh => {
  for (let i = 0; i < 10; i++) {
    await sh(`echo Hello World ${i}`);
  }
});
```

## Capture command output 
```javascript
const jsShell = require("js-shell");

jsShell(async sh => {
  let output = await sh.captureOutput(`whoami`);
  console.log(output);
});
```

## Log into another host
```javascript
const jsShell = require("js-shell");

jsShell(async sh => {
  await sh.login("1.2.3.4", {username: "root", password: "123456"});
  await sh(`hostname`);
});
```

## Fetch logs from multiple hosts
```javascript
const jsShell = require("js-shell");

const hosts = [
  {name: "A", host: "1.2.3.4"},
  {name: "B", host: "2.3.4.5"},
];

const routine = async (sh, host) => {
  await sh.login.captureOutput(host, {username: "root", password: "123456", port: 2022});
  return await sh.readFile.captureOutput("test.log", {last: 1000});
};

// running multiple shells in parallel!
Promise.all(
  hosts.map(host => jsShell(sh => routine(sh, host.host)))
).then(logs => console.log(
  logs.map((log, index) => {
    return `>>>>> Host: ${hosts[index].name} (${hosts[index].host})\n${log}\n<<<<<\n`;
  }).join("\n"))
);
```

# jsShell options

* `echoOff`: whether to turn off command echoing.
* `shellRttDelay`: expected round-trip time of the shell (especially when you ssh to other machines), in order to make sure the results are correct.

## DEMO
```javascript
jsShell(async sh => {
  for (let i = 0; i < 10; i++) {
    await sh(`echo Hello World ${i}`);
  }
}, {echoOff: true, shellRttDelay: 10})
```

# How it works

As you may already have guessed, `js-shell` spawns a `sh` process and communicates with it through `STDIN` and `STDOUT`.
It relies heavily on [node-pty](https://github.com/Microsoft/node-pty).

# You may also be interested

* [log-viewer](https://github.com/KevinWang15/log-viewer): Hackable log viewer built with `nw.js` and `react`.
  
  So that you can do: `node collect-logs.routine.js | log-viewer`

# TODO
- [ ] Error handling
- [ ] Windows compatibility
- [ ] More utils

# License

MIT
