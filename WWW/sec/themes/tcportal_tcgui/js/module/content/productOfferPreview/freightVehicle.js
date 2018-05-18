$(function() {
    var $freightVehicle = $('#freightVehicleOffer'),
        $fromCountry    = $('#fromCountry', $freightVehicle),
        $toCountry      = $('#toCountry',   $freightVehicle),
        $vehicleBody    = $('#vehicleBody', $freightVehicle),
        ajaxFile        = '/WWW/sec/900000/ext/cfc/com/timocom/controller/freightVehicleOffer.cfc?wsdl&returnformat=json&queryformat=column',
        staticHeader    = false,
        loading         = false,
        page            = $freightVehicle.attr('data-startPage'),
        language        = $freightVehicle.attr('data-language'),
        downloadLink    = $freightVehicle.attr('data-downloadLink'),
        ajaxFunction    = $freightVehicle.attr('data-ajaxFunction'),
        eof             = false,
        $filterHeader   = $('#filterHeader', $freightVehicle),
        $filter         = $('#filter',       $freightVehicle);
    
    eof = ($('table tbody tr', $freightVehicle).length < 20);
    
    $filterHeader.css({
        zIndex: 10
    });
    
    $('table tbody', $freightVehicle).on('click', 'tr', function() {
        window.location = downloadLink;
    });
    
    var loadNextPage = function(clearTable) {
        var loadingShape,
            loadingRow;
        
        clearTable = typeof clearTable === 'undefined' ? false : clearTable;
        
        if(clearTable) {
            eof = false;
            $('table tbody', $freightVehicle).empty();
            $('h1 small', $freightVehicle).text('');
            $('html, body').animate({
                scrollTop: $($freightVehicle).offset().top - 48
            }, 0);
        }
         
        if(! loading && (! eof | clearTable)) {
            page++;
            loading = true;
            
            loadingShape = $('<li/>')
                               .append($('<i/>')
                                           .addClass('shape'));
            
            loadingRow = $('<tr/>')
                             .attr('id', 'loadingRow')
                             .append($('<td/>')
                                         .attr('colspan', 7)
                                         .css({
                                             textAlign: 'center'
                                         })
                                         .append($('<ul/>')
                                                     .addClass('preloader no-margin')
                                                     .append(loadingShape.clone())
                                                     .append(loadingShape.clone())
                                                     .append(loadingShape.clone())));
            
            $('table tbody', $freightVehicle).append(loadingRow);
            
            $.getJSON(ajaxFile, {
                    method:         ajaxFunction,
                    fromCountry:    $fromCountry.val(),
                    toCountry:      $toCountry.val(),
                    vehicleBody:    $vehicleBody.val(),
                    page:           page,
                    language:       language,
                }, function(result) {
                    var row       = null,
                        i         = 0,
                        offerData = result.offerData;
                    
                    loading = false;
                    eof = (offerData.length < 20);
                    $('table tbody #loadingRow', $freightVehicle).remove();
                    
                    if(clearTable) {
                        $('h2 .headlineRoute', $freightVehicle).text(result.headline);
                    }
                    
                    if(offerData.length > 0) {
                        $('table', $freightVehicle).show();
                        $('#noResults', $freightVehicle).hide();
                        
                        // generate the new rows and append them...
                        for(; i < offerData.length; i++) {
                            offerData[i].startPostCode = offerData[i].startPostCode || '';
                            offerData[i].destinationZipCode = offerData[i].destinationZipCode || '';
                            
                            row = $('<tr/>')
                                      .attr('title', offerData[i].title)
                                      .addClass('clickable')
                                .append($('<td>')
                                            .text(offerData[i].startDate))
                                .append($('<td>')
                                            .html(offerData[i].startCountry + ' ' + offerData[i].startPostCode + '<br>') 
                                                  .append($('<span/>')
                                                            .addClass('wordbreakall')
                                                            .html(offerData[i].startCity)))
                                .append($('<td>')
                                            .html(offerData[i].destinationCountry + ' ' + offerData[i].destinationZipCode + '<br>') 
                                                  .append($('<span/>')
                                                            .addClass('wordbreakall')
                                                            .html(offerData[i].destinationCity)))
                                .append($('<td>')
                                            .text(offerData[i].lengthInMetres))
                                .append($('<td>')
                                            .text(offerData[i].weightInTons))
                                .append($('<td>')
                                            .append($('<span/>')
                                                        .addClass('wordbreakall')
                                            .text(htmlDecode(offerData[i].vehicleBody))))
                                .append($('<td class="hidden-phone">')
                                            .append($('<a/>')
                                                        .attr('href', downloadLink)
                                                        .append($('<i/>')
                                                                    .addClass('icon icon-download'))));
                            
                            $('table tbody', $freightVehicle).append(row);
                        }
                        
                        eof = (offerData.length < 20);
                    }
                    else {
                        if(clearTable) {
                            $('table', $freightVehicle).hide();
                            $('#noResults', $freightVehicle).show();
                            eof = true;
                        }
                        else {
                            eof = true;
                        }
                    }
                });
        }
    };
    
    var addStaticHeader = function() {
        /* static duplicated filterbox */
        $filter
            .css({
                 position: 'fixed',
                 top:      $('#mainnav').height(),
                 zIndex:   15
             });
        /* static duplicated table header */
        $filterHeader
            .css({
                 position: 'fixed',
                 top:      $('#mainnav').height() + $('#filter', $freightVehicle).height(),
                 zIndex:   10
             })
             .show();
        /*tablet / small desktop exception */
        if (($(window).width() > 767) && ($(window).width() < 1025)) {
            /* static duplicated filterbox */
            $filter
                .css({
                     position: 'fixed',
                     top:      0,
                     zIndex:   10
                 });
            /* static duplicated table header */
            $filterHeader
                .css({
                     position: 'fixed',
                     top:      $('#filter', $freightVehicle).height(),
                     zIndex:   15
                 })
                 .show();
        };
    };
    var removeStaticHeader = function() {
        $filter.removeAttr('style');
        $filterHeader.hide();
    };
    var setMobileFilter = function() {
        $filter
            .css({
                 position: 'relative',
                 top:      20
             });
    }
    var setMobileFilterHeader = function() {
        $filterHeader
            .css({
                 display:  'block',
                 position: 'fixed',
                 top:      0
             });
    }
    var htmlDecode = function(value) {
        return $('<div/>').html(value).text();
    }
    var $introTxt = $($('.span12', $('.tcStage'))[0]);
    
    $('#fromCountry, #toCountry, #vehicleBody', $freightVehicle).on('change', function() {
        page = 0;
        loadNextPage(true);
    });
    
    /* responsive things */
    if($(window).width() < 768) {
        $('#searchbar').css('display', 'none');
        $filterHeader.css('display','none');
        setMobileFilter();
    };
    
    $(window).scroll(function() {
        /* responsive things */
        if($(window).width() < 768) {
            setMobileFilter();
            if($(window).scrollTop() > ($('#mainnav').height() + $('table#results', $freightVehicle).offset().top - $filter.height()) + 100) {
                setMobileFilterHeader();
            } else {
                $filterHeader.css('display','none');
            }
        } else if (($(window).width() > 767) && ($(window).width() < 1025)) {
            setMobileFilter();
            if($(window).scrollTop() > ($('table#results', $freightVehicle).offset().top - $filter.height())) {
                setMobileFilterHeader();
                addStaticHeader();
            } else {
                $filterHeader.css('display','none');
            }
        } else {
            if($('table#results', $freightVehicle).is(':hidden') || $(window).scrollTop() + $('#mainnav').height() <= $('table#results', $freightVehicle).offset().top - $filter.height()) {
                if(staticHeader) {
                    removeStaticHeader();
                    staticHeader = false;
                }
            } else {
                if(! staticHeader) {
                    addStaticHeader();
                    staticHeader = true;
                }
            }
        }

        if($('table#results', $freightVehicle).is(':hidden') || $(window).scrollTop() + $('#mainnav').height() + $filter.height() + $filterHeader.height() >= $('table#results').height() + $('footer').height()) {
            if(staticHeader) {
                removeStaticHeader();
                staticHeader = false;
            }
        }
        
        // load next entries
        var $lastRow = $('table#results tbody tr:last', $freightVehicle);
        if($lastRow.length === 1) {
            if($(window).scrollTop() + $('#mainnav').height() + $(window).height() >= $lastRow.offset().top) {
                loadNextPage(false);
            }
        }
    });
});