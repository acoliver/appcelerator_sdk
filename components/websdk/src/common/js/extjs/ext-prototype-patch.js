
if(window.Event) {
    Object.extend(Event,{
        element: function(event) {
          var node = Event.extend(event).target;
          return node && Element.extend(node.nodeType == Node.TEXT_NODE ? node.parentNode : node);
        },

        pointer: function(event) {
          return {
            x: event.pageX || (event.clientX +
              ((document && document.documentElement && document.documentElement.scrollLeft)
                  || (document && document.body && document.body.scrollLeft))),
            y: event.pageY || (event.clientY +
              ((document && document.documentElement && document.documentElement.scrollTop)
                  || (document && document.body && document.body.scrollTop)))
          };
        }
    });
}	
