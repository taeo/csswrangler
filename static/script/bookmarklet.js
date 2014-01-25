/* 
TODO:
- UI Builder
- Checking for style type="text/css" with @import url(PATH.css)
- remove &/or refresh list
- window available height for UI (since it's "fixed") - need to ensure 100% visibility for UI and tabs
- dynamic loading of UI?
- minified src provided for bookmarklet
- version-based timestamps for bookmarklet css include
- loader (bookmarklet trigger) - how can we force the latest bookmarklet .js
- test jQuery min version against required features
- jQuery noConflict? (necessary with namespacing?) 
- Clear preferences option
- disable / enable local changes option
- expand / collapse option tab bar icons
- test for local stylesheet url's regex (?.css?)?
- bug in chrome (maybe jqversion issue?) - options panel does not stay open.
*/

/***
 ORDER OF OPERATIONS

 ONLOAD
 1) Check / Load jQuery
 2) Build interface
 3) Check preferences
 4) Apply preferences to UI
 5) Refresh

 SAVE / REFRESH
 1) Save cookie preferences
 2) Refresh
***/

(function(){

	var jqVersionRequired = "1.5.0";

	if (window.jQuery === undefined || window.jQuery.fn.jquery < jqVersionRequired) {
		var jqLoaded = false;
		var jqScript = document.createElement("script");
		jqScript.src = "http://ajax.googleapis.com/ajax/libs/jquery/" + jqVersionRequired + "/jquery.min.js";
		jqScript.onload = jqScript.onreadystatechange = function(){
			if (!jqLoaded && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
				jqLoaded = true;
				initBookmarklet();
			}
		};
		(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(jqScript);
	} else {
		initBookmarklet();
	}


	
	function initBookmarklet() {

		// Our custom action
		(window.csswrangler = function(parent, $){
		
			var self = parent || {},
				interfaceLoaded = false,
				//interfaceHtmlPath = 'http://sole.local/sole/recss/interface.html',
				//interfaceCssPath = 'http://sole.local/sole/recss/css/bookmarklet.css',
				$remoteStylesheets = [],
				preferences = {'remote':{},'local':null,'code':null},
				settings = {
					cookieName: 'cssWranglerPreferences'
				}
				css = {
					'directInputId': 'CSSWRANGERDIRECTINPUT', 
					'localUrlClass': 'CSSWRANGLERATTACHED',
					'stylesheetId': 'CSSWRANGLERSTYLE',
					'stylesheetUrl': 'http://static.csswrangler.dev/css/bookmarklet.css'
				};

			// Core loader - called when bookmarklet is initiated.
			self.init = function() {

				// Load the interface
				this.loadUI();

				// Check & apply cookie preferences
				this.applyPreferences();

				// Save default options and refresh
				this.save(true);

				// Trigger Refresh
				$('#cssWranglerTabRefresh').bind('click', function() {

					csswrangler.save(true);

				});

				// Show hide the options panel
				$('#cssWranglerTabOptions').bind('click', function() {

					csswrangler.togglePanel();

				});

				// Show hide specific option groups.
				$('#cssWranglerOptionsNav a').bind('click', function() {
					var optionsNavUl = $('#cssWranglerOptionsNav'),
						optionsNavLinks = $('a', optionsNavUl),
						activeClassName = 'cssWranglerOptionActive',
						allContent = $('.cssWranglerOptionGroup'),
						targetContent = $($(this).data('target'));

					optionsNavLinks.removeClass(activeClassName);
					$(this).addClass(activeClassName);	

					allContent.not(targetContent).hide();
					targetContent.show();
				});

			}

			// Helper to show/hide the options panel
			self.togglePanel = function(hide) {

				var contentArea = $('#cssWranglerContentWrap');

				if (contentArea.is(':hidden') && (!hide || typeof hide == 'undefined')) {
					contentArea.slideDown();
				} else {
					contentArea.slideUp();
				}

			}

			// Get user cookie-based preferences
			self.getPreferences = function() {

				// Check for cookie-based preferences
				var cd = this.readCookie(settings.cookieName);

				// Apply preferences if there are any
				if (cd) {	
					// set preferences object from cookie
					preferences = JSON.parse(cd);
				}
			}

			// Apply cookie-based preferences
			self.applyPreferences = function() {

				// Get the preferences
				this.getPreferences();

				// fill the code textarea
				if (preferences.code) {
					$('#cssWranglerDirectInputCode').val(this.unsanitizeDirectInputCode(preferences.code));
				}

				// fill the direct input textarea
				if (preferences.local) {
					$('#cssWranglerLocalFilesCode').val(preferences.local);
				}

				// populate checkboxes
				if (!$.isEmptyObject(preferences.remote)) {
					for (var i in preferences.remote) {
						$('#cssWranglerRemoteFiles input[name="' + preferences.remote[i] + '"]').attr('checked','checked');
					}
				} else {	// If no saved preferences - check all remote stylesheets
					$('#cssWranglerRemoteFiles input').attr('checked', 'checked');
				}


			}

			
			// Get all existing stylesheets
			self.getStylesheets = function() {
				
				// Get all stylesheets on the page
				$remoteStylesheets = $('link[rel="stylesheet"]').not('#CSSWRANGLERSTYLE');

				return $remoteStylesheets;
			}

			// Build the interfacef for the user
			self.loadUI = function() {

				// Don't re-load the interface if it's already loaded.
				if (interfaceLoaded || $('#CSSWRANGLERSTYLE').length > 0) { return; }

				// Load our interface css
				$('<link>').attr('id', css.stylesheetId)
					.attr('href', css.stylesheetUrl + '?m=' + (new Date().valueOf()))
					.attr('type', 'text/css')
					.attr('rel', 'stylesheet')
					.appendTo('head');

				// Append our html interface to the end of the <body>
				// * would like a way to grab this via .js dynamically with $().load
				$('body').append('<div id="cssWranglerUI"><div id="cssWranglerContentWrap" style="display:none;"><div id="cssWranglerContent" class="cssWranglerClearfix"><div id="cssWranglerLeft"><h2>CSS Wrangler</h2><p>This will allow you to refresh your css or override css from a local source file. To learn more visit our website at <a id="cssWranglerLink" href="http://www.csswrangler.com">csswrangler.com</a>.</p><div class="cssWranglerSavePreferences"><a href="javascript:void(0);" id="cssWranglerSavePreferences">Save &amp; Refresh</a></div></div><div id="cssWranglerRight"><ul id="cssWranglerOptionsNav" class="cssWranglerClearfix"><li><a href="javascript:void(0);" data-target="#cssWranglerRemoteFiles">Remote Files</a></li><li><a href="javascript:void(0);" data-target="#cssWranglerLocalFiles">Local Files</a></li><li><a href="javascript:void(0);" data-target="#cssWranglerDirectInput">Direct Input</a></li></ul><div id="cssWranglerRemoteFiles" class="cssWranglerOptionGroup"><h3>Server-side file options</h3><p>Check the files you would like refreshed. Unchecked file paths will not be reloaded.</p></div><div id="cssWranglerLocalFiles" class="cssWranglerOptionGroup cssWranglerHidden"><h3>Attach locally hosted files</h3><p>Put the full path to each locally or externally hosted stylesheet below <em>(Each one on a new line)</em>.</p><textarea name="cssWranglerLocalFilesCode" id="cssWranglerLocalFilesCode"></textarea></div><div id="cssWranglerDirectInput" class="cssWranglerOptionGroup cssWranglerHidden"><h3>Paste your own code</h3><p>Write any css below. It will be included right before the closing <code>&lt;/head&gt;</code> tag.</p><textarea name="cssWranglerDirectInputCode" id="cssWranglerDirectInputCode"></textarea></div></div><br style="clear:both;" /></div></div><div id="cssWranglerTabs"><a href="javascript:void(0);" id="cssWranglerTabOptions">Options Tab</a><a href="javascript:void(0);" id="cssWranglerTabRefresh">Refresh</a></div></div>');


				// Populate css files
				this.getStylesheets();

				$.each($remoteStylesheets, function() {
					var h = jQuery(this).attr('href').split('?');
					$('#cssWranglerRemoteFiles').append('<div class="cssWranglerRemoteSheetUrl"><label><input type="checkbox" value="' + h[0] + '" name="' + h[0] + '" /> <span title="' + jQuery(this).attr('href') + '">' + h[0] + '</span></label></div>');
				});

				// Loaded
				interfaceLoaded = true;

			}

			// Options Nav
			self.optionsNav = function() {
				optionsNavUl = $('#cssWranglerOptionsNav'),
				optionsNavLinks = $('a', optionsNavUl),
				optionsNavItems = $('.cssWranglerOptionGroup');
			}


			self.save = function(doRefresh) {

				// reset preferences
				preferences.remote = {};
				preferences.local = null;
				preferences.code = null;

				// Save remote options
				$('#cssWranglerRemoteFiles input:checked').each(function(i) {
					preferences.remote[i] = ($(this).val());
				});

				// Save local files
				preferences.local = $('#cssWranglerLocalFilesCode').val();

				// Save code options
				preferences.code = this.sanitizeDirectInputCode();

				// Save preferences in the cookie
				this.createCookie(settings.cookieName, JSON.stringify(preferences));

				// Re-apply preferences from saved cookie
				this.getPreferences();

				// Trigger refresh
				if (doRefresh) {
					this.refresh();
				}
			}

			// Refresh all
			self.refresh = function() {

				// Refresh css files
				this.refreshRemote();

				// Add & Refresh local files
				this.refreshLocal();

				// Update any direct input code - (important that this is called last)
				this.refreshCode();

				// Hide the panel
				this.togglePanel(true);

			}

			// Refresh just the direct input code
			self.refreshCode = function() {

				// Delete exsiting
				$('#' + css.directInputId).remove();

				if (preferences.code) {

					// Re-apply the style node
					$('<style type="text/css"></style>').attr('id', css.directInputId).appendTo('head');

					// Add the code to our direct input node
					$('#' + css.directInputId).text(this.unsanitizeDirectInputCode(preferences.code));
				}

			}

			// Refresh remote files
			self.refreshRemote = function() {

				if (!$.isEmptyObject(preferences.remote)) {
					for (var i in preferences.remote) {
						this.cacheBust($('link[href^="' + preferences.remote[i] + '"]'));
					}
				}

			}

			// Refresh local files
			self.refreshLocal = function() {

				// Remove previously attached url's
				$('link.' + css.localUrlClass).remove();

				// Add requested sheets
				if (preferences.local) {
					var localPaths = $('#cssWranglerLocalFilesCode').val().split("\n");
					for (var i in localPaths) {
						this.attachStylesheet(localPaths[i]);
					}
				}

			}

			// Cachebuster - append timestamp to path
			self.cacheBust = function(el) {
				
				var h = el.attr('href').replace(/(&|\?)cachebust=\d+/,'');
				el.attr('href', h + (h.indexOf('?') >= 0 ? '&':'?') + 'cachebust=' + (new Date().valueOf()));
			
			}

			// Method to attach a stylesheet url
			self.attachStylesheet = function(path) {
				
				if (path != '') {
					// Create the new link element
					var sheet = $('<link type="text/css" rel="stylesheet" class="' + css.localUrlClass + '"></link>').attr('href', path);
					
					console.log('sheet busting');

					// Cache bust it
					this.cacheBust(sheet);

					// Append to head
					sheet.appendTo('head');
				}

			}

			// Apparently JSON doesn't play nice with ; in the css input.
			// Replace semicolons with a placeholder
			self.sanitizeDirectInputCode = function() {
				return $('#cssWranglerDirectInputCode').val().replace(/;/g, "|SC|");
			}

			// Convert the placeholder semicolon back to valid css
			self.unsanitizeDirectInputCode = function(data) {
				return data.replace(/(\|SC\|)/g,";");
			}


			///////////////////////////////////////////////////////////
			// Cookie Scripts
			///////////////////////////////////////////////////////////
			self.createCookie = function(name,value,days) {
				if (days) {
					var date = new Date();
					date.setTime(date.getTime()+(days*24*60*60*1000));
					var expires = "; expires="+date.toGMTString();
				}
				else var expires = "";
				document.cookie = name+"="+value+expires+"; path=/";
			}

			self.readCookie = function(name) {
				var nameEQ = name + "=";
				var ca = document.cookie.split(';');
				for(var i=0;i < ca.length;i++) {
					var c = ca[i];
					while (c.charAt(0)==' ') c = c.substring(1,c.length);
					if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
				}
				return null;
			}

			self.eraseCookie = function(name) {
				createCookie(name,"",-1);
			}

		})(csswrangler || {}, jQuery);

		// Run the initializer.
		csswrangler.init();

	}	// end initBookmarklet();


})();

