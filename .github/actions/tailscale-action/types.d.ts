interface Devices {
  devices: {
    addresses: string[];
    authorized: boolean;
    blocksIncomingConnections: boolean;
    clientVersion: string;
    created: string;
    expires: string;
    hostname: string;
    id: string;
    isExternal: boolean;
    keyExpiryDisabled: boolean;
    lastSeen: string;
    machineKey: string;
    name: string;
    nodeKey: string;
    os: string;
    updateAvailable: boolean;
    user: string;
  }[];
}
