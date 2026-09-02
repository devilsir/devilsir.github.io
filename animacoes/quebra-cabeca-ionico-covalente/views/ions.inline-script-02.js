(function(){
  if (window.self !== window.top) return;
  [
    '../../../../Chat/widget/vlibras-widget.js?v=vlibras-20260430b',
    '../../../../Chat/widget/simoens-accessibility.js?v=a11y-widget-20260430a'
  ].forEach(function(src){
    var s = document.createElement('script');
    s.src = src;
    document.body.appendChild(s);
  });
})();
