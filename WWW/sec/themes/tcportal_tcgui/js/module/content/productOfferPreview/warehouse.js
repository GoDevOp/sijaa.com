$(function() {
    var $warehouse     = $('#warehouseOffer'),
        $country       = $('#country', $warehouse),
        $warehouseType = $('#warehouseType', $warehouse),
        ajaxFile       = '/WWW/sec/900000/ext/cfc/com/timocom/controller/warehouse.cfc?method=getResult&wsdl&returnformat=json&queryformat=column',
        staticHeader   = false,
        loading        = false,
        page           = $warehouse.attr('data-startPage'),
        entriesPerPage = $warehouse.attr('data-entriesPerPage'),
        language       = $warehouse.attr('data-language'),
        downloadLink   = $warehouse.attr('data-downloadLink'),
        eof            = false,
        $filterHeader  = $('#filterHeader', $warehouse),
        $filter        = $('#filter',       $warehouse);

    eof = ($('table tbody tr', $warehouse).length < entriesPerPage);

    $filterHeader.css({
        zIndex: 10
    });

    $('table tbody', $warehouse).on('click', 'tr', function() {
        window.location = downloadLink;
    });

    var loadNextPage = function(clearTable) {
        var loadingShape,
            loadingRow;

        clearTable = typeof clearTable === 'undefined' ? false : clearTable;

        if(clearTable) {
            eof = false;
            $('table tbody', $warehouse).empty();
            $('h1 small', $warehouse).text('');
            $('html, body').animate({
                scrollTop: $($warehouse).offset().top - 48
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

            $('table tbody', $warehouse).append(loadingRow);

            $.getJSON(ajaxFile, {
                    country:        $country.val(),
                    warehouseType:  $warehouseType.val(),
                    page:           page,
                    entriesPerPage: entriesPerPage,
                    language:       language,
                }, function(result) {
                    var row           = null,
                        i             = 0,
                        warehouseData = result.warehouseData;

                    loading = false;
                    eof = (warehouseData.length < entriesPerPage);
                    $('table tbody #loadingRow', $warehouse).remove();

                    if(clearTable) {
                        $('h2 .headlineRoute', $warehouse).text(result.headline);
                    }

                    if(warehouseData.length > 0) {
                        $('table', $warehouse).show();
                        $('#noResults', $warehouse).hide();

                        // generate the new rows and append them...
                        for(; i < warehouseData.length; i++) {
                            warehouseData[i].location.zipCode = warehouseData[i].location.zipCode || '';

                            row = $('<tr/>')
                                      .attr('title', warehouseData[i].title)
                                      .addClass('clickable')
                                .append($('<td>')
                                            .html(warehouseData[i].location.country + ' - ' + warehouseData[i].location.zipCode + '<br>')
                                                  .append($('<span/>')
                                                            .addClass('wordbreakall')
                                                            .html(warehouseData[i].location.city)))
                                .append($('<td>')
                                           .append($('<span/>')
                                                      .addClass('wordbreakall')
                                                      .html(warehouseData[i].warehouseTypes)))
                                .append($('<td>')
                                           .append($('<span/>')
                                                      .addClass('wordbreakall')
                                                      .text(warehouseData[i].warehouseEquipment)))
                                .append($('<td>')
                                            .text(warehouseData[i].size))
                                .append($('<td class="hidden-phone">')
                                            .append($('<a/>')
                                                        .attr('href', downloadLink)
                                                        .append($('<i/>')
                                                                    .addClass('icon icon-download'))));

                            $('table tbody', $warehouse).append(row);
                        }

                        eof = (warehouseData.length < entriesPerPage);
                    }
                    else {
                        if(clearTable) {
                            $('table', $warehouse).hide();
                            $('#noResults', $warehouse).show();
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
             })
            .removeClass('margin-fluid-top');
        /* static duplicated table header */
        $filterHeader
            .css({
                 position: 'fixed',
                 top:      $('#mainnav').height() + $('#filter', $warehouse).height(),
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
                     top:      $('#filter', $warehouse).height(),
                     zIndex:   15
                 })
                 .show();
        };
    };
    var removeStaticHeader = function() {
        $filter.removeAttr('style').addClass('margin-fluid-top');
        $filterHeader.hide();
    };
    var setMobileFilter = function() {
        $filter
            .css({
                 position: 'relative',
                 top:      60
             });
    }
    var setMobileFilterHeader = function() {
        $filterHeader
            .css({
                 display: 'block',
                 position: 'fixed',
                 top:      0
             });
    }

    $('#country, #warehouseType', $warehouse).on('change', function() {
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
            if($(window).scrollTop() > ($('#mainnav').height() + $('table#results', $warehouse).offset().top - $filter.height()) + 100) {
                setMobileFilterHeader();
            } else {
                $filterHeader.css('display','none');
            }
        } else {
            if($('table#results', $warehouse).is(':hidden') || $(window).scrollTop() + $('#mainnav').height() <= $('table#results', $warehouse).offset().top - $filter.height()) {
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

        if($('table#results', $warehouse).is(':hidden') || $(window).scrollTop() + $('#mainnav').height() + $filter.height() + $filterHeader.height() >= $('table#results').height() + $('footer').height()) {
            if(staticHeader) {
                removeStaticHeader();
                staticHeader = false;
            }
        }

        // load next entries
        var $lastRow = $('table#results tbody tr:last', $warehouse);
        if($lastRow.length === 1) {
            if($(window).scrollTop() + $('#mainnav').height() + $(window).height() >= $lastRow.offset().top) {
                loadNextPage(false);
            }
        }
    });
});