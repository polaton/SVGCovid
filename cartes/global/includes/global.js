//Déclaration des variables
var configDict = {}; //Tableau de configuration
var dataDict = {}; //Tableau des données

var firstDay = ""; //Premier jour des données
var daysPast; //Nombres de jours depuis le début des données

var selectedColoration = false;
var nbCaissons; //Nombre de caissons pour la légende
var dataMax = 2; //Maximum de la légende
var dataMin = 0; //Minimum de la légende
var colors = {}; //Tableau des couleurs utilisés par la légende

var tim; //Fonction d'intervalle pour l'animations

var selectedRegion = ""; //Pays selectionné
var lockedRegion = ""; //Pays vérouillé

var correspondanceZone = {};
var availableZones = [];

var dataStats = false;
var daysLabelStats = [];

$(function() {
    const queryParams  = new URLSearchParams(window.location.search);
    const mapParam = queryParams .get('map');
    if (mapParam) {
        loadMap(mapParam);
    }else{
        loadMap("monde");
    }
    
});

//Evenement clique bouton retour au début
$("#first").click(function(e) {
    $("#dateRange").val(1); //On amène le slider de dates à la première date
    //On fait la mise à jour de la carte
    var selectedDate = $("#dateRange").val();
    changeSliderDateLabel(returnDateFormatted(selectedDate));
    majFixed();
    majCouleurs(selectedDate);
});

//Evenement clique bouton -1 "pas"
$("#downDate").click(function(e) {
    $("#dateRange").val($("#dateRange").val() - $("#pas").val()); //On fait baisser la date d'un pas
    //On fait la mise à jour de la carte
    var selectedDate = $("#dateRange").val();
    changeSliderDateLabel(returnDateFormatted(selectedDate));
    majFixed();
    majCouleurs(selectedDate);
});

//Evenement clique pause
$("#pause").click(function(e) {
    //On désactive tous les composants utilisateurs
    $("#first").prop("disabled", false);
    $("#downDate").prop("disabled", false);
    $("#pause").prop("disabled", true);
    $("#play").prop("disabled", false);
    $("#upDate").prop("disabled", false);
    $("#last").prop("disabled", false);
    $("#pas").prop("disabled", false);
    $("#vitesse").prop("disabled", false);
    clearInterval(tim);
});

//Evenement clique lecture
$("#play").click(function(e) {
    //On réactive tous les composants utilisateurs
    $("#first").prop("disabled", true);
    $("#downDate").prop("disabled", true);
    $("#pause").prop("disabled", false);
    $("#play").prop("disabled", true);
    $("#upDate").prop("disabled", true);
    $("#last").prop("disabled", true);
    $("#pas").prop("disabled", true);
    $("#vitesse").prop("disabled", true);

    //On définit la fonction qui sera répétée pour l'animation
    tim = setInterval(function(e) {
        $("#dateRange").val(parseInt($("#dateRange").val()) + parseInt($("#pas").val()));
        var selectedDate = $("#dateRange").val();
        changeSliderDateLabel(returnDateFormatted(selectedDate));
        majFixed();
        majCouleurs(selectedDate);
        if (selectedDate == daysPast){
            $("#first").prop("disabled", false);
            $("#downDate").prop("disabled", false);
            $("#pause").prop("disabled", true);
            $("#play").prop("disabled", false);
            $("#upDate").prop("disabled", false);
            $("#last").prop("disabled", false);
            $("#pas").prop("disabled", false);
            $("#vitesse").prop("disabled", false);
            clearInterval(tim);
        }
    }, $("#vitesse").val()); //Ici on indique l'intervalle à laquelle la fonction doit se répéter
});

//Evenement clique +1 "pas"
$("#upDate").click(function(e) {
    $("#dateRange").val(parseInt($("#dateRange").val()) + parseInt($("#pas").val())); //On incrémente la date d'un pas
    //On fait la mise à jour de la carte
    var selectedDate = $("#dateRange").val();
    changeSliderDateLabel(returnDateFormatted(selectedDate));
    majFixed();
    majCouleurs(selectedDate);
});

//Evenement clique dernier
$("#last").click(function(e) {
    $("#dateRange").val(daysPast);
    //On fait la mise à jour de la carte
    var selectedDate = $("#dateRange").val();
    changeSliderDateLabel(returnDateFormatted(selectedDate));
    majFixed();
    majCouleurs(selectedDate);
});

//Evenement changement coloration
$("#coloration").change(function(e) {
    //On fait la mise à jour de la carte
    selectColoration();
    var selectedDate = $("#dateRange").val();
    initColors(false);
    majFixed();
    majCouleurs(selectedDate);
});

//Evenement changement max de la légende
$("#customMax").change(function(e) {
    //On fait la mise à jour de la carte
    var selectedDate = $("#dateRange").val();
    initColors(true);
    majFixed();
    majCouleurs(selectedDate);
});

//Evenement changement de date via le slider
$("#slider").change(function(e) {
    //On fait la mise à jour de la carte
    var selectedDate = $("#dateRange").val();
    changeSliderDateLabel(returnDateFormatted(selectedDate));
    majFixed();
    majCouleurs(selectedDate);
});

// -------INIT & LOAD-------
function loadMap(map) {
    $.get("config/"+map +".json", function(data) {
        configDict = data;
        dataDict = {};
        correspondanceZone = {};
        colors = {};
        selectedRegion = "";
        lockedRegion = "";
        availableZones = [];
        firstDay = configDict.Début;
        $("#coloration").empty();

        initMap(map);
        var queryParams = new URLSearchParams(window.location.search); 
        queryParams.set("map", map);
        history.replaceState(null, null, "?"+queryParams.toString());
    }).fail(function() {
        alert("La carte demandée n'a pas de configuration"); // or whatever
        loadMap("monde");
    }); 
}

function initMap(mapName){
    $("body").addClass("loading");

    $("#cadre-carte").load('cartes/'+mapName+'.svg', function(response,status) {
        if (status == "error"){
            alert("Le pays demandé n'a pas de carte");
            return;
        }

        $(".zone-path").each(function(){
            if ($(this).attr("id")){
                var tmpId = $(this).attr("id").split("-")[0];
                if (!availableZones.includes(tmpId)){
                    availableZones.push(tmpId);
                }
            }
        });

        var loaded = 0;
        loadData(loaded);
    });
}

function initSettings(){
    selectColoration();
    initColors(false);

    initSvg(); //On fait les quelques modifications désirées sur le SVG
    changeSliderDateLabel(returnDateFormatted(daysPast)); //On met à jour le label du slider de date
    majFixed(); //On met à jour les données
    majCouleurs($("#dateRange").val()); //On met à jour les colorations des pays
    loadCorrespondances();
    dataStats = false;
    initStatsLabels();
    $("body").removeClass("loading");
}

// TODO Config nombre de caissons
function initColors(custom) {
    nbCaissons =  $(".legBox").length;
    //changement du texte de titre
    $("#txt-titre").text(selectedColoration.Titre);

    //modification du max de la légende
    if (custom) {
        dataMax = $("#customMax").val();
    } else {
        dataMax = selectedColoration.Max;
    }

    var iLegText = 0;
    //récupération des couleurs de la légende
    $(".legText").each(function(index) {
        iLegText++;
        $(this).text(String(dataMax * iLegText / nbCaissons).substring(0, 4));
    });

    //initialisation du tableau de couleurs
    var iLegBox = 0;
    $(".legBox").each(function(index) {
        iLegBox++;
        colors[iLegBox] = $(this).attr('fill');
    });

    //modification des textes de titre de la légende, du max de la légende et du champ de configuration
    $("#legTitle").text($("#coloration option:selected").text());
    $("#legMax").text(String(dataMax));
    $("#customMax").val(dataMax);
}

function initSvg() {
    //On ajoute de nouvelles lignes aux tooltips de tous les pays
    for (let i = 0; i < configDict.Tooltip.Champs.length; i++) {
        const element = configDict.Tooltip.Champs[i];
        var txtElem = document.createElementNS("http://www.w3.org/2000/svg", "text");
        txtElem.setAttributeNS(null, "x", $("#TT-FIXED").find("text:nth-child(1)").prop("x").animVal[0].valueAsString);
        txtElem.setAttributeNS(null, "y", parseFloat($("#TT-FIXED").find("text:nth-child(1)").prop("y").animVal[0].valueAsString) + (i==0?configDict.Tooltip.HauteurTitre:(configDict.Tooltip.HauteurTitre + (configDict.Tooltip.Hauteur * (i)))) );
        txtElem.setAttributeNS(null, "style", "font-size:"+configDict.Tooltip.Hauteur+"px; font-family:Helvetica");
        txtElem.setAttributeNS(null, "text", "");
        if (element.Data) {
            txtElem.setAttributeNS(null, "id", element.Data+"-fixed");    
        } else if (element.Serie){
            txtElem.setAttributeNS(null, "id", element.Serie+"-fixed");
        }
        
        document.getElementById("TT-FIXED").appendChild(txtElem);
    }
}

function initStatsLabels() {
    for (let index = 0; index <= daysPast; index++) {
        daysLabelStats.push(returnDateFormatted(index));
    }
};

function loadData(loaded){
    if (loaded == configDict.Series.length) {
        initSettings();
    } else {
        var tmpSerie = configDict.Series[loaded];
        $.get("data/"+configDict.Nom.toLowerCase()+"/"+ tmpSerie.Fichier, function(tmpData) { //On charge RStandard
            //transformation en tableau, 
            tmpData = $.csv.toArrays(tmpData); //transformation en tableau
            configDict.Series[loaded]["Taille"] = tmpData[0].length - 2;
            for (let index = 0; index < tmpSerie.Shift; index++) {
                tmpData.shift();
            }
            dataDict[tmpSerie.Key] = {};
            tmpData.forEach(element => dataDict[tmpSerie.Key][element.shift()] = element.map(function(v) {
                return parseFloat(v, 10);
            })); //ajout au tableau de données
            $("#coloration").append("<option value='"+tmpSerie.Key+"'>"+tmpSerie.Nom+"</option>");
            loaded++;
            loadData(loaded);
        });
    }
}

function loadCorrespondances(){
    $.get("data/"+configDict.Nom.toLowerCase()+"/"+ configDict.Correspondance.Fichier, function(data) {
        data = $.csv.toArrays(data,{'separator':';'});
        data.shift();
        data.forEach(element => {
            correspondanceZone[element[configDict.Correspondance.Key]] = {};
            for (let i = 0; i < configDict.Correspondance.Données.length; i++) {
                const tmpField = configDict.Correspondance.Données[i];
                correspondanceZone[element[configDict.Correspondance.Key]][tmpField["Key"]] = element[tmpField["Index"]];
            }
        });
    });
};


// -------INTERACTIONS-------
function selectColoration(){
    var coloration = $("#coloration").val();
    var init = false;
    var maxRange = false;

    if (!selectedColoration){
        init = true;
    } else if (selectedColoration.Taille == $("#dateRange").val()){
        maxRange = true;
    }
    

    for (let index = 0; index < configDict.Series.length; index++) {
        const element = configDict.Series[index];
        
        if (element.Key == coloration) {
            selectedColoration = element;
        }
    }

    if (selectedColoration) {
        daysPast = selectedColoration.Taille;
        $("#dateRange").attr("max", daysPast);

        if (init) $("#dateRange").val(daysPast);
        if (maxRange) $("#dateRange").val(daysPast);

        changeSliderDateLabel(returnDateFormatted($("#dateRange").val()));
    } else {
        alert("Une erreur est survenue.");
        exit();
    }

}

function changeSliderDateLabel(val) {
    $("#selectedDate").text(val);
    $("#textDate").text(val);
}

// -------MAP-------
function majCouleurs(offset) {
    var offset = parseInt(offset);
    for (let index = 0; index < availableZones.length; index++) {
        const element = availableZones[index];

        if (element in dataDict[selectedColoration.Key]) {
            //on récupère la valeur du jour pour le pays
            var valeurDuJour = dataDict[selectedColoration.Key][element][offset];
        } else {
            //on récupère la valeur du jour pour le pays
            var valeurDuJour = "NA";
        }
        //On effectue ensuite les traitements en fonction de valeurDuJour
        if (valeurDuJour != "NA") {
            if (valeurDuJour >= 0) {
                (valeurDuJour > dataMax ? valeurDuJour = dataMax - (dataMax / (nbCaissons * 2)) : valeurDuJour); //Si la valeur du jour est supérieure au max de la légende, on ramène la valeur du jour pour qu'elle corresponde à notre caisson le plus élevé
                var couleurDuJour = processColor(valeurDuJour);
                var chaineCouleur = couleurDuJour;
                //On remplit le pays avec la couleur
                $('path[id^=' + element + '-].zone-path').attr('fill', chaineCouleur);
            } else { //Si la valeur == 0 
                var chaineCouleur = 'rgb(211,211,211)';
                //On colore le pays en gris
                $('path[id^=' + element + '-].zone-path').attr('fill', chaineCouleur);
            }
        } else { //Si valeurDuJour == "NA"
            var chaineCouleur = 'rgb(211,211,211)';
            //On colore le pays en gris
            $('path[id^=' + element + '-].zone-path').attr('fill', chaineCouleur);
        }
    };
};

// Todo: série à afficher dans le tooltip mais pas dans les stats
function majFixed() {
    var offset = $("#dateRange").val();
    if (lockedRegion != "") {
        zone = lockedRegion;
    } else if (selectedRegion != "") {
        zone = selectedRegion;
    } else {
        zone = "";
    }

    if (zone == "") {
        $("#Region-fixed").text("");
        for (let index = 0; index < configDict.Tooltip.Champs.length; index++) {
            const element = configDict.Tooltip.Champs[index];
            if (element.Serie) {
                $("#"+element.Serie+"-fixed").text("");
            } else if (element.Data) {
                $("#"+element.Data+"-fixed").text("");
            } 
            
        }
    } else {
        $("#Region-fixed").text(correspondanceZone[zone]["Nom"]);
        for (let index = 0; index < configDict.Tooltip.Champs.length; index++) {
            const element = configDict.Tooltip.Champs[index];
            if (element.Serie) {
                if (zone in dataDict[element.Serie]) {
                    $("#"+element.Serie+"-fixed").text(element.Texte + ": " + dataDict[element.Serie][zone][offset]);
                } else {
                    $("#"+element.Serie+"-fixed").text(element.Texte + ": Pas de données");
                }
            } else if (element.Data){
                if (zone in correspondanceZone && correspondanceZone[zone][element.Data]) {
                    $("#"+element.Data+"-fixed").text(element.Texte.replace("${value}",correspondanceZone[zone][element.Data]));
                } else {
                    $("#"+element.Data+"-fixed").text(element.Data + ": Pas de données");
                }
            }    
        }
    }
};

// TODO Inner stroker locked zone: https://codepen.io/collection/nJbGEB/?cursor=eyJjb2xsZWN0aW9uX2lkIjoibkpiR0VCIiwiY29sbGVjdGlvbl90b2tlbiI6bnVsbCwibGltaXQiOjQsIm1heF9pdGVtcyI6OCwib2Zmc2V0IjowLCJwYWdlIjoxLCJzb3J0X2J5IjoicG9zaXRpb24iLCJzb3J0X29yZGVyIjoiQXNjIn0=
function lockRegion(regionCode) {
    //Si on a deja un pays verouillé, on repasse ses frontières en noir
    if (lockedRegion != "") {
        $('path[id^=' + lockedRegion + '-]').removeClass("locked-region");
    }

    //Si on a un nouveau code pays a vérouiller et qu'il est différent de l'ancien pays vérouillé, on met à jour le pays vérouillé et on change la couleur de ses frontières
    if (regionCode != "" && regionCode != lockedRegion) {
        lockedRegion = regionCode;
        $('path[id^=' + regionCode + '-]').addClass("locked-region");
    } else {
        lockedRegion = "";
    }
    majFixed();
};

function showData(zone) {
    selectedRegion = zone;
    majFixed();
};

function hideData() {
    selectedRegion = "";
    majFixed();
};

// -------UTILS-------
function processColor(valeurDuJour) {
    var couleurJour = parseInt((valeurDuJour / dataMax) * nbCaissons) + 1;
    return (colors[couleurJour]);
}

function extractDaysLabel(arrayPosition) {
    var output = [];
    for (const position of arrayPosition) {
        output.push(daysLabelStats[position])
    }
    return output;
};

function returnDateFormatted(offset) {
    var offset = parseInt(offset);
    var today = new Date(firstDay);
    today.setDate(today.getDate() + offset);
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    today = dd + '/' + mm + '/' + yyyy;
    return today;
}

function returnDateFormattedEnglish(offset){
    var offset = parseInt(offset);
    var today = new Date(firstDay);
    today.setDate(today.getDate() + offset);
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    return today;
}

function cleanRSerie(serie){
    var tmpSerie = serie.slice();
    for (let index = 0; index < tmpSerie.length; index++) {
        const element = tmpSerie[index];
        if (element == -1){
            tmpSerie[index] = 0;
        }
    }
    return tmpSerie;
}

function range(start, end, step = 1) {
    var output = [];
    if (typeof end === 'undefined') {
        end = start;
        start = 0;
    }
    for (let i = start; i < end; i += step) {
        output.push(i);
    }
    return output;
};

function generateSelectZones(id,none){
    var tmpSelectZones = '<select class="select-styled" id="'+id+'">';
    if (none) {
        tmpSelectZones += '<option value="none"></option>'
    }
    availableZones.forEach(element => {
        if (element in correspondanceZone) {
            tmpSelectZones += '<option value="'+element+'">'+correspondanceZone[element]["Nom"]+'</option>';
        }
    });
    return tmpSelectZones;
}
// TODO
function orderSelectCountry(id){
    var options = $('select#'+id+' option');
    var arr = options.map(function(_, o) { return { t: $(o).text(), v: o.value }; }).get();
    arr.sort(function(o1, o2) { return o1.t > o2.t ? 1 : o1.t < o2.t ? -1 : 0; });
    options.each(function(i, o) {
        o.value = arr[i].v;
        $(o).text(arr[i].t);
    });
}

// -------STATS-------

function displayStats() {
    $("body").addClass("loading");
    // if (!dataStats || !dataStatsPhase || !dataStatsPhase3D) {
    if (!dataStats) {
        initStats();
    }
    // updateStats();
    $("body").removeClass("loading");
};

function initStats(){
    $(".stats-row").remove();
    dataStats = [];
    for (let i = 0; i < configDict.Graphiques.length; i++) {
        const element = configDict.Graphiques[i];
        initStatsControlRow(i,element);
        initStatsGraph(i,element);
        updateStats(i);
    }
}

function initStatsControlRow(i,element){
    var tmpRow = '<div id="stats-row-1-'+i.toString()+'" class="row stats-row">';
    tmpRow += '<div class="col-3 zone-column"><h6>Zone principale</h6>';
    tmpRow += '<div id="select-zone-main-'+i.toString()+'" class="select-zone"></div>';
    if (element.compare) {
        tmpRow += '<h6>Zone comparée</h6>';
        tmpRow += '<div id="select-zone-compared-'+i.toString()+'" class="select-zone"></div>';
        tmpRow += '<button onClick="invertZones('+i.toString()+')" class="btn btn-primary btn-sm btn-stats" type="button">Inverser</button>';
        tmpRow += '<button onClick="removeZone('+i.toString()+')" class="btn btn-danger btn-sm btn-stats" type="button">Supprimer</button>';
    }
    tmpRow += '</div>';
    tmpRow += '<div id="param-column-1-'+i.toString()+'" class="col-4 param-column">';
    tmpRow += '</div>';

    tmpRow += '<div id="param-column-2-'+i.toString()+'" class="col-4 param-column">';
    tmpRow += '</div>';


    $("#stats-modal-content").append(tmpRow);

    // Selects colonne
    $("#select-zone-main-"+i.toString()).append(generateSelectZones("stats-zone-"+i.toString(),false,i));
    orderSelectCountry("stats-zone-"+i.toString());
    $("#select-zone-main-"+i.toString()).prepend("<div class='box red'></div>");

    $("#select-zone-compared-"+i.toString()).append(generateSelectZones("stats-compared-"+i.toString(),true,i));
    orderSelectCountry("stats-compared-"+i.toString());
    $("#select-zone-compared-"+i.toString()).prepend("<div class='box blue'></div>");

    $("#stats-zone-"+i.toString()).change(function(e) {
        updateStats(i);
    });

    $("#stats-compared-"+i.toString()).change(function(e) {
        updateStats(i);
    });

    if (lockedRegion != "") {
        $('#stats-zone-'+i.toString()+' option[value="'+lockedRegion+'"]').prop('selected', true);
    }

    // Boutons colonne 1
    $('#param-column-1-'+i.toString()).append('<h6>'+element.columnTitles[0]+'</h6>')
    switch (element.type) {
        case "dynamic":
            for (let ii = 0; ii < element.traces.length; ii++) {
                const trace = element.traces[ii];
                if (trace.type=="scatter") {
                    $('#param-column-1-'+i.toString()).append('<input class="stats-control-'+i.toString()+' stats-box cbx-stats-1-'+i.toString()+'" type="checkbox" id="cbx-stats-1-'+i.toString()+'-'+trace.data+'" alt="'+trace.name+'" process="'+(trace.process?trace.process:'')+'" value="'+trace.data+'" name="cbx-stats-1-'+i.toString()+'-'+trace.data+'" '+(ii==1?"checked":"")+'><label for="cbx-stats-1-'+i.toString()+'-'+trace.data+'">'+trace.name+'</label><br>');
                }
            }
            break;
        case "phase":
            for (let ii = 0; ii < element.series.x.length; ii++) {
                const serie = element.series.x[ii];
                    $('#param-column-1-'+i.toString()).append('<input id="radio-stats-1-'+i.toString()+'-'+serie.data+'" class="stats-control-'+i.toString()+' stats-box" type="radio" value="'+serie.data+'" alt="'+serie.name+'" process="'+(serie.process?serie.process:'')+'" name="radio-stats-1-'+i.toString()+'" '+(ii==0?"checked":"")+'><label for="radio-stats-1-'+i.toString()+'-'+serie.data+'">'+serie.name+'</label><br>');
            }
            break;
        default:
            break;
    }

    // Boutons colonne 2
    $('#param-column-2-'+i.toString()).append('<h6>'+element.columnTitles[1]+'</h6>')
    switch (element.type) {
        case "dynamic":
            for (let ii = 0; ii < element.traces.length; ii++) {
                const trace = element.traces[ii];
                if (trace.type=="bars") {
                    for (let j = 0; j < trace.series.length; j++) {
                        const serie = trace.series[j];
                            $('#param-column-2-'+i.toString()).append('<input id="radio-stats-2-'+i.toString()+'-'+serie.data+'" class="stats-control-'+i.toString()+' stats-box" type="radio" value="'+serie.data+'" alt="'+serie.name+'" name="radio-stats-2-'+i.toString()+'" '+(j==0?"checked":"")+'><label for="radio-stats-2-'+i.toString()+'-'+serie.data+'">'+serie.name+'</label><br>');
                    }
                    $('#param-column-2-'+i.toString()).append('<input id="radio-stats-2-'+i.toString()+'-none" class="stats-control-'+i.toString()+' stats-box" type="radio" value="none" name="radio-stats-2-'+i.toString()+'"><label for="radio-stats-2-'+i.toString()+'-none">Désactiver</label><br>');
                    break;
                }
            }
            break;
        case "phase":
            for (let ii = 0; ii < element.series.y.length; ii++) {
                const serie = element.series.y[ii];
                $('#param-column-2-'+i.toString()).append('<input id="radio-stats-2-'+i.toString()+'-'+serie.data+'" class="stats-control-'+i.toString()+' stats-box" type="radio" value="'+serie.data+'" alt="'+serie.name+'" process="'+(serie.process?serie.process:'')+'" name="radio-stats-2-'+i.toString()+'" '+(ii==0?"checked":"")+'><label for="radio-stats-2-'+i.toString()+'-'+serie.data+'">'+serie.name+'</label><br>');
            }
            break;
        default:
            break;
    }

    $(".stats-control-"+i.toString()).change(function(e) {
        updateStats(i);
    });
}

function initStatsGraph(i,element){
    var tmpRow = '<div id="stats-row-2-'+i.toString()+'" class="row stats-row">';
    tmpRow += '<h3 class="title-graph" id="title-graph-'+i.toString()+'"></h3>';
    tmpRow += '<div id="plot-div-'+i.toString()+'"></div>';
    tmpRow += '</div></div>';
    $("#stats-modal-content").append(tmpRow);
    
    switch (element.type) {
        case "dynamic":
            var layout = {
                barmode: 'group',
                width: $("#modal-stats").width(),
                height: 450,
                legend: {
                    x: 0,
                    y: 1.2,
                    xanchor:'left',
                    yanchor:'top'
                },
                pad: {
                    t: 100
                }
            }

            if (element.colorway) layout.colorway = element.colorway;

            if (element.axis) {
                if (element.axis.x) {
                    layout.xaxis = {
                        "tickmode": "array",
                        "tickvals": range(0,daysPast,35),
                        "ticktext": extractDaysLabel(range(0,daysPast,35))
                    }
                        
                    if (element.axis.x.rangemode) {
                        layout.xaxis.rangemode = element.axis.x.rangemode;
                    }

                    if (element.axis.x.autorange) {
                        layout.xaxis.autorange = element.axis.x.autorange;
                    }

                    if (element.axis.x.color) {
                        layout.xaxis.titlefont = {
                            color: element.axis.x.color
                        };
                        layout.xaxis.tickfont = {
                            color: element.axis.x.color
                        };                        
                    }
                }

                if (element.axis.y) {
                    layout.yaxis = {
                    }
                        
                    if (element.axis.y.rangemode) {
                        layout.yaxis.rangemode = element.axis.y.rangemode;
                    }

                    if (element.axis.y.autorange) {
                        layout.yaxis.autorange = element.axis.y.autorange;
                    }

                    if (element.axis.y.color) {
                        layout.yaxis.titlefont = {
                            color: element.axis.y.color
                        };
                        layout.yaxis.tickfont = {
                            color: element.axis.y.color
                        };                        
                    }
                }

                if (element.axis.y2) {
                    layout.yaxis2 = {
                        overlaying: 'y',
                        side: 'right'
                    }
                    if (element.axis.y2.title) {
                        layout.yaxis2.title = element.axis.y2.title;
                    }
                        
                    if (element.axis.y2.rangemode) {
                        layout.yaxis2.rangemode = element.axis.y2.rangemode;
                    }

                    if (element.axis.y2.autorange) {
                        layout.yaxis2.autorange = element.axis.y2.autorange;
                    }

                    if (element.axis.y2.color) {
                        layout.yaxis2.titlefont = {
                            color: element.axis.y2.color
                        };
                        layout.yaxis2.tickfont = {
                            color: element.axis.y2.color
                        };                        
                    }
                }
            }

            var tmpTraces = [];
            for (let ii = 0; ii < element.traces.length; ii++) {
                const trace = element.traces[ii];
                switch (trace.type) {
                    case "bars":
                        tmpTraces.push({
                            "y": [],
                            "x": daysLabelStats,
                            "type": 'bar',
                            "yaxis": 'y2',
                            "opacity": 0.5
                        });
                        if (element.compare) {
                            tmpTraces.push({
                                "y": [],
                                "x": daysLabelStats,
                                "type": 'bar',
                                "yaxis": 'y2',
                                "opacity": 0.5
                            });
                        }
                        break;
                    case "scatter":
                        tmpTraces.push({
                            "y": [],
                            "x": daysLabelStats,
                            "type": 'scatter'
                        });
                        if (element.compare) {
                            tmpTraces.push({
                                "y": [],
                                "x": daysLabelStats,
                                "type": 'scatter'
                            });
                        }
                        break;
                    default:
                        break;
                }
            }

            Plotly.newPlot('plot-div-'+i.toString()+'', tmpTraces, layout);
            dataStats.push(tmpTraces);
            break;
        case "phase":
            var layout = {
                width: $("#modal-stats").width(),
                height: 450,
                legend: {
                    x: 0,
                    y: 1.2,
                    xanchor:'left',
                    yanchor:'top'
                }
            }

            if (element.colorway) layout.colorway = element.colorway;

            if (element.axis) {
                if (element.axis.x) {
                    layout.xaxis = {
                        "tickmode": "array",
                        "tickvals": range(0,daysPast,35),
                        "ticktext": extractDaysLabel(range(0,daysPast,35))
                    }
                        
                    if (element.axis.x.rangemode) {
                        layout.xaxis.rangemode = element.axis.x.rangemode;
                    }

                    if (element.axis.x.autorange) {
                        layout.xaxis.autorange = element.axis.x.autorange;
                    }

                    if (element.axis.x.color) {
                        layout.xaxis.titlefont = {
                            color: element.axis.x.color
                        };
                        layout.xaxis.tickfont = {
                            color: element.axis.x.color
                        };                        
                    }
                }

                if (element.axis.y) {
                    layout.yaxis = {
                    }
                        
                    if (element.axis.y.rangemode) {
                        layout.yaxis.rangemode = element.axis.y.rangemode;
                    }

                    if (element.axis.y.autorange) {
                        layout.yaxis.autorange = element.axis.y.autorange;
                    }

                    if (element.axis.y.color) {
                        layout.yaxis.titlefont = {
                            color: element.axis.y.color
                        };
                        layout.yaxis.tickfont = {
                            color: element.axis.y.color
                        };                        
                    }
                }
            }

            if (element.shapes) {
                layout.shapes = element.shapes;
            }

            var tmpTraces = [];

            if (element.highlightRecent) {
                tmpTraces.push({
                    y: [],
                    x: [],
                    text: daysLabelStats.slice(0,-9),
                    mode: "markers+lines",
                    type: "scatter",
                    marker: {
                        size: 4
                    },
                });
                if (element.compare) {
                    tmpTraces.push({
                        y: [],
                        x: [],
                        text: daysLabelStats.slice(0,-9),
                        mode: "markers+lines",
                        type: "scatter",
                        marker: {
                            size: 4
                        },
                    });
                    tmpTraces.push({
                        y: [],
                        x: [],
                        text: daysLabelStats.slice(-10),
                        mode: "markers+lines",
                        type: "scatter",
                        marker: {
                            size: 4
                        },
                    });
                    tmpTraces.push({
                        y: [],
                        x: [],
                        text: daysLabelStats.slice(-10),
                        mode: "markers+lines",
                        type: "scatter",
                        marker: {
                            size: 4
                        },
                    });
                } else {
                    tmpTraces.push({
                        y: [],
                        x: [],
                        text: daysLabelStats.slice(-10),
                        mode: "markers+lines",
                        type: "scatter",
                        marker: {
                            size: 4
                        },
                    });
                }
            } else {
                tmpTraces.push({
                    y: [],
                    x: [],
                    text: daysLabelStats,
                    mode: "markers+lines",
                    type: "scatter",
                    marker: {
                        size: 4
                    },
                });
                if (element.compare) tmpTraces.push({
                    y: [],
                    x: [],
                    text: daysLabelStats,
                    mode: "markers+lines",
                    type: "scatter",
                    marker: {
                        size: 4
                    },
                });
            }

            Plotly.newPlot('plot-div-'+i.toString(), tmpTraces, layout);
            dataStats.push(tmpTraces);
            break;    
        default:
            break;
    }
}

function updateStats(i) {
    var tmpGraphique = configDict.Graphiques[i];
    var zoneMain = $("#select-zone-main-"+i.toString()+ " option:selected").val();
    var zoneMainLabel = $("#select-zone-main-"+i.toString()+" option:selected").text();
    var zoneCompared = $("#select-zone-compared-"+i.toString()+ " option:selected").val();
    var zoneComparedLabel = $("#select-zone-compared-"+i.toString()+" option:selected").text();

    var tmpTitle = tmpGraphique.title + "<br>";
    var tmpSeriesTitle = [];

    switch (configDict.Graphiques[i].type) {
        case "dynamic":
            var tmpScatterSeries=[];
            $('.cbx-stats-1-'+i.toString()+':checked').each(function() {
                tmpScatterSeries.push({"key":this.value,"name":this.alt,"process":$(this).attr("process")});
            });
            var tmpBar = $('.stats-control-'+i.toString()+'[name="radio-stats-2-'+i.toString()+'"]:checked').val();

            for (let j = 0; j < dataStats[i].length; j++) {
                dataStats[i][j]["y"] = [];
                dataStats[i][j]["name"] = "";
            }

            if (tmpBar != "none") {
                var alt = $('.stats-control-'+i.toString()+'[name="radio-stats-2-'+i.toString()+'"]:checked').prop("alt");
                tmpSeriesTitle.push(alt);
                dataStats[i][0]["y"] =  dataDict[tmpBar][zoneMain];
                dataStats[i][0]["name"] = alt + " " + zoneMainLabel;
                if (tmpGraphique.compare && zoneCompared != "none") {
                    dataStats[i][1]["y"] =  dataDict[tmpBar][zoneCompared];
                    dataStats[i][1]["name"] = alt + " " + zoneComparedLabel;
                }
            }

            startingIndex = (tmpGraphique.compare?2:1)
            for (let j = 0; j < tmpScatterSeries.length; j++) {
                const element = tmpScatterSeries[j];
                
                tmpSeriesTitle.push(element.name);

                switch (element.process) {
                    case "CleanRSerie":
                        dataStats[i][startingIndex]["y"] =  cleanRSerie(dataDict[element.key][zoneMain]);
                        break;
                    default:
                        dataStats[i][startingIndex]["y"] =  dataDict[element.key][zoneMain];
                        break;
                }
                dataStats[i][startingIndex]["name"] = element.name + " " + zoneMainLabel;
                startingIndex++;
                if (tmpGraphique.compare) {
                    if (zoneCompared != "none") {
                        switch (element.process) {
                            case "CleanRSerie":
                                dataStats[i][startingIndex]["y"] =  cleanRSerie(dataDict[element.key][zoneCompared]);
                                break;
                            default:
                                dataStats[i][startingIndex]["y"] =  dataDict[element.key][zoneCompared];
                                break;
                        }
                        dataStats[i][startingIndex]["name"] = element.name + " " + zoneComparedLabel;
                    }
                    startingIndex++;
                }
            }

            tmpTitle+= tmpSeriesTitle.join(" | ");
            break;
        case "phase":
            var xOptions = {
                "key":$('.stats-control-'+i.toString()+'[name="radio-stats-1-'+i.toString()+'"]:checked').val(),
                "process": $('.stats-control-'+i.toString()+'[name="radio-stats-1-'+i.toString()+'"]:checked').attr("process"),
                "name": $('.stats-control-'+i.toString()+'[name="radio-stats-1-'+i.toString()+'"]:checked').prop("alt")
            };
            var yOptions = {
                "key":$('.stats-control-'+i.toString()+'[name="radio-stats-2-'+i.toString()+'"]:checked').val(),
                "process": $('.stats-control-'+i.toString()+'[name="radio-stats-2-'+i.toString()+'"]:checked').attr("process"),
                "name": $('.stats-control-'+i.toString()+'[name="radio-stats-2-'+i.toString()+'"]:checked').prop("alt")
            };
            var tmpHoverTemplate = '<b>%{text}</b><br>';
            tmpHoverTemplate += '<i>'+xOptions.name+'</i>: %{x:.2f}<br>';
            tmpHoverTemplate += '<i>'+yOptions.name+'</i>: %{y:.2f}<br>';
            
            tmpTitle+= xOptions.name + " & " + yOptions.name;

            for (let j = 0; j < dataStats[i].length; j++) {
                dataStats[i][j]["y"] = [];
                dataStats[i][j]["name"] = "";
                dataStats[i][j]["hovertemplate"] = "";
            }

            if (!tmpGraphique.compare && !tmpGraphique.highlightRecent) {
                switch (xOptions.process) {
                    case "CleanRSerie":
                        dataStats[i][0]["x"] = cleanRSerie(dataDict[xOptions.key][zoneMain]);
                        break;
                    default:
                        dataStats[i][0]["x"] = dataDict[xOptions.key][zoneMain];
                        break;
                }
                switch (yOptions.process) {
                    case "CleanRSerie":
                        dataStats[i][0]["y"] = cleanRSerie(dataDict[yOptions.key][zoneMain]);
                        break;
                    default:
                        dataStats[i][0]["y"] = dataDict[yOptions.key][zoneMain];
                        break;
                }
                dataStats[i][0]["name"] = zoneMainLabel;
            } else if (!tmpGraphique.compare && tmpGraphique.highlightRecent){
                switch (xOptions.process) {
                    case "CleanRSerie":
                        dataStats[i][0]["x"] = cleanRSerie(dataDict[xOptions.key][zoneMain].slice(0,-9));
                        dataStats[i][1]["x"] = cleanRSerie(dataDict[xOptions.key][zoneMain].slice(-10));
                        break;
                    default:
                        dataStats[i][0]["x"] = dataDict[xOptions.key][zoneMain].slice(0,-9);
                        dataStats[i][1]["x"] = dataDict[xOptions.key][zoneMain].slice(-10);
                        break;
                }
                switch (yOptions.process) {
                    case "CleanRSerie":
                        dataStats[i][0]["y"] = cleanRSerie(dataDict[yOptions.key][zoneMain].slice(0,-9));
                        dataStats[i][1]["y"] = cleanRSerie(dataDict[yOptions.key][zoneMain].slice(-10));
                        break;
                    default:
                        dataStats[i][0]["y"] = dataDict[yOptions.key][zoneMain].slice(0,-9);
                        dataStats[i][1]["y"] = dataDict[yOptions.key][zoneMain].slice(-10);
                        break;
                }
                dataStats[i][0]["name"] = zoneMainLabel;
                dataStats[i][1]["name"] = zoneMainLabel + ' (récent)';
            } else if (tmpGraphique.compare && !tmpGraphique.highlightRecent) {
                switch (xOptions.process) {
                    case "CleanRSerie":
                        dataStats[i][0]["x"] = cleanRSerie(dataDict[xOptions.key][zoneMain]);
                        if (zoneCompared != "none") dataStats[i][1]["x"] = cleanRSerie(dataDict[xOptions.key][zoneCompared]);
                        break;
                    default:
                        dataStats[i][0]["x"] = dataDict[xOptions.key][zoneMain];
                        if (zoneCompared != "none") dataStats[i][1]["x"] = dataDict[xOptions.key][zoneCompared];
                        break;
                }
                switch (yOptions.process) {
                    case "CleanRSerie":
                        dataStats[i][0]["y"] = cleanRSerie(dataDict[yOptions.key][zoneMain]);
                        if (zoneCompared != "none") dataStats[i][1]["y"] = cleanRSerie(dataDict[yOptions.key][zoneCompared]);
                        break;
                    default:
                        dataStats[i][0]["y"] = dataDict[yOptions.key][zoneMain];
                        if (zoneCompared != "none") dataStats[i][1]["y"] = dataDict[yOptions.key][zoneCompared];
                        break;
                }
                dataStats[i][0]["name"] = zoneMainLabel;
                if (zoneCompared != "none") dataStats[i][1]["name"] = zoneComparedLabel;
            } else if (tmpGraphique.compare && tmpGraphique.highlightRecent) {
                switch (xOptions.process) {
                    case "CleanRSerie":
                        dataStats[i][0]["x"] = cleanRSerie(dataDict[xOptions.key][zoneMain].slice(0,-9));
                        if (zoneCompared != "none") dataStats[i][1]["x"] = cleanRSerie(dataDict[xOptions.key][zoneCompared].slice(0,-9));
                        dataStats[i][2]["x"] = cleanRSerie(dataDict[xOptions.key][zoneMain].slice(-10));
                        if (zoneCompared != "none") dataStats[i][3]["x"] = cleanRSerie(dataDict[xOptions.key][zoneCompared].slice(-10));
                        break;
                    default:
                        dataStats[i][0]["x"] = dataDict[xOptions.key][zoneMain].slice(0,-9);
                        if (zoneCompared != "none") dataStats[i][1]["x"] = dataDict[xOptions.key][zoneCompared].slice(0,-9);
                        dataStats[i][2]["x"] = dataDict[xOptions.key][zoneMain].slice(-10);
                        if (zoneCompared != "none") dataStats[i][3]["x"] = dataDict[xOptions.key][zoneCompared].slice(-10);
                        break;
                }
                switch (yOptions.process) {
                    case "CleanRSerie":
                        dataStats[i][0]["y"] = cleanRSerie(dataDict[yOptions.key][zoneMain].slice(0,-9));
                        if (zoneCompared != "none") dataStats[i][1]["y"] = cleanRSerie(dataDict[yOptions.key][zoneCompared].slice(0,-9));
                        dataStats[i][2]["y"] = cleanRSerie(dataDict[yOptions.key][zoneMain].slice(-10));
                        if (zoneCompared != "none") dataStats[i][3]["y"] = cleanRSerie(dataDict[yOptions.key][zoneCompared].slice(-10));
                        break;
                    default:
                        dataStats[i][0]["y"] = dataDict[yOptions.key][zoneMain].slice(0,-9);
                        if (zoneCompared != "none") dataStats[i][1]["y"] = dataDict[yOptions.key][zoneCompared].slice(0,-9);
                        dataStats[i][2]["y"] = dataDict[yOptions.key][zoneMain].slice(-10);
                        if (zoneCompared != "none") dataStats[i][3]["y"] = dataDict[yOptions.key][zoneCompared].slice(-10);
                        break;
                }
                dataStats[i][0]["name"] = zoneMainLabel;
                if (zoneCompared != "none") dataStats[i][1]["name"] = zoneComparedLabel;
                dataStats[i][2]["name"] = zoneMainLabel + ' (récent)';
                if (zoneCompared != "none") dataStats[i][3]["name"] = zoneComparedLabel + ' (récent)';
            }

            break;
        default:
            break;
    }

    tmpTitle+="<br>"+zoneMainLabel+(zoneCompared!="none"?" vs " + zoneComparedLabel:"")
    $("#title-graph-"+i.toString()).empty().append(tmpTitle);
    Plotly.redraw('plot-div-'+i.toString());
}

function removeZone(i) {
    $('#select-zone-compared-'+i.toString()+' option[value="none"]').prop('selected', true);
    updateStats(i);
};

function invertZones(i) {
    var tmpMain = $('#select-zone-main-'+i.toString()+' option:selected').val();
    var tmpCompared = $('#select-zone-compared-'+i.toString()+' option:selected').val();
    $('#select-zone-main-'+i.toString() +' option[value="'+tmpCompared+'"]').prop('selected', true);
    $('#select-zone-compared-'+i.toString() +' option[value="'+tmpMain+'"]').prop('selected', true);
    updateStats(i);
};