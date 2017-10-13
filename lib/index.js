var fs = require('fs');
var isHTML = require('is-html');
var path = require('path');

module.exports = function(request, options = {}) {
  var hasPageHTML = !!options.html;
  options.root = options.root || process.cwd();
  if (options.html && !isHTML(options.html)) {
    // It's a path
    var pth = options.html;
    if (!path.isAbsolute(pth)) {
      pth = path.join(options.root, pth);
    }
    options.html = fs.readFileSync(pth, 'utf8');
  }
  options.html = options.html || '<html></html>';

  return function(data) {
    var plugins = [require('./dom')(request, options.html)];

    // Only add the run-html plugin if page html is provided
    if (hasPageHTML) {
      plugins.push(require('./run-html')(request, options));
    }

    return {
      plugins: plugins,
      ended: function() {
        data.html = data.document.documentElement.outerHTML;
      }
    };
  };
};
