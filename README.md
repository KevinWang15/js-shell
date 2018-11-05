# js-shell

Automate your shell with JavaScript.

# Note

This is only a POC project. It may come with a lot of bugs, so **do not use it in any mission-critical systems.**

You should supervise it each time it is run. In other words, run your shell routines manually. It's too dangerous to let `cronjob` and such run shell routines automatically without supervision at the current stage.

If you find a bug, please submit an issue. PRs are welcome!

# Purpose

Writing a `.sh` file is sufficient for most of the tasks. 
However, shell alone still has some limitations.

For example, it would be very difficult to log into another server (which required password auth) and do routine operations there.
It would also be difficult to automate interactive programs.
How are you supposed to do lower level operations / implement complicated data structures / run multiple shells in parallel / debug with confidence?

It occurs to me that I can solve these problems by having a Node.js program manipulate the STDIN and read from the STDOUT of a shell. What's more, by blending Node.js and shell, the automation script can also benefit from all the technologies from the Node.js world! Shell and Node.js can compliment each other really well. 

Now you can even write shell scripts with Node.js, which may feel good for people who generally write JS and seldom write shell (the `for` and `if`s in shell can seem a little obscured for JS programmers, now you can write `if (fs.existsSync(..)){}`).

# Why another JavaScript & shell project?

What makes it different from other JavaScript & shell projects is that this project spawns a shell process in the background and communicates with it through `STDIN` and `STDOUT` (it relies heavily on [node-pty](https://github.com/Microsoft/node-pty)). The two way communication can go on for as long as necessary. It makes possible use cases such as asking a user for OTP when requested in the shell and using that new password to log in OTP-protected machines. If the OTP is wrong, it can simply ask the user again and try again, using the same shell, without destroying the current state and starting everything over again. To my knowledge, other projects cannot achieve this.

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

You can append `.captureOutput` to `sh` or any `sh.command` to make it return the output value instead of printing it to STDOUT.

```javascript
const jsShell = require("js-shell");

jsShell(async sh => {
  let output = await sh.captureOutput(`whoami`);
  console.log(output);
});
```

## Print command output

Unless specified with `defaultStdOutHandling`, the default behavior is to print the output of the command.

You can use `.printOutput` to print the output no matter what `defaultStdOutHandling` says.

```javascript
jsShell(async sh => {
  for (let i = 0; i < 10; i++) {
    await sh.printOutput(`echo Hello World ${i}`);
  }
}, {echoOff: true, shellRttDelay: 10, defaultStdOutHandling: "capture"})
```

## Log into another host
```javascript
const jsShell = require("js-shell");

jsShell(async sh => {
  await sh.ssh("1.2.3.4", {username: "root", password: "123456"});
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
  await sh.ssh.captureOutput(host, {username: "root", password: "123456", port: 2022});
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
* `defaultStdOutHandling`: "print" | "capture". `print` prints the STDOUT of the command to STDOUT, while `capture` saves it as a variable and returns it. Defaults to `print`.

## DEMO
```javascript
jsShell(async sh => {
  let results = [];
  for (let i = 0; i < 10; i++) {
    results.push(await sh(`echo Hello World ${i}`));
  }
}, {echoOff: true, shellRttDelay: 10, defaultStdOutHandling: "capture"})
```

# You may also be interested

* [log-viewer](https://github.com/KevinWang15/log-viewer): Hackable log viewer built with `nw.js` and `react`.
  
  So that you can do: `node collect-logs.routine.js | log-viewer`

# TODO
- [ ] Error handling
- [ ] Windows compatibility
- [ ] More utils

# License

MIT
