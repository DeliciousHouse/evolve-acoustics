/*!
loadCSS: load a CSS file asynchronously.
[c]2017 @scottjehl, Filament Group, Inc.
Licensed MIT
*/
(function(w){
  "use strict";
  /* exported loadCSS */
  var loadCSS = function(href, before, media, attributes){
    // Arguments explained:
    // `href` [REQUIRED] is the URL for your CSS file.
    // `before` [OPTIONAL] is the element to use as a reference for injecting our stylesheet.
    // By default, loadCSS attempts to inject the link after the last stylesheet or script in the DOM. However, you might desire a more specific location in your document.
    // `media` [OPTIONAL] is the media type or query of the stylesheet. By default it will be 'all'.
    // `attributes` [OPTIONAL] is an object of name-value pairs to set on the stylesheet's DOM Element.
    var doc = w.document;
    var ss = doc.createElement("link");
    var ref;
    if(before){
      ref = before;
    }
    else {
      var refs = (doc.body || doc.getElementsByTagName("head")[0]).childNodes;
      ref = refs[refs.length - 1];
    }

    var sheets = doc.styleSheets;
    ss.rel = "stylesheet";
    ss.href = href;
    // temporarily set media to something inapplicable to ensure it'll fetch without blocking render
    ss.media = "only x";

    // wait until body is defined before injecting link. This ensures a non-blocking load in Firefox.
    function ready(cb){
      if(doc.body){
        return cb();
      }
      setTimeout(function(){
        ready(cb);
      });
    }
    // Inject link
    // Note: the ternary preserves the existing behavior of "before" argument, but we could choose to change the argument to "after" in a later release and standardize on ref.nextSibling for all refs
    // Note: `insertBefore` is used instead of `appendChild`, for safety re: http://www.paulirish.com/2011/surefire-dom-element-insertion/
    ready(function(){
      ref.parentNode.insertBefore(ss, (before ? ref : ref.nextSibling));
    });
    // A method for detecting if the browser supports preload
    var support = function(){
      try {
        return ss.sheet.cssRules.length === 0;
      } catch(e) {
        return false;
      }
    };
    // This feature detection determines whether the browser supports `onload` for link (stylesheet) elements.
    var onloadcssdefined = function(cb){
      var resolvedHref = ss.href;
      var i = sheets.length;
      while(i--){
        if(sheets[i].href === resolvedHref){
          return cb();
        }
      }
      setTimeout(function() {
        onloadcssdefined(cb);
      });
    };

    function loadCB(){
      if(ss.addEventListener){
        ss.removeEventListener("load", loadCB);
      }
      ss.media = media || "all";
    }

    // once loaded, set link's media back to `all` so that the stylesheet applies once it loads
    if(ss.addEventListener){
      ss.addEventListener("load", loadCB);
    }
    ss.onloadcssdefined = onloadcssdefined;
    onloadcssdefined(loadCB);
    return ss;
  };
  // commonjs
  if(typeof exports !== "undefined"){
    exports.loadCSS = loadCSS;
  }
  else{
    w.loadCSS = loadCSS;
  }
}(typeof global !== "undefined" ? global : this));

/* Preload polyfill for older browsers */
(function(w){
  // rel=preload support test
  if(!w.loadCSS){
    return;
  }
  var rp = loadCSS.relpreload = {};
  rp.support = function(){
    try {
      return w.document.createElement("link").relList.supports("preload");
    } catch(e) {
      return false;
    }
  };

  // loop preload links and fetch using loadCSS
  rp.poly = function(){
    var links = w.document.getElementsByTagName("link");
    for(var i = 0; i < links.length; i++){
      var link = links[i];
      if(link.rel === "preload" && link.getAttribute("as") === "style" && !link.getAttribute("data-loadcss")){
        // prevent rerunning on link
        link.setAttribute("data-loadcss", true);
        // bind listeners to link
        var href = link.href;
        var media = link.media || "all";
        var callback = function(){};
        var timeout = link.getAttribute("data-media-timeout") || 3000;

        setTimeout(function(){
          w.loadCSS(href, null, media, callback);
          link.rel = "stylesheet";
        }, timeout);
      }
    }
  };

  // if link[rel=preload] is not supported, we must fetch the CSS manually
  if(!rp.support()){
    rp.poly();

    // watch for changes in document.head to remove injected stylesheets for polyfilled preloads
    var run = w.setInterval(function(){
      if(w.document.body){
        w.clearInterval(run);
        rp.poly();
      }
    }, 500);

    // Add an event to load the polyfill for any added preload links
    w.addEventListener("load", function(){
      rp.poly();
    });
    w.addEventListener("DOMContentLoaded", function(){
      rp.poly();
    });
  }
}(this));
