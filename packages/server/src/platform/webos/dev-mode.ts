/* eslint-disable max-statements */
import Timeout from 'await-timeout';
import { throwIf } from '../../helpers';
import { values as config } from '../../config';
import WebosWsRemoteControl from './ws-remote-control';

const sleep = async (ms: number) => Timeout.set(ms);

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
  //do: insert login
  await remoteControl.sendKey('ENTER');
  await sleep(1000);
  remoteControl.insertText(config.webosAccountLogin);
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

export const extendDevMode = async function (remoteControl: WebosWsRemoteControl) {
  await launchDevMode(remoteControl);

  //do: push Extend button
  await remoteControl.sendKey('DOWN');
  await sleep(1000);
  await remoteControl.sendKey('DOWN');
  await sleep(1000);
  await remoteControl.sendKey('ENTER');
};

async function launchDevMode(remoteControl: WebosWsRemoteControl) {
  await remoteControl.launchApp('com.palmdts.devmode');
  await sleep(10000);
}
