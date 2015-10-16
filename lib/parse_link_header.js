module.exports = function (linkHeader) {
  var links = {};
  linkHeader.split(/\s*,\s*/).forEach(function (link) {
    var matches = link.match(/<([^>]+)>;\s+rel="([^"]+)"/);
    if (matches) {
      links[matches[2]] = matches[1];
    }
  });
  return links;
}
