$(document).ready(function() {
    $("#feeCalculatorButton").colorbox({
        inline: true,
        close: "<i class=\"icon-form-remove colorboxIcon\"></i>",
        width: 380,
        onOpen: function() {
            $("#feeCalculator").css({"display":"block"});
        },
        onCleanup: function() {
            $("#feeCalculator").css({"display":"none"});
        }
    });
});