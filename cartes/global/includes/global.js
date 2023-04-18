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

var corresRegion = {};

$(function() {
    loadMap("monde");
});

//Evenement clique bouton retour au début
$("#first").click(function(e) {
    $("#dateRange").val(1); //On amène le slider de dates à la première date
    //On fait la mise à jour de la carte
    var selectedDate = $("#dateRange").val();
    changeSliderDateLabel(returnDateFormatted(selectedDate));
    majData(selectedDate);
    majCouleurs(selectedDate);
});


$("#display-phase").change(function(e) {
    
    $("#pandemic-dynamic").toggle();
    
    if (this.checked) {
        var sectionOffset = $('#pandemic-dynamic').position().top;
        $("#popupStats").scrollTop(sectionOffset);
    }
    // get the top of the section

    //scroll the container
});

$("#remove-stats-country").click(function(e) {
    $('#stats-compared option[value="none"]').prop('selected', true);
    updateStats();
});

$("#invert-stats-country").click(function(e) {
    var tmpPays = $("#stats-pays").val();
    var tmpCompared = $("#stats-compared").val();
    $('#stats-pays option[value="'+tmpCompared+'"]').prop('selected', true);
    $('#stats-compared option[value="'+tmpPays+'"]').prop('selected', true);
    updateStats();
});

//Evenement clique bouton -1 "pas"
$("#downDate").click(function(e) {
    $("#dateRange").val($("#dateRange").val() - $("#pas").val()); //On fait baisser la date d'un pas
    //On fait la mise à jour de la carte
    var selectedDate = $("#dateRange").val();
    changeSliderDateLabel(returnDateFormatted(selectedDate));
    majData(selectedDate);
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
        majData(selectedDate);
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
    majData(selectedDate);
    majCouleurs(selectedDate);
});

//Evenement clique dernier
$("#last").click(function(e) {
    $("#dateRange").val(daysPast);
    //On fait la mise à jour de la carte
    var selectedDate = $("#dateRange").val();
    changeSliderDateLabel(returnDateFormatted(selectedDate));
    majData(selectedDate);
    majCouleurs(selectedDate);
});

//Evenement changement coloration
$("#coloration").change(function(e) {
    //On fait la mise à jour de la carte
    selectColoration();
    var selectedDate = $("#dateRange").val();
    initiateColors(false);
    majData(selectedDate);
    majCouleurs(selectedDate);
});

//Evenement changement max de la légende
$("#customMax").change(function(e) {
    //On fait la mise à jour de la carte
    var selectedDate = $("#dateRange").val();
    initiateColors(true);
    majData(selectedDate);
    majCouleurs(selectedDate);
});

//Evenement changement de date via le slider
$("#slider").change(function(e) {
    //On fait la mise à jour de la carte
    var selectedDate = $("#dateRange").val();
    changeSliderDateLabel(returnDateFormatted(selectedDate));
    majData(selectedDate);
    majCouleurs(selectedDate);
});

//Evenement changement de configuration du module de stats
$(".stats-control").change(function(e) {
    updateStats();
});

function loadMap(map) {
    $.get("config/"+map +".json", function(data) {
        configDict = data;
        dataDict = {};
        corresRegion = {};
        colors = {};
        selectedRegion = "";
        lockedRegion = "";
        firstDay = configDict.Début;
        $("#coloration").empty();

        initMap(map);
    }).fail(function() {
        alert("Le pays demandé n'a pas de configuration"); // or whatever
    }); 
}

function initMap(mapName){
    $("body").addClass("loading");


    $("#cadre-carte").load('cartes/'+mapName+'.svg', function(response,status) {
        if (status == "error"){
            alert("Le pays demandé n'a pas de carte");
            return;
        }

        var loaded = 0;
        loadData(loaded);
    });
}

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

// TODO rework + event
function initSettings(){
    selectColoration();
    initiateColors(false);

    initiateSvg(); //On fait les quelques modifications désirées sur le SVG
    changeSliderDateLabel(returnDateFormatted(daysPast)); //On met à jour le label du slider de date
    majData($("#dateRange").val()); //On met à jour les données
    majCouleurs($("#dateRange").val()); //On met à jour les colorations des pays
    loadCountries();
    $("body").removeClass("loading");
}

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

function loadCountries(){
    $.get("data/"+configDict.Nom.toLowerCase()+"/"+ configDict.Correspondance, function(data) {
        data = $.csv.toArrays(data,{'separator':';'});
        data.shift();
        data.forEach(element => {
            corresRegion[element[0]] = element[1];
        });
    });
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


function majData(offset) {
    var offset = parseInt(offset);
    //On traite les tootlitps un par un
    $("g[id$=-TT]").each(function(index) {
        for (let i = 0; i < configDict.Tooltip.Champs.length; i++) {
            const element = configDict.Tooltip.Champs[i];
            var indexLigne = i + 1 + configDict.Tooltip.LignesInit; 
            var idTooltip = this.id.split("-")[0];

            if (idTooltip in dataDict[element.Serie]) {
                $(this).find("text:nth-child("+indexLigne.toString()+")").text(element.Texte + ": " + dataDict[element.Serie][idTooltip][offset]);
            } else {
                $(this).find("text:nth-child("+indexLigne.toString()+")").text(element.Texte + ": Pas de données");
            }
        }
    });
    majFixed();
};

function majCouleurs(offset) {
    //Pour chaque tooltip
    var offset = parseInt(offset);
    $("g[id$=-TT]").each(function(index) {
        var idTooltip = this.id.split("-")[0];
        //Selon la coloration choisie par l'utilisateur, 
        if (idTooltip in dataDict[selectedColoration.Key]) {
            //on récupère la valeur du jour pour le pays
            var valeurDuJour = dataDict[selectedColoration.Key][idTooltip][offset];
        } else {
            //on récupère la valeur du jour pour le pays
            var valeurDuJour = "NA";
        }
        //On effectue ensuite les traitements en fonction de valeurDuJour
        // console.log(valeurDuJour);
        if (valeurDuJour != "NA") {
            if (valeurDuJour >= 0) {
                (valeurDuJour > dataMax ? valeurDuJour = dataMax - (dataMax / (nbCaissons * 2)) : valeurDuJour); //Si la valeur du jour est supérieure au max de la légende, on ramène la valeur du jour pour qu'elle corresponde à notre caisson le plus élevé
                var couleurDuJour = processColor(valeurDuJour);
                var chaineCouleur = couleurDuJour;
                // console.log(chaineCouleur);
                //On remplit le pays avec la couleur
                $('path[id^=' + idTooltip + '-]').attr('fill', chaineCouleur);
            } else { //Si la valeur == 0 
                var chaineCouleur = 'rgb(211,211,211)';
                //On colore le pays en gris
                $('path[id^=' + idTooltip + '-]').attr('fill', chaineCouleur);
            }
        } else { //Si valeurDuJour == "NA"
            var chaineCouleur = 'rgb(211,211,211)';
            //On colore le pays en gris
            $('path[id^=' + idTooltip + '-]').attr('fill', chaineCouleur);
        }
    });
};
// TODO Caisson automatiques config
function initiateColors(custom) {
    nbCaissons =  $(".legBox").length;
    //changement du texte de titre
    $("#txt-titre2").text(selectedColoration.Titre);

    //modification du max de la légende
    if (custom) {
        dataMax = $("#customMax").val();
    } else {
        dataMax = selectedColoration.Max;
    }

    var iLegText = 0;
    //récupération des couleurs de la légende
    $(".legText").each(function(index) {
        // console.log(dataMax , iLegText , nbCaissons);
        iLegText++;
        $(this).text(String(dataMax * iLegText / nbCaissons).substring(0, 4));
        // console.log($(this).text());
    });

    //initialisation du tableau de couleurs
    var iLegBox = 0;
    $(".legBox").each(function(index) {
        // console.log($(this));
        iLegBox++;
        colors[iLegBox] = $(this).attr('fill');
    });

    //modification des textes de titre de la légende, du max de la légende et du champ de configuration
    $("#legTitle").text($("#coloration option:selected").text());
    $("#legMax").text(String(dataMax));
    $("#customMax").val(dataMax);
}

function initiateSvg() {
    //On ajoute de nouvelles lignes aux tooltips de tous les pays
    $("g[id$=-TT]").each(function(index) {
        for (let i = 0; i < configDict.Tooltip.Champs.length; i++) {
            const element = configDict.Tooltip.Champs[i];
            var txtElem = document.createElementNS("http://www.w3.org/2000/svg", "text");
            txtElem.setAttributeNS(null, "x", $(this).find("text:nth-child(1)").prop("x").animVal[0].valueAsString);
            txtElem.setAttributeNS(null, "y", parseFloat($(this).find("text:nth-child(1)").prop("y").animVal[0].valueAsString) + (configDict.Tooltip.Hauteur * i));
            txtElem.setAttributeNS(null, "style", "font-size:"+configDict.Tooltip.Hauteur+"px; font-family:Helvetica");
            txtElem.setAttributeNS(null, "text", element.Texte);
            txtElem.setAttributeNS(null, "class", "data-TT-"+ element.Serie );
            document.getElementById(this.id).appendChild(txtElem);
        }
    });
    for (let i = 0; i < configDict.Tooltip.Champs.length; i++) {
        const element = configDict.Tooltip.Champs[i];
        var txtElem = document.createElementNS("http://www.w3.org/2000/svg", "text");
        txtElem.setAttributeNS(null, "x", $("#TT-FIXED").find("text:nth-child(1)").prop("x").animVal[0].valueAsString);
        txtElem.setAttributeNS(null, "y", parseFloat($("#TT-FIXED").find("text:nth-child(1)").prop("y").animVal[0].valueAsString) + (i==0?configDict.Tooltip.HauteurTitre:(configDict.Tooltip.HauteurTitre + (configDict.Tooltip.Hauteur * (i)))) );
        txtElem.setAttributeNS(null, "style", "font-size:"+configDict.Tooltip.Hauteur+"px; font-family:Helvetica");
        txtElem.setAttributeNS(null, "text", "");
        txtElem.setAttributeNS(null, "id", element.Serie+"-fixed");
        document.getElementById("TT-FIXED").appendChild(txtElem);
    }
}

function processColor(valeurDuJour) {
    var couleurJour = parseInt((valeurDuJour / dataMax) * nbCaissons) + 1;
    return (colors[couleurJour]);
}
// Todo: habitants serie fixe + rework TT (supprimer les XXX-TT)
function majFixed() {
    if (lockedRegion != "") {
        tooltip = lockedRegion + "-TT";
    } else if (selectedRegion != "") {
        tooltip = selectedRegion;
    } else {
        tooltip = "";
    }

    if (tooltip == "") {
        $("#Region-fixed").text("");
        for (let index = 0; index < configDict.Tooltip.Champs.length; index++) {
            const element = configDict.Tooltip.Champs[index];
            $("#"+element.Serie+"-fixed").text("");
        }
    } else {
        $("#Region-fixed").text($("#" + tooltip).find(".data-TT-Region").text());
        for (let index = 0; index < configDict.Tooltip.Champs.length; index++) {
            const element = configDict.Tooltip.Champs[index];
            $("#"+element.Serie+"-fixed").text($("#" + tooltip).find(".data-TT-"+element.Serie).text());
        }
    }
};

// CHECK FRANCE
function lockRegion(regionCode) {

    //Si on a deja un pays verouillé, on repasse ses frontières en noir
    if (lockedRegion != "") {
        $('path[id^=' + lockedRegion + '-]').attr("stroke", "rgb(0,0,0)");
        $('path[id^=' + lockedRegion + '-]').attr("stroke-width", "0.1");
        $('path[id^=' + lockedRegion + '-]').removeClass("locked-region");
    }

    //Si on a un nouveau code pays a vérouiller et qu'il est différent de l'ancien pays vérouillé, on met à jour le pays vérouillé et on change la couleur de ses frontières
    if (regionCode != "" && regionCode != lockedRegion) {
        lockedRegion = regionCode;
        $('path[id^=' + regionCode + '-]').attr("stroke", "rgb(25,184,254)");
        $('path[id^=' + regionCode + '-]').attr("stroke-width", "0.5");
        $('path[id^=' + regionCode + '-]').addClass("locked-region");
    } else {
        lockedRegion = "";
    }
    majFixed();
};

// TODO Rework showTT et hideTT pour ne plus prendre "-TT" en compte
function showTT(tooltip) {
    selectedRegion = tooltip; //Maj du pays selectionné
    majFixed(); //Maj des infos dans le tooltip fixe
    // document.getElementById(tooltip).setAttribute('visibility','visible'); //Avant, on affichait le tooltip du pays
};

function hideTT(tooltip) {
    selectedRegion = ""; //Suppression du pays selectionné
    majFixed(); //Maj des infos dans le tooltip fixe
    // document.getElementById(tooltip).setAttribute('visibility','hidden');//Avant, on cachait le tooltip du pays
};