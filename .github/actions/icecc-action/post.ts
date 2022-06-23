import * as core from "@actions/core";

function main() {
  const pid = core.getState("server-pid");

  if (pid) {
    process.kill(Number(pid));
  }
}

try {
  main();
} catch (error: any) {
  core.setFailed(error.message);
}
