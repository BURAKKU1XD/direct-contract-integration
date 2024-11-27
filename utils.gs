function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Мой контракт')
    .addItem('Открыть боковое меню', 'main')
    .addToUi();
}

function getSheetNameList(){
  const sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets().map((sheet)=>sheet.getName());
  return sheets;
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// TODO: add validation
function loadUserData(){
  const defaultUserData = {
    insertCell: '1A',
    lastSize: 0
  };
  const loadedUserData = PropertiesService.getUserProperties().getProperties();
  return loadedUserData?.token ? loadedUserData : defaultUserData;
}

function clearUserData(){
  PropertiesService.getUserProperties().deleteAllProperties();
}

// TODO: add validation
function saveUserData(userData){
  PropertiesService.getUserProperties().setProperties(userData);
}
