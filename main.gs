/* 
Промисы не работают, поэтому часть написана криво и нужно оптимизировать другими способами. Я немного потыкал заметок, что можно сделать, чтобы адекватное время было.
Так же куча нюансов из-за api гугла. 
*/

let userData = loadUserData();


// UI TODO: move to another file
function main(){
  Logger.log(userData);
  if (!userData?.token || !userData?.username)
    showAuth();
  else
    showMenu();
}

function showAuth() {
  const html = HtmlService.createTemplateFromFile('auth')
  .evaluate()
  .setTitle('Прямой контракт');
  SpreadsheetApp.getUi().showSidebar(html);
}

function showMenu() {
  const html = HtmlService.createTemplateFromFile('menu')
    .evaluate()
    .setTitle('Прямой контракт');
  SpreadsheetApp.getUi().showSidebar(html);
}

// logic
function authorization(username) {
  const token = directContractApi.login(username);
  userData.username = username;
  userData.token = token;
  saveUserData(userData);
}

function registration(username) {
  const token = directContractApi.registration(username);
  userData.username = username;
  userData.token = token;
  saveUserData(userData);
}


// TODO: add batching requests optimization
function updateClientListWithStatus(row = 1, column = 1, sheetName = 'Данные') {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  let count = 0;
  let rowInsert = row;

  const exampleData = directContractApi.getClientsWithStatuses(1,0);

  // empty bd check
  if(!exampleData || exampleData?.length === 0){
    Logger.log('Бд пуста');
    // TODO: add alert for user
    return;
  }
  
  const columnNames = Object.keys(exampleData[0]);


  // insert column names
  Logger.log(`rowInsert: ${rowInsert}, column: ${column}, rowInsert: ${rowInsert}, columnNames.length: ${columnNames.length}`)
  Logger.log([columnNames]);
  sheet
  .getRange(rowInsert, column, 1, columnNames.length)
  .setValues([columnNames]);

  rowInsert++;


  let clientList;
  // TODO: add pagination
  do {
    
    clientList = directContractApi.getClientsWithStatuses(config.responseLimit, count * config.responseLimit);

    if(!clientList || clientList?.length === 0){
      // for batching
      userData.lastSize = rowInsert - 1 ;
      return;
    }


    const data = clientList.map(client => columnNames.map(key => client[key] || "NULL"))

    sheet
    .getRange(rowInsert, column, data.length, columnNames.length)
    .setValues(data);
    rowInsert += data.length;

    count++;
  }while (clientList?.length > 0)
  

  Logger.log("Список клиентов обновлён.");
  return rowInsert - 1;
}


