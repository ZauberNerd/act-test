import * as core from "@actions/core";
import { exec } from "@actions/exec";
import { spawn } from "node:child_process";
import { HttpClient } from "@actions/http-client";
import { setTimeout } from "node:timers/promises";

async function bash(command: string): Promise<number> {
  return await exec("/bin/bash", ["-c", command]);
}

async function main() {
  const schedulerHost = core.getInput("scheduler-host", { required: true });
  const isScheduler = core.getBooleanInput("is-scheduler", { required: true });
  const isNode = core.getBooleanInput("is-node", { required: true });

  await bash("sudo apt-get -yqq install icecc");
  await bash("sudo systemctl stop icecc-scheduler.service");
  await bash("sudo systemctl stop iceccd.service");

  await bash(
    `sudo sed -i 's/ICECC_SCHEDULER_HOST=""/ICECC_SCHEDULER_HOST="${schedulerHost}"/' /etc/icecc/icecc.conf`
  );

  core.addPath("/usr/lib/icecc/bin");

  if (isScheduler) {
    await bash("sudo systemctl start icecc-scheduler.service");

    const readyServer = spawn(
      `node`,
      ["-e", 'http.createServer((_, res) => res.end("ready")).listen(47249)'],
      { detached: true, stdio: "ignore" }
    );
    readyServer.unref();

    core.info(
      `Started ready server for scheduler with pid "${readyServer.pid}"`
    );

    core.saveState("server-pid", readyServer.pid);
  }

  if (isNode) {
    const client = new HttpClient();

    async function tryStartNode() {
      try {
        core.debug(`Trying to reach scheduler server`);
        const response = await client.get("http://scheduler:47249");

        if ((await response.readBody()) === "ready") {
          await bash("sudo systemctl start iceccd.service");
        }
      } catch {
        core.debug(`Scheduler server not ready, retrying in 60s`);
        await setTimeout(60 * 1000);
        await tryStartNode();
      }
    }

    await tryStartNode();
  }
}

main().catch((error) => {
  core.setFailed(error.message);
});
