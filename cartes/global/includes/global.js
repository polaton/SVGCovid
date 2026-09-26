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
var zone = "";

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
    initLegende();
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

function initLegende() {
    var configLegende = configDict.Legende;
    var currentY = configLegende.startY;
    // Aberrant values 
    document.getElementById("caissons").appendChild(
        generateRectElement(
            configLegende.startX,
            currentY - configLegende.aberrant.height,
            configLegende.aberrant.width, 
            configLegende.aberrant.height,
            `stroke-width:0;`,
            "legBoxAberrant",
            configLegende.aberrant.color
        )
    );
    document.getElementById("caissons").appendChild(
        generateTextElement(
            configLegende.startX - configLegende.aberrant.textOffsetX,
            currentY - configLegende.aberrant.height/2,
            `font-size:${configLegende.aberrant.text1Size}px; font-family:Helvetica; color: black;`,
            configLegende.aberrant.text1, 
            false,
            "legAberrant"
        )
    );
    document.getElementById("caissons").appendChild(
        generateTextElement(
            configLegende.startX - configLegende.aberrant.textOffsetX,
            currentY - configLegende.aberrant.height/2 + configLegende.aberrant.text1BottomMargin,
            `font-size:${configLegende.aberrant.text2Size}px; font-family:Helvetica; color: black;`,
            configLegende.aberrant.text2,
            false, 
            "legAberrant"
        )
    );
    currentY = currentY - configLegende.aberrant.height;

    // Texte min
    document.getElementById("caissons").appendChild(
        generateTextElement(
            configLegende.startX + configLegende.texts.min.offsetX, 
            currentY - configLegende.texts.min.offsetY,
            `font-size:${configLegende.texts.min.size}px; font-family:Helvetica; color: black;`,
            configLegende.texts.min.text,
            "legTextMin",
            false
        )
    );
    currentY = currentY - configLegende.aberrant.legendOffset;

    // Légende
    for (let i = 1; i <= configLegende.boxes.number; i++) {
        document.getElementById("caissons").appendChild(
            generateRectElement(
                configLegende.startX,
                currentY - configLegende.boxes.height,
                configLegende.boxes.width,
                configLegende.boxes.height,
                `stroke-width:0;`,
                "legBox",
                configLegende.boxes.colors[i-1]
            )
        );
        currentY = currentY - configLegende.boxes.height;
        if (i == configLegende.boxes.number) continue;
        document.getElementById("caissons").appendChild(
            generateTextElement(
                configLegende.startX - configLegende.boxes.textOffsetX, 
                currentY + (configLegende.boxes.textSize /2),
                `font-size:${configLegende.boxes.textSize}px; font-family:Helvetica; color: black;`,
                "",
                false,
                "legText"
            )
        );
        
    }

    // Texte max
    document.getElementById("caissons").appendChild(
        generateTextElement(
            configLegende.startX + configLegende.texts.max.offsetX, 
            currentY - configLegende.texts.max.offsetY,
            `font-size:${configLegende.texts.max.size}px; font-family:Helvetica; color: black;`,
            configLegende.texts.max.text,
            "legTextMax",
            false
        )
    );
    document.getElementById("caissons").appendChild(
        generateTextElement(
            configLegende.startX + configLegende.texts.max.offsetX + configLegende.texts.max.valueOffsetX, 
            currentY - configLegende.texts.max.offsetY,
            `font-size:${configLegende.texts.max.size}px; font-family:Helvetica; color: black;`,
            2,
            "legMax",
            false
        )
    );
    currentY = currentY - configLegende.texts.max.offsetY;
    // Texte titre
    document.getElementById("caissons").appendChild(
        generateTextElement(
            configLegende.startX + configLegende.texts.title.offsetX, 
            currentY - configLegende.texts.title.offsetY,
            `font-size:${configLegende.texts.title.size}px; font-family:Helvetica; color: black;`,
            configLegende.texts.title.text,
            "legTitle",
            false
        )
    );
    // Elevator
    document.getElementById("caissons").appendChild(
        generateRectElement(
            configLegende.startX + configLegende.elevator.offsetX,
            0,
            configLegende.elevator.width,
            0,
            '',
            false,
            configLegende.elevator.lowColor,
            "intervalle-rect-low",
            "hidden",
            0.5,
            configLegende.elevator.strokeColor
        )
    );
    // $("#intervalle-rect-low").hover(toggleElevatorTooltip);

    document.getElementById("caissons").appendChild(
        generateRectElement(
            configLegende.startX + configLegende.elevator.offsetX,
            0,
            configLegende.elevator.width,
            0,
            '',
            false,
            configLegende.elevator.highColor,
            "intervalle-rect-high",
            "hidden",
            0.5,
            configLegende.elevator.strokeColor
        )
    );
    // $("#intervalle-rect-high").hover(toggleElevatorTooltip);

    document.getElementById("caissons").appendChild(
        generateTextElement(
            configLegende.startX + configLegende.elevator.width + configLegende.elevator.textOffsetX, 
            currentY,
            `font-size:${configLegende.elevator.textSize}px; font-family:Helvetica; color: black;`,
            "test",
            "legElevatorText",
            false,
            "visible"
        )
    );
    document.getElementById("caissons").appendChild(
        generateTextElement(
            configLegende.startX + configLegende.elevator.width + configLegende.elevator.textOffsetX, 
            currentY - (configLegende.elevator.textSize),
            `font-size:${configLegende.elevator.textSize}px; font-family:Helvetica; color: black;`,
            "test",
            "legElevatorTitle",
            false,
            "visible"
        )
    );

    var lineElem = document.createElementNS("http://www.w3.org/2000/svg", "line");
    lineElem.setAttributeNS(null, "id", "intervalle-stroke-mid");
    lineElem.setAttributeNS(null, "x1", configLegende.startX + configLegende.elevator.offsetX);
    lineElem.setAttributeNS(null, "x2", configLegende.startX + configLegende.elevator.offsetX + configLegende.elevator.middleWidth);
    lineElem.setAttributeNS(null, "stroke", configLegende.elevator.middleColor);
    lineElem.setAttributeNS(null, "stroke-width", configLegende.elevator.middleStrokeWidth);
    document.getElementById("caissons").appendChild(lineElem);
}

function toggleElevatorTooltip() {
    $("#legElevatorText").attr("visibility") == "hidden" ? $("#legElevatorText").attr("visibility","visible") : $("#legElevatorText").attr("visibility","hidden");
}

function generateTextElement(x,y,style,text,id,cssClass,visibility = "visible"){
    var textElem = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textElem.setAttributeNS(null, "x", x);
    textElem.setAttributeNS(null, "y", y);
    textElem.setAttributeNS(null, "style", style);
    if (cssClass) textElem.setAttributeNS(null, "class", cssClass);
    if (id) textElem.setAttributeNS(null, "id", id);
    textElem.setAttributeNS(null, "visibility", visibility);
    textElem.textContent = text;

    return textElem;
}

function generateRectElement(x,y,width,height,style,cssClass,fill,id = false, visibility = "visible", strokeWidth = false, strokeColor = false){
    var rectElem = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rectElem.setAttributeNS(null, "x", x);
    rectElem.setAttributeNS(null, "y", y);
    rectElem.setAttributeNS(null, "width", width);
    rectElem.setAttributeNS(null, "height", height);
    rectElem.setAttributeNS(null, "style", style);
    if (cssClass) rectElem.setAttributeNS(null, "class", cssClass);
    if (fill) rectElem.setAttributeNS(null, "fill", fill);
    if (id) rectElem.setAttributeNS(null, "id", id);
    if (strokeWidth) rectElem.setAttributeNS(null, "stroke-width", strokeWidth);
    if (strokeColor) rectElem.setAttributeNS(null, "stroke", strokeColor);
    rectElem.setAttributeNS(null, "visibility", visibility);
    return rectElem;
}

function initColors(custom) {
    nbCaissons =  $(".legBox").length;
    //changement du texte de titre
    $("#txt-titre").text(selectedColoration.Titre);
    if (selectedColoration.ElevatorText) {$("#legElevatorText").text(selectedColoration.ElevatorText)} else {$("#legElevatorText").text("")};

    //modification du max de la légende
    if (custom) {
        dataMax = $("#customMax").val();
    } else {
        dataMax = selectedColoration.Max;
    }

    if (configDict.CSS) {
        for (const [key, value] of Object.entries(configDict.CSS)) {
            document.documentElement.style.setProperty(`--${key}`, value);
        }
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
        txtElem.setAttributeNS(null, "x", $("#TT-FIXED").find("#Region-fixed").prop("x").animVal[0].valueAsString);
        txtElem.setAttributeNS(null, "y", parseFloat($("#TT-FIXED").find("#Region-fixed").prop("y").animVal[0].valueAsString) + (i==0?configDict.Tooltip.HauteurTitre:(configDict.Tooltip.HauteurTitre + (configDict.Tooltip.Hauteur * (i)))) );
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
                if (tmpSerie.Type && tmpSerie.Type == "Array") {
                    if (tmpSerie.Spread && tmpSerie.Spread != 0) {
                        return v.split(";").map(function(vv) {
                            return parseFloat(vv, 10);
                        });
                    } else {
                        // Spread is 0: parse and return the middle value of the semicolon-separated array
                        var parts = v.split(";");
                        var mid = Math.floor(parts.length / 2);
                        return parseFloat(parts[mid], 10);
                    }
                } else {
                    return parseFloat(v, 10);
                }
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
            if (selectedColoration.Type && selectedColoration.Type == "Array" && selectedColoration.Spread && selectedColoration.Spread != 0) {
                var middleValue = Math.floor(valeurDuJour.length / 2);
                valeurDuJour = valeurDuJour[middleValue];
            }
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
                if (lockedRegion == element) {
                    document.documentElement.style.setProperty(`--day-color`, chaineCouleur);
                }
            } else { //Si la valeur == 0 
                var chaineCouleur = 'rgb(211,211,211)';
                //On colore le pays en gris
                $('path[id^=' + element + '-].zone-path').attr('fill', chaineCouleur);
                if (lockedRegion == element) {
                    document.documentElement.style.setProperty(`--day-color`, chaineCouleur);
                }
            }
        } else { //Si valeurDuJour == "NA"
            var chaineCouleur = 'rgb(211,211,211)';
            //On colore le pays en gris
            $('path[id^=' + element + '-].zone-path').attr('fill', chaineCouleur);
            if (lockedRegion == element) {
                document.documentElement.style.setProperty(`--day-color`, chaineCouleur);
            }
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
            hideLegendeIntervalle();
        }
    } else {
        if (correspondanceZone[zone] && correspondanceZone[zone]["Nom"]) {
            $("#Region-fixed").text(correspondanceZone[zone]["Nom"]);
        }

        if (selectedColoration && selectedColoration.ElevatorTitle) {
            if (correspondanceZone[zone] && correspondanceZone[zone]["Nom"] && correspondanceZone[zone]["Nom"].length < 20) {
                $("#legElevatorTitle").text(selectedColoration.ElevatorTitle.replace("${selectedKey}", correspondanceZone[zone]["Nom"]));
            } else {
                $("#legElevatorTitle").text(selectedColoration.ElevatorTitle.replace("${selectedKey}", zone));
            }
        }
        for (let index = 0; index < configDict.Tooltip.Champs.length; index++) {
            const element = configDict.Tooltip.Champs[index];
            if (element.Serie) {
                if (zone in dataDict[element.Serie]) {
                    if (element.Type == "Intervalle") {
                        var value = dataDict[element.Serie][zone][offset];
                        var middleValue = Math.floor(value.length / 2);
                        $("#"+element.Serie+"-fixed").text(element.Texte + ": " + `[${value[middleValue - element.Spread]} - ${value[middleValue + element.Spread]}]`);
                    } else {
                        $("#"+element.Serie+"-fixed").text(element.Texte + ": " + dataDict[element.Serie][zone][offset]);
                    }
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

        if (selectedColoration.Key && selectedColoration.IntervalleLegende && selectedColoration.Spread) {
            if (zone in dataDict[selectedColoration.Key]) {
                //on récupère la valeur du jour pour le pays
                var valeurDuJour = dataDict[selectedColoration.Key][zone][offset];
                var middle = Math.floor(valeurDuJour.length / 2);
                var middleValue = valeurDuJour[middle];
                var spread = selectedColoration.Spread;
                var lowValue = valeurDuJour[middle - spread];
                var highValue = valeurDuJour[middle + spread];
                var legMax = parseFloat($("#legMax").text());
                if (lowValue >= 0 && highValue >= 0 && middleValue < legMax && highValue < legMax && lowValue < legMax) {
                    var legStartY = configDict.Legende.startY - configDict.Legende.aberrant.height - configDict.Legende.aberrant.legendOffset;
                    var legHeight = configDict.Legende.boxes.height * configDict.Legende.boxes.number;

                    var midHeight = (legHeight * middleValue) / legMax;
                    var lowHeight = (legHeight * lowValue) / legMax;
                    var highHeight = (legHeight * highValue) / legMax;

                    $("#intervalle-stroke-mid").attr("y1", legStartY - midHeight).attr("y2", legStartY - midHeight).attr("visibility","visible");
                    $("#intervalle-stroke-low").attr("y1", legStartY - lowHeight).attr("y2", legStartY - lowHeight).attr("visibility","visible");
                    $("#intervalle-stroke-high").attr("y1", legStartY - highHeight).attr("y2", legStartY - highHeight).attr("visibility","visible");
                    $("#intervalle-rect-low").attr("y", legStartY - midHeight).attr("height", midHeight - lowHeight).attr("visibility","visible");
                    $("#intervalle-rect-high").attr("y", legStartY - highHeight).attr("height", highHeight - midHeight).attr("visibility","visible");
                    $("#legElevatorText").attr("y", legStartY - midHeight + (configDict.Legende.elevator.textSize / 2)).attr("visibility","visible");
                    $("#legElevatorTitle").attr("y", legStartY - midHeight + (configDict.Legende.elevator.textSize / 2) - 5).attr("visibility","visible");
                } else {
                    hideLegendeIntervalle()
                }
            } else {
                hideLegendeIntervalle()
            }
        } else {
            hideLegendeIntervalle();
        }
    }
};

function hideLegendeIntervalle() {
    $("#intervalle-stroke-mid").attr("visibility","hidden");
    $("#intervalle-stroke-high").attr("visibility","hidden");
    $("#intervalle-stroke-low").attr("visibility","hidden");
    $("#intervalle-rect-high").attr("visibility","hidden");
    $("#intervalle-rect-low").attr("visibility","hidden");
    $("#legElevatorText").attr("visibility","hidden");
    $("#legElevatorTitle").attr("visibility","hidden");
}

// TODO Inner stroker locked zone: https://codepen.io/collection/nJbGEB/?cursor=eyJjb2xsZWN0aW9uX2lkIjoibkpiR0VCIiwiY29sbGVjdGlvbl90b2tlbiI6bnVsbCwibGltaXQiOjQsIm1heF9pdGVtcyI6OCwib2Zmc2V0IjowLCJwYWdlIjoxLCJzb3J0X2J5IjoicG9zaXRpb24iLCJzb3J0X29yZGVyIjoiQXNjIn0=
function lockRegion(regionCode) {
    //Si on a deja un pays verouillé, on repasse ses frontières en noir
    if (lockedRegion != "") {
        $('circle[id^=' + lockedRegion + '-]').removeClass("locked-region");
        $('path[id^=' + lockedRegion + '-]').removeClass("locked-region");
    }

    //Si on a un nouveau code pays a vérouiller et qu'il est différent de l'ancien pays vérouillé, on met à jour le pays vérouillé et on change la couleur de ses frontières
    if (regionCode != "" && regionCode != lockedRegion) {
        lockedRegion = regionCode;
        $('circle[id^=' + regionCode + '-]').addClass("locked-region");
        $('path[id^=' + regionCode + '-]').addClass("locked-region");
    } else {
        lockedRegion = "";
    }
    var selectedDate = $("#dateRange").val();
    majCouleurs(selectedDate);
    majFixed();
    updateSelectionOutline();
    syncStatsWithLockedRegion(); // Add this
};

function showData(regionCode) {
    selectedRegion = regionCode;
    updateSelectionOutline();
    majFixed();
}

function hideData() {
    selectedRegion = "";
    updateSelectionOutline();
    majFixed();
}

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

function generateIntervalleDaysLabel(serie){
    var tmpSerie = serie.slice();
    var serieStraight = [];
    var serieReverse = [];
    for (let index = 0; index < tmpSerie.length; index++) {
        const element = tmpSerie[index];
        serieStraight.push(element);
        serieReverse.unshift(element);
    }
    var labelSerie = serieStraight.concat(serieReverse);
    return labelSerie;
}

function generateIntervalleMargeSerie(serie,spread){
    var tmpSerie = serie.slice();
    // todo spread
    var serieHaute = [];
    var serieBasse = [];
    for (let index = 0; index < tmpSerie.length; index++) {
        const element = tmpSerie[index];
        let middleValue = Math.floor(element.length / 2);
        serieHaute.push(element[middleValue+spread]);
        serieBasse.unshift(element[middleValue-spread]);
    }
    var cleanedSerie = serieHaute.concat(serieBasse);
    return cleanedSerie;
}

function generateIntervalleSerie(serie){
    var tmpSerie = serie.slice();
    var cleanedSerie = [];
    for (let index = 0; index < tmpSerie.length; index++) {
        const element = tmpSerie[index];
        let middleValue = Math.floor(element.length / 2);
        cleanedSerie.push(element[middleValue]);
    }
    return cleanedSerie;
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

function orderSelectCountry(id) {
    const select = document.getElementById(id);
    if (!select) return;

    // Custom display order—not a formal ranking.
    // Includes ISO 2-letter/3-letter codes and common country names.
    const priorityCountries = [
        ["FR", "FRA", "France"],
        ["US", "USA", "United States", "United States of America",
            "États-Unis", "États-Unis d'Amérique"],
        ["CN", "CHN", "China", "Chine"],
        ["RU", "RUS", "Russia", "Russian Federation", "Russie"],

        // Europe
        ["DE", "DEU", "Germany", "Allemagne"],
        ["GB", "GBR", "UK", "United Kingdom", "Royaume-Uni"],
        ["IT", "ITA", "Italy", "Italie"],
        ["ES", "ESP", "Spain", "Espagne"],

        // Asia / Middle East
        ["IN", "IND", "India", "Inde"],
        ["JP", "JPN", "Japan", "Japon"],
        ["KR", "KOR", "South Korea", "Corée du Sud"],
        ["ID", "IDN", "Indonesia", "Indonésie"],
        ["TR", "TUR", "Turkey", "Türkiye", "Turquie"],
        ["SA", "SAU", "Saudi Arabia", "Arabie saoudite"],

        // Americas
        ["CA", "CAN", "Canada"],
        ["BR", "BRA", "Brazil", "Brésil"],
        ["MX", "MEX", "Mexico", "Mexique"],
        ["AR", "ARG", "Argentina", "Argentine"],

        // Africa
        ["ZA", "ZAF", "South Africa", "Afrique du Sud"],
        ["NG", "NGA", "Nigeria", "Nigéria"],
        ["EG", "EGY", "Egypt", "Égypte"],
        ["KE", "KEN", "Kenya"],
        ["ET", "ETH", "Ethiopia", "Éthiopie"],

        // Oceania
        ["AU", "AUS", "Australia", "Australie"],
        ["NZ", "NZL", "New Zealand", "Nouvelle-Zélande"]
    ];

    function normalize(value) {
        return String(value)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");
    }

    const priorityLookup = new Map();

    priorityCountries.forEach((aliases, index) => {
        aliases.forEach(alias => {
            priorityLookup.set(normalize(alias), index);
        });
    });

    function getPriority(option) {
        // Keep the empty "no comparison" option at the very top.
        if (option.value === "none" || option.value === "") {
            return -1;
        }

        return priorityLookup.get(normalize(option.value))
            ?? priorityLookup.get(normalize(option.textContent))
            ?? Infinity;
    }

    const selectedValue = select.value;
    const options = Array.from(select.options);

    options.sort((a, b) => {
        const rankA = getPriority(a);
        const rankB = getPriority(b);

        if (rankA !== rankB) {
            return rankA < rankB ? -1 : 1;
        }

        return a.textContent.localeCompare(b.textContent, "fr", {
            sensitivity: "base"
        });
    });

    // Move the actual options rather than rewriting their values.
    options.forEach(option => select.appendChild(option));

    // Preserve the user's current selection.
    select.value = selectedValue;
}

// -------STATS-------

function displayStats() {
    $("body").addClass("loading");

    try {
        if (!dataStats) {
            // initStatsControlRow already applies lockedRegion
            // when each chart is first created.
            initStats();
        } else {
            syncStatsWithLockedRegion();
        }
    } finally {
        $("body").removeClass("loading");
    }
}

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

    const mainSelect = document.getElementById(`stats-zone-${i}`);

    const franceOption = Array.from(mainSelect.options).find(option => {
        const code = option.value.trim().toUpperCase();
        const name = option.textContent.trim().toLowerCase();

        return code === "FR" || code === "FRA" || name === "france";
    });

    // Use the country locked on the map, otherwise default to France.
    if (lockedRegion !== "") {
        mainSelect.value = lockedRegion;
    } else if (franceOption) {
        mainSelect.value = franceOption.value;
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
        case "interval":
            for (let ii = 0; ii < element.traces.length; ii++) {
                const trace = element.traces[ii];
                if (trace.type=="scatter") {
                    $('#param-column-1-'+i.toString()).append('<input class="stats-control-'+i.toString()+' stats-box cbx-stats-1-'+i.toString()+'" type="checkbox" id="cbx-stats-1-'+i.toString()+'-'+trace.data+'" alt="'+trace.name+'" process="'+(trace.process?trace.process:'')+'" spread="'+(trace.spread?trace.spread:'1')+'" value="'+trace.data+'" name="cbx-stats-1-'+i.toString()+'-'+trace.data+'" '+(ii==1?"checked":"")+'><label for="cbx-stats-1-'+i.toString()+'-'+trace.data+'">'+trace.name+'</label><br>');
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
        case "interval":
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
        case "interval":
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
                        if (trace.process && trace.process === "Intervalle") {
                            tmpTraces.push({
                                "y": [],
                                "x": generateIntervalleDaysLabel(daysLabelStats),
                                "type": 'scatter',
                                "fill": "tozerox", 
                                "fillcolor": "rgba(207, 0, 15,0.3)", 
                                "line": {"color": "transparent"}
                            });
                            if (element.compare) {
                                tmpTraces.push({
                                    "y": [],
                                    "x": generateIntervalleDaysLabel(daysLabelStats),
                                    "type": 'scatter',
                                    "fill": "tozerox", 
                                    "fillcolor": "rgba(25, 181, 254,0.3)", 
                                    "line": {"color": "transparent"}
                                });
                            }
                        } else {
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
                        type: "linear",
                        tickmode: "auto",
                        autorange: true,
                        rangemode: "nonnegative",
                        automargin: true
                    };
                        
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

const STATS_PALETTE = {
    main: {
        dark: [139, 0, 0],
        bar:   "#F28E2B"
    },
    compared: {
        dark: [0, 45, 114],
        bar: "#219E9A"
    }
};

// amount = 0: original color
// amount = 1: white
function lightenStatsColor(rgb, amount) {
    return rgb.map(channel =>
        Math.round(channel + (255 - channel) * amount)
    );
}

function statsRgb(rgb, alpha = 1) {
    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

function getStatsTraceColor(definition, zoneRole, confidenceLevels) {
    const base = STATS_PALETTE[zoneRole].dark;

    // CleanRSerie always uses the darkest shade.
    if (definition.process === "CleanRSerie") {
        return base;
    }

    if (definition.process === "Intervalle") {
        // A single selected confidence level gets a lighter shade.
        if (confidenceLevels.length <= 1) {
            return lightenStatsColor(base, 0.55);
        }

        // confidenceLevels is sorted from lowest to highest.
        const rank = confidenceLevels.indexOf(
            Number(definition.confidence)
        );

        // Lowest confidence: lightest.
        // Highest confidence: darker, but still lighter than CleanRSerie.
        const amount =
            0.75 - (rank / (confidenceLevels.length - 1)) * 0.40;

        return lightenStatsColor(base, amount);
    }

    // Default for other line processes.
    return lightenStatsColor(base, 0.40);
}

function updateTimeStats(i) {
    const graph = configDict.Graphiques[i];
    const plot = document.getElementById(`plot-div-${i}`);

    const mainSelect = $(`#stats-zone-${i}`);
    const comparedSelect = $(`#stats-compared-${i}`);

    const zones = [{
        key: mainSelect.val(),
        label: mainSelect.find("option:selected").text(),
        role: "main"
    }];

    if (
        graph.compare &&
        comparedSelect.val() &&
        comparedSelect.val() !== "none"
    ) {
        zones.push({
            key: comparedSelect.val(),
            label: comparedSelect.find("option:selected").text(),
            role: "compared"
        });
    }

    const selectedKeys = new Set(
        $(`.cbx-stats-1-${i}:checked`)
            .map(function () {
                return this.value;
            })
            .get()
    );

    const selectedDefinitions = graph.traces.filter(definition =>
        definition.type === "scatter" &&
        selectedKeys.has(definition.data)
    );

    const confidenceLevels = [...new Set(
        selectedDefinitions
            .filter(definition => definition.process === "Intervalle")
            .map(definition => Number(definition.confidence))
    )].sort((a, b) => a - b);

    const traces = [];
    const titleParts = [];

    // ----- Bars -----
    const barControl = $(
        `.stats-control-${i}[name="radio-stats-2-${i}"]:checked`
    );
    const barKey = barControl.val();

    if (barKey && barKey !== "none") {
        const barName = barControl.attr("alt");
        titleParts.push(barName);

        for (const zone of zones) {
            const values = dataDict[barKey]?.[zone.key];

            if (!Array.isArray(values)) continue;

            traces.push({
                type: "bar",
                x: daysLabelStats.slice(0, values.length),
                y: values,
                yaxis: "y2",
                name: barName,
                legendgroup: zone.role,
                legendgrouptitle: {
                    text: zone.label
                },
                marker: {
                    color: STATS_PALETTE[zone.role].bar
                },
                opacity: 0.65
            });
        }
    }

    // Draw wide/high-confidence intervals first,
    // then narrower intervals, then the ordinary lines.
    const intervalDefinitions = selectedDefinitions
        .filter(definition => definition.process === "Intervalle")
        .sort((a, b) => Number(b.confidence) - Number(a.confidence));

    const lineDefinitions = selectedDefinitions.filter(
        definition => definition.process !== "Intervalle"
    );

    for (const definition of selectedDefinitions) {
        titleParts.push(definition.name);
    }

    for (const definition of [
        ...intervalDefinitions,
        ...lineDefinitions
    ]) {
        for (const zone of zones) {
            const values = dataDict[definition.data]?.[zone.key];

            if (!Array.isArray(values)) continue;

            const dates = daysLabelStats.slice(0, values.length);
            const rgb = getStatsTraceColor(
                definition,
                zone.role,
                confidenceLevels
            );

            const legendName =
                definition.process === "Intervalle"
                    ? `IC ${definition.confidence}%`
                    : definition.process === "CleanRSerie"
                        ? "Estimation de R"
                        : definition.name;

            const trace = {
                type: "scatter",
                mode: "lines",

                name: legendName,

                // Group entries under the country name.
                legendgroup: zone.role,
                legendgrouptitle: {
                    text: zone.label
                },

                line: {
                    color: statsRgb(rgb),
                    width: definition.process === "CleanRSerie" ? 2.5 : 2
                },

                // The full description remains available on hover.
                hovertemplate:
                    `${definition.name} — ${zone.label}` +
                    "<br>%{x}<br>%{y:.3f}<extra></extra>"
            };

            switch (definition.process) {
                case "Intervalle": {
                    const spread = Number(definition.spread ?? 1);

                    trace.x = generateIntervalleDaysLabel(dates);
                    trace.y = generateIntervalleMargeSerie(values, spread);

                    trace.fill = "toself";
                    trace.fillcolor = statsRgb(rgb, 0.22);

                    trace.line.dash = {
                        90: "solid",
                        95: "dash",
                        99: "dot"
                    }[definition.confidence] ?? "solid";

                    trace.hoveron = "points";

                    break;
                }

                case "CleanRSerie":
                    trace.x = dates;
                    trace.y = cleanRSerie(values);
                    break;

                default:
                    trace.x = dates;
                    trace.y = values;
                    break;
            }

            traces.push(trace);
        }
    }

    dataStats[i] = traces;

    const zoneTitle = zones.map(zone => zone.label).join(" vs ");

    $(`#title-graph-${i}`)
        .empty()
        .append(document.createTextNode(graph.title))
        .append("<br>")
        .append(document.createTextNode(titleParts.join(" | ")))
        .append("<br>")
        .append(document.createTextNode(zoneTitle));

    const layout = {
        ...plot.layout,

        legend: {
            orientation: "v",
            // Closer to the right Y-axis, with room for its numbers.
            x: 1.05,
            y: 1,
            xanchor: "left",
            yanchor: "top",
            traceorder: "grouped",
            tracegroupgap: 10,
            groupclick: "toggleitem",
            // Keep stroke samples long enough to distinguish dash styles.
            itemwidth: 40,
            font: {
                size: 11
            },
            // Country heading.
            grouptitlefont: {
                size: 12
            }
        },
        margin: {
            ...plot.layout.margin,
            l: 0,
            r: 240
        },
        yaxis: {
            ...plot.layout.yaxis,
            automargin: true
        },
        yaxis2: {
            ...plot.layout.yaxis2,
            automargin: true
        }
    };

    Plotly.react(plot, traces, layout);
}

function updateStats(i) {
    const graphType = configDict.Graphiques[i].type;

    if (graphType === "dynamic" || graphType === "interval") {
        updateTimeStats(i);
        return;
    }

    var tmpGraphique = configDict.Graphiques[i];
    var zoneMain = $("#select-zone-main-"+i.toString()+ " option:selected").val();
    var zoneMainLabel = $("#select-zone-main-"+i.toString()+" option:selected").text();
    var zoneCompared = $("#select-zone-compared-"+i.toString()+ " option:selected").val();
    var zoneComparedLabel = $("#select-zone-compared-"+i.toString()+" option:selected").text();

    var tmpTitle = tmpGraphique.title + "<br>";
    var tmpSeriesTitle = [];

    switch (configDict.Graphiques[i].type) {
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

    if (tmpGraphique.type === "phase") {
        dataStats[i].forEach((trace, index) => {
            trace.showlegend =
                Boolean(trace.name) &&
                Array.isArray(trace.y) &&
                trace.y.length > 0;
            // Trace order with comparison:
            // main, compared, main recent, compared recent.
            const isCompared =
                tmpGraphique.compare && index % 2 === 1;

            const role = isCompared ? "compared" : "main";
            const zoneKey = isCompared ? zoneCompared : zoneMain;
            const base = STATS_PALETTE[role].dark;

            const recentStart = tmpGraphique.compare ? 2 : 1;
            const isRecent =
                tmpGraphique.highlightRecent && index >= recentStart;

            // Use the complete series so the gradient continues
            // smoothly from the historical trace to the recent trace.
            const totalPoints =
                dataDict[xOptions.key]?.[zoneKey]?.length ?? 0;

            const pointCount = trace.x?.length ?? 0;

            const firstPointIndex = isRecent
                ? Math.max(0, totalPoints - pointCount)
                : 0;

            const pointColors = Array.from(
                { length: pointCount },
                (_, pointIndex) => {
                    const absoluteIndex = firstPointIndex + pointIndex;

                    // 0 = oldest point, 1 = newest point.
                    const progress = Math.min(
                        1,
                        absoluteIndex / Math.max(1, totalPoints - 1)
                    );

                    // Oldest: lightened by 80%.
                    // Newest: original dark red/blue.
                    const lightness = 0.80 * (1 - progress);

                    return statsRgb(
                        lightenStatsColor(base, lightness)
                    );
                }
            );

            trace.mode = "markers+lines";

            trace.marker = {
                ...trace.marker,
                color: pointColors,
                size: isRecent ? 6 : 4,
                opacity: 1,
                line: {
                    width: 0
                }
            };

            // Plotly requires one color per connecting-line trace.
            trace.line = {
                ...trace.line,
                color: statsRgb(
                    lightenStatsColor(base, isRecent ? 0 : 0.55)
                ),
                width: isRecent ? 2.5 : 1
            };
        });
    }

    const plotId = `plot-div-${i}`;

    Plotly.redraw(plotId);

    if (tmpGraphique.type === "phase") {
        Plotly.relayout(plotId, {
            // Always display the legend, even for one country.
            height: 560,
            showlegend: true,
            "margin.t": 20,
            "margin.b": 65,
            "margin.l": 55,
            "margin.r": 20,
            "margin.autoexpand": true,
            "yaxis.title.text": "Estimation de R",
            "yaxis.automargin": true,
            "legend.x": 1.01,
            "legend.y": 1,
            "legend.xanchor": "left",
            "legend.yanchor": "top",
            "legend.itemwidth": 30,
            "legend.groupclick": "togglegroup"
        });
    }
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

function syncStatsWithLockedRegion() {
    // Charts have not been initialized, or no country is locked.
    if (!Array.isArray(dataStats) || lockedRegion === "") {
        return;
    }

    configDict.Graphiques.forEach((graph, i) => {
        const select = document.getElementById(`stats-zone-${i}`);
        const plot = document.getElementById(`plot-div-${i}`);

        if (!select || !plot || !dataStats[i]) {
            return;
        }

        // Do not clear the selection if this country is unavailable.
        const hasCountry = Array.from(select.options).some(
            option => option.value === lockedRegion
        );

        if (hasCountry && select.value !== lockedRegion) {
            select.value = lockedRegion;
            updateStats(i);
        }
    });
}

function updateSelectionOutline() {
    const countries = document.getElementById("GALL.S");
    if (!countries) return;

    const svgNS = "http://www.w3.org/2000/svg";

    function drawOutline(layerId, regionCode, color, width) {
        let layer = countries.querySelector(`#${layerId}`);

        if (!layer) {
            layer = document.createElementNS(svgNS, "g");
            layer.id = layerId;
            layer.setAttribute("aria-hidden", "true");
        }

        layer.style.setProperty("pointer-events", "none", "important");

        countries.appendChild(layer);
        layer.replaceChildren();

        if (!regionCode) return;

        const prefix = `${regionCode}-`;

        countries.querySelectorAll("path.zone-path").forEach(path => {
            if (!path.id.startsWith(prefix)) return;

            const outline = document.createElementNS(svgNS, "path");
            outline.setAttribute("d", path.getAttribute("d"));

            if (path.hasAttribute("transform")) {
                outline.setAttribute(
                    "transform",
                    path.getAttribute("transform")
                );
            }

            // Transparent interior — only the border is drawn.
            outline.style.setProperty("fill", "none", "important");
            outline.style.setProperty("stroke", color, "important");
            outline.style.setProperty(
                "stroke-width", `${width}px`, "important"
            );
            outline.style.setProperty(
                "pointer-events", "none", "important"
            );

            outline.style.strokeLinejoin = "round";
            outline.style.strokeLinecap = "round";
            outline.style.vectorEffect = "non-scaling-stroke";

            layer.appendChild(outline);
        });
    }

    // Locked country remains blue, even when hovered.
    const hoveredRegion =
        selectedRegion !== lockedRegion ? selectedRegion : "";

    drawOutline("hover-outline", hoveredRegion, "#000000", 1.6);
    drawOutline("selection-outline", lockedRegion, "#2563eb", 2);
}