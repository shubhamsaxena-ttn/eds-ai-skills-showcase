(function loadAEMGenAIVariationsPlugin() {
  const clientSrc = 'https://experience.adobe.com/solutions/aem-sites-genai-aem-genai-variations-mfe/static-assets/resources/sidekick/client.js?source=plugin';

  function loadAEMGenAIVariationsApp() {
    if (document.querySelector(`script[src="${clientSrc}"]`)) return;

    const script = document.createElement('script');
    script.src = clientSrc;
    script.onerror = function handleAEMGenAIVariationsError() {
      // eslint-disable-next-line no-console
      console.error('Error loading the AEM Generate Variations App.');
    };
    document.head.appendChild(script);
  }
  loadAEMGenAIVariationsApp();
}());
