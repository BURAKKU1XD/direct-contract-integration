const directContractApi ={
  ip: config.ip,
  port: config.port,

  buildQueryParams(params) {
    return Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join("&");
  },

  // TODO: add check null/undefined in args fn
  basicRequest(endpoint, type, params = {}, headers = {}, payload = {}) {
    const options = {
      'method': type.toLowerCase(),
      'contentType': 'application/json',
      'headers': {...headers},
      ...(Object.keys(payload ?? {}).length > 0 && {"payload": JSON.stringify(payload)}),
      'muteHttpExceptions': true
    }
    const paramsStr = this.buildQueryParams(params);
    const response = UrlFetchApp.fetch(`http://${this.ip}:${this.port}${endpoint}${paramsStr.length > 0 ? '?' + paramsStr : ''}`, options);
    return response;
  },

  login(username){

    const response = this.basicRequest('/auth/login', 'post', {}, {}, {username})
    
    if (response.getResponseCode() === 400)
        throw new Error('Пользователь не найден');

    if (response.getResponseCode() !== 201)
        throw new Error(JSON.parse(response)?.message ?? 'Неизвестная ошибка');

    if (!JSON.parse(response).token)
      throw new Error('В ответе нет token');
    
    return JSON.parse(response).token;
  },

  registration(username){

    const response = this.basicRequest('/auth/registration', 'post', {}, {}, {username})

    if (response.getResponseCode() === 400)
        throw new Error('Пользователь уже существует');

    if (response.getResponseCode() !== 201)
        throw new Error(JSON.parse(response)?.message ?? 'Неизвестная ошибка');

    if (!JSON.parse(response).token)
      throw new Error('В ответе нет token');
    
    return JSON.parse(response).token;
  },

  getClients(limit, offset){
    if (limit > config.responseLimit || offset < 0)
      throw new Error('Некорректные аругменты функции');

    const response = this.basicRequest('/clients','get',{limit, offset}, {Authorization: userData.token}, {} )

    // TODO: add log out 
    if (response.getResponseCode() === 401)
      throw new Error('Пользователь не авторизован');

    if (response.getResponseCode() !== 200)
      throw new Error(JSON.parse(response)?.message ?? 'Неизвестная ошибка');

    return JSON.parse(response);
  },

  getStatuses(userIds){
    if (!Array.isArray(userIds) || userIds.length === 0)
      throw new Error('Некорректные аругменты функции');

    const response = this.basicRequest('/clients','post',{}, {Authorization: userData.token}, {userIds})

    if (response.getResponseCode() === 401)
      throw new Error('Пользователь не авторизован');

    if (response.getResponseCode() !== 201)
      throw new Error(JSON.parse(response)?.message ?? 'Неизвестная ошибка');

    return JSON.parse(response);
  },

  getClientsWithStatuses(limit, offset){
    const clients = this.getClients(limit, offset);

    if (!Array.isArray(clients) || clients.length === 0)
      return []

    // TODO: add check
    const statuses = this.getStatuses(clients.map(client => client.id));

    const statusesMap = statuses.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {});

    const merged =  clients.map(client => ({...client, ...(statusesMap[client.id] || {})}));

    return merged;
  }

















}
