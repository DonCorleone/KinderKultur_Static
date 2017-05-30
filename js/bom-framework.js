(function(global, url, culture, cookieName, appId, btnId, textLogin, textLogout){
	if (global === undefined || global === null) {
		console.error('bom framework could not be initialized')
		return;
	}
	/**
	 * Get the value of the authentication cookie
	 * @private
	 * @function getAuthCookie
	 * @return {object|null} 					- value of cookie or null
	 */
	function getAuthCookie() {
		if (global.bom.settings.cookieName === undefined || global.bom.settings.cookieName === null)
			return null;

		var value = "; " + document.cookie;
		var parts = value.split("; " + global.bom.settings.cookieName + "=");
		return  parts.length == 2 ? parts.pop().split(";").shift() : null;
	}
	/**
	 * set the authentication cookie
	 * @private
	 * @function setAuthCookie
	 * @param {object} cvalue	 				- value of the authentication cookie
	 * @param {number} value					- days till expiration
	 */
	function setAuthCookie(cvalue, days) {
		if (global.bom.settings.cookieName === undefined || global.bom.settings.cookieName === null)
			return;
		var d = new Date();
	    d.setTime(d.getTime() + (days*24*60*60*1000));
	    document.cookie = global.bom.settings.cookieName + "=" + cvalue + "; " + "expires="+ d.toUTCString();
	}
	/**
	 * Creates a XHR request to the given url, cbSuccess handles the successfull request, cbError handles the failed request
	 * @private
	 * @function request
	 * @param {string} type - type of request (GET or POST)
	 * @param {string} url - url of ressource
	 * @param {defaultRequestSuccessCallback} cbSuccess - callback if xhr request is successful
	 * @param {defaultRequestErrorCallback} cbError - callback if xhr request is failed
	 */
	function request(type, url, cbSuccess, cbError) {
		cbSuccess = cbSuccess || defaultRequestSuccessCallback;
		cbError = cbError || defaultRequestErrorCallback;
		var req = new XMLHttpRequest();
		if (!('withCredentials' in req))
			throw 'XMLHttpRequest not supported';
		req.open(type, url);
		if (getAuthCookie() !== null)
			req.setRequestHeader('Authorization', getAuthCookie());
		if (global.bom.settings.culture !== null && global.bom.settings.culture !== '')
			req.setRequestHeader('Accept-Language', global.bom.settings.culture);

		req.setRequestHeader('Accept', 'application/json');
		req.onload = function() {
			return cbSuccess(this.response, this.status);
		}
		req.onerror = function() {
			console.error('request to "'  + url + '" has failed')
			return cbError();
		};
		return req.send();
	}
	/**
	 * @protected
	 * @callback defaultRequestSuccessCallback
	 * @param {object|object[]} data - reponse request data
	 * @param {object|object[]} httpStatus - reponse http status
	 * @description request success callback if no callback was given by parameter
	 */
	function defaultRequestSuccessCallback(data, httpStatus) {
		return console.log(data, httpStatus);
	}
	/**
	 * @protected
	 * @callback defaultRequestErrorCallback
	 * @description request error callback if no callback was given by parameter
	 */
	function defaultRequestErrorCallback() {
		return console.error('a networkerror has occured');
	}
	/**
	 * creates a popup
	 * @private
	 * @param {string} url		 				- url of popup to open
	 * @param {string} title					- title of popup
	 * @param {number} w						- width of popup
	 * @param {number} h 						- height of popup
	 */
	function popup(url, title, w, h) {
	    var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
	    var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;
	    var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
	    var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
	    var left = ((width / 2) - (w / 2)) + dualScreenLeft;
	    var top = ((height / 2) - (h / 2)) + dualScreenTop;
	    var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
	    if (window.focus) {
	        newWindow.focus();
	    }
	}
	/**
	 * get list of items of given module
	 *
	 * @function bom.get.module
	 * @param {string} module - string of module specified in variable modules
	 * @param {string} options - string of url params (for building options, please read the function setOption below)
	 * @param {defaultRequestSuccessCallback} successCallback - callback if xhr request is successful
	 * @param {defaultRequestErrorCallback} errorCallback - callback if xhr request is failed
	 * @return {object[]} - list of objects of given module
	 * @see bom.options.build for option details.
	 *
	 * @example
	 * // return [{...}, {...}, {...}]
	 * bom.get.module(bom.modules.abos, bom.options.build('search', '2016').set('sorter', 'abo').get(), cbSuccess, cbError);
	 * @example
	 * // return [{...}, {...}, {...}]
	 * bom.get.module(bom.modules.events, bom.options.build('sorter', 'from desc').get(), cbSuccess, cbError);
	 * @see {@link bom.options.build}
	 */
	function getModule(module, options, successCallback, errorCallback) {
		if (modules[module] === undefined || modules[module] === null)
			throw 'Module "' + module + '" is invalid';
		return request('GET', global.bom.settings.url + '/api/m/' + module + (options || ''), successCallback, errorCallback);
	}
	/**
	 * get specific item
	 *
	 * @function bom.get.item
	 * @param {string} id 	 					- id of item
	 * @param {defaultRequestSuccessCallback} successCallback 		- callback if xhr request is successful
	 * @param {defaultRequestErrorCallback} errorCallback 			- callback if xhr request is failed
	 * @return {object} 						- object of given id
	 *
	 * @example
	 * // return {...}
	 * bom.get.item('0#EHnnupT46A0Ju2Apumm9hpCmvZYL4SH49krYDljkWmg=', cbSuccess, cbError);
	 */
	function getItem(id, successCallback, errorCallback) {
		if (id === undefined || id === null)
			throw 'Id is invalid';
		return request('GET', global.bom.settings.url + '/api/i/' + encodeURIComponent(id), successCallback, errorCallback);
	}
	/**
	 * get user data
	 *
	 * @function bom.get.user
	 * @param {defaultRequestSuccessCallback} successCallback 		- callback if xhr request is successful
	 * @param {defaultRequestErrorCallback} errorCallback 			- callback if xhr request is failed
	 * @return {object} - object of user
	 *
	 * @example
	 * // return {...}
	 * bom.get.user(cbSuccess, cbError);
	 */
	function getUser(successCallback, errorCallback) {
		if (getAuthCookie() === null)
			throw 'Authentication cookie is not available or invalid';
		return request('GET', global.bom.settings.url + '/api/profile', successCallback, errorCallback);
	}
	/**
	 * possible recursiv function for setting and getting module option
	 * @function bom.options.set
	 * @param {(string|object)} objectOrKey 	- sets option by object or key (for valid object or key, look for the options.keys)
	 * @param {(string|number)} value			- sets the value by key
	 * @return {object}							- object of option
	 * @this (bom.options|bom.options.set)
	 * @example
	 * // return { get: function(){ ... }, set: function(objectOrKey, value) { recursiv }}
	 * bom.options.set('search', 'BMW');
	 * @example
	 * // return { get: function(){ ... }, set: function(objectOrKey, value) { recursiv }}
	 * bom.options.set('search', 'BMW').set('skip', 5).set('take', 5);
	 * @example
	 * // return '?fs=BMW&sk=5&ta=5'
	 * bom.options.set('search', 'BMW').set('skip', 5).set('take', 5).get();
	 */
	function setOption(objectOrKey, value) {
		var dic = this;
		if (typeof objectOrKey === 'object')
			dic = objectOrKey;

		if (typeof objectOrKey === 'string' && options.keys[objectOrKey] !== undefined && value !== undefined && value !== null)
			dic[objectOrKey] = value;

		return {
			get: function(){
				var params = '';
				for (var key in dic) {
					if (params !== '') params += '&';
					params += options.keys[key] + '=' + encodeURIComponent(dic[key]);
				}
				return params !== '' ? '?' + params : '';
			},
			set: function(objectOrKey, value){
				return setOption.call(dic, objectOrKey, value);
			}
		}
	}
	/**
	 * only available if button is defined, sets the button state to unauthorized
	 * @private
	 * @function isUnauth
	 */
	function isUnauth() {
		global.bom.settings.btnLogin.innerHTML = global.bom.settings.textLogin;
		global.bom.settings.btnLogin.addEventListener(clickEvent, authentication.login);
	}
	/**
	 * only available if button is defined, sets the button state to authorized
	 * @private
	 * @function isAuth
	 */
	function isAuth() {
		global.bom.settings.btnLogin.innerHTML = global.bom.settings.textLogout;
		global.bom.settings.btnLogin.addEventListener(clickEvent, authentication.logout);
	}
	/**
	 * only available if button is defined, success callback of xhr request of profile resource
	 * @private
	 * @callback checkAuthSuccess
	 */
	function checkAuthSuccess(data, httpStatus) {
		return httpStatus === 200 ? isAuth() : isUnauth();
	}
	/**
	 * only available if button is defined, failed callback of xhr request of profile resource
	 * @private
	 * @callback checkAuthError
	 */
	function checkAuthError() {
		return isUnauth();
	}
	/**
	 * creates popup to login service and creates a listener for the created popup
	 * @function bom.authentication.authLogin
	 *
	 * @example
	 * bom.authentication.login();
	 */
	function authLogin() {
		popup(tools.urlLogin, 'BOM - Login', 302, 320);
		eventer(messageEvent, authLoginSuccess, false);
	}
	/**
	 * fires if created popup of login returns the public authentication key of user
	 * @private
	 * @callback authLoginSuccess
	 */
	function authLoginSuccess(e) {
		if (e.origin !== global.bom.settings.url)
			return;
		setAuthCookie(e.data);
		location.reload(true);
	}
	/**
	 * creates a xhr request for logout if cookie was set and deleting cookie afterwards
	 * @function bom.authentication.authLogout
	 *
	 * @example
	 * bom.authentication.logout();
	 */
	function authLogout() {
		if (getAuthCookie() !== null)
			request('GET', tools.urlLogout, authLogoutSuccess, authLogoutError);
	}
	/**
	 * fires if logout request is successful, delete cookie and reload page
	 * @private
	 * @callback authLogoutSuccess
	 */
	function authLogoutSuccess() {
		setAuthCookie(undefined, -1)
		return location.reload(true);
	}
	/**
	 * fires if logout request is un successful, print error in console
	 * @private
	 * @callback authLogoutError
	 */
	function authLogoutError() {
		return console.error('An error has occured')
	}
	if (global.bom === undefined || global.bom === null) {
		/**
		 * @namespace bom
		 */
		global.bom = { };
	}
	if (global.bom.settings === undefined || global.bom.settings === null) {
		/**
		 * @namespace bom.settings
		 * @property {string} url 			- Mandatory, 						Url of api
		 * @property {string} culture 		- Mandatory, 						Requested culture of resource
		 * @property {string} cookieName 	- Mandatory, 						Cookiename for authentication cookie
		 * @property {string} appId 		- Mandatory, 						Application id for login purpose
		 * @property {string} btnLogin 		- Optional, 						Javascript object of the html button placeholder
		 * @property {string} textLogin 	- Mandatory if btnLogin is defined, Text for Loginbutton
		 * @property {string} textLogout 	- Mandatory if btnLogin is defined, Text for Logoutbutton
		 */
		global.bom.settings = {
			url: url,
			culture: culture || null,
			cookieName: cookieName,
			appId: appId,
			btnLogin: document.getElementById(btnId),
			textLogin: textLogin,
			textLogout: textLogout
		};
	}

	/**
	 * @namespace bom.get
	 * @borrows getModule as module
	 * @borrows getItem as item
	 * @borrows getUser as user
	 */
	var get = {
		module: getModule,
		item: getItem,
		user: getUser
	}
	/**
	 * @namespace bom.options
	 * @prop {object} keys - resolve option keys
	 * @prop {string} keys.tag - resolve 'tag' into 'ft'
	 * @prop {string} keys.search - resolve 'search' into 'fs'
	 * @prop {string} keys.sorter - resolve 'sorter' into 'so'
	 * @prop {string} keys.skip - resolve 'skip' into 'sk'
	 * @prop {string} keys.take - resolve 'take' into 'ta'
	 */
	var options = {
		set: function(objectOrKey, value){
			return setOption.call({}, objectOrKey, value)
		},
		keys: {
			tag: 'ft',
			search: 'fs',
			sorter: 'so',
			skip: 'sk',
			take: 'ta',
		}
	}
	/**
	 * @namespace bom.modules
	 * @prop {string} abos - static string 'abos'
	 * @prop {string} events - static string 'events'
	 * @prop {string} news - static string 'news'
	 */
	var modules = {
		abos: 'abos',
		events: 'events',
		news: 'news',
	}
	/**
	 * Available if AppId is defined
	 * @namespace bom.authentication
	 * @borrows authLogin as login
	 * @borrows authLogout as logout
	 */
	var authentication = {
		login: authLogin,
		logout: authLogout
	}
	var tools = {
		urlLogin: global.bom.settings.url + '/?token=' + encodeURIComponent(global.bom.settings.appId) + '&origin=' + window.location.origin + '&domain=' + window.location.href,
		urlLogout: global.bom.settings.url + '/api/logout',
		urlProfile: global.bom.settings.url + '/api/profile',
	}
	if (global.bom.get === undefined || global.bom.get === null) {
		global.bom.get = get;
	}

	if (global.bom.options === undefined || global.bom.options === null) {
		global.bom.options = options;
	}
	if (global.bom.modules === undefined || global.bom.modules === null) {
		global.bom.modules = modules;
	}
	if (global.bom.authentication === undefined || global.bom.authentication === null) {
		global.bom.authentication = authentication
	}
	var eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent';
	var eventer = window[eventMethod];
	var messageEvent = eventMethod == 'attachEvent' ? 'onmessage' : 'message';
	var clickEvent = eventMethod == 'attachEvent' ? 'onclick' : 'click';
	if (global.bom.settings.btnLogin != null)
		request('GET', tools.urlProfile, checkAuthSuccess, checkAuthError);
})
(window,"http://api_kinderkultur.crmforyou.ch/api/m/events","de-CH","bom-auth-cookie","","","","");
