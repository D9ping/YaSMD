// Change to the first selectable date for power use:
var firstDataDate = new Date(2022, 1, 1, 0, 0, 0, 0);
// Change to the first selectable date for gas use per hour:
var firstGasDate = new Date(2022, 1, 1, 0, 0, 0, 0);
// Change to the first selectable date for gas use per day:
var firstDataMonth = new Date(2022, 1, 1, 0, 0, 0, 0);

function loadPowerGraph(csvfile) {
    graphPower = new Dygraph(
        document.getElementById("divGraphPower"),
        csvfile,
        {
            visibility: [false, false, false, false, true, true, true],
            includeZero: true,
            ylabel: i18next.t('chartWatt'),
            y2label: i18next.t('chartGasTotal'),
            drawXGrid: false,
            showRoller: false,
            drawPoints: true,
            pointSize: 2,
            series : {
                'gas': {
                    axis: 'y2',
                    color: '#FF8B1E'
                },
                'vermogenaf': {
                    color: '#C60000'
                },
                'vermogenterug': {
                    color: '#008B1E'
                }
            },
            axes: {
                y: {
                    axisLabelWidth: 60
                },
                y2: {
                    labelsKMB: false,
                    independentTicks: true
                }
            },
            labelsDivStyles: {
                'text-align': 'center'
            },
            valueRange: [0, 5000],  // Change to upper power use in watts in the chart visible.
            showRangeSelector: true
        }
    );
}

function loadGasGraph(csvfile) {
    graphGas = new Dygraph(
        document.getElementById("divGraphGas"),
        csvfile,
        {
            includeZero: true,
            ylabel: i18next.t('chartGasHour'),
            y2label: i18next.t('chartTemperature') + ' Celcius',
            drawXGrid: false,
            showRoller: false,
            drawPoints: true,
            fillGraph: true,
            fillAlpha: 0.7,
            pointSize: 2,
            panEdgeFraction: 0.005,
            showRangeSelector: true,
            mobileDisableYTouch: true,
            series : {
                'gas m3/uur': {
                    color: '#FF8B1E',
                    fillGraph: true
                },
                'temperatuur': {
                    axis: 'y2',
                    color: '#a5aa44',
                    fillGraph: false
                }
            },
            axes: {
                y: {
                    valueRange: [0, 5.0]
                },
                y2: {
                    valueRange: [-10, 40.0]
                }
            }
        }
    );
}

// Darken a color
function darkenColor(colorStr) {
    var color = Dygraph.toRGB_(colorStr);
    color.r = Math.floor((255 + color.r) / 2);
    color.g = Math.floor((255 + color.g) / 2);
    color.b = Math.floor((255 + color.b) / 2);
    return 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')';
}

// This function draws bars for a single series.
function barChartPlotter(e) {
    var ctx = e.drawingContext;
    var points = e.points;
    var y_bottom = e.dygraph.toDomYCoord(0);
    ctx.fillStyle = darkenColor(e.color);
    // Find the minimum separation between x-values.
    // This determines the bar width.
    var min_sep = Infinity;
    for (var i = 1; i < points.length; ++i) {
        var sep = points[i].canvasx - points[i - 1].canvasx;
        if (sep < min_sep) min_sep = sep;
    }

    var bar_width = Math.floor(0.9 * min_sep);
    // Do the actual plotting.
    for (var i = 0; i < points.length; ++i) {
        var p = points[i];
        var center_x = p.canvasx;
        ctx.fillRect(center_x - bar_width / 2, p.canvasy, bar_width, y_bottom - p.canvasy);
        ctx.strokeRect(center_x - bar_width / 2, p.canvasy, bar_width, y_bottom - p.canvasy);
    }
}

function loadGasMonthGraph(csvfile) {
    graphGas = new Dygraph(
        document.getElementById("divGraphGasMonth"),
        csvfile, {
            includeZero: true,
            ylabel: i18next.t('chartGasDay'),
            drawXGrid: false,
            showRoller: false,
            drawPoints: false,
            stepGraph: true,
            fillGraph: true,
            fillAlpha: 0.7,
            pointSize: 2,
            panEdgeFraction: 0.005,
            showRangeSelector: true,
            mobileDisableYTouch: true,
            plotter: barChartPlotter,
            series : {
                'gas m3': {
                    color: '#FF8B1E',
                }
            },
            axes: {
                y: {
                    valueFormatter: function(val) {
                        var gasRate = parseFloat(spanGasRate.textContent.replace(',', '.'));
                        var gasDayCost = val * gasRate;
                        return val+' (' + valuta + ' '+gasDayCost.toFixed(2).toString().replace('.', ',')+')'; 
                    }
                }
            }
        }
    );
}

function showSelectedDate(isToday) {
    let spanSelectedDate = document.getElementById('textSelectedDate');
    let iso8601str = selectedDate.toISOString(true).substr(0, 10);
    spanSelectedDate.textContent = iso8601str;
    document.getElementById('btndownload').setAttribute('title', i18next.t('btnDownloadDataFrom') + iso8601str);
    document.getElementById('downloadlink').setAttribute('download', 'data_'+iso8601str+'.csv');
    if (arguments.length === 0) {
        document.getElementById('downloadlink').setAttribute('href', '/' + selectedDate.getFullYear() + '/data_' + iso8601str + '.csv');
        return;
    }

    if (isToday) {
        document.getElementById('downloadlink').setAttribute('download', 'data_'+iso8601str+'_' + encodeURIComponent(i18next.t('filenameNoFullDay')) + '.csv');
        document.getElementById('downloadlink').setAttribute('href', '/data.csv');
        return;
    }

    document.getElementById('downloadlink').setAttribute('href', '/' + selectedDate.getFullYear() + '/data_' + iso8601str + '.csv');
}

function showSelectedMonth() {
    let spanSelectedDate = document.getElementById('textSelectedMonth');
    spanSelectedDate.textContent = selectedMonth.getFullYear() + '-' + (selectedMonth.getMonth()+1);
}

loadPowerGraph("/data.csv");
loadGasGraph("/gasuse.csv");

var curDate = new Date();
var selectedMonth = new Date(curDate.getTime() - (curDate.getTimezoneOffset() * 60000));
selectedMonth.setTime(selectedMonth.getTime() - (24*60*60*1000));
var selectedDate = new Date(curDate.getTime() - (curDate.getTimezoneOffset() * 60000));
loadGasMonthGraph('/' + selectedDate.getFullYear() + "/gasuse_" + selectedMonth.toISOString().substr(0, 7) + ".csv");

var btnbackMonth = document.getElementById('btnbackMonth');
var btnnextMonth = document.getElementById('btnnextMonth');

var btnback = document.getElementById('btnback');
btnback.addEventListener('click', function() {
    selectedDate.setDate(selectedDate.getDate()-1);
    if (moment(selectedDate).isBefore(firstDataDate)) {
        document.getElementById('btnback').className = "hidden";
    }

    document.getElementById('btnnext').className = "";
    loadPowerGraph('/' + selectedDate.getFullYear() + "/data_" + selectedDate.toISOString().substr(0, 10) + ".csv");
    if (moment(selectedDate).isSameOrAfter(firstGasDate)) {
        loadGasGraph('/' + selectedDate.getFullYear() + "/gasuse_" + selectedDate.toISOString().substr(0, 10) + ".csv");
    }

    showSelectedDate();
});

var btnnext = document.getElementById('btnnext');
btnnext.addEventListener('click', function() {
    document.getElementById('btnback').className = "";
    selectedDate.setDate(selectedDate.getDate()+1);
    let dy = new Date();
    if (moment(selectedDate).isAfter(dy)) {
        document.getElementById('btnnext').className = "hidden";
        loadPowerGraph("data.csv");
        loadGasGraph("gasuse.csv");
        showSelectedDate(true);
    } else {
        loadPowerGraph('/' + selectedDate.getFullYear() + "/data_" + selectedDate.toISOString().substr(0, 10) + ".csv");
        loadGasGraph('/' + selectedDate.getFullYear() + "/gasuse_" + selectedDate.toISOString().substr(0, 10) + ".csv");
        showSelectedDate(false);
    }
});

btnbackMonth.addEventListener('click', function() {
    selectedMonth = moment(selectedMonth).subtract(1, 'months').toDate();
    document.getElementById('btnnextMonth').className = "";
    if (moment(selectedMonth).isBefore(firstDataMonth)) {
        document.getElementById('btnbackMonth').className = "hidden";
    }

    showSelectedMonth();
    loadGasMonthGraph('/' + selectedMonth.getFullYear() + "/gasuse_" + selectedMonth.toISOString().substr(0, 7) + ".csv");
});

btnnextMonth.addEventListener('click', function() {
    selectedMonth = moment(selectedMonth).add(1, 'months').toDate();
    document.getElementById('btnbackMonth').className = "";
    var d = moment(new Date()).subtract(1, 'months').toDate();
    if (moment(selectedMonth).isAfter(d)) {
        document.getElementById('btnnextMonth').className = "hidden";
    }

    showSelectedMonth();
    loadGasMonthGraph('/' + selectedMonth.getFullYear() + "/gasuse_" + selectedMonth.toISOString().substr(0, 7) + ".csv");
});

showSelectedDate(true);
showSelectedMonth();

var spanGasRate = document.getElementById('spanGasRate');
if (typeof(Storage) !== "undefined") {
    var gasRate = window.localStorage.getItem("gasRate");
    if (localStorage.getItem("gasRate") !== null) {
        spanGasRate.textContent = String(window.localStorage.getItem("gasRate")).replace('.', ',');
    }
}

spanGasRate.addEventListener('click', function() {
    var newGasRate = prompt(i18next.t('promtNewGasPrice'), spanGasRate.textContent).replace('.', ',');
    if (typeof(Storage) !== "undefined" && newGasRate !== "undefined") {
        if (newGasRate !== "") {
            spanGasRate.textContent = newGasRate;
            window.localStorage.setItem("gasRate", newGasRate);
        } 
    }
});

var xmlhttp = new XMLHttpRequest();
xmlhttp.open('GET', '/gasuse.csv', true);
xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
xmlhttp.timeout = 10000;
xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        let resp = xmlhttp.responseText.split("\n");
        if (resp.length >= 2) {
            var divCurTemp = document.getElementById('divCurrentTemperature');
            divCurTemp.append(document.createTextNode(i18next.t('chartTitleTempNow')));
            var lastTemperature = '';
            var totalTemperature = 0;
            var totaldaygasuse = 0;
            var lastLineNum = resp.length - 2;
            var numTempsMissing = 0;
            for (var i = 1; i <= lastLineNum; ++i) {
                totaldaygasuse += parseFloat(resp[i].split(",")[1]);
                let curTempDeltaStr = resp[i].split(",")[2];
                if (curTempDeltaStr.length <= 1) {
                    numTempsMissing++;
                    continue;
                }

                totalTemperature += parseFloat(curTempDeltaStr);
                lastTemperature = curTempDeltaStr;
            }

            var curTempH3 = document.createElement('h3');
            curTempH3.className = 'temperatureH3';
            curTempH3.textContent = lastTemperature+' ℃ ';
            divCurTemp.append(curTempH3);

            let avgTemperatureToday = totalTemperature / (lastLineNum - numTempsMissing);
            let avgTemperatureTodayParts = String(avgTemperatureToday).split(".");
            let roundedAvgTemperatureToday = avgTemperatureTodayParts[0] + ',' + avgTemperatureTodayParts[1][0];
            var avgTempTodayH3 = document.createElement('h3');
            avgTempTodayH3.className = 'avgTempTodayH3';
            avgTempTodayH3.textContent = i18next.t('chartTitleAvgTemp') + roundedAvgTemperatureToday + ' ℃';
            divCurTemp.append(avgTempTodayH3);

            let totaldaygasusestrparts = String(totaldaygasuse).split(".");
            let roundeddaygasuse = totaldaygasusestrparts[0] + ',' + totaldaygasusestrparts[1][0];
            var curGasuseTodayH3 = document.createElement('h3');
            curGasuseTodayH3.className = 'gasuseTodayH3';
            curGasuseTodayH3.textContent = i18next.t('chartTitleGasTodayTillNow') + roundeddaygasuse + ' kuub.';
            divCurTemp.append(curGasuseTodayH3);
        }
    }
}

xmlhttp.send();

window.addEventListener('offline', function(e) {
    let nodeIssueText = document.createTextNode(i18next.t('statusOflline'));
    document.getElementById('issues').appendChild(nodeIssueText);
    document.getElementById('btndownload').setAttribute('disabled', 'disabled');
}, false);

window.addEventListener('online', function(e) {
    document.getElementById('issues').removeChild(document.getElementById('issues').childNodes[0]);
    if (document.getElementById('btndownload').hasAttribute('disabled')) {
        document.getElementById('btndownload').removeAttribute('disabled');
    }
}, false);
