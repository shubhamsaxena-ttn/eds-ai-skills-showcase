(function () {
    let isAEMGenAIVariationsAppLoaded = false;
    function loadAEMGenAIVariationsApp() {
      const script = document.createElement('script');
      script.src = 'https://experience.adobe.com/solutions/aem-sites-genai-aem-genai-variations-mfe/static-assets/resources/sidekick/client.js?source=plugin';
      script.onload = function () {
        isAEMGenAIVariationsAppLoaded = true;
      };
      script.onerror = function () {
        console.error('Error loading the AEM Generate Variations App.');
      };
      document.head.appendChild(script);
    }
    loadAEMGenAIVariationsApp();
  })();