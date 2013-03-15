# Daisy GPIO

This module provide a simple full asynchronous interface to manage Acmesystems Daisy modules for Aria and FoxBoard products. Visit [AcmeSystems official site](http://www.acmesystems.it/) for more informations about this hardware.

To create documentation you must install [JSDuck](https://github.com/senchalabs/jsduck) and type in your terminal:

    $ ./gen_doc.sh

Please visit [Yoovant website](http://www.yoovant.com/how-to-manage-gpio-on-arm-based-sbc-aria-and-fox-g20/) for more informations.

## Usage

If you have a new amazing [Acmesystem](http://www.acmesystems.it) [Aria board](http://www.acmesystems.it/aria) or a [FoxBoad G20](http://www.acmesystems.it/FOXG20), you can easy manage GPIO using [Node.js](http://nodejs.org) and this module to manage Daisy board for fast prototyping.

Install the package as usual:

    debarm:~# npm install daisy_gpio

Now you can write a simple program to turn on a led when push a button using two prototype boards: [Daisy5](http://www.acmesystems.it/DAISY-5) and [Daisy11](http://www.acmesystems.it/DAISY-11). Assuming you connect Daisy5 to D5 connector and Daisy11 to D2 connector of your FoxBoard, your first program seems like this:

    var daisy = require('daisy')({
        model: 'fox',   // set to aria if you have this board
        test: false,    // set true if you want use a fake gpio path.
                        // Note that the change, falling and rising events can't fires
        debug: false    // set true if you want see debug messages into terminal window
    });
    // create a new Daisy5 instance (8 buttons array)
    var daisy5 = new daisy.Daisy5();
    // attach the init event (fired when ALL buttons are ready)
    daisy5.attach('init', function(event) {
        console.log('init daisy5');
    });
    // create a new Daisy11 instance (8 leds array)
    var daisy11 = new daisy.Daisy11();
    // attach the init event (fired when ALL leds are ready)
    daisy11.attach('init', function(event) {
        console.log('init daisy11');
    });
    // attach the rising event fired for EVERY button when pressed
    daisy5.attach('rising', function(event) {
        daisy11.instances[event.data.sender.index].setHigh();
    });
    // attach the falling event fired for EVERY button when released
    daisy5.attach('falling', function(event) {
        daisy11.instances[event.data.sender.index].setLow();
    });
    // attach the rising event fired for EVERY led is turned on
    daisy11.attach('rising', function(event) {
        console.log('turned on led #' + event.data.sender.index);
    });
    // attach the falling event fired for EVERY led is turned off
    daisy11.attach('falling', function(event) {
        console.log('turned off led #' + event.data.sender.index);
    });

Save your file as _presstolight.js_ and run in your terminal:

    debarm:~# node presstolight.js

Now if you push a button, the corresponding led is turned on. Easy, right? Note that the _init_ and _free_ events are fired only when ALL leds (buttons) of Daisy11 (Daisy5) are ready to use and available respectively, whereas the _rising_ and _falling_ events are fired by every led (button). Note also that all events have a data property that contains two properties:

- err: the error if occurred
- sender: the Gpio instance that has fired the event

The _event.data_ for a _change_ event has also a _value_ property with the last value.

See full documentation into _doc_ folder and some examples into _test_ folder within the [daisy_gpio](https://npmjs.org/package/daisy_gpio) package.