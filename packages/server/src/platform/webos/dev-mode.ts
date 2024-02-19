/* eslint-disable max-statements */
import Timeout from 'await-timeout';
import { values as config } from '../../config';
import { execCmd } from '../../helpers/cli';
import WebosWsRemoteControl from './ws-remote-control';

const sleep = async (ms: number) => Timeout.set(ms);

export const enableDevModeNewInterface = async function (remoteControl: WebosWsRemoteControl) {
  await launchDevMode(remoteControl);

  if (!config.webosAccountLogin) {
    throw new Error('WebOS account login is not specified in config');
  }
  if (!config.webosAccountPassword) {
    throw new Error('WebOS account password is not specified in config');
  }

  //do: set focus to login input field
  await remoteControl.sendKey('DOWN');

  await insertLoginAndPassword(remoteControl);

  //do: got to login and push Dev Mode button
  await remoteControl.sendKey('DOWN');
  await sleep(1000);
  await remoteControl.sendKey('DOWN');
  await sleep(1000);
  await remoteControl.sendKey('ENTER');

  // do: wait login
  await sleep(10000);

  // do: confirm restart
  await remoteControl.sendKey('ENTER');
  await sleep(2000);
  await remoteControl.sendKey('ENTER');
};

export const enableDevMode = async function (remoteControl: WebosWsRemoteControl) {
  await launchDevMode(remoteControl);

  if (!config.webosAccountLogin) {
    throw new Error('WebOS account login is not specified in config');
  }
  if (!config.webosAccountPassword) {
    throw new Error('WebOS account password is not specified in config');
  }

  //do: set focus to login on WebOS 14
  await remoteControl.sendKey('ENTER');
  await sleep(1000);

  await insertLoginAndPassword(remoteControl);

  //do: push Dev Mode button
  await remoteControl.sendKey('RIGHT');
  await sleep(1000);
  await remoteControl.sendKey('ENTER');
  await sleep(4000);

  //do: confirm restart
  await remoteControl.sendKey('ENTER');
  await sleep(2000);
  await remoteControl.sendKey('ENTER');
};

async function insertLoginAndPassword(remoteControl: WebosWsRemoteControl) {
  if (!config.webosAccountLogin) {
    throw new Error('WebOS account login is not specified in config');
  }
  if (!config.webosAccountPassword) {
    throw new Error('WebOS account password is not specified in config');
  }

  //do: insert login
  await remoteControl.sendKey('ENTER');
  await sleep(1000);
  await remoteControl.insertText(config.webosAccountLogin);
  await sleep(2000);
  await remoteControl.sendKey('BACK');
  await sleep(1000);

  //do: set focus to password field
  await remoteControl.sendKey('DOWN');

  //do: insert password
  await sleep(1000);
  await remoteControl.sendKey('ENTER');
  await sleep(1000);
  remoteControl.insertText(config.webosAccountPassword);
  await sleep(2000);
  await remoteControl.sendKey('BACK');
  await sleep(1000);
}

export const extendDevMode = async function (deviceName: string) {
  try {
    await execCmd(`ares-extend-dev -d ${deviceName}`);
    return true;
  } catch (e) {
    return false;
  }
};

async function launchDevMode(remoteControl: WebosWsRemoteControl) {
  await remoteControl.launchApp('com.palmdts.devmode');
  await sleep(10000);
}
