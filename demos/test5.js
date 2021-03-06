const jsShell = require("../index");

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