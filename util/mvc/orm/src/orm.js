define(function(require, exports, module) {

require('reset');

var Class = require('class'),
  _ = require('utilities'),
  Model = require('model')
  ;

ORM = Model.extend({
  test:function(){
    console.log(this.init());
  },
  init:function(){
    this.records = {};
    this.attributes = [];
  },
  find: function(id){
    var record = this.records[id];
    if ( !record ) throw("Unknown record");
    return record.dup();
  },
  exists: function(id){
    try {
     return this.find(id);
    } catch (e) {
     return false;
    }
  },
  populate: function(values){
    // Reset model & records
    this.records = {};

    for (var i=0, il = values.length; i < il; i++) {    
     var record = this.inst(values[i]);
     record.newRecord = false;
     this.records[record.id] = record;
    }
  },
  select: function(callback){
   var result = [];
   
   for (var key in this.records)
     if (callback(this.records[key]))
       result.push(this.records[key]);
   
   return this.dupArray(result);
  },

  findByAttribute: function(name, value){
   for (var key in this.records)
     if (this.records[key][name] == value)
       return this.records[key].dup();
  },

  findAllByAttribute: function(name, value){
   return(this.select(function(item){
     return(item[name] == value);
   }));
  },

  each: function(callback){
   for (var key in this.records) {
     callback(this.records[key]);
   }
  },

  all: function(){
   return this.dupArray(this.recordsValues());
  },

  first: function(){
   var record = this.recordsValues()[0];
   return(record && record.dup());
  },

  last: function(){
   var values = this.recordsValues()
   var record = values[values.length - 1];
   return(record && record.dup());
  },

  count: function(){
   return this.recordsValues().length;
  },

  deleteAll: function(){
   for (var key in this.records)
     delete this.records[key];
  },

  destroyAll: function(){
   for (var key in this.records)
     this.records[key].destroy();
  },

  update: function(id, atts){
   this.find(id).updateAttributes(atts);
  },

  create: function(atts){
   var record = this.inst(atts);
   record.save();
   return record;
  },

  destroy: function(id){
   this.find(id).destroy();
  },

  // Private

  recordsValues: function(){
   var result = []
   for (var key in this.records)
     result.push(this.records[key])
   return result;
  },

  dupArray: function(array){
   return array.map(function(item){
     return item.dup();
   });
  }

});

/*
ORM = Model.include({
  xxx:function(){alert(1);}
});
*/

ORM.singleton = new ORM;
ORM.Model = Model;

module.exports = ORM;

});

