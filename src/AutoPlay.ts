import { AutoPlayOptionsType, AutoplayType, defaultOptions } from './Options';
import { EmblaCarouselType, OptionsHandlerType } from 'embla-carousel';

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
    if (emblaApi.scrollSnapList().length <= 1) return;

    const { mergeOptions, optionsAtMedia } = optionsHandler;
    const optionsBase = mergeOptions(defaultOptions, AutoPlay.globalOptions);
    const allOptions = mergeOptions(optionsBase, userOptions);

    Object.assign(options, optionsAtMedia(allOptions));
    if (options.playOnInit) {
      start();
    }
  };

  const destroy = () => {};

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
