//import i18next from 'i18next';
var valuta = '€';
i18next.init({
  lng: 'en',
  debug: true,
  resources: {
    en: {
      translation: {
        "textGasprice": "Used natural gas price",
        "initHintBtndownload": "download csv from today",
        "hintSpanGasRate": "Click to edit gas price for estimated natural gas costs per day.",
        "chartGasTotal": "Cubic meters of gas",
        "chartGasDay": "Cubic meters of gas per day",
        "chartGasHour": "Kubieke meter gas per hour",
        "chartTemperature": "Degree",
        "btnDownloadDataFrom": "Download data from ",
        "promtNewGasPrice": "Set new natural gas price.",
        "chartWatt": "Watt",
        "chartTitleTempNow": "Temperature now",
        "chartTitleAvgTemp": "Average temperature today till now ±",
        "chartTitleGasTodayTillNow": "Natural gas use today till now ±",
        "statusOflline": "You seems to be offline.",
        "filenameNoFullDay": "incomplete"
      }
    },
    nl: {
      translation: {
        "textGasprice": "Gebruikte gas prijs",
        "initHintBtndownload": "download csv van vandaag",
        "hintSpanGasRate": "Klik om gebruikte gas prijs te wijzigen voor geschatte gas kosten per dag.",
        "chartGasTotal": "kubieke meter gas totaal",
        "chartGasDay": "Kubieke meter gas per dag",
        "chartGasHour": "Kubieke meter gas per uur",
        "chartTemperature": "Temperatuur",
        "btnDownloadDataFrom": "Download gegevens van ",
        "promtNewGasPrice": "Stel de nieuwe gasprijs in.",
        "chartWatt": "Watt",
        "chartTitleTempNow": "Temperatuur nu",
        "chartTitleAvgTemp": "Gem. temperatuur vandaag tot nu: ±",
        "chartTitleGasTodayTillNow": "Gas verbruik vandaag tot nu: ±",
        "statusOflline": "Je lijkt offline te zijn.",
        "filenameNoFullDay": "incomplete"
      }
    }
  }
}).then(function(t) {
  document.getElementById('textGasprice').textContent = t('textGasprice');
  document.getElementById('spanGasRate').setAttribute('title', t('hintSpanGasRate'));
  document.getElementById('btndownload').setAttribute('title', t('initHintBtndownload'));
  document.getElementById('spanTextGaspriceValuta').textContent = valuta;
});