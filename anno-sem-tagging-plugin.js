annotorious.plugin.SemanticTagging = function(opt_config_options) {
  /** @private **/
  this._ENDPOINT_URI = opt_config_options['endpoint_url'];
}

annotorious.plugin.SemanticTagging.prototype.initPlugin = function(anno) {

}

annotorious.plugin.SemanticTagging.prototype.onInitAnnotator = function(annotator) {
  // TODO make this work across browsers! 
  annotator.editor.element.addEventListener('keyup', function(event) {
    // This will construct a new annotation on every keyup
    // TODO add method to get raw text for performance increase!
    var txt = annotator.editor.getAnnotation().text;
    if (txt.length % 5 == 0)
      console.log(txt);
  });
}
