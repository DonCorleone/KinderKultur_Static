(function(window){
	"use strict";

	if (window.app === undefined || window.app === null){
		$('#Site-Navigation').hide();
		var getRouteDefault = function()	{
			return {
				''							: 'toHome',
				'home'						: 'getHome',
				'ueberuns'					: 'getAboutUs',
				'veranstaltungen'			: 'getEvents',
				'abos'						: 'getAbos',
				'beitrag/*id'				: 'getPost',
			};
		}

		var getRouteAuthorized = function() {
			return _.extend(getRouteDefault(), {
				'profil': 'getProfile'
			});
		}

		var getRouteListenerDefault = function() {
			return {
				'route:toHome'			: app.events.toHome,
				'route:getHome'			: app.events.getPosts,
				'route:getPost'			: app.events.getPost,
				'route:getAboutUs'		: app.events.getAboutUs,
				'route:getEvents'		: app.events.getEvents,
				'route:getAbos'			: app.events.getAbos,
				'route:getError'		: app.events.getError,
			};
		}

		var getRouteListenerAuthorized = function() {
			return _.extend(getRouteListenerDefault(), {
				'route:getProfile'		: app.events.getProfile,
			});
		}

		var setSiteDefault = function() {
			$('#Nav_MyProfile').remove();
			return configRouter(getRouteDefault(), getRouteListenerDefault());
		}

		var setSiteAuthorized = function() {
			$('#Nav_MyProfile').show();
			return configRouter(getRouteAuthorized(), getRouteListenerAuthorized());
		}

		var configRouter = function(routes, routeListeners) {
			var Router = Backbone.Router.extend({ routes: _.extend(routes, { '*path' : 'getError' }) });
			app.router = new Router;
			app.router.on('route', function(route, params) {
				NProgress.start();
				NProgress.inc();
				var hash = window.location.hash.split('/')[1];

				$('#Site-Navigation li').removeClass(app.css.active);
				$('#Site-Navigation li[data-nav="' + hash + '"]').length > 0 ? $('#Site-Navigation li[data-nav="' + hash + '"]').addClass(app.css.active) : $('#Site-Navigation li[data-nav="home"]').addClass(app.css.active);
			    console.log('Different Page: ' + route);
			});

			for (var key in routeListeners) app.router.on(key, routeListeners[key]);
			Backbone.history.start();
			$('#Site-Navigation').show('fade');
		}

		var app = {
			settings : {
				allowMorePosts: 	false,
				postsPerRequest: 	5,
			},

			tools: {

				renderStatic: 		function(url, title, meta) {
										return $.get({ url:url, cache: true	}).done(function(html){ return app.tools.render(title, meta, null, html); }).fail(app.events.getError);
									},

				render: 			function(title, meta, control, html) {
										NProgress.inc();
										var effect = 'fade'
										return app.html.main.hide(effect, function(){
											app.html.title.html(title);
											app.html.content.html(html);

											meta !== null ? app.html.meta.html(meta) : app.html.meta.empty();
											meta !== null ? app.html.meta.show() : app.html.meta.hide();
											control !== null ? app.html.control.html(control) : app.html.control.empty();
											control !== null ? app.html.control.show() : app.html.control.hide();

											NProgress.done();
											return app.html.main.show(effect);
										});
									},

				showEvents: 		function(){
										return bom.get.module('events', bom.options.set('sorter', 'to desc').get(), function(items) {
											var htmlId = items.length === 0 ? 'events_empty' : 'events_available';
											var meta = items.length === 0 ? null : null;
											var templateObj = items.length === 0 ? { } : { items: items };

											return app.tools.getTemplate(htmlId).then(function(html){
												var html = _.template(html)(templateObj)
												return app.tools.render('Veranstaltungen', null, null, html);
											})
										}, app.events.getError)
									},

				showAbos: 			function(){
										return bom.get.module('abos', bom.options.set('sorter', 'abo').get(), function(items) {
											var htmlId = items.length === 0 ? 'abos_empty' : 'abos_available';
											var meta = items.length === 0 ? null : null;
											var templateObj = items.length === 0 ? { } : { items: items };
											return app.tools.getTemplate(htmlId).then(function(html){
												var html = _.template(html)(templateObj)
												return app.tools.render('Abos', null, null, html);
											})
										}, app.events.getError)
									},

				showPost: 			function(postId){
										return bom.get.item(postId, function(item) {
											return app.tools.getTemplate('post_meta').then(function(metaHtml){
												return app.tools.getTemplate('post_content').then(function(contentHtml){
													return app.tools.render(item.title, _.template(metaHtml)(item), null, _.template(contentHtml)(item));
												})
											})
										}, app.events.getError)
									},

				showPosts: 			function(filterId){
										var option = bom.options.set('sorter', 'published desc').set('take', app.settings.postsPerRequest);
										if (filterId !== undefined && filterId !== null)
											option.set('tag', encodeURIComponent(filterId));

										return bom.get.module('news', option.get(), function(items) {
											if (items.length === 0) {
												return app.tools.getTemplate('posts_empty').then(function(html){
													return app.tools.render('Blog', null, null, html);
												});
											} else {
												return app.tools.getTemplate('posts_available').then(function(contentHtml){
													return app.tools.getTemplate('posts_available_items').then(function(itemsHtml){
														return app.tools.getTemplate('posts_available_buttons').then(function(buttonHtml){
															app.settings.allowMorePosts = items.length >= app.settings.postsPerRequest;
															var templateObj = { items: items, itemsHtml: itemsHtml };
															var html = _.template(contentHtml)(templateObj)
															return app.tools.render('Blog', null, buttonHtml, html);
														});
													});
												});
											}
										}, app.events.getError)
									},

				showProfile:		function(){
										return bom.get.user(function(profile) {
											return app.tools.getTemplate('my_profile').then(function(contenthtml){
												return app.tools.getTemplate('my_profile_buttons').then(function(buttonHtml){
													return app.tools.render('Mein Profil', null, _.template(buttonHtml)(profile), _.template(contenthtml)(profile));
												});
											});
										}, app.events.getError)
									},

				morePosts:			function(filterId){
										if (!app.settings.allowMorePosts)
											return null;

										var option = bom.options.set('sorter', 'published desc');
										if (filterId !== undefined && filterId !== null)
											option.set('tag', encodeURIComponent(filterId));

										var elPosts = $('#posts');
										var page = elPosts.data('page');
										elPosts.data('page', page+1);
										option.set('skip', page * app.settings.postsPerRequest).set('take', app.settings.postsPerRequest);

										return bom.get.module('news', option.get(), function(items) {
											if (items.length === 0) {
												return app.settings.allowMorePosts = false;
											} else {
												return app.tools.getTemplate('posts_available_items').then(function(itemsHtml){
													var templateObj = { items: items };
													var html = _.template(itemsHtml)(templateObj)
													return $('#posts').append(html);
												});
											}
										}, app.events.getError)
									},

				getRecents:   		function() {
										var recentList = $('.recent-posts .sidebar-elements');
										return bom.get.module('news', bom.options.set('sorter', 'published desc').set('take', 5).get(), function(items){
											return app.tools.getTemplate('recents').then(function(html){
												return recentList.html(_.template(html)({ items: items }));
											})
										}, function(){
											recentList.html($('<p>').text('Ein Fehler ist aufgetreten'))
										});
									},

				getSponsors:   		function() {
										var sponsorList = $('.sponsors .sidebar-elements');
										sponsorList.html($('<p>').text('In Bearbeitung'))
										/*return bom.get.module('sponsors', bom.options.set('sorter', 'published desc').set('take', 5).get(), function(items){
											return app.tools.getTemplate('sponsors').then(function(html){
												return sponsorList.html(_.template(html)({ items: items }));
											})
										}, function(){

										});*/
									},

				getTemplate: 		function(id) {
										var counter = parseInt(this) || 0;

										return new Promise(function(resolve, reject) {
											if (counter >= 5) {
												resolve('');
											} else if (localStorage.getItem(id) === null){
												setTimeout(function(){
													resolve(app.tools.getTemplate.call(++counter, id));
												} , 200)
											} else {
												resolve(JSON.parse(localStorage.getItem(id)).value);
											}
										});
									},
			},
			events: {
				toHome: 			function() {
										return this.navigate('#/home');
									},

				getPosts: 			function() {
										return app.tools.showPosts();
									},
				getPost: 			function(id) {
										return app.tools.showPost(id);
									},
				getAboutUs: 		function() {
										return app.tools.renderStatic('static/ueberuns.html', 'Über uns');
									},

				getEvents: 			function() {
										return app.tools.showEvents();
									},

				getAbos: 			function() {
										return app.tools.showAbos();
									},

				getProfile:			function() {
										return app.tools.showProfile();
									},

				getError: 			function() {
										var msg = '';
										msg += '<p>Ein Fehler ist aufgetreten, Ihre angeforderte Ressource ist ungültig!</p>'
										msg += '<p>Bitte versuchen Sie eine andere Seite aufzurufen.</p>'
										msg += '<br><br><br>'
										msg += '<img src="media/images/error.gif" />';
										return app.tools.render('Uuups!', null, null, msg)
									},

				hideNav: 			function() {
										return $('.navbar-collapse').collapse('hide')
									},

				changeNav: 			function() {
										$('#Site-Navigation li').removeClass(app.css.active);
										$(this).addClass(app.css.active);
									},

				hightlightNavBlog: 	function() {
										$('#Site-Navigation li').removeClass(app.css.active);
										$('#Site-Navigation li[data-nav="home"]').addClass(app.css.active);
									},

			},
			underscore: {
				sSinceEpochFormat:  function(secondsSinceEpoch, format){
										return moment(secondsSinceEpoch * 1000).format(format);
									},

				buildAddress:  		function(address, separator){
										if (address === undefined || address === null)
											return '';

										var returnString = '';
										if (address.name !== null && address.name !== '')
											returnString += address.name;

										returnString += separator

										if (address.street !== null && address.street !== '')
											returnString += address.street;

										returnString += separator

										if (address.zipCode !== null && address.zipCode !== '')
											returnString += address.zipCode;
										if (address.place !== null && address.place !== '' && address.zipCode !== null && address.zipCode !== '')
											returnString += ' ';
										if (address.place !== null && address.place !== '')
											returnString += address.place;

										return returnString.replace(separator + separator, separator);
									}
			},
			css: {
				active: 'active-item',
			},
			html: {
				main: $('#Page-Main'),
				title: $('#Page-Title'),
				control: $('#Page-Controls'),
				meta: $('#Page-Meta'),
				content: $('#Page-Content'),
			},
			template: {	}
		};

		bom.get.user(function(user, httpStatus){ return httpStatus === 200 ? setSiteAuthorized() : setSiteDefault(); }, setSiteDefault);

		_.each(
		[
			'abos_available',
			'abos_empty',
			'events_available',
			'events_empty',
			'posts_available',
			'posts_available_items',
			'posts_available_buttons',
			'posts_empty',
			'post_meta',
			'post_content',
			'recents',
			'sponsors',
			'my_profile',
			'my_profile_buttons',
		], function (file){
			function setFile(fileName) {
				return $.get('templates/' + file + '.html', function(html){
					return localStorage.setItem(file, JSON.stringify({
						timestamp: new Date().getTime(),
						value: html
					}));
				})
			}

			if (localStorage.getItem(file) !== null) {
				var obj = JSON.parse(localStorage.getItem(file));
				var cacheExpirePeriod = 15 * 60 * 1000; // mins * seconds * 1000 = milliseconds
				//var cacheExpirePeriod = 0;
				if ((new Date) - new Date(obj.timestamp) > cacheExpirePeriod ) {
					return setFile(file);
				}
			} else {
				return setFile(file);
			}
		});

		window.app = app;
	}

	$('#Site-Navigation li[data-nav!=""]').on('click', app.events.hideNav);
	app.tools.getRecents();
	app.tools.getSponsors();
})(window);
