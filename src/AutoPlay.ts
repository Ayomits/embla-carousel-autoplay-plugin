import { AutoPlayOptionsType, AutoplayType, defaultOptions } from './Options';
import { EmblaCarouselType, OptionsHandlerType } from 'embla-carousel';
import { getAutoplayRootNode } from './Utils';

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
      start();
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

  const start = () => {
    clearTimeout(timer);
    if (isStopped) {
      return;
    }
    isPlaying = true;
    if (!emblaApi) {
      return;
    }
    if (isPaused) {
      return;
    }
    startTime = Date.now() - elapsedTime;
    timer = setTimeout(
      () => {
        clearTimeout(timer);
        if (isPaused) {
          return;
        }
        if (!emblaApi?.canScrollNext()) {
          emblaApi?.scrollTo(0);
        } else {
          emblaApi?.scrollNext();
        }
        elapsedTime = 0;
        start();
      },
      (options?.delay ?? 0) - elapsedTime
    );
    emblaApi.emit('autoplay:start');
  };

  const stop = () => {
    clearTimeout(timer);
    isStopped = true;
    isPaused = false;
    isPlaying = false;
    elapsedTime = 0;
    emblaApi.emit('autoplay:stop');
  };

  const pause = () => {
    clearTimeout(timer);
    isPaused = true;
    elapsedTime = Date.now() - startTime;
    emblaApi.emit('autoplay:pause');
  };

  const resume = () => {
    clearTimeout(timer);
    if (isStopped) {
      isStopped = false;
      elapsedTime = 0;
    } else {
      isPaused = false;
    }
    start();
    emblaApi.emit('autoplay:resume');
  };

  const reset = () => {
    stop();
    start();
    emblaApi.emit('autoplay:reset');
  };

  return {
    name: 'autoplay',
    options: options,
    init,
    destroy,
    start,
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

export { AutoPlay };
