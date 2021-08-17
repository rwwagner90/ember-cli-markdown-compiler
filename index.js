'use strict';

var Filter = require('broccoli-filter');
var marked = require('marked');
marked.setOptions({
  gfm: true,
  highlight(code) {
    return require('highlight.js').highlightAuto(code).value;
  }
});

function TemplateCompiler(inputNode, options) {
  if (!(this instanceof TemplateCompiler)) {
    return new TemplateCompiler(inputNode, options);
  }

  options = options || {};
  Filter.call(this, inputNode, options);
  this.compile = marked;
}

TemplateCompiler.prototype = Object.create(Filter.prototype);
TemplateCompiler.prototype.constructor = TemplateCompiler;
TemplateCompiler.prototype.extensions = ['md'];
TemplateCompiler.prototype.targetExtension = 'hbs';

TemplateCompiler.prototype.processString = function(string) {
  return this.compile(string).replace(/&quot;/g, '"').replace(/<pre>[\s\S]*<\/pre>/g, function(match) {
    return match.replace(/{/g, '&#x7B;');
  });
};

module.exports = {
  name: require('./package').name,

  isDevelopingAddon: function() {
    return true;
  },

  setupPreprocessorRegistry(type, registry) {
    registry.add('template', {
      name: 'ember-cli-markdown-compiler',
      ext: ['md'],
      toTree(tree) {
        return TemplateCompiler(tree);
      }
    });

    if (type === 'parent') {
      this.parentRegistry = registry;
    }
  },

  included(app) {
    this._super.included.apply(this, arguments);

    this.setupPreprocessorRegistry('parent', app.registry);
  }

};
