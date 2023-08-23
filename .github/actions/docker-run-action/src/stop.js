import { endGroup, getState, startGroup, warning } from "@actions/core";
import { exec } from "@actions/exec";
import { which } from "@actions/io";

(async () => {
  const containerName = getState("container-name");
  if (!containerName) {
    return;
  }

  const dockerBin = await which("docker", true);

  try {
    startGroup("Container");
    await exec(dockerBin, ["logs", containerName]);
  } catch (err) {
    warning(
      `Failed to retrieve logs from container '${containerName}': ${err}`
    );
  } finally {
    endGroup();
  }

  try {
    await exec(dockerBin, ["kill", containerName]);
  } catch (err) {
    warning(`Failed to kill container '${containerName}': ${err}`);
  }
  try {
    await exec(dockerBin, ["rm", containerName]);
  } catch (err) {
    warning(`Failed to remove container '${containerName}': ${err}`);
  }
})();
