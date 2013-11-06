/**
 * @class node_modules.daisy_gpio
 * 
 * This module provide a simple full asynchronous interface for GPIO management for Acmesystems Aria and FoxBoard products.
 * Visit [AcmeSystems official site](http://www.acmesystems.it/) for more informations about this hardware.
 * For an example of usage see the test folder.
 * 
 * @author Marcello Gesmundo
 * 
 * # License
 * 
 * Copyright (c) 2012-2013 Yoovant by Marcello Gesmundo. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 * 
 *    * Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above
 *      copyright notice, this list of conditions and the following
 *      disclaimer in the documentation and/or other materials provided
 *      with the distribution.
 *    * Neither the name of Yoovant nor the names of its
 *      contributors may be used to endorse or promote products derived
 *      from this software without specific prior written permission.
 *      
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
module.exports = function(config) {
    var utils        = require('object_utils');
    var Class        = require('chic').Class;
    var chicEvent    = require('chic-event');
    var Event        = chicEvent.Event;
    var EventEmitter = chicEvent.EventEmitter;

    // namespace
    var my = {};
    
    /**
     * Configuration
     */
    my.config = {
        /**
         * @cfg {String} [model='aria']The model of the device. Values allowed:
         * 
         *  - aria: for an Acmesystems Aria G25
         *  - fox: for an Acmesystems FoxBoard G20
         */
        model : 'aria',
        /**
         * @cfg {Boolean} test Set true when not run in fox or aria
         */
        test  : false,
        /**
         * @cfg {Boolean} debug Set true if you want trace running module
         */
        debug : false,
        /**
         * @cfg {Object} logger The logger use in debug mode
         */
        logger: console
    };

    config = config || {};
    
    // merge new config with default config
    utils.merge(my.config, config);

    var acme = require('aria_fox_gpio')(my.config);
    
    /**
     * The base Daisy base class.
     * 
     * __NOTE.__ Must inherit your custom class from this.
     * 
     * @class node_modules.daisy_gpio.Daisy
     */
    var Daisy = Class.extend({
        /**
         * The constructor. When all the GPIO are ready to use, an init event is fired.
         * 
         * @constructor
         * @param {String} connector The name of the connector
         * @param {Number} pins The number of the pins used into the daisy board
         */
        init: function(connector, pins) {
            this.events = new EventEmitter();
            this.connector = connector;
            this.pins = pins || 8;
            this.instances = [];
            this.totalInit = 0;
            this.totalFree = 0;
            var self = this;
            acme.attach('change', function(event) {
                if (event.data.sender.connector === self.connector) {
                    self.emitEvent('change', event.data.sender, event.data.err);
                }
            });
            acme.attach('rising', function(event) {
                if (event.data.sender.connector === self.connector) {
                    self.emitEvent('rising', event.data.sender, event.data.err);
                }
            });
            acme.attach('falling', function(event) {
                if (event.data.sender.connector === self.connector) {
                    self.emitEvent('falling', event.data.sender, event.data.err);
                }
            });
            acme.attach('init', function(event) {
                if (event.data.sender.connector === self.connector) {
                    self.totalInit++;
                    if (self.totalInit === self.pins) {
                        self.emitEvent('init', self);
                    }
                }
            });
            acme.attach('free', function(event) {
                if (event.data.sender.connector === self.connector) {
                    self.totalFree++;
                    if (self.totalFree === self.pins) {
                        self.emitEvent('free', self);
                    }
                }
            });
        },
        /**
         * Attach a listener to an event.
         * 
         * __Note__. The listener handle all events generated by all GPIO used into Daisy instance,
         * except the init and free events that are emitted only when all GPIO are ready to use,
         * and free to use respectively.
         * 
         * @param {String} event Event name
         * @param {Function} callback The listener for the event
         * @return {callback(event)} The callback
         * @param {{ type: String, target: Object, data: Object }} callback.event The fired event
         * @param {String} callback.event.type The event type name
         * @param {Object} callback.event.target The object emitter
         * @param {Object} callback.event.data The data sent through the event
         */
        attach: function(event, callback) {
            this.events.on(event, callback);
        },
        /**
         * Remove a listener from an event.
         * If the callback is not provided, all listeners for the event are removed.
         * If the event is not provided, all listeners are removed.
         * 
         * @param {String} event (optional) Event name
         * @param {Function} callback (optional) The listener for the event
         * @return {callback(event)} The callback
         * @param {{ type: String, target: Object, data: Object }} callback.event The fired event
         * @param {String} callback.event.type The event type name
         * @param {Object} callback.event.target The object emitter
         * @param {Object} callback.event.data The data sent through the event
         */
        detach: function(event, callback) {
            this.events.off(event, callback);
        },
        /**
         * @private
         * @ignore
         */
        emitEvent: function(event, sender, err) {
            this.events.emit(event, new Event({
                err: err,
                sender: sender
            }));
        },
        /**
         * All the GPIO are released for other use. When all the GPIO are released a free event is emitted.
         */
        free: function() {
            var i;
            for (i = 0; i < this.pins; i++) {
                this.instances[i].free();
            }
            delete this.instances;
        }
        /**
         * @event init Fired when all GPIO into the daisy board are ready
         * @param {String} err The error if occurred
         * @param {Object} sender The sender of the event (the Daisy instance)
         */  
        /**
         * @event free Fired when all GPIO into the daisy board are free
         * @param {String} err The error if occurred
         * @param {Object} sender The sender of the event (the Daisy instance)
         */
        /**
         * @event rising Fired when a pin change from low to high status. After this event a {@link change} event is fired.
         * @param {String} err The error if occurred
         * @param {Object} sender The sender of the event
         * 
         * __Note__ Use sender.index to identify the pin
         */
        /**
         * @event falling Fired when a pin change from high to low status. After this event a {@link change} event is fired.
         * @param {String} err The error if occurred
         * @param {Object} sender The sender of the event
         * 
         * __Note__ Use sender.index to identify the pin
         */
        /**
         * @event change Fired when a pin change his status. This event is fired after a {@link #falling} or {@link #rising} event.
         * 
         * @param {String} err The error if occurred
         * @param {Object} sender The sender of the event
         * @param {String} value The value of the pin.
         * 
         * __Note__ Use sender.index to identify the pin
         */
    });
    
    /**
     * @class node_modules.daisy_gpio.Daisy5
     * @extends node_modules.daisy_gpio.Daisy
     * @inheritdoc node_modules.daisy_gpio.Daisy
     * 
     * 8 buttons array
     */
    my.Daisy5 = Daisy.extend({
        /**
         * The constructor. When all the GPIO are ready to use, an init event is fired.
         * 
         * @constructor
         * @param {String} [connector = 'D12'] The name of the connector
         */
        init: function(connector) {
            var self = this;
            connector = connector || 'D12';
            self.sup(connector);
            var Button = acme.InGpio;
            var i, btn;
            for (i = 0; i < 8; i++) {                          
                btn = new Button(connector, i + 2);
                btn.index = i;
                self.instances.push(btn);
            }
        }
    });
    
    /**
     * @class node_modules.daisy_gpio.Daisy11
     * @extends node_modules.daisy_gpio.Daisy
     * @inheritdoc node_modules.daisy_gpio.Daisy
     * 
     * 8 leds array
     */
    my.Daisy11 = Daisy.extend({
        /**
         * The constructor. When all the GPIO are ready to use, an init event is fired.
         * 
         * @constructor
         * @param {String} [connector = 'D11'] The name of the connector
         */
        init: function(connector) {
            var self = this;
            connector = connector || 'D11';
            self.sup(connector);
            var Led = acme.OutGpio;
            var i, led;
            for (i = 0; i < 8; i++) {                          
                led = new Led(connector, i + 2);
                led.index = i;
                self.instances.push(led);
            }
        }
    });
   
    return my;
};
