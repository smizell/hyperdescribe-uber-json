(function() {
  var availableActions, cleanItem, getPropertyName, hasData, isAction, isLink, isProperty, isReadAction, isResource, isTransition, mapAction, mapLink, mapProperty, mapResource, mapUberDocument, mapValue, modifiesBody, parseBodyModel,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  cleanItem = function(data) {
    return Object.keys(data).reduce(function(total, key) {
      if ((data[key] != null) && data[key].length !== 0) {
        total[key] = data[key];
      }
      return total;
    }, {});
  };

  availableActions = {
    append: 'POST',
    partial: 'PATCH',
    read: 'GET',
    remove: 'DELETE',
    replace: 'PUT'
  };

  hasData = function(data, level) {
    var _ref;
    return (data.data != null) && ((_ref = data.data) != null ? _ref.length : void 0) !== 0;
  };

  isReadAction = function(data) {
    var _ref;
    return (data.action == null) || data.action === 'read' || (_ref = data.action, __indexOf.call(Object.keys(availableActions), _ref) < 0);
  };

  isLink = function(data, level) {
    return (data.url != null) && !hasData(data, level) && isReadAction(data);
  };

  getPropertyName = function(data, level) {
    if (level !== 0) {
      if (data.id != null) {
        return data.id;
      } else {
        return data.name;
      }
    }
  };

  mapLink = function(data, level) {
    var link, linkUrl;
    linkUrl = data.model != null ? data.url + data.model : data.url;
    link = {
      id: data.id,
      name: data.name,
      rel: data.rel,
      property: getPropertyName(data, level),
      transclude: data.transclude,
      types: data.accepting,
      label: data.value
    };
    link.href = data.model != null ? data.url + data.model : data.url;
    if (data.model != null) {
      link.template = true;
    }
    return link;
  };

  isAction = function(data, level) {
    var _ref;
    return (data.action != null) && (data.url != null) && (_ref = data.action, __indexOf.call(Object.keys(availableActions), _ref) >= 0);
  };

  modifiesBody = ['append', 'partial', 'replace'];

  mapValue = function(value) {
    if (value[0] === '{') {
      return value.slice(1, -1);
    } else {
      return value;
    }
  };

  parseBodyModel = function(model) {
    var items;
    return items = model.split('&').map(function(item) {
      var key, value, _ref;
      _ref = item.split('='), key = _ref[0], value = _ref[1];
      return {
        name: key,
        type: "text",
        mapsTo: mapValue(value)
      };
    });
  };

  mapAction = function(data, level) {
    var action, _ref, _ref1;
    action = {
      name: data.name,
      rel: data.rel,
      method: availableActions[data.action],
      sendAs: data.sending,
      property: getPropertyName(data, level)
    };
    if ((_ref = data.action, __indexOf.call(modifiesBody, _ref) < 0) && (data.model != null)) {
      action.url = data.url + data.model;
      action.template = true;
    }
    if (_ref1 = data.action, __indexOf.call(modifiesBody, _ref1) >= 0) {
      action.url = data.url;
      action.fields = parseBodyModel(data.model);
    }
    return cleanItem(action);
  };

  isTransition = function(data, level) {
    return isLink(data, level) || isAction(data, level);
  };

  isProperty = function(data, level) {
    return (data.value != null) && level !== 0 && !isTransition(data, level) && !hasData(data, level);
  };

  mapProperty = function(data) {
    return cleanItem({
      name: data.name,
      value: data.value
    });
  };

  isResource = function(data, level) {
    return (data.action == null) && hasData(data, level);
  };

  mapResource = function(data, level) {
    var actions, hActions, hLinks, hProperties, hResources, links, properties, resources;
    links = data.data.filter(function(d) {
      return isLink(d, level);
    });
    actions = data.data.filter(function(d) {
      return isAction(d, level);
    });
    resources = data.data.filter(function(d) {
      return isResource(d, level);
    });
    properties = data.data.filter(function(d) {
      return isProperty(d, level);
    });
    hLinks = links.map(function(link) {
      return mapLink(link);
    });
    hActions = actions.map(function(action) {
      return mapAction(action);
    });
    hResources = resources.map(function(resource) {
      return mapResource(resource, level + 1);
    });
    hProperties = properties.map(function(property) {
      return mapProperty(property);
    });
    return cleanItem({
      name: data.name,
      property: getPropertyName(data, level),
      links: hLinks,
      actions: hActions,
      resources: hResources,
      properties: hProperties
    });
  };

  mapUberDocument = module.exports = function(uber) {
    return mapResource(uber.uber, 0);
  };

}).call(this);
