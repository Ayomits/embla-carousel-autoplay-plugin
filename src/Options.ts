import { CreateOptionsType, CreatePluginType } from 'embla-carousel';

type RootNodeType = null | ((emblaRoot: HTMLElement) => HTMLElement | null);

declare module 'embla-carousel' {
  export interface EmblaPluginsType {
    autoplay: AutoplayType;
  }

  export interface EmblaEventListType {
    autoplayStart: 'autoplay:start';
    autoplayStop: 'autoplay:stop';
    autoplayPause: 'autoplay:pause';
    autoplayResume: 'autoplay:resume';
    autoplayReset: 'autoplay:reset';
  }
}

type AutoPlayOptionsType = CreateOptionsType<{
  delay: number;

  pauseOnMouseEnter: boolean;
  pauseOnClick: boolean;
  pauseOnFocusIn: boolean;
  pauseOnLastSnap: boolean;

  stopOnFocusIn: boolean
  stopOnClick: boolean
  stopOnMouseEnter: boolean
  stopOnLastSnap: boolean

  revertOnEvent: boolean;

  playOnInit: boolean;
  rootNode: RootNodeType;
}>;

type AutoplayType = CreatePluginType<
  {
    start: () => void;
    stop: () => void;
    pause: () => void;
    resume: () => void;
    reset: () => void;
    isPlaying: boolean;
    isPaused: boolean;
    isStopped: boolean;
  },
  AutoPlayOptionsType
>;

const defaultOptions = {
  delay: 4_000,

  pauseOnMouseEnter: false,
  pauseOnClick: false,
  pauseOnFocusIn: false,
  pauseOnLastSnap: false,

  stopOnFocusIn: false,
  stopOnClick: false,
  stopOnMouseEnter: false,
  stopOnLastSnap: false,

  playOnInit: true,

  revertOnEvent: true,
};

export { AutoPlayOptionsType, AutoplayType, RootNodeType, defaultOptions };
