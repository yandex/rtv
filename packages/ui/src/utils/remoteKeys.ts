import { Platform } from 'rtv-client';

export interface RemoteKey {
  keyCode: string;
  keyCodeLabel: string;
  tvKeyCode: string;
  tvKeyCodeLabel: string;
}

const arrows: RemoteKey[] = [
  {
    keyCode: 'ArrowLeft',
    keyCodeLabel: 'Arrow Left',
    tvKeyCode: 'Left',
    tvKeyCodeLabel: 'Left',
  },
  {
    keyCode: 'ArrowRight',
    keyCodeLabel: 'Arrow Right',
    tvKeyCode: 'Right',
    tvKeyCodeLabel: 'Right',
  },
  {
    keyCode: 'ArrowUp',
    keyCodeLabel: 'Arrow Up',
    tvKeyCode: 'Up',
    tvKeyCodeLabel: 'Up',
  },
  {
    keyCode: 'ArrowDown',
    keyCodeLabel: 'Arrow Down',
    tvKeyCode: 'Down',
    tvKeyCodeLabel: 'Down',
  },
];

const digits: RemoteKey[] = [
  {
    keyCode: 'Digit0',
    keyCodeLabel: 'Digit 0',
    tvKeyCode: '0',
    tvKeyCodeLabel: '0',
  },
  {
    keyCode: 'Digit1',
    keyCodeLabel: 'Digit 1',
    tvKeyCodeLabel: '1',
    tvKeyCode: '1',
  },
  {
    keyCode: 'Digit2',
    keyCodeLabel: 'Digit 2',
    tvKeyCode: '2',
    tvKeyCodeLabel: '2',
  },
  {
    keyCode: 'Digit3',
    tvKeyCodeLabel: '3',
    keyCodeLabel: 'Digit 3',
    tvKeyCode: '3',
  },
  {
    keyCode: 'Digit4',
    tvKeyCodeLabel: '4',
    keyCodeLabel: 'Digit 4',
    tvKeyCode: '4',
  },
  {
    keyCode: 'Digit5',
    tvKeyCodeLabel: '5',
    keyCodeLabel: 'Digit 5',
    tvKeyCode: '5',
  },
  {
    keyCode: 'Digit6',
    tvKeyCodeLabel: '6',
    keyCodeLabel: 'Digit 6',
    tvKeyCode: '6',
  },
  {
    keyCode: 'Digit7',
    keyCodeLabel: 'Digit 7',
    tvKeyCode: '7',
    tvKeyCodeLabel: '7',
  },
  {
    keyCode: 'Digit8',
    tvKeyCodeLabel: '8',
    keyCodeLabel: 'Digit 8',
    tvKeyCode: '8',
  },
  {
    keyCode: 'Digit9',
    tvKeyCodeLabel: '9',
    keyCodeLabel: 'Digit 9',
    tvKeyCode: '9',
  },
];

const tizenKeys: RemoteKey[] = [
  {
    keyCode: 'Space',
    keyCodeLabel: 'Space',
    tvKeyCode: 'Home',
    tvKeyCodeLabel: 'Home',
  },
  {
    keyCode: 'Enter',
    keyCodeLabel: 'Enter',
    tvKeyCode: 'Enter',
    tvKeyCodeLabel: 'Enter',
  },
  {
    keyCode: 'Backspace',
    keyCodeLabel: 'Backspace',
    tvKeyCode: 'Return',
    tvKeyCodeLabel: 'Return',
  },
  ...arrows,
  {
    keyCode: 'KeyP',
    keyCodeLabel: 'Key P',
    tvKeyCode: 'PowerOff',
    tvKeyCodeLabel: 'Power Off',
  },
  {
    keyCode: 'KeyQ',
    keyCodeLabel: 'Key Q',
    tvKeyCode: 'ChannelUp',
    tvKeyCodeLabel: 'Channel Up',
  },
  {
    keyCode: 'KeyA',
    keyCodeLabel: 'Key A',
    tvKeyCode: 'ChannelDown',
    tvKeyCodeLabel: 'Channel Down',
  },
  {
    keyCode: 'KeyW',
    keyCodeLabel: 'Key W',
    tvKeyCode: 'VolumeUp',
    tvKeyCodeLabel: 'Volume Up',
  },
  {
    keyCode: 'KeyS',
    keyCodeLabel: 'Key S',
    tvKeyCode: 'VolumeDown',
    tvKeyCodeLabel: 'Volume Down',
  },
  {
    keyCode: 'KeyL',
    keyCodeLabel: 'Key L',
    tvKeyCode: 'ChannelList',
    tvKeyCodeLabel: 'Channel List',
  },
  {
    keyCode: 'KeyM',
    keyCodeLabel: 'Key M',
    tvKeyCode: 'Menu',
    tvKeyCodeLabel: 'Menu',
  },
  {
    keyCode: 'KeyE',
    keyCodeLabel: 'Key E',
    tvKeyCode: 'Source',
    tvKeyCodeLabel: 'Source',
  },
  {
    keyCode: 'KeyN',
    keyCodeLabel: 'Key N',
    tvKeyCode: 'Guide',
    tvKeyCodeLabel: 'Guide',
  },
  {
    keyCode: 'KeyT',
    keyCodeLabel: 'Key T',
    tvKeyCode: 'Tools',
    tvKeyCodeLabel: 'Tools',
  },
  {
    keyCode: 'KeyI',
    keyCodeLabel: 'Key I',
    tvKeyCode: 'Info',
    tvKeyCodeLabel: 'Info',
  },
  {
    keyCode: 'KeyV',
    keyCodeLabel: 'Key V',
    tvKeyCode: 'Mute',
    tvKeyCodeLabel: 'Mute',
  },
  {
    keyCode: 'KeyR',
    keyCodeLabel: 'Key R',
    tvKeyCode: 'ARed',
    tvKeyCodeLabel: 'A Red',
  },
  {
    keyCode: 'KeyG',
    keyCodeLabel: 'Key G',
    tvKeyCode: 'BGreen',
    tvKeyCodeLabel: 'B Green',
  },
  {
    keyCode: 'KeyY',
    keyCodeLabel: 'Key Y',
    tvKeyCode: 'CYellow',
    tvKeyCodeLabel: 'C Yellow',
  },
  {
    keyCode: 'KeyB',
    keyCodeLabel: 'Key B',
    tvKeyCode: 'DBlue',
    tvKeyCodeLabel: 'D Blue',
  },
  {
    keyCode: 'KeyD',
    keyCodeLabel: 'Key D',
    tvKeyCode: '3D',
    tvKeyCodeLabel: '3D',
  },
  ...digits,
  {
    keyCode: 'KeyZ',
    keyCodeLabel: 'Key Z',
    tvKeyCode: 'TvSource',
    tvKeyCodeLabel: 'TV Source',
  },
  {
    keyCode: 'KeyH',
    keyCodeLabel: 'Key H',
    tvKeyCode: 'HDMISource',
    tvKeyCodeLabel: 'HDMI Source',
  },
  {
    keyCode: 'KeyX',
    keyCodeLabel: 'Key X',
    tvKeyCode: 'SmartHub',
    tvKeyCodeLabel: 'Smart Hub',
  },
  {
    keyCode: 'Semicolon',
    keyCodeLabel: 'Semicolon',
    tvKeyCode: 'Play',
    tvKeyCodeLabel: 'Play',
  },
  {
    keyCode: 'Quote',
    keyCodeLabel: 'Quote',
    tvKeyCode: 'Pause',
    tvKeyCodeLabel: 'Pause',
  },
  {
    keyCode: 'Backslash',
    keyCodeLabel: 'Backslash',
    tvKeyCode: 'Stop',
    tvKeyCodeLabel: 'Stop',
  },
  {
    keyCode: 'BracketLeft',
    keyCodeLabel: 'BracketLeft',
    tvKeyCode: 'Rewind',
    tvKeyCodeLabel: 'Rewind',
  },
  {
    keyCode: 'BracketRight',
    keyCodeLabel: 'BracketRight',
    tvKeyCode: 'Fastforward',
    tvKeyCodeLabel: 'Fastforward',
  },
];

const webosKeys: RemoteKey[] = [
  {
    keyCode: 'Enter',
    keyCodeLabel: 'Enter',
    tvKeyCode: 'Enter',
    tvKeyCodeLabel: 'Enter',
  },
  ...arrows,
  {
    keyCode: 'KeyM',
    keyCodeLabel: 'Key M',
    tvKeyCode: 'Menu',
    tvKeyCodeLabel: 'Menu',
  },
  {
    keyCode: 'Space',
    keyCodeLabel: 'Space',
    tvKeyCode: 'Home',
    tvKeyCodeLabel: 'Home',
  },
  {
    keyCode: 'Escape',
    keyCodeLabel: 'Escape',
    tvKeyCode: 'Exit',
    tvKeyCodeLabel: 'Exit',
  },
  {
    keyCode: 'KeyP',
    keyCodeLabel: 'Key P',
    tvKeyCode: 'Power',
    tvKeyCodeLabel: 'Power',
  },
  {
    keyCode: 'Backspace',
    keyCodeLabel: 'Backspace',
    tvKeyCode: 'Back',
    tvKeyCodeLabel: 'Back',
  },
  {
    keyCode: 'KeyI',
    keyCodeLabel: 'Key I',
    tvKeyCode: 'Info',
    tvKeyCodeLabel: 'Info',
  },
  {
    keyCode: 'KeyQ',
    keyCodeLabel: 'Key Q',
    tvKeyCode: 'ChannelUp',
    tvKeyCodeLabel: 'Channel Up',
  },
  {
    keyCode: 'KeyA',
    keyCodeLabel: 'Key A',
    tvKeyCode: 'ChannelDown',
    tvKeyCodeLabel: 'Channel Down',
  },
  {
    keyCode: 'KeyW',
    keyCodeLabel: 'Key W',
    tvKeyCode: 'VolumeUp',
    tvKeyCodeLabel: 'Volume Up',
  },
  {
    keyCode: 'KeyS',
    keyCodeLabel: 'Key S',
    tvKeyCode: 'VolumeDown',
    tvKeyCodeLabel: 'Volume Down',
  },
  {
    keyCode: 'Minus',
    keyCodeLabel: 'Minus',
    tvKeyCode: 'Dash',
    tvKeyCodeLabel: 'Dash',
  },
  {
    keyCode: 'KeyK',
    keyCodeLabel: 'Key K',
    tvKeyCode: 'Asterisk',
    tvKeyCodeLabel: 'Asterisk',
  },
  {
    keyCode: 'KeyV',
    keyCodeLabel: 'Key V',
    tvKeyCode: 'Mute',
    tvKeyCodeLabel: 'Mute',
  },
  {
    keyCode: 'KeyC',
    keyCodeLabel: 'Key C',
    tvKeyCode: 'CC',
    tvKeyCodeLabel: 'CC',
  },
  {
    keyCode: 'KeyR',
    keyCodeLabel: 'Key R',
    tvKeyCode: 'Red',
    tvKeyCodeLabel: 'Red',
  },
  {
    keyCode: 'KeyG',
    keyCodeLabel: 'Key G',
    tvKeyCode: 'Green',
    tvKeyCodeLabel: 'Green',
  },
  {
    keyCode: 'KeyB',
    keyCodeLabel: 'Key B',
    tvKeyCode: 'Blue',
    tvKeyCodeLabel: 'Blue',
  },
  {
    keyCode: 'KeyY',
    keyCodeLabel: 'Key Y',
    tvKeyCode: 'Yellow',
    tvKeyCodeLabel: 'Yellow',
  },
  ...digits,
  {
    keyCode: 'Semicolon',
    keyCodeLabel: 'Semicolon',
    tvKeyCode: 'Play',
    tvKeyCodeLabel: 'Play',
  },
  {
    keyCode: 'Quote',
    keyCodeLabel: 'Quote',
    tvKeyCode: 'Pause',
    tvKeyCodeLabel: 'Pause',
  },
  {
    keyCode: 'Backslash',
    keyCodeLabel: 'Backslash',
    tvKeyCode: 'Stop',
    tvKeyCodeLabel: 'Stop',
  },
  {
    keyCode: 'BracketLeft',
    keyCodeLabel: 'BracketLeft',
    tvKeyCode: 'Rewind',
    tvKeyCodeLabel: 'Rewind',
  },
  {
    keyCode: 'BracketRight',
    keyCodeLabel: 'BracketRight',
    tvKeyCode: 'Fastforward',
    tvKeyCodeLabel: 'Fastforward',
  },
];

export const remoteKeysByPlatform: Partial<Record<Platform, RemoteKey[]>> = {
  tizen: tizenKeys,
  webos: webosKeys,
};
