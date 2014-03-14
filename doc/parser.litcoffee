# UBER and Hyperdescribe

The goal of this document is to outline how Hyperdescribe would be used to describe a UBER document according to the [current specs](https://rawgithub.com/mamund/media-types/e034e9d9eae7fb4455f25c928cb84cd513f9472c/uber-hypermedia.html). This document will look at the JSON variant of the UBER format.

    _ = require 'underscore'

    cleanItem = (data) ->
      _.reduce data, (total, value, key) ->
        total[key] = value if value? and value.length != 0
        total
      , {}

## Types

Even though UBER really only has one data element, `data`, this data element can be treated differently depending on the context. This section will look at each of these different types along with the conditions for those types and the means to describe them with Hyperdescribe.

### Transitions

In Hyperdescribe, there are two types of transitions:

1. Links
2. Actions

In the UBER spec, though, links and actions are not separated in this way, so this document will specify how it is determined whether an item is a link or an action.

#### Links

Items in UBER that are considered links in Hyperdescribe are items with `read` as the action. If the `@action` attribute is absent and the `@url` attribute is present, the action is assumed to be `read`. Additionally, if the action specified is not listed in the spec, it should be treated as `read`. This is according to the UBER spec.

For an item to be considered a link, it MUST have a `@url` attribute, it MUST NOT have any data, and it MUST be a `read` action.

    #getPropertyName = (data) ->
    #  if data.id? then id else data.name

    hasData = (data, level) ->
      data.data? and data.data?.length != 0

    isReadAction = (data) ->
      (!data.action? or 
        data.action == 'read' or 
        data.action not in _.keys(availableActions))

    isLink = (data, level) ->
      data.url? and !hasData(data, level) and isReadAction(data)

    mapLink = (data) ->
      linkUrl = if data.model? then data.url + data.model else data.url

      link =
        id: data.id
        name: data.name
        rel: data.rel
        #property: getPropertyName(data)
        transclude: data.transclude
        types: data.accepting
        label: data.value

      link.href = if data.model? then data.url + data.model else data.url
      link.template = true if data.model?

      link

#### Actions

UBER only specifies available actions and also provides a mapping of these actions to their corresponding HTTP verbs (see [section 4.1.1](https://rawgithub.com/mamund/media-types/master/uber-hypermedia.html#_mapping_uber_tt_action_tt_values_to_http_methods)).

    availableActions =
      append: 'POST'
      partial: 'PATCH'
      read: 'GET'
      remove: 'DELETE'
      replace: 'PUT'

Items that are considered actions MUST have an `@action` attribute, MUST have a `@url`, MAY have a `@model`, and MUST use an avaiable action from the spec.

    isAction = (data, level) ->
      data.action? and
        data.url? and
        data.action in _.keys(availableActions)

According to 4.1.1, there are only three actions that modify the body of the message sent:

* append
* partial
* replace

Since `read` actions are handled by links, `remove` is the only action that needs special treatment.

    modifiesBody = [
      'append'
      'partial'
      'replace'
    ]

    parseBodyModel = (model) ->
      items = model.split('&').map (item) ->
        [key, value] = item.split('=')
        { name: key, type: "text", mapsTo: value[1..-2] }

    mapAction = (data) ->
      action = 
        name: data.name
        rel: data.rel
        method: availableActions[data.action]
        sendAs: data.sending

If an action is one that does not modify the body, the model is added to the action's `@url` attribute and template is set to `true`, which conveys it is templated action.

      if data.action not in modifiesBody and data.model?
        action.url = data.url + data.model
        action.template = true

If the action does modify the body, the model is parsed and fields are created.

      if data.action in modifiesBody
        action.url = data.url
        action.fields = parseBodyModel(data.model)
      cleanItem(action)

### Properties

An item that is considered a property of a resource MUST have a `@value`, MUST NOT be at the root level (or in other words, MUST be a child element), MUST NOT be a transition, and MUST NOT have a `@data` attribute.

    isTransition = (data, level) ->
      isLink(data, level) or isAction(data, level)

    isProperty = (data, level) ->
      data.value? and level != 0 and !isTransition(data, level) and !hasData(data, level)

Currently, with regards to mapping to Hyperdescribe, the only relevant values will be `@name` and `@value`.

    mapProperty = (data) ->
      cleanItem
        name: data.name
        value: data.value

### Resources

An item considered a resource MUST NOT have an `@action` attribute and MUST have a `@data` attribute. Any `@value` attribute will be ignored. Like the `data` element in UBER, Hyperdescribe can handle nested resources.

    isResource = (data, level) ->
      !data.action? and hasData(data, level)

Mapping a resource from UBER to Hyperdescribe requires finding all of the links, actions, and properties, along with all nested resources. Once those are all found, they can then be mapped to how 

    mapResource = (data, level) ->
      links = data.data.filter (d) -> isLink(d, level)
      actions = data.data.filter (d) -> isAction(d, level)
      resources = data.data.filter (d) -> isResource(d, level)
      properties = data.data.filter (d) -> isProperty(d, level)

      hLinks = links.map (link) -> mapLink(link)
      hActions = actions.map (action) -> mapAction(action)
      hResources = resources.map (resource) -> mapResource(resource, level + 1)
      hProperties = properties.map (property) -> mapProperty(property)

      cleanItem
        name: data.name
        links: hLinks
        actions: hActions
        resources: hResources
        properties: hProperties

## UBER Document

Mapping an UBER document to Hyperdescribe requires treating the root `@uber` element as a resource. Since each resource can have nested resources, Hyperdescribe should map each resource recursively.

    mapUberDocument = module.exports = (uber) -> mapResource(uber.uber, 0)

## Issues

1. There is currently no way to tell whether a nested link should be a property of the resource (e.g. the `avatarUrl` in the example in the spec) or just a normal link. 
2. Is there any way to specify schema.org information for an UBER document?

