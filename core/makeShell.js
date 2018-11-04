const os = require('os');
const chalk = require("chalk");
const pty = require('node-pty');

const defer = require('../utils/defer');

/**
 * What shell to use?
 */
const shellName = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

/**
 * Count how many pty has been created
 */
let ptyNo = 0;

/**
 * SSH round-trip time in ms.
 *     to avoid capturing the echoing of shell
 *     (what you sent to STDIN being sent back to you in STDOUT)
 */
const SSH_RTT_DELAY = 200;

// TODO: refactor this file, split up the core and all the util commands
async function makeShell({echoOff = false, sshRttDelay = SSH_RTT_DELAY} = {}) {
  let localPtyNo = ptyNo;
  ptyNo++;

  // Spawn child process
  const ptyProcess = pty.spawn(shellName, [], {
    cwd: process.env.HOME,
    env: process.env
  });

  // Pub Sub for the shell's STDOUT
  const subscribeData = makePtyStdoutSubscriber(ptyProcess);

  // Core function: Execute command (send to STDIN) in shell.
  const sh = (command, {commandFinishIndicator = null, overrideLogMessage = false, captureOutput = false} = {}) => {

    // Print log
    // (console.error is to print it in STDERR, so that we can do "node script.js > file.log" without also writing those logs to file)

    if (!echoOff) {
      echoCommand(command, localPtyNo, overrideLogMessage);
    }


    let deferred = defer();

    // on command finish, print out the result or resolve the promise with result
    const onCommandDone = (data) => {
      if (captureOutput) {
        deferred.resolve(data);
      } else {
        console.log(data);
        deferred.resolve(data);
      }
    };

    const execCommand = (command, {outputCommandFinishIndicator = null} = {}) => new Promise(resolve => setTimeout(() => {
        // write to STDIN
        ptyProcess.write(command);

        setTimeout(() => {
          // after RTT (to avoid echoing), clear stdOutLogBuffer and write \n
          let stdOutLogBuffer = "";
          ptyProcess.write("\n");

          // subscribe to new STDOUT data
          let unsubscribeData = subscribeData((data) => {
            // append to stdOutLogBuffer so we can access the result of the command later
            stdOutLogBuffer += data;

            // if finish indicator is captured in the output, it means the command has finished executing
            if (outputCommandFinishIndicator && stdOutLogBuffer.indexOf(outputCommandFinishIndicator) >= 0) {
              unsubscribeData(); // send updates of STDOUT no more
              resolve(stdOutLogBuffer);
            }

          })
        }, sshRttDelay);
      }, sshRttDelay) //TODO: what is this setTimeout for?
    );


    if (!commandFinishIndicator) {
      // if no command finish indicator is specified, we will use a technique: let it echo some random data after the command is finished.
      let outputCommandFinishIndicator = "ssh_route_cmd_finish_" + Math.random().toString().substr(2);
      setTimeout(() => {
        execCommand(
          `${command}; echo ${outputCommandFinishIndicator.substr(0, 1) + "\\" + outputCommandFinishIndicator.substr(1)}`, //TODO: is the \\ still necessary?
          {outputCommandFinishIndicator}
        ).then(stdoutData => {
          // now the command is finished, remove the random data we made it echo.
          stdoutData = stdoutData.substr(0, stdoutData.indexOf(outputCommandFinishIndicator));
          onCommandDone(stdoutData);
        });
      });
    } else {
      // if a finish indicator is specified by caller, just use it.
      let outputCommandFinishIndicator = commandFinishIndicator;
      setTimeout(() => {
        execCommand(`${command}`, {outputCommandFinishIndicator}).then(onCommandDone);
      });
    }

    return deferred.promise;
  };

  enableUtilCommands(sh, ptyProcess);
  return sh;
}

// Pub Sub maker
function makePtyStdoutSubscriber(ptyProcess) {
  const subscribers = [];

  const subscribeData = (callback) => {
    subscribers.push(callback);
    return () => {
      subscribers.splice(subscribers.indexOf(callback), 1);
    }
  };

  ptyProcess.on('data', function (data) {
    subscribers.forEach(callback => callback(data));
  });
  return subscribeData;
}

// Echo what is about to execute
function echoCommand(command, localPtyNo, overrideLogMessage) {
  let message;
  if (overrideLogMessage) {
    message = overrideLogMessage(command);
  } else {
    message = "⏳  " + chalk.blue(command.trim());
  }
  console.error(chalk.magenta(`[PTY ${localPtyNo}] `) + message);
}

// Install util commands from ./commands and make their .captureOutput version
function enableUtilCommands(sh, ptyProcess) {
  const utilCommands = require("./commands")(sh, ptyProcess);

  // generate captureOutput version of command
  sh.captureOutput = (cmd, options) => sh(cmd, {...options, captureOutput: true});
  Object.keys(utilCommands).forEach(commandName => {
    // enable util command
    sh[commandName] = utilCommands[commandName];
    // generate captureOutput version of util command
    sh[commandName].captureOutput = (cmd, options) => sh[commandName](cmd, {...options, captureOutput: true});
  });
}

module.exports = makeShell;