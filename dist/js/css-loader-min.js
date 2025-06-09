/*! loadCSS. [c]2017 Filament Group, Inc. MIT License */
(function(w){
  var loadCSS = function(href, before, media) {
    var doc = w.document;
    var ss = doc.createElement("link");
    ss.rel = "stylesheet";
    ss.href = href;
    ss.media = "only x";
    doc.head.appendChild(ss);
    setTimeout(function(){
      ss.media = media || "all";
    }, 0);
    return ss;
  };
  w.loadCSS = loadCSS;
}(typeof global !== "undefined" ? global : this));