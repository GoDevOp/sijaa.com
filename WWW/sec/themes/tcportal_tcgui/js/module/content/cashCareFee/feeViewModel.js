function GetURLParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0].toLowerCase() == sParam.toLowerCase()) {
            return sParameterName[1].toLowerCase();
        }
    }
}

function Currency(Currency, Value) {
    var self = this;
    self.Currency = ko.observable(Currency)
        .extend({
            required: true,
            pattern: {
                message: "Exchange rate needs 3 characters",
                params: "^[A-Za-z]{3}$"
            }
        });
    self.Value = ko.observable(Value)
        .extend({
            required: "Exchange rate is required",
            pattern: ({
                message: "Exchange rate is not in the right Format!",
                params: "^[0-9]+([.|,][0-9]+)?$"
            })
        });
    self.formIsNotValid = ko.computed(function() {
        var errors = ko.utils.unwrapObservable(ko.validation.group(self));
        return (errors.length > 0);
    });
}

function Grading(Grading, Fee) {
    var self = this;
    self.Grading = ko.observable(Grading);
    self.Fee = ko.observable(Fee)
        .extend({
            required: "Fee is required.",
            pattern: ({
                message: "Fee is not in the right Format!",
                params: "^[0-9]+([.|,][0-9]+)?$"
            })
        });
    self.formIsNotValid = ko.computed(function() {
        var errors = ko.utils.unwrapObservable(ko.validation.group(self));
        return (errors.length > 0);
    });
}

function feeViewModel() {
    var self = this;

    self.path = ko.observable();
    self.formularType = ko.observable();
    self.ajaxExt = ko.observable();
    self.ajaxFiles = ko.observable();

    self.listCurrencies = ko.observableArray([]);
    self.listGrading = ko.observableArray([]);
    self.selectedCurrency = ko.observable();
    self.inputValue = ko.observable().extend({
        pattern: ({
            message: "Value is not in the right Format!",
            params: "^[0-9]+([.|,][0-9]+)?$"
        })
    });
    self.inputValueWarning = ko.observable();
    self.formIsValid = ko.observable(true);

    ko.computed(function() {
        var errors = ko.utils.unwrapObservable(ko.validation.group(self));
        if (errors.length > 0) {
            self.inputValueWarning("text-warning");
            self.formIsValid(false);
        } else {
            self.inputValueWarning();
            self.formIsValid(true);
        }
        $.colorbox.resize();
    });
    self.outputDue = ko.observable("0 €");

    self.getCurrenciesAndExchangeRates = function getCurrenciesAndExchangeRates() {
        self.listCurrencies.removeAll();
        $.ajax({
            type: "GET",
            dataType: "json",
            url: self.ajaxFiles(),
            data: {
                method: "prepareCurrenciesAndExchangeRates"
            },
            success: function(data) {
                self.listCurrencies.push(new Currency("EUR", 1));
                for (var i = 0; i < data.length; i++) {
                    self.listCurrencies.push(new Currency(data[i].Currency, data[i].Value));
                }
            },
            error: function(ex) {},
            async: true
        });
    };

    self.getGradingAndFees = function getGradingAndFees() {
        self.listGrading.removeAll();
        $.ajax({
            type: "GET",
            dataType: "json",
            url: self.ajaxFiles(),
            data: {
                method: "prepareGradingFees"
            },
            success: function(data) {
                for (var i = 0; i < data.length; i++) {
                    var tmpNumber = data[i].Fee;
                    tmpNumber = tmpNumber.toLocaleString($("#language").val(), {
                        localMatcher: "lookup",
                        style: "currency",
                        currency: 'EUR'
                    });
                    self.listGrading.push(new Grading(data[i].Grading, tmpNumber));
                }
            },
            error: function(ex) {},
            async: true
        });
    };

    self.showValue = function showValue() {
        if (self.selectedCurrency() && self.inputValue()) {
            var tmpValue = self.inputValue();
            if (/,/i.test(tmpValue)) {
                tmpValue = tmpValue.toString().replace(",", ".");
            }

            var euroValue = tmpValue / self.selectedCurrency().Value();
            if (euroValue != 0) {
                for (var i = 0; i < self.listGrading().length; i++) {
                    if (self.listGrading()[i].Grading() >= euroValue) {
                        self.outputDue(self.listGrading()[i].Fee());
                        break;
                    } else {
                        if (self.listGrading()[i].Grading() < euroValue) {
                            if (self.listGrading()[i + 1] != undefined) {
                                if (self.listGrading()[i + 1].Grading() > euroValue) {
                                    self.outputDue(self.listGrading()[i + 1].Fee());
                                    break;
                                }
                            } else {
                                self.outputDue(self.listGrading()[i].Fee());
                                break;
                            }
                        }
                    }
                }
            }
        }
    };

    self.init = function init() {
        self.path("/WWW/sec/900000/ext/cfc/com/timocom/controller/");
        self.formularType("TCO");
        self.ajaxExt("?wsdl&returnformat=json");
        self.ajaxFiles(self.path() + "cashCareFee.cfc" + self.ajaxExt());

        self.getCurrenciesAndExchangeRates();
        self.getGradingAndFees();

        var popUp = GetURLParameter('openpopup');
        if (popUp == "cashcarefee") {
            $("#feeCalculatorButton").click();
        }
    };
    self.init();
}

$(document).ready(function() {
    ko.applyBindings(new feeViewModel());
});