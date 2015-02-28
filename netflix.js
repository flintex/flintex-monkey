/*global netflix*/
(function(){
  var vp = netflix && netflix.cadmium && netflix.cadmium.objects &&
    netflix.cadmium.objects.videoPlayer &&
    netflix.cadmium.objects.videoPlayer();

  function deleteNonVideoElements() {
    var playerElement = document.getElementById('netflix-player');
    var children = playerElement.children;
    var i = 0;
    while (i < children.length) {
      if (children[i].classList.contains('player-video-wrapper')) {
        i++;
      } else {
        playerElement.removeChild(children[i]);
      }
    }
  }

  function flintexMessageListener(evt){
    var incoming = evt.data;
    var origin = evt.origin;
    var source = evt.source;
    function resolve(message) {
      source.postMessage({
        event: 'response',
        id: incoming.id,
        response: message
      }, origin || '*');
    }
    function reject(message) {
      source.postMessage({
        event: 'error',
        id: incoming.id,
        response: message
      }, origin || '*');
    }

    switch(incoming.api) {
      case 'netflix.cadmium.objects.videoPlayer':
        if (vp) {
          if (incoming.method in vp) {
            resolve(vp[incoming.method].apply(vp, incoming.arguments || []));
          } else {
            reject({
              message: 'Unsupported method',
              method: incoming.method
            });
          }
        } else {
          reject({
            message: 'nextflix.cadmium.objects.videoPlayer is not available',
          });
        }
        break;
      case 'flintex.v0_1':
        switch(incoming.method) {
          case 'respond':
            resolve(true);
            break;
          case 'deleteNonVideoElements':
            try {
              deleteNonVideoElements();
              resolve();
            } catch (err) {
              reject({message: err.message});
            }
            break;
          default:
            reject({
              message: 'Unsupported method',
              method: incoming.method
            });
            break;
        }
        break;
    }
  }

  addEventListener('message',flintexMessageListener);
})();
