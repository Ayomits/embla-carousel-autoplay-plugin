import {
  CreateOptionsType,
  CreatePluginType,
  EmblaCarouselType,
  OptionsHandlerType,
} from 'embla-carousel';

type RootNodeType = null | ((emblaRoot: HTMLElement) => HTMLElement | null);

declare module 'embla-carousel' {
  export interface EmblaPluginsType {
    autoplay: AutoplayType;
  }

  export interface EmblaEventListType {
    autoplayPlay: 'autoplay:play';
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

  stopOnFocusIn: boolean;
  stopOnClick: boolean;
  stopOnMouseEnter: boolean;
  stopOnLastSnap: boolean;

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

function getAutoplayRootNode(
  emblaApi: EmblaCarouselType,
  rootNode: RootNodeType
): HTMLElement {
  const emblaRootNode = emblaApi.rootNode();
  return (rootNode && rootNode(emblaRootNode)) || emblaRootNode;
}

const AutoPlay = (
  userOptions: Partial<AutoPlayOptionsType> = {}
): AutoplayType => {
  // @ts-expect-error embla-carousel plugin logic (it must be here empty)
  const options: AutoPlayOptionsType = {};

  let isPlaying = false;
  let isPaused = false;
  let isStopped = false;

  let timer: NodeJS.Timeout;
  let emblaApi: EmblaCarouselType;
  let startTime = 0;
  let elapsedTime = 0;

  const init = (
    emblaApiInstance: EmblaCarouselType,
    optionsHandler: OptionsHandlerType
  ) => {
    emblaApi = emblaApiInstance;
    const { mergeOptions, optionsAtMedia } = optionsHandler;
    const { eventStore } = emblaApi.internalEngine();
    const optionsBase = mergeOptions(defaultOptions, AutoPlay.globalOptions);
    const allOptions = mergeOptions(optionsBase, userOptions);

    const root = getAutoplayRootNode(emblaApi, options.rootNode);

    emblaApi.on('select', () => {
      clearTimer();
      play();
    });

    Object.assign(options, optionsAtMedia(allOptions));
    // Pause actions
    if (options.pauseOnMouseEnter) {
      eventStore.add(root, 'mouseenter', pause);
      if (options.revertOnEvent) {
        eventStore.add(root, 'mouseleave', resume);
      }
    }

    if (options.pauseOnClick) {
      eventStore.add(root, 'click', () => {
        if (isPaused) {
          resume();
        } else if (options.revertOnEvent) {
          pause();
        }
      });
    }

    if (options.pauseOnFocusIn) {
      eventStore.add(root, 'focusin', pause);
      if (options.revertOnEvent) {
        eventStore.add(root, 'focusout', resume);
      }
    }

    // Stop actions
    if (options.stopOnMouseEnter) {
      eventStore.add(root, 'mouseenter', stop);
      if (options.revertOnEvent) {
        eventStore.add(root, 'mouseleave', resume);
      }
    }

    if (options.stopOnClick) {
      eventStore.add(root, 'click', () => {
        if (isPaused) {
          stop();
        } else if (options.revertOnEvent) {
          resume();
        }
      });
    }

    if (options.stopOnFocusIn) {
      eventStore.add(root, 'focusin', stop);
      if (options.revertOnEvent) {
        eventStore.add(root, 'focusout', resume);
      }
    }

    if (options.playOnInit) {
      play();
    }
  };

  const destroyEvents = () => {
    if (!emblaApi) return;
    const { eventStore } = emblaApi.internalEngine();
    eventStore.clear();
  };

  const destroy = () => {
    stop();
    destroyEvents();
  };

  const clearTimer = () => {
    clearTimeout(timer);
    isPlaying = false;
    isPaused = false;
    isStopped = false;
  };

  const play = () => {
    clearTimer();
    if (isStopped || isPaused || isPlaying) return;

    isPlaying = true;
    startTime = Date.now() - elapsedTime;

    timer = setTimeout(() => {
      if (isPaused) {
        console.log('isPaused');
        return;
      }

      isPlaying = false;

      if (!emblaApi?.canScrollNext()) {
        emblaApi?.scrollTo(0);
      } else {
        emblaApi?.scrollNext();
      }

      elapsedTime = 0;
      play();
    }, options?.delay ?? 0);

    emblaApi.emit('autoplay:play');
  };

  const stop = () => {
    clearTimer();
    isStopped = true;
    isPaused = false;
    isPlaying = false;
    elapsedTime = 0;
    emblaApi.emit('autoplay:stop');
  };

  const pause = () => {
    clearTimer();
    isPaused = true;
    elapsedTime = Date.now() - startTime;
    emblaApi.emit('autoplay:pause');
  };

  const resume = () => {
    clearTimer();
    if (isStopped) {
      isStopped = false;
      elapsedTime = 0;
    } else {
      isPaused = false;
    }
    play();
    emblaApi.emit('autoplay:resume');
  };

  const reset = () => {
    stop();
    play();
    emblaApi.emit('autoplay:reset');
  };

  return {
    name: 'autoplay',
    options: options,
    init,
    destroy,
    start: play,
    stop,
    pause,
    resume,
    reset,
    isPaused,
    isPlaying,
    isStopped,
  };
};
AutoPlay.globalOptions = undefined;

export { AutoPlay, getAutoplayRootNode, defaultOptions };
