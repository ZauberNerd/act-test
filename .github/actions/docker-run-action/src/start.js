import { getInput, getMultilineInput, saveState } from "@actions/core";
import { exec } from "@actions/exec";
import { which } from "@actions/io";
import { randomUUID } from "node:crypto";
import { basename, dirname } from "path";

(async () => {
  const dockerfile = getInput("dockerfile", {
    required: false,
    trimWhitespace: true,
  });
  const image = getInput("image", {
    required: true,
    trimWhitespace: true,
  });
  const args = getMultilineInput("args", { trimWhitespace: true });
  const command = getInput("command");
  const detach =
    getInput("detach", {
      required: true,
    }) === "true";

  const pull = getInput("pull", {
    required: true,
  });

  const containerName = randomUUID();
  const dockerBin = await which("docker", true);

  if (dockerfile) {
    await exec(
      dockerBin,
      ["build", "--rm", "--tag", image, "--file", basename(dockerfile), "."],
      {
        cwd: dirname(dockerfile),
      }
    );
  }

  const dockerArgs = [
    "run",
    "--init",
    "--pull",
    pull,
    "--name",
    containerName,
    ...args.flatMap((arg) => arg.split(/[\s=]/g)),
  ];
  if (detach) {
    dockerArgs.push("--detach");
  }

  const dockerCommands = [];
  if (command) {
    dockerCommands.push(...command.split(/[\s=]/g));
  }

  await exec(dockerBin, [...dockerArgs, image, ...dockerCommands]);

  saveState("container-name", containerName);
})();
