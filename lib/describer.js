(function() {
  var availableActions, cleanItem, getClasses, getPropertyName, getTransitionUrl, hasData, isAvailableAction, isEntity, isProperty, isReadTransition, isTemplated, isTransition, mapEntity, mapProperty, mapTransition, mapUberDocument, modifiesBody,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  mapUberDocument = module.exports = function(uber) {
    return {
      hyperdescribe: mapEntity(uber.uber, 0)
    };
  };

  cleanItem = function(data) {
    return Object.keys(data).reduce(function(total, key) {
      if ((data[key] != null) && data[key].length !== 0) {
        total[key] = data[key];
      }
      return total;
    }, {});
  };

  getClasses = function(data) {
    if (data.name != null) {
      return [data.name];
    } else {
      return null;
    }
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

  isEntity = function(data, level) {
    return (data.action == null) && hasData(data, level);
  };

  mapEntity = function(data, level) {
    var content, entities, hEntities, hProperties, hTransitions, properties, transitions, version;
    transitions = data.data.filter(function(d) {
      return isTransition(d, level);
    });
    entities = data.data.filter(function(d) {
      return isEntity(d, level);
    });
    properties = data.data.filter(function(d) {
      return isProperty(d, level);
    });
    hTransitions = transitions.map(function(transition) {
      return mapTransition(transition);
    });
    hEntities = entities.map(function(resource) {
      return mapEntity(resource, level + 1);
    });
    hProperties = properties.map(function(property) {
      return mapProperty(property);
    });
    if (level === 0) {
      version = "0.1.0";
    }
    content = cleanItem({
      transitions: hTransitions,
      entities: hEntities,
      properties: hProperties
    });
    return cleanItem({
      version: version,
      id: data.id,
      classes: getClasses(data),
      rels: data.rel,
      property: getPropertyName(data, level),
      content: content
    });
  };

  availableActions = {
    append: 'POST',
    partial: 'PATCH',
    read: 'GET',
    remove: 'DELETE',
    replace: 'PUT'
  };

  modifiesBody = ['append', 'partial', 'replace'];

  isAvailableAction = function(data) {
    var _ref;
    return _ref = data.action, __indexOf.call(Object.keys(availableActions), _ref) >= 0;
  };

  hasData = function(data, level) {
    var _ref;
    return (data.data != null) && ((_ref = data.data) != null ? _ref.length : void 0) !== 0;
  };

  isTemplated = function(data) {
    return isReadTransition(data) && (data.model != null);
  };

  isReadTransition = function(data) {
    var _ref;
    return (data.action == null) || data.action === 'read' || (_ref = data.action, __indexOf.call(Object.keys(availableActions), _ref) < 0);
  };

  isTransition = function(data, level) {
    if (hasData(data)) {
      return (data.url != null) && isAvailableAction(data) && !isReadTransition(data);
    } else {
      return data.url != null;
    }
  };

  getTransitionUrl = function(data) {
    if (isReadTransition(data) && (data.model != null)) {
      return data.url + data.model;
    } else {
      return data.url;
    }
  };

  mapTransition = function(data, level) {
    var transition, _ref;
    transition = {
      id: data.id,
      classes: getClasses(data),
      url: getTransitionUrl(data),
      rels: data.rel,
      property: getPropertyName(data, level),
      responseTypes: data.accepting,
      requestTypes: data.sending,
      label: data.value
    };
    if ((_ref = data.action, __indexOf.call(modifiesBody, _ref) >= 0) && (data.model != null)) {
      transition.bodyTemplate = data.model;
    }
    if (data.action != null) {
      transition.method = availableActions[data.action];
    }
    if (isTemplated(data)) {
      transition.isTemplated = true;
    }
    return cleanItem(transition);
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

}).call(this);
