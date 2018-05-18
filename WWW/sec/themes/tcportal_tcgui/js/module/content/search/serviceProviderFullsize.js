$(function() {
    var gaPushCountry = function() {
        if(typeof ga !== 'undefined') {
            ga('send', 'Dienstleister-Check', 'Länder Relationen', 'von: '+$('#fromCountry').val()+' - nach: '+$('#toCountry').val());
        }
    };
    gaPushCountry();
    $('select#fromCountry, select#toCountry', $('#serviceProvider')).on('change', gaPushCountry);
    
    $('input[type="checkbox"]', $('#serviceProvider')).on('change', function() {
        if($(this)[0].checked) {
            var $newPill = $('<button/>')
                               .addClass('btn btn-large btn-info margin-fluid-top margin-fluid-right')
                               .attr('data-forId', $(this)[0].id)
                               .html($.trim($(this).parent().text())+' &times;');
            $('#actualFilter div', $('#serviceProvider')).append($newPill);
        }
        else {
            $('button[data-forId="'+$(this)[0].id+'"]').remove();
        }
    });
    
    $('#actualFilter div', $('#serviceProvider')).on('click', 'button', function() {
        var id = $(this).attr('data-forId');
        $('input#'+id).removeAttr('checked');
        $(this).remove();
        
        lookup();
    });
    
    var lookup = function() {
        var getData = function($selector) {
            return $selector.map(function() { return $(this).val(); }).get().join(',');
        };
        
        var data = {
            fromCountry:            $('#fromCountry').val(),
            toCountry:              $('#toCountry').val(),
            getTypeOfCompany:       getData($('input[name="typeOfCompany"]:checked')),
            getTransportMode:       getData($('input[name="transportMode"]:checked')),
            getTypeOfVehicle:       getData($('input[name="typeOfVehicle"]:checked')),
            getTypeOfVehicleBody:   getData($('input[name="typeOfVehicleBody"]:checked')),
            getTypeOfTransport:     getData($('input[name="typeOfTransport"]:checked')),
            getTypeOfGood:          getData($('input[name="typeOfGood"]:checked'))
        };
     
        $('#serviceProvider .preloader').show();
        $('#serviceProvider .result').hide();
        
        $.getJSON('/WWW/sec/900000/ext/cfc/com/timocom/controller/serviceProvider.cfc?method=getResult&wsdl&returnformat=json&queryformat=column',
            data,
            function(result) {
                $('#serviceProvider .preloader').hide();
                $('#serviceProvider .result').show();
                $('.result')
                    .removeAttr('style')
                    .text(result)
                    .show()
                    .animate({
                            color: '#0069b4'
                        },
                        1000,
                        'easeOutBack');
            });
        
        
        /// Google Analytics Trackevent wird losgeschickt, sobaltd eine selectbox selektiert wird!
        if(typeof tcTrackEvent !== "undefined") {
            var gaAllFilter = "von: " + data.fromCountry + " - nach: " + data.toCountry;
            var filter = {
                "Unternehmensart": "",
                "Transportart": "",
                "LKW-Art": "",
                "LKW-Aufbauart": "",
                "Warenform": "",
                "Warenart": ""
            };
            
            var getGoogleAnalyticsData = function($selector) {
                return $selector.map(function() { return $(this).attr("data-googleAnalyticsValue"); }).get().join(', ');
            };
            var setFilter = function(key, inputName) {
                var filterOptions = getGoogleAnalyticsData($('input[name="'+inputName+'"]:checked'));
                
                return (filterOptions === '') ? '' : (' | ' + key + ': '+filterOptions);
            }
            
            filter["Unternehmensart"] = setFilter('Unternehmensart', 'typeOfCompany');
            filter["Transportart"]    = setFilter('Transportart',    'transportMode');
            filter["LKW-Art"]         = setFilter('LKW-Art',         'typeOfVehicle');
            filter["LKW-Aufbauart"]   = setFilter('LKW-Aufbauart',   'typeOfVehicleBody');
            filter["Warenform"]       = setFilter('Warenform',       'typeOfTransport');
            filter["Warenart"]        = setFilter('Warenart',        'typeOfGood');
            
            gaAllFilter += filter["Unternehmensart"] + filter["Transportart"]  + filter["LKW-Art"] + filter["LKW-Aufbauart"] + filter["Warenform"] + filter["Warenart"] ;
            tcTrackEvent('Dienstleister-Check', 'Gesamt-Abfrage', gaAllFilter);
        }
    }
    lookup();
    $('input, select', $('#serviceProviderAccordion')).on('change', lookup);
});