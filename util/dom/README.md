## mix.core.util.Dom

DOM操作

###包含的子模块

* selector

* event

* animation

* ajax

###使用方法

		var $ = require('selector');
		require('event');
		require('ajax');
		require('animation');

selector
====

 $()
 -------------


> $(selector, [context]) collection

> $(<Zepto collection>) same collection

> $(<DOM nodes>) collection

> $(htmlString) collection

	Zepto(function($){ ... })

 $.each
 -------------


> $.each(collection, function(index, item){ ... }) collection


 $.extend
 -------------


> $.extend(target, [source, [source2, ...]]) target

    Extend target object with properties from each of the source objects, overriding the properties on target.


 $.inArray
 -------------


> $.inArray(element, array, [fromIndex]) number


 $.isArray
 -------------


> $.isArray(object) boolean


 

 $.isFunction
 -------------


> $.isFunction(object) boolean


 $.isPlainObject 
 -------------


> $.isPlainObject(object) boolean


 $.map
 -------------


> $.map(collection, function(item, index){ ... }) collection


 $.trim
 -------------


> $.trim(string) string


 add
 -------------


> add(selector, [context]) self

    Modify the current collection by adding the results of performing the CSS selector on the whole document, or, if context is given, just inside context elements.

 addClass
 -------------


> addClass(name) self

> addClass(function(index, oldClassName){ ... }) self

 after
 -------------


> after(content) self

    Add content to the DOM after each elements in the collection. The content can be an HTML string, a DOM node or an array of nodes.
    eg:$('form label').after('<p>A note below the label</p>')

 append
 -------------


> append(content) self

    Append content to the DOM inside each individual element in the collection. The content can be an HTML string, a DOM node or an array of nodes.
    eg:$('ul').append('<li>new list item</li>')

 appendTo
 -------------


> appendTo(target) self

    Append elements from the current collection to the target element. This is like append, but with reversed operands.
    eg:$('<li>new list item</li>').appendTo('ul')

 attr
 -------------


> attr(name) string

> attr(name, value) self

> attr(name, function(index, oldValue){ ... }) self

> attr({ name: value, name2: value2, ... }) self


 before
 -------------


> before(content) self

 children
 -------------

> children([selector]) collection


 clone
 -------------


> clone() collection

    Duplicate all elements in the collection via deep clone.

 closest
 -------------


> closest(selector, [context]) collection

    Traverse upwards from the current element to find the first element that matches the selector. If context node is given, consider only elements that are its descendants. This method is similar to parents(selector), but it only returns the first ancestor matched.

 concat
 -------------


> concat(nodes, [node2, ...]) self

    Modify the collection by adding elements to it. If any of the arguments is an array, its elements are merged into the current collection.


 contents
 -------------


> contents() collection

    Get the children of each element in the collection, including text and comment nodes.


 css
 -------------

> css(property) value

> css(property, value) self

> css({ property: value, property2: value2, ... }) self

 data
 -------------


> data(name) string

> data(name, value) self

Read or write data-* DOM attributes. Behaves like attr, but prepends data- to the attribute name.


 each
 -------------


> each(function(index, item){ ... }) self


 empty
 -------------


> empty() self

 eq
 -------------


> eq(index) collection

 filter
 -------------


> filter(selector) collection


> filter(function(index){ ... }) collection


 find
 -------------


> find(selector) collection


 first
 -------------


> first() collection


 forEach
 -------------


> forEach(function(item, index, array){ ... }, [context])


 get
 -------------


> get() array

> get(index) DOM node


 hasClass
 -------------


> hasClass(name) boolean


 height
 -------------


> height() number

> height(value) self

> height(function(index, oldHeight){ ... }) self


 hide
 -------------


> hide() self


 html
 -------------


> html() string

> html(content) self

> html(function(index, oldHtml){ ... }) self

 index
 -------------


> index([element]) number


 indexOf
 -------------


> indexOf(element, [fromIndex]) number


 insertAfter
 -------------


> insertAfter(target) self

    eg:$('<p>Emphasis mine.</p>').insertAfter('blockquote')


 insertBefore
 -------------


> insertBefore(target) self

    eg:$('<p>See the following table:</p>').insertBefore('table')


 is
 -------------

    is(selector) boolean


 last
 -------------


> last() collection

Get the last element of the current collection.


 map
 -------------


> map(function(index, item){ ... }) array


 next
 -------------


> next() collection


> next(selector) collection


eg:$('dl dt').next()   //=> the DD elements


 not
 -------------


> not(selector) collection


> not(collection) collection


> not(function(index){ ... }) collection


 offset
 -------------


> offset() object


 parent
 -------------


> parent([selector]) collection


 parents
 -------------


> parents([selector]) collection


 pluck
 -------------


> pluck(property) array


 prepend
 -------------


> prepend(content) self

    Prepend content to the DOM inside each element in the collection. The content can be an HTML string, a DOM node or an array of nodes.
    eg:$('ul').prepend('<li>first list item</li>')


 prependTo
 -------------


> prependTo(target) self


 prev
 -------------


> prev() collection


> prev(selector) collection


 prop
 -------------


> prop(name) value

> prop(name, value) self

> prop(name, function(index, oldValue){ ... }) self

    Read or set properties of DOM elements. This should be preferred over attr in case of reading values of properties that change with user interaction over time, such as checked and selected.


 push
 -------------


> push(element, [element2, ...]) self


 ready
 -------------


> ready(function($){ ... }) self


 reduce
 -------------

 >reduce(function(memo, item, index, array){ ... }, [initial]) value

    Identical to Array.reduce that iterates over current collection.


 remove
 -------------

> remove() self

    Remove elements in the current collection from their parent nodes, effectively detaching them from the DOM.


 removeAttr
 -------------

> removeAttr(name) self


 removeClass
 -------------

> removeClass([name]) self

> removeClass(function(index, oldClassName){ ... }) self


 replaceWith
 -------------


> replaceWith(content) self

    Replace each element in the collection—both its contents and the element itself—with the new content. Content can be of any type described in before.

 show
 -------------

> show() self


 siblings
 -------------

> siblings([selector]) collection


 size
 -------------

> size() number

> Get the number of elements in this collection.


 slice
 -------------


> slice(start, [end]) array

 text
 -------------

> text() string

> text(content) self


 toggle
 -------------
> 
>toggle([setting]) self

    Toggle between showing and hiding each of the elements, based on whether the first element is visible or not. If setting is present, this method behaves like show if setting is truthy or hide otherwise.


 toggleClass
 -------------

> toggleClass(name, [setting]) self

> toggleClass(function(index, oldClassName){ ... }, [setting]) self


 unwrap
 -------------


> unwrap() self

`eg:$(document.body).append('<div id=wrapper><p>Content</p></div>')
$('#wrapper p').unwrap().parents()  //=[<body>, <html>]`


 val
 -------------

> val() string

> val(value) self

> val(function(index, oldValue){ ... }) self


 width
 -------------
> 

> width() number

> width(value) self

> width(function(index, oldWidth){ ... }) self


 wrap
 -------------

> wrap(content) self


 wrapAll
 -------------

> wrapAll(content) self


 wrapInner
 -------------
> 
> wrapInner(wrappingElement) self

Wrap an HTML structure around the content of each element in the set of matched elements. Wrapping element can be any type described in append.



ajax
====
 
>     $.ajax(options) XMLHttpRequest

 
 $.ajax
 -------------

>     $.ajaxJSONP(options) mock XMLHttpRequest

 
 $.ajaxJSONP
 
 -------------
 
    *   timeout (default: 0): set to a non-zero value to specify a default timeout for Ajax requests in milliseconds     
    
    *   global (default: true): set to false to prevent firing Ajax events
    
    *   xhr (default: XMLHttpRequest factory): set to a function that returns instances of XMLHttpRequest (or a compatible object)
    
    *   accepts: MIME types to request from the server for specific dataType values:
        script: “text/javascript, application/javascript”
        json: “application/json”
        xml: “application/xml, text/xml”
        html: “text/html”
        text: “text/plain”


 $.ajaxSettings

 -------------
 
>     $.get(url, function(data, status, xhr){ ... }) XMLHttpRequest

 $.get
 
 -------------
> 
>     $.getJSON(url, function(data, status, xhr){ ... }) XMLHttpRequest

 $.getJSON
 
 -------------

>     $.param(object, [shallow]) string
>     
>     $.param(array) string

 $.param
 
 -------------

>    $.post(url, [data], function(data, status, xhr){ ... }, [dataType]) 

 $.post
 
 -------------

 >    load(url, function(data, status, xhr){ ... }) self

 
 load



## Anmation ##

animate

----------
> 
> animate(properties, [duration, [easing, [function(){ ... }]]])  ⇒ self

> animate(properties, { duration: msec, easing: type, complete: fn })  ⇒ self

show

----------
> show()  ⇒ self

hide

----------
> hide()  ⇒ self

toggle

----------

> toggle([setting])  ⇒ self

fadeTo 

----------
> fadeTo(speed, opacity, callback)

fadeIn 

----------
> fadeIn(speed, callback)

fadeOut 

----------

> fadeOut(speed, callback)

fadeToggle 

----------

> fadeToggle(speed, callback)

