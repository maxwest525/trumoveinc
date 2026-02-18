import { useEffect } from 'react';

export default function ElevenLabsTrudyWidget() {
  useEffect(() => {
    // Inject the ElevenLabs convai widget script once
    if (!document.querySelector('script[src*="elevenlabs/convai-widget-embed"]')) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
      script.async = true;
      script.type = 'text/javascript';
      document.body.appendChild(script);
    }
  }, []);

  return (
    // @ts-ignore – custom element from ElevenLabs embed script
    <elevenlabs-convai agent-id="agent_4401khaanh17fpnadka6stynd05f" />
  );
}
