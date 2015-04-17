// change it manually in browser console if you need logging
var LOGGING_ENABLED = false;

var DEF_DATASET_NAME = 'prediction-dataset';
var DEF_GLOBAL_STATE_KEY = 'gstate-prediction-dataset';
var DEF_INTERACTIVE_URL = 'https://lab.concord.org/embeddable-dev.html#interactives/itsi/sensor/prediction-prediction.json';

function getParameterByName(name, defaultValue) {
  if (defaultValue == null) {
    defaultValue = '';
  }
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  var results = regex.exec(location.search);
  if (results === null) {
    return defaultValue;
  }
  return decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function log(msg) {
  if (LOGGING_ENABLED) {
    console.log(msg);
  }
}

function DatasetSyncWrapper(id) {
  this.globalState = {};
  this.updateRuntimeDataSchedule = false;
  this.updateInterval = 500;

  this.loadConfiguration();

  $(id).attr('src', this.interactiveUrl);
  $(id).load(function() {
    this.registerPhones(id);
  }.bind(this));
}

DatasetSyncWrapper.prototype.loadConfiguration = function() {
  this.datasetName = getParameterByName('datasetName', DEF_DATASET_NAME);
  log('DatasetSyncWrapper: Using dataset ' + this.datasetName);
  this.globalStateKey = getParameterByName('globalStateKey', DEF_GLOBAL_STATE_KEY);
  log('DatasetSyncWrapper: Global key ' + this.globalStateKey);
  this.interactiveUrl = getParameterByName('interactive', DEF_INTERACTIVE_URL);
  log('DatasetSyncWrapper: Interactive ' + this.interactiveUrl);
};

DatasetSyncWrapper.prototype.registerPhones = function(id) {
  if (this.interactivePhone) {
    this.interactivePhone.hangup();
    this.interactivePhone = null;
  }
  if (this.runtimePhone) {
    this.runtimePhone.hangup();
    this.runtimePhone = null;
  }
  this.interactivePhone = new iframePhone.ParentEndpoint($(id)[0], function() {
    this.interactivePhoneAnswered();
    log('Interactive Phone ready');
    this.runtimePhone = new iframePhone.getIFrameEndpoint();
    this.registerHandlers(this.runtimePhone, this.runtimeHandlers());
    log('Runtime Phone ready');
    this.runtimePhone.initialize();
  }.bind(this));
};

DatasetSyncWrapper.prototype.scheduleDataUpdate = function() {
  if (this.updateRuntimeDataSchedule) {
    clearTimeout(this.updateRuntimeDataSchedule);
  }
  var func = function() {
    this.interactivePhone.post('getDataset', this.datasetName);
    this.updateRuntimeDataSchedule = false;
  }.bind(this);
  this.updateRuntimeDataSchedule = setTimeout(func, this.updateInterval);
};

DatasetSyncWrapper.prototype.runtimeHandlers = function() {
  return {
    "loadInteractiveGlobal": function(data) {
      var myData;
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }
      this.globalState = data;
      myData = this.globalState[this.globalStateKey];
      if (myData) {
        this.interactivePhone.post('sendDatasetEvent', {
          'eventName': 'dataReset',
          'datasetName': this.datasetName,
          'data': myData.value.initialData
        });
      }
    }.bind(this)
  };
};

DatasetSyncWrapper.prototype.interactiveHandlers = function() {
  var obj = {};
  obj[this.datasetName + '-sampleAdded'] = function() {
    this.scheduleDataUpdate();
  }.bind(this);
  obj[this.datasetName + '-sampleRemoved'] = function() {
    this.scheduleDataUpdate();
  }.bind(this);
  obj[this.datasetName + '-dataReset'] = function() {
    this.scheduleDataUpdate();
  }.bind(this);
  obj['dataset'] = function(data) {
    this.globalState[this.globalStateKey] = data;
    this.runtimePhone.post('interactiveStateGlobal', this.globalState);
  }.bind(this);
  return obj;
};

DatasetSyncWrapper.prototype.interactivePhoneAnswered = function() {
  if (this.alreadySetupInteractive) {
    log('DatasetSyncWrapper: interactive phone rang, and previously answerd');
  } else {
    log('DatasetSyncWrapper: interactive phone answered');
    this.alreadySetupInteractive = true;
    this.registerHandlers(this.interactivePhone, this.interactiveHandlers());
    'sampleAdded dataReset sampleRemoved'.split(/\s+/).forEach(function(evt) {
      this.interactivePhone.post('listenForDatasetEvent', {
        eventName: evt,
        datasetName: this.datasetName
      });
    }.bind(this));
  }
};

DatasetSyncWrapper.prototype.registerHandlers = function(phone, handlers) {
  function register(phone, message, response) {
    phone.addListener(message, function(data) {
      log('DatasetSyncWrapper: handling phone: ' + message);
      if (response) {
        response(data);
      } else {
        log('DatasetSyncWrapper: no response defined for ' + message);
      }
    });
  }
  for (var message in handlers) {
    var response = handlers[message];
    register(phone, message, response);
  }
};

window.DatasetSyncWrapper = DatasetSyncWrapper;
