$(document).ready(function() {
    $(".referenceDetailButton").click(function() {
        var test = $(this).parent();
        var myChildren = test.children(".detail");
        $("#referenceDetail").empty();
        myChildren.clone().show().appendTo("#referenceDetail");
        $.colorbox.resize();
    });

    $(".referenceDetailButton").colorbox({
        inline: true,
        close: "<i class=\"icon-form-remove colorboxIcon\"></i>",
        onOpen: function() {
            $("#referenceDetail").css({
                "display": "block"
            });
        },
        onCleanup: function() {
            $("#referenceDetail").css({
                "display": "none"
            });
        }
    });
});