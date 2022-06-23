import * as core from "@actions/core";
import { exec } from "@actions/exec";

async function bash(command: string): Promise<number> {
  return await exec("/bin/bash", ["-c", command]);
}

async function main() {
  const authKey = core.getInput("tailscale-auth-key", { required: true });
  core.setSecret(authKey);

  await bash(
    "curl -fsSL https://pkgs.tailscale.com/stable/ubuntu/focal.noarmor.gpg | sudo tee /usr/share/keyrings/tailscale-archive-keyring.gpg >/dev/null"
  );
  await bash(
    "curl -fsSL https://pkgs.tailscale.com/stable/ubuntu/focal.tailscale-keyring.list | sudo tee /etc/apt/sources.list.d/tailscale.list"
  );

  await bash("sudo apt-get -y update");
  await bash("sudo apt-get -yqq install tailscale");

  await bash("tailscale netcheck");
  await bash(`sudo tailscale up --authkey ${authKey}`);
  await bash("tailscale status");
}

main().catch((error) => {
  core.setFailed(error.message);
});
