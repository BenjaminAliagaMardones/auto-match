import { useEffect, useId, useMemo } from 'react'; 

const GPT_SCRIPT_SRC = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';
const DEFAULT_AD_SIZES = [[300, 250]];

const loadGooglePublisherTag = () => {
  // TODO: load GPT real when Google Ad Manager account configuration is ready.
  if (document.querySelector(`script[src="${GPT_SCRIPT_SRC}"]`)) {
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = GPT_SCRIPT_SRC;
  document.head.appendChild(script);
};

export default function GoogleAdSlot({ networkCode, adUnit, sizes = DEFAULT_AD_SIZES, className = '' }) {
  const reactId = useId();
  const slotId = useMemo(
    () => `gam-slot-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`,
    [reactId],
  );

  useEffect(() => {
    if (!networkCode || !adUnit) {
      return undefined;
    }

    window.googletag = window.googletag || { cmd: [] };
    loadGooglePublisherTag();

    let slot;
    const slotPath = `/${networkCode}/${adUnit}`;

    window.googletag.cmd.push(() => {
      slot = window.googletag.defineSlot(slotPath, sizes, slotId);

      if (!slot) {
        return;
      }

      slot.addService(window.googletag.pubads());
      window.googletag.pubads().enableSingleRequest();
      window.googletag.enableServices();
      window.googletag.display(slotId);
    });

    return () => {
      window.googletag?.cmd?.push(() => {
        if (slot) {
          window.googletag.destroySlots([slot]);
        }
      });
    };
  }, [adUnit, networkCode, sizes, slotId]);

  return <div id={slotId} className={className} />;
}
