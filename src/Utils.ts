import { EmblaCarouselType } from 'embla-carousel/components/EmblaCarousel';
import { RootNodeType } from './Options';

function getAutoplayRootNode(
  emblaApi: EmblaCarouselType,
  rootNode: RootNodeType
): HTMLElement {
  const emblaRootNode = emblaApi.rootNode();
  return (rootNode && rootNode(emblaRootNode)) || emblaRootNode;
}

export { getAutoplayRootNode };
