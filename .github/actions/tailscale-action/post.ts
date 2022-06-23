import os from "node:os";
import * as core from "@actions/core";
import { HttpClient } from "@actions/http-client";
import { BasicCredentialHandler } from "@actions/http-client/lib/auth";

function assertDevicesResponse(o: unknown): asserts o is Devices {
  if (o == null || typeof o !== "object" || !("devices" in o)) {
    throw new Error(
      `Tailscale API call for /devices returned incorrect response: "${JSON.stringify(
        o
      )}"`
    );
  }
}

async function main() {
  const apiKey = core.getInput("tailscale-api-key");
  core.setSecret(apiKey);

  const tailnet = core.getInput("tailscale-network-name");
  core.setSecret(tailnet);

  if (apiKey === "") {
    if (tailnet !== "") {
      throw new Error(
        `Input "tailscale-network-name" provided but "tailscale-api-key" is missing!`
      );
    }
    return;
  } else if (tailnet === "") {
    throw new Error(
      `Input "tailscale-api-key provided" but "tailscale-network-name" is missing!`
    );
  }

  const client = new HttpClient("tailscale-action", [
    new BasicCredentialHandler(apiKey, ""),
  ]);

  const devicesResponse = await client.get(
    `https://api.tailscale.com/api/v2/tailnet/${tailnet}/devices`
  );
  if (devicesResponse.message.statusCode !== 200) {
    throw new Error(
      `Tailscale API call for /devices returned a non 200 status code: ` +
        (await devicesResponse.readBody())
    );
  }

  const devices = JSON.parse(await devicesResponse.readBody());
  assertDevicesResponse(devices);

  const hostname = os.hostname();
  const thisDevice = devices.devices.find((d) => d.hostname === hostname);
  if (!thisDevice) {
    core.debug(
      `Not deleting device with hostname "${hostname}", because it was not found in the API response for the device list`
    );
    return;
  }

  core.info(`Deleting device with hostname "${hostname}"`);

  const deletionResponse = await client.del(
    `https://api.tailscale.com/api/v2/device/${thisDevice.id}`
  );
  if (deletionResponse.message.statusCode !== 200) {
    throw new Error(
      `Tailscale API call for DELETE /device/ID returned a non 200 status code: ` +
        (await deletionResponse.readBody())
    );
  }
}

main().catch((error) => {
  core.setFailed(error.message);
});
