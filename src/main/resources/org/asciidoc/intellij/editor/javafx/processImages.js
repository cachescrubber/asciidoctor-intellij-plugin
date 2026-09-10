if (window.__IntelliJTools === undefined) {
  window.__IntelliJTools = {}
}

window.__IntelliJTools.processImageClick = function (event) {
  event.preventDefault();
  window.JavaPanelBridge.saveImage(this.src);
}

// A Kroki diagram the server rejected (HTTP 4xx, e.g. an include it cannot resolve) arrives as a broken image.
// kroki-placeholder.rb wraps every Kroki image in <div class="kroki-diagram" data-kroki-source="file://..."> so the
// broken image can be replaced by the same placeholder the Ruby side emits, with a link that opens the diagram
// source in the IDE editor (see JavaPanelBridge.openLink via processLinks.js).
window.__IntelliJTools.krokiImageFailed = function (img) {
  var wrapper = img.closest ? img.closest('.kroki-diagram') : null;
  if (!wrapper || wrapper.querySelector('.kroki-placeholder')) {
    return;
  }
  var type = wrapper.getAttribute('data-kroki-type') || 'kroki';
  var source = wrapper.getAttribute('data-kroki-source');
  var name = wrapper.getAttribute('data-kroki-name') || source;
  var box = document.createElement('div');
  box.className = 'kroki-placeholder';
  box.setAttribute('style', 'border: 1px dashed #999; border-radius: 4px; padding: 0.6em 0.9em; margin: 0.5em 0; ' +
    'font-family: sans-serif; font-size: 0.9em; background: rgba(128,128,128,0.08);');
  var title = document.createElement('div');
  var strong = document.createElement('strong');
  strong.textContent = type + ' diagram not rendered';
  title.appendChild(strong);
  box.appendChild(title);
  var message = document.createElement('div');
  message.className = 'kroki-placeholder-message';
  message.textContent = 'The Kroki server could not render this diagram (' + img.src.replace(/\/[^/]*$/, '/…') + ').';
  box.appendChild(message);
  if (source) {
    var open = document.createElement('div');
    var a = document.createElement('a');
    a.setAttribute('href', source);
    a.className = 'kroki-placeholder-open';
    a.textContent = 'Open ' + name;
    a.addEventListener('click', window.__IntelliJTools.processClick);
    open.appendChild(a);
    box.appendChild(open);
  }
  var content = img.closest('.imageblock') || img;
  content.parentNode.replaceChild(box, content);
}

window.__IntelliJTools.processImages = function () {
  var links = document.getElementsByTagName("img");
  for (var i = 0; i < links.length; ++i) {
    var link = links[i];
    link.addEventListener('contextmenu', window.__IntelliJTools.processImageClick);
  }
  var krokiImages = document.querySelectorAll('.kroki-diagram img');
  for (var j = 0; j < krokiImages.length; ++j) {
    var img = krokiImages[j];
    if (img.complete && img.naturalWidth === 0) {
      window.__IntelliJTools.krokiImageFailed(img);
    } else {
      img.addEventListener('error', function () { window.__IntelliJTools.krokiImageFailed(this); });
    }
  }
}

window.__IntelliJTools.clearImages = function () {
  var links = document.getElementsByTagName("img");
  for (var i = 0; i < links.length; ++i) {
    var link = links[i];
    link.removeEventListener('contextmenu', __IntelliJTools.processImageClick);
  }
}
