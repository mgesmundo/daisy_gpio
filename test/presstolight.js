var daisy = require('../lib/daisy')({
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
