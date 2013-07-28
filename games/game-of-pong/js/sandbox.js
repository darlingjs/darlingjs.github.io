'use strict';
/**
 * Project: darlingjs (GameEngine).
 * Copyright (c) 2013, Eugene-Krevenets
 */

(function(global) {

    //Define the little iframe sandbox
    global.Sandbox = function(){
        var self = document.querySelector('#sandbox').get(0).contentWindow;

        self.runSpecs = function() {
            hideErrors();
//            self.jasmine.getEnv().addReporter(new self.jasmine.TrivialReporter({
//                location: window.document.location,
//                body: $('.spec-runner')[0]
//            }));
//            self.jasmine.getEnv().addReporter(new StylishReporter());
            editors.each(function(editor) {
                self.execute(editor);
            });
            self.jasmine.getEnv().execute();
        };
        self.execute = function(editor) {
            var script = editor.getSession().getValue();
            localStorage[editor.name] = script;
            try {
                self.eval(script);
            } catch(javaScriptError) {
                //Well, maybe it's just coffeescript.
                try {
                    self.eval(CoffeeScript.compile(script, { bare: true }));
                    editors.setMode('coffee');
                } catch(coffeeError) {
                    var fullError = 'JavaScript Parse Error: '+javaScriptError+
                        '<br/>'+
                        'CoffeeScript Compile Error: '+coffeeError;
                    showError(editor.name,fullError);
                    throw fullError.replace(/\<br\/\>/g,"\n");
                }
            }
        };

        var hideErrors = function() {
            $('.flash').html('').hide();
            $('.error, .runner-wrap').removeClass('error');
        };

        var showError = function(name,fullError) {
            $('.flash').fadeIn().append("<li>Uh oh, it looks like your JavaScript "+(name === 'specs' ? 'specs have' : 'source has')+" a parse error!"+
                "<br/><br/>"+
                "<code>"+fullError+"</code>"+
                "</li>");
            $('.runner-wrap, #'+name).addClass('error');
        };

        return self;
    };
})(window);