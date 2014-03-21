# UBER and Hyperdescribe Describer

The goal of this document is to outline how Hyperdescribe would be used to describe a UBER document according to the [current specs](https://rawgithub.com/mamund/media-types/e034e9d9eae7fb4455f25c928cb84cd513f9472c/uber-hypermedia.html). This document will look at the JSON variant of the UBER format.

## UBER Document

Mapping an UBER document to Hyperdescribe requires treating the root `@uber` element as a resource. Since each resource can have nested resources, Hyperdescribe should map each resource recursively.

    mapUberDocument = module.exports = (uber) -> 
      hyperdescribe: mapEntity(uber.uber, 0)

    cleanItem = (data) ->
      Object.keys(data).reduce (total, key) ->
        total[key] = data[key] if data[key]? and data[key].length != 0
        total
      , {}

    getClasses = (data) ->
      if data.name? then [data.name] else null

    getPropertyName = (data, level) ->
      if level != 0
        if data.id? then data.id else data.name

## Types

Even though UBER really only has one data element, `data`, this data element can be treated differently depending on the context. This section will look at each of these different types along with the conditions for those types and the means to describe them with Hyperdescribe.

### Resources

An item considered a resource MUST NOT have an `@action` attribute and MUST have a `@data` attribute. Any `@value` attribute will be ignored. Like the `data` element in UBER, Hyperdescribe can handle nested resources.

    isEntity = (data, level) ->
      !data.action? and hasData(data, level)

Mapping an element from UBER to Hyperdescribe requires finding all of the transitions and properties, along with all nested entities. Once those are all found, they can then be mapped to Hyperdescribe

    mapEntity = (data, level) ->
      transitions = data.data.filter (d) -> isTransition(d, level)
      entities = data.data.filter (d) -> isEntity(d, level)
      properties = data.data.filter (d) -> isProperty(d, level)

      hTransitions = transitions.map (transition) -> mapTransition(transition)
      hEntities = entities.map (resource) -> mapEntity(resource, level + 1)
      hProperties = properties.map (property) -> mapProperty(property)

      version = "0.1.0" if level == 0

      content = cleanItem
        transitions: hTransitions
        entities: hEntities
        properties: hProperties

      cleanItem
        version: version
        id: data.id
        classes: getClasses(data)
        rels: data.rel
        property: getPropertyName(data, level)
        content: content

### Transitions

UBER specifies available actions and also provides a mapping of these actions to their corresponding HTTP verbs (see [section 4.1.1](https://rawgithub.com/mamund/media-types/master/uber-hypermedia.html#_mapping_uber_tt_action_tt_values_to_http_methods)).

    availableActions =
      append: 'POST'
      partial: 'PATCH'
      read: 'GET'
      remove: 'DELETE'
      replace: 'PUT'

    modifiesBody = [
      'append'
      'partial'
      'replace'
    ]

    isAvailableAction = (data) ->
      data.action in Object.keys(availableActions)

    hasData = (data, level) ->
      data.data? and data.data?.length != 0

    isTemplated = (data) ->
      isReadTransition(data) and data.model?

    isReadTransition = (data) ->
      !data.action? or 
        data.action == 'read' or 
        data.action not in Object.keys(availableActions)

If an element has data, for it to be considered a transition, it MUST have a `@url` property, it MUST be an available action, and it MUST NOT be a read transition.

If an element does not have data, the only thing it MUST have is a `@url`.

Reason being, we do not need to describe read links with data because that information will be gathered in the entity object itself under the `@url` property.

    isTransition = (data, level) ->
      if hasData(data)
        data.url? and 
          isAvailableAction(data) and
          !isReadTransition(data)
      else
        data.url?

    getTransitionUrl = (data) ->
      if isReadTransition(data) and data.model? 
        data.url + data.model 
      else 
        data.url

When a link is nested, it SHOULD have a `@property` attribute. The value of this attribute MUST be the `@id` if it is set, and if not, it MUST be the `@name` unless it is undefined.

    mapTransition = (data, level) ->
      transition = 
        id: data.id
        classes: getClasses(data)
        url: getTransitionUrl(data)
        rels: data.rel
        property: getPropertyName(data, level)
        responseTypes: data.accepting
        requestTypes: data.sending
        label: data.value

If a this particular transition modifies the body of the request and has a `@model` property, the `@model` value will be given to the `@bodyTemplate` property.

      transition.bodyTemplate = data.model if data.action in modifiesBody and data.model?

If this element has an `@action` property, the corresponding HTTP verb will be used for the `@method`.

      transition.method = availableActions[data.action] if data.action?

Templated URLs will require `@isTemplated` to be set to `true`. A transition is templated when it is a `read` action and it has a `@model` property.

      transition.isTemplated = true if isTemplated(data)

      cleanItem transition

### Properties

An item that is considered a property of a resource MUST have a `@value`, MUST NOT be at the root level (or in other words, MUST be a child element), MUST NOT be a transition, and MUST NOT have a `@data` attribute.

    isProperty = (data, level) ->
      data.value? and level != 0 and !isTransition(data, level) and !hasData(data, level)

Currently, with regards to mapping to Hyperdescribe, the only relevant values will be `@name` and `@value`.

    mapProperty = (data) ->
      cleanItem
        name: data.name
        value: data.value


