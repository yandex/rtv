import semver from 'semver';
import { warn } from './output';

export const onNeedUpdate = ({ serverVersion, clientVersion }: { serverVersion: string; clientVersion: string }) => {
  checkOutdatedClient(clientVersion, serverVersion);
  checkOutdatedServer(clientVersion, serverVersion);
};

function checkOutdatedClient(clientVersion: string, serverVersion: string) {
  if (semver.major(clientVersion) < semver.major(serverVersion)) {
    warn(
      [
        `Your rtv client version (${clientVersion}) is lower than rtv server version (${serverVersion}).`,
        // todo: generate link by _resolved field of pkg
        `Please update rtv client: npm i -g rtv-client`,
      ].join('\n')
    );
  }
}

function checkOutdatedServer(clientVersion: string, serverVersion: string) {
  if (semver.major(clientVersion) > semver.major(serverVersion)) {
    warn(
      [
        `Your rtv client version (${clientVersion}) is greater than rtv server version (${serverVersion}).`,
        `Please update rtv-server.`,
      ].join('\n')
    );
  }
}
