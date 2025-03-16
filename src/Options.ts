import {
  CreateOptionsType,
  CreatePluginType,
} from 'embla-carousel';

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
  delay?: number;
  usePauseOnMouseEnter?: boolean;
  usePauseOnInteraction?: boolean;
  playOnInit?: boolean;
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
  usePauseOnMouseEnter: false,
  usePauseOnInteraction: false,
  playOnInit: true,
};

export { AutoPlayOptionsType, AutoplayType, defaultOptions };
