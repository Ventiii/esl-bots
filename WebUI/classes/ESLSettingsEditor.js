let Language = {};

const ESLSettingsEditor = (new function ESLSettingsEditor() {
    const DEBUG = false;
    const VERSION = '1.0.0-ALPHA';
    const AUTHOR = "https://github.con/Ventiii";
    let _language = "en_US";

    this.__constructor = function __constructor(){
        console.log('Initialize ESL Settings Editor UI (v' + VERSION + ') by ' + AUTHOR + '.');

        /**
         *      Fix the UI Views Location 
         */

         [].map.call(document.querySelectorAll('ui-view'), function(view) {
             view.dataset.show = false;
         }.bind(this));

         this.bindMouseEvents();
         this.bindKeyboardEvents();
    };

    this.bindMouseEvents = function bindMouseEvents(){
        document.body.addEventListener('mouseover', function onMouseDown(event) {
            if (!event){
                event = window.event;
            }

            var parent = Tools.getClosest(event.target, '[data-description]');

            if (typeof(parent) == 'undefined'){
                return;
            }

            document.querySelector('ui-description').innerHTML = parent.dataset.description;
        });

        document.body.addEventListener('mouseout', function onMouseDown(event) {
            if (!event)
            {
                event = window.event;
            }

            var parent = Tools.getClosest(event.target, '[data-description]');

            if (typeof(parent) == 'undefined'){
                return;
            }

            document.querySelector('ui-description').innerHTML = '';
        });

        document.body.addEventListener('mousedown', function onMouseDown(e) {
            if (!e){
                e = window.event;
            }

            var parent = Tools.getClosest(e.target, '[data-action]');

            if ([
                'INPUT'
            ].indexOf(e.target.nodeName) >= 0){
                if (DEBUG)
                {
                    console.warn('Parent is a form element!', parent);
                }

                return;
            }

            if (typeof(parent) == 'undefined')
            {
                if (DEBUG)
                {
                    console.warn('Parent is undefined', parent);
                }

                return;
            }

            if (DEBUG)
            {
                console.log('CLICK', parent.dataset.action);
            }

            switch (parent.dataset.action)
            {
                case 'restore':
                    [].map.call(Tools.getClosest(e.target, 'ui-view').querySelectorAll('ui-entry'), function(entry) {
                        entry.resetToDefault();
                    });
                    break;
                case 'exit_editor':
                    WebUI.Call('DispatchEventLocal', 'UI_Toggle');
                break;
                case 'close':
                    /**
                     *  Check if there are some views still visible 
                     */
                    let openedViews = 0;
                    [].map.call(document.querySelectorAll('ui-view'), function (view) {
                        if (view.dataset.show && view.dataset.name != 'toolbar')
                        {
                            openedViews++;
                        }
                    });

                    /**
                     *  Close completely if only one view is visible.
                     */

                     if (openedViews == 1)
                     {
                         WebUI.Call('DispatchEventLocal', 'UI_Toggle');
                         return;
                     }

                     /**
                      *  Otherwise we want to hide the currently visible views 
                      */

                      let view = Tools.getClosest(e.target, 'ui-view');
                      this.hide(view.dataset.name);

                      /**
                       *    Close by password.
                       */

                       if (view.dataset.name == 'password')
                       {
                           WebUI.Call('DispatchEventLocal', 'UI_Toggle');
                       }
                break;
                /** 
                 *   ESL BOTS & Settings 
                 */
                case 'spawn_esl_bots':
                    count = document.querySelector('[data-action="spawn_esl_bots"] input[type="number"');
                    WebUI.Call('DispatchEventLocal', 'ESLSettingsEditor', JSON.stringify({
                        action: 'spawn_esl_bots',
                        value: count.value
                    }));
                    count.value = 1;
                break;
                case 'kill_esl_bots':
                    WebUI.Call('DispatchEventLocal', 'ESLSettingsEditor', JSON.stringify({
                        action: 'kill_esl_bots'
                    }));
                break;
                case 'toggle_respawn_esl_bots':
                    WebUI.Call('DispatchEventLocal', 'ESLSettingsEditor', JSON.stringify({
                        action: 'toggle_respawn_esl_bots'
                    }));
                break;
                case 'toggle_aggression_esl_bots':
                    WebUI.Call('DispatchEventLocal', 'ESLSettingsEditor', JSON.stringify({
                        action: 'toggle_aggression_esl_bots'
                    }));
                break;

                /** ESL BOT SETTINGS  */
                case 'request_settings':
                    WebUI.Call('DispatchEventLocal', 'ESLSettingsEditor', JSON.stringify({
                        action: 'request_settings',
                        opened: this.isVisible('settings')
                    }));
                break;
                case 'submit_settings':
                    WebUI.Call('DispatchEventLocal', 'ESLSettingsEditor', JSON.stringify({
                        action: 'submit_settings'
                    }));
                break;

                /** OTHER  */
                default: 
                    let entry;

                    switch (e.target.nodeName){
                        case 'UI-RESTORE':
                            entry = Tools.getClosest(e.target, 'ui-entry');

                            entry.resetToDefault();
                        break;
                        case 'UI-ARROW':
                            entry = Tools.getClosest(e.target, 'ui-entry');

                            switch (e.target.dataset.direction){
                                case 'left':
                                    entry.onPrevious();
                                break;
                                case 'right':
                                    entry.onNext();
                                break;
                            }
                            break;
                    }

                    /** FORM SUBMISSION  */
                    if (parent.dataset.action.startsWith('submit')){
                        let form = Tools.getClosest(e.target, 'ui-view').querySelector('[data-type="form"]');
                        let action = form.dataset.action;
                        let data = { subaction: null };

                        if (parent.dataset.action.startsWith('submit_'))
                        {
                            data.subaction = parent.dataset.action.replace('submit_', '');
                        }

                        [].map.call(form.querySelectorAll('input[type="text"], input[type="password"]'), function onInputEntry(input) {
                            
                            if (typeof(input.name) !== 'undefined' && input.name.length > 0)
                            {
                                data[input.name] = input.value;
                            }
                        });

                        /** UI ENTRIES ? BOOLEAN  */
                        [].map.call(form.querySelectorAll('ui-entry[data-type="Boolean"]'), function onInputEntry(input) {
                            
                            if (typeof(input.dataset.name) !== 'undefined' && input.dataset.name.length > 0)
                            {
                                data[input.dataset.name] = (input.querySelector('ui-text').innerHTML == 'Yes');
                            }
                        });

                        /** UI ENTRY :: LIST  */

                        [].map.call(form.querySelectorAll('ui-entry[data-type="List"]'), function onInputEntry(input) {

                            if (typeof(input.dataset.name) !== 'undefined' && input.dataset.name.length > 0)
                            {
                                data[input.dataset.name] = input.querySelector('ui-text').innerHTML;
                            }
                        });

                        /* UI-Entrys :: Integer, Float, Text & Password */
                        [].map.call(form.querySelectorAll('ui-entry[data-type="Integer"], ui-entry[data-type="Float"], ui-entry[data-type="Text"], ui-entry[data-type="Password"]'), function onInputEntry(input) {

                            if (typeof(input.dataset.name) !== 'undefined' && input.dataset.name.length > 0)
                            {
                                data[input.dataset.name] = input.querySelector('input').value;
                            }
                        });

                        WebUI.Call('DispatchEventLocal', action, JSON.stringify(data));
                    }
                    break;
            }
        }.bind(this));
    };

	this.bindKeyboardEvents = function bindKeyboardEvents() {
		document.body.addEventListener('keydown', function onMouseDown(event) {
			let count;

			switch(event.keyCode || event.which) {
				/* Forms */
				case InputDeviceKeys.IDK_Enter:
					let form	= Utils.getClosest(event.target, 'ui-view');
					let submit	= form.querySelector('[data-action="submit"]');

					if(typeof(submit) !== 'undefined') {
						var clickEvent = document.createEvent('MouseEvents');
						clickEvent.initEvent('mousedown', true, true);
						submit.dispatchEvent(clickEvent);
					}

					// @ToDo get to next input and calculate the submit-end
				break;

				/* Bots */
				case InputDeviceKeys.IDK_F1:
					count = document.querySelector('[data-action="spawn_esl_bots"] input[type="number"]');
					WebUI.Call('DispatchEventLocal', 'ESLSettingsEditor', JSON.stringify({
						action:	'spawn_esl_bots',
						value:	count.value
					}));
					count.value = 1;
				break;
				case InputDeviceKeys.IDK_F2:
					WebUI.Call('DispatchEventLocal', 'ESLSettingsEditor', JSON.stringify({
						action:	'kill_esl_bots'
					}));
				break;

				/* Settings */
				case InputDeviceKeys.IDK_F11:
					WebUI.Call('DispatchEventLocal', 'ESLSettingsEditor', JSON.stringify({
						action:	'request_settings',
						opened:	this.isVisible('settings')
					}));
				break;

				/* Exit */
				case InputDeviceKeys.IDK_F12:
					WebUI.Call('DispatchEventLocal', 'UI_Toggle');
				break;

				/* Debug */
				default:
					if(DEBUG) {
						console.warn('Unknown/Unimplemented KeyCode', event.keyCode || event.which);
					}
				break;
			}
		}.bind(this));
	};

	this.openSettings = function openSettings(data) {
		let json;
		let container = document.querySelector('ui-view[data-name="settings"] figure');

		try {
			json = JSON.parse(data);
		} catch(e) {
			console.error(e, data);
			return;
		}

		/* Clear/Remove previous Data */
		[].map.call(container.querySelectorAll('ui-tab[class]'), function(element) {
			element.innerHTML = '';
		});

		json.forEach(function onEntry(entry) {
			let element	= container.querySelector('ui-tab[class="' + entry.category + '"]');
			let output	= new EntryElement();

			output.setType(entry.types);
			output.setName(entry.name);
			output.setTitle(entry.title);
			output.setValue(entry.value);
			output.setDefault(entry.default);
			output.setDescription(entry.description);

			switch(entry.types) {
				case EntryType.List:
					output.setList(entry.list);
				break;
				case EntryType.Boolean:
				case EntryType.Float:
				case EntryType.Integer:
				case EntryType.Text:
				case EntryType.Password:

				break;
			}

			element.appendChild(output.getElement());
		});
	};

	/* Translate */
	this._createLanguage = function _createLanguage(url, success, error) {
		let script	= document.createElement('script');
		script.type	= 'text/javascript';
		script.src	= url;

		script.onload = function onLoad() {
			success();
		}.bind(this);

		script.onerror = function onError() {
			error();
		}.bind(this);

		document.body.appendChild(script);
	};
	
	this.loadLanguage = function loadLanguage(string) {
		if(DEBUG) {
			console.log('Trying to loading language file:', string);
		}
		
		this._createLanguage('languages/' + string + '.js', function onSuccess() {
			if(DEBUG) {
				console.log('Language file was loaded:', string);
			}
			
			_language = string;

			this.reloadLanguageStrings();
		}.bind(this), function onError() {
			// this._createLanguage('https://min.gitcdn.link/repo/Joe91/fun-bots/fun-bots-bizzi/WebUI/languages/' + string + '.js', function() {
			this._createLanguage('https://min.gitcdn.link/repo/Ventiii/esl-bots/esl-bots/WebUI/languages/' + string + '.js', function() {	
            if(DEBUG) {
					console.log('Language file was loaded:', string);
				}
				
				_language = string;

				this.reloadLanguageStrings();
			}, function onSuccess() {
				if(DEBUG) {
					console.log('Fallback-Language file was loaded:', string);
				}
				
				_language = string;

				this.reloadLanguageStrings();
			}.bind(this), function onSuccess() {
				if(DEBUG) {
					console.log('Language & Fallback file was not exists:', string);
				}
				
				this.reloadLanguageStrings();
			}.bind(this));
		}.bind(this));		
	};

	this.reloadLanguageStrings = function reloadLanguageStrings() {
		[].map.call(document.querySelectorAll('[data-lang]'), function(element) {
			element.innerHTML = this.I18N(element.dataset.lang);
		}.bind(this));
	};

	this.I18N = function I18N(string) {
		if(DEBUG) {
			let translated = null;

			try {
				translated = Language[_language][string];
			} catch(e){}

			console.log('[Translate]', _language, '=', string, 'to', translated);
		}

		/* If Language exists */
		if(typeof(Language[_language]) !== 'undefined') {
			/* If translation exists */
			if(typeof(Language[_language][string]) !== 'undefined') {
				return Language[_language][string];
			}
		}

		return string;
	};

	this.getView = function getView(name) {
		return document.querySelector('ui-view[data-name="' + name + '"]');
	};

	this.show = function show(name) {
		if(DEBUG) {
			console.log('Show View: ', name);
		}

		let view = this.getView(name);

		view.dataset.show = true;
		//view.setAttribute('data-show', 'true');

		switch(name) {
			/* Reset Error-Messages & Password field on opening */
			case 'password':
				view.querySelector('ui-error').innerHTML				= '';
				let password		= view.querySelector('input[type="password"]');
				password.value		= '';
				password.focus();
			break;
		}
	};

	this.isVisible = function isVisible(name) {
		let view = this.getView(name);
		
		return view.dataset.show;
	};
	
	this.hide = function hide(name) {
		if(DEBUG) {
			console.log('Hide View: ', name);
		}

		let view = this.getView(name);

		view.dataset.show = false;
		//view.setAttribute('data-show', 'false');
	};

	this.error = function error(name, text) {
		if(DEBUG) {
			console.log('Error View: ', name);
		}

		let view	= this.getView(name);
		let error	= view.querySelector('ui-error');

		[].map.call(view.querySelectorAll('input[type="password"]'), function(element) {
			element.value = '';
		});

		error.innerHTML = text;
	};

    this.__constructor.apply(this, arguments);
}());