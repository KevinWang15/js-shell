const sshRoutine = require("../index");

const hosts = [
  {name: "A", host: "1.2.3.4"},
  {name: "B", host: "2.3.4.5"},
];

const subRoutine = async (sh, host) => {
  await sh.login(host, {username: "root", password: "123456", port: 2022});
  return sh.readFile.captureOutput("test.log", {last: 1000});
};

// running multiple shells in parallel!
Promise.all(
  hosts.map(host => sshRoutine(sh => subRoutine(sh, host.host)))
).then(logs => console.log(
  console.log(logs.map((log, index) => {
    return `>>>>> Host: ${hosts[index].name} (${hosts[index].host})\n${log}\n<<<<<\n`;
  }).join("\n")))
);