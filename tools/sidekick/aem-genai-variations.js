(function loadAEMGenAIVariationsPlugin() {
  function loadAEMGenAIVariationsApp() {
    const script = document.createElement('script');
    script.src = 'https://experience.adobe.com/solutions/aem-sites-genai-aem-genai-variations-mfe/static-assets/resources/sidekick/client.js?source=plugin';
    script.onerror = function handleAEMGenAIVariationsError() {
      // eslint-disable-next-line no-console
      console.error('Error loading the AEM Generate Variations App.');
    };
    document.head.appendChild(script);
  }
  loadAEMGenAIVariationsApp();
}());
