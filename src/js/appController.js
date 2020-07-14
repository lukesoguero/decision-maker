/**
 * @license
 * Copyright (c) 2014, 2020, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your application specific code will go here
 */
define(['ojs/ojresponsiveutils', 'ojs/ojresponsiveknockoututils', 'knockout', 'ojs/ojarraydataprovider', 'ojs/ojknockout', 'ojs/ojnavigationlist', 'ojs/ojswitcher', 'ojs/ojformlayout',
        'ojs/ojinputtext', 'ojs/ojbutton', 'ojs/ojdialog', 'ojs/ojtable'],
  function(ResponsiveUtils, ResponsiveKnockoutUtils, ko, ArrayDataProvider) {
     function ControllerViewModel() {

      // Media queries for repsonsive layouts
      const smQuery = ResponsiveUtils.getFrameworkQuery(ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY);
      this.smScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(smQuery);

      this.selectedTab = ko.observable("pairwise");

      var items = ko.observableArray(["", "", ""]);
      this.itemsDP = new ArrayDataProvider(items);

      this.item1 = ko.observable();
      this.item2 = ko.observable();
      var tuples = [];
      var currTuple = -1;

      var scores = new Map();
      var scoresData = ko.observableArray([]);
      this.scoresDP = new ArrayDataProvider(scoresData, {keyAttributes: 'itemName'});
      
      this.comparisonFinished = ko.observable(false);

      this.onValueChanged = function(event, current) {
        var index = current.observableIndex();
        items()[index] = current.data;
      }.bind(this);

      this.addItem = function() {
        items.push("");
      }.bind(this)

      this.removeItem = function(event, current) {
        var index = current.observableIndex();
        if (items().length > 2) {
          items.splice(index, 1);
        }
      }.bind(this);

      function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
      }

      this.compare = function() {
        // Remove empty strings from list
        var noEmpty = items().filter(function(item) {
          return item != "";
        });
        items(noEmpty);
        for (var i = 0; i < items().length; i++) {
          // Initialize scores map
          scores.set(items()[i], 0);
          for (var j = i+1; j < items().length; j++) {
            // Create list of pairs
            if (Math.floor(Math.random() * 2)) {
              tuples.push([items()[i], items()[j]]);
            } else {
              tuples.push([items()[j], items()[i]]);
            }
          }
        }
        shuffleArray(tuples);
        this.step();
      }.bind(this);

      this.step = function() {
        currTuple++;
        if (currTuple >= tuples.length) {
          document.getElementById("modalDialog").close();
          this.formatResults();
          this.comparisonFinished(true);
          return 0;
        }
        var tuple = tuples[currTuple];
        this.item1(tuple[0]);
        this.item2(tuple[1]);
        document.getElementById("modalDialog").open();
      }.bind(this);

      this.chooseItem1 = function() {
        scores.set(this.item1(), scores.get(this.item1())+1);
        this.step();
      }.bind(this);

      this.chooseItem2 = function() {
        scores.set(this.item2(), scores.get(this.item2())+1);
        this.step();
      }.bind(this);

      this.formatResults = function() {
        const sortedMap = new Map([...scores.entries()].sort((a, b) => b[1] - a[1]));
        var i = 1;
        sortedMap.forEach(function(value, key) {
          var scoreRow = {ranking: i,
            itemName: key,
            score: value};
          scoresData.push(scoreRow);
          i++;
        }, this);
      }.bind(this);

      this.closeDialog = function() {
        document.getElementById("modalDialog").close();
        this.item1("");
        this.item2("");
        tuples = [];
        currTuple = -1;
        scores = new Map();
        scoresData([]);
      }.bind(this);

      this.reset = function() {
        items(["", "", ""]);
        this.item1("");
        this.item2("");
        tuples = [];
        currTuple = -1;
        scores = new Map();
        scoresData([]);
        var inputFields = document.querySelectorAll('oj-input-text');
        Array.prototype.forEach.call(inputFields, function (inputField) {
          inputField.value = "";
        });
        this.comparisonFinished(false);
      }.bind(this);
      
      // Application Name used in Branding Area
      this.appName = ko.observable("Decision Maker");
     }

     return new ControllerViewModel();
  }
);
