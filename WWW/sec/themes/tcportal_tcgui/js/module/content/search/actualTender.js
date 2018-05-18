$(function() {
    var $actualTender  = $('#actualTender'),
        $fromCountry   = $('#fromCountry', $actualTender),
        $toCountry     = $('#toCountry', $actualTender),
        ajaxFile       = '/WWW/sec/900000/ext/cfc/com/timocom/controller/actualTender.cfc?method=getResult&wsdl&returnformat=json&queryformat=column',
        staticHeader   = false,
        loading        = false,
        page           = $actualTender.attr('data-startPage'),
        entriesPerPage = $actualTender.attr('data-entriesPerPage'),
        language       = $actualTender.attr('data-language'),
        downloadLink   = $actualTender.attr('data-downloadLink'),
        eof            = false,
        $filterHeader  = $('#filterHeader', $actualTender),
        $filter        = $('#filter', $actualTender);

    if(typeof $toCountry === 'undefined') {
        $toCountry = null;
    }

    eof = ($('table tbody tr', $actualTender).length < entriesPerPage);

    $filterHeader.css({
        zIndex: 10
    });

    $('table tbody', $actualTender).on('click', 'tr', function() {
        window.location = downloadLink;
    });

    var loadNextPage = function(clearTable) {
        var loadingShape,
            loadingRow;

        clearTable = typeof clearTable === 'undefined' ? false : clearTable;

        if(clearTable) {
            eof = false;
            $('table tbody', $actualTender).empty();
            $('h1 small', $actualTender).text('');
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
                                         .attr('colspan', 6)
                                         .css({
                                             textAlign: 'center'
                                         })
                                         .append($('<ul/>')
                                                     .addClass('preloader no-margin')
                                                     .append(loadingShape.clone())
                                                     .append(loadingShape.clone())
                                                     .append(loadingShape.clone())));

            $('table tbody', $actualTender).append(loadingRow);

            $.getJSON(ajaxFile, {
                    fromCountry:    $fromCountry.val(),
                    page:           page,
                    language:       language,
                    toCountry:      $toCountry !== null &&  $toCountry.val() !== undefined ? $toCountry.val() : $fromCountry.val()
                }, function(result) {
                    var row        = null,
                        i          = 0,
                        tenderData = result.tenderData;

                    loading = false;
                    eof = (tenderData.length < entriesPerPage);
                    $('table tbody #loadingRow', $actualTender).remove();

                    if(clearTable) {
                        $('h2 .headlineRoute', $actualTender).text(result.headlineRoute);
                    }

                    if(tenderData.length > 0) {
                        $('table', $actualTender).show();
                        $('#noResults', $actualTender).hide();

                        // generate the new rows and append them...
                        for(; i < tenderData.length; i++) {
                            row = $('<tr/>')
                                      .attr('title', tenderData[i].title)
                                      .addClass('clickable');
                            row.append($('<td>')
                                           .text(tenderData[i].from.country + ' ' + tenderData[i].from.zipCode));
                            row.append($('<td>')
                                           .text(tenderData[i].to.country + ' ' + tenderData[i].to.zipCode));
                            if(language === 'hu') {
                                row.append($('<td>')
                                               .append($('<span/>')
                                                           .addClass('wordbreakall')
                                                           .text(tenderData[i].frequency.unit + ' ' + tenderData[i].frequency.value + ' x')));
                            }
                            else {
                                row.append($('<td>')
                                               .append($('<span/>')
                                                           .addClass('wordbreakall')
                                                           .text(tenderData[i].frequency.value + ' x ' + tenderData[i].frequency.unit)));
                            }
                            row.append($('<td>')
                                           .append($('<span/>')
                                                       .addClass('wordbreakall')
                                                       .text(tenderData[i].vehicleList)));
                            row.append($('<td>')
                                           .append($('<span/>')
                                                       .addClass('wordbreakall')
                                                       .text(tenderData[i].typeOfGoods + ' ('+tenderData[i].natureOfGoods+')')));
                            row.append($('<td class="hidden-phone">')
                                           .append($('<a/>')
                                                       .attr('href', downloadLink)
                                                       .append($('<i/>')
                                                                   .addClass('icon icon-download'))));

                            $('table tbody', $actualTender).append(row);
                        }

                        eof = (tenderData.length < entriesPerPage);
                    }
                    else {
                        if(clearTable) {
                            $('table', $actualTender).hide();
                            $('#noResults', $actualTender).show();
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
        $filter
            .css({
                 position: 'fixed',
                 top:      $('#mainnav').height(),
                 zIndex:   10
             });
        $filterHeader
            .css({
                 position: 'fixed',
                 top:      $('#mainnav').height() + $('#filter', $actualTender).height(),
                 zIndex:   10
             })
             .show();
    };
    var removeStaticHeader = function() {
        $filter.removeAttr('style');
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

    $('#fromCountry, #toCountry', $actualTender).on('change', function() {
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
            if($(window).scrollTop() > ($('#mainnav').height() + $('table#results', $actualTender).offset().top - $filter.height()) + 100) {
                setMobileFilterHeader();
            } else {
                $filterHeader.css('display','none');
            }
        } else {
            if($(window).scrollTop() + $('#mainnav').height() <= $('table#results', $actualTender).offset().top - $filter.height()) {
                if(staticHeader) {
                    removeStaticHeader();
                    staticHeader = false;
                }
            }
            else {
                if(! staticHeader) {
                    addStaticHeader();
                    staticHeader = true;
                }
            }
        }
        if($('table#results', $actualTender).is(':hidden') || $(window).scrollTop() + $('#mainnav').height() + $filter.height() + $filterHeader.height() >= $('table#results').height() + $('footer').height()) {
            if(staticHeader) {
                removeStaticHeader();
                staticHeader = false;
            }
        }

        // load next entries
        var $lastRow = $('table#results tbody tr:last', $actualTender);
        if($lastRow.length === 1) {
            if($(window).scrollTop() + $('#mainnav').height() + $(window).height() >= $('table#results tbody tr:last', $actualTender).offset().top) {
                loadNextPage(false);
            }
        }
    });
});