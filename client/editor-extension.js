/**
 * Extends the Annotorious editor with the Semantic Tagging field.
 * @param {Object} annotator the annotator (provided by the Annotorious framework)
 */
annotorious.plugin.SemanticTagging.prototype._extendEditor = function(annotator) {
  var self = this,
      container = document.createElement('div'),
      idle_timeout,
      TRIGGER_CHARS = ". ,", // characters that force an NER lookup
      IDLE_THRESHOLD = 300;  // NER is also done after IDLE_THRESHOLD milliseconds of key idleness

  container.className = 'semtagging-editor-container';

  // Adds a tag
  var addTag = function(annotation, topic, opt_css_class) {
    self._tags[topic.id] = topic;

    var link = document.createElement('a');
    link.style.cursor = 'pointer';
    link.className = 'semtagging-tag semtagging-editor-tag annotorious-editor-button-save';
    link.innerHTML = topic.title;
    container.appendChild(link);

    var jqLink = jQuery(link);
    if (opt_css_class)
      jqLink.addClass(opt_css_class);

    jqLink.click(function() {
        $(".annotorious-editor-text").val(topic.title);
        $(".annotorious-editor-button-save").click();
     });
  };

  // Does the NER lookup
  var doNER = function(annotation, text) {
    jQuery.getJSON(self._ENDPOINT_URI + text, function(data) {
      if (data.detectedTopics.length > 0) {
        jQuery.each(data.detectedTopics, function(idx, topic) {
          // Add to cached tag list and UI, if it is not already there
          if (!self._tags[topic.id])
            addTag(annotation, topic);
        });
      }
    });
  };

  // Restarts the keyboard-idleness timeout
  var restartIdleTimeout = function(annotation, text) {
    if (idle_timeout)
      window.clearTimeout(idle_timeout);
    
    idle_timeout = window.setTimeout(function() { doNER(annotation, text); }, IDLE_THRESHOLD);
  };

  // Add a key listener to Annotorious editor (and binds stuff to it)
  annotator.editor.element.addEventListener('keyup', function(event) {
    var annotation = annotator.editor.getAnnotation(),
        text = annotation.text;

    if (text.length >= self._MINLENGTH) {
      restartIdleTimeout(annotation, text);

      if (TRIGGER_CHARS.indexOf(text[text.length - 1]) > -1)
        doNER(annotation, text);
    }
  });
  
  // add a base lookup for 0-length default display
  var annotationtmp = annotator.editor.getAnnotation();
  doNER(annotationtmp, "");

  // Final step: adds the field to the editor
  annotator.editor.addField(function(annotation) {
    self._tags = [];
    container.innerHTML = '';
    if (annotation && annotation.tags) { 
      jQuery.each(annotation.tags, function(idx, topic) {
        var css_class = (topic.status == 'rejected') ? 'rejected' : 'accepted';
        addTag(annotation, topic, css_class);
      });
    }
    return container;
  });
}
