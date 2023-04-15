//Déclaration des variables
var configDict = {"Map":"monde"};
var optionsDict = false;
var dataDict = {}; //Tableau des données RStandard
var dataFull = {}; //Tableau des données RStandard
var dataFast = {}; //Tableau des données RFast
var dataNew = {}; //Tableau des données NCas
var dataMorts = {}; //Tableau des données AggMorts
var dataConfirmed = {}; //Tableau des données AggConfirmed
var dataCasDenoised = {}; //Tableau des données Ncasdenoised
var dataMortsDenoised = {}; //Tableau des données Ncasdenoised
var firstDay = "02/02/2020"; //Premier jour des données
var daysPast; //Nombres de jours depuis le début des données
var nbCaissons; //Nombre de caissons pour la légende
var dataMax = 2; //Maximum de la légende
var dataMin = 0; //Minimum de la légende
var tim; //Fonction d'intervalle pour l'animations
var colors = {}; //Tableau des couleurs utilisés par la légende
var selectedCountry = ""; //Pays selectionné
var lockedCountry = ""; //Pays vérouillé
var dataStats = false; //Objet de statistiques pour les graphiques
var dataStatsPhase = false; //Objet de statistiques pour les graphiques
var dataStatsPhase3D = false; //Objet de statistiques pour les graphiques
var daysLabelStats = []; //Tableau des titres des jours pour le graphique
var corresPays = {};
var availableCountries=["AFG","AGO","ALB","ARE","ARG","ARM","AUS","AUT","AZE","BDI","BEL","BEN","BFA","BGD","BGR","BHR","BHS","BIH","BLM","BLR","BLZ","BOL","BRA","BRN","BTN","BWA","CAF","CAN","CCK","CHE","CHL","CHN","CIV","CMR","COD","COG","COK","COL","COM","CPV","CRI","CUB","CYM","CYP","CZE","DEU","DJI","DMA","DNK","DOM","DZA","ECU","EGY","ERI","ESH","ESP","EST","ETH","FIN","FJI","FLK","FRA","FSM","GAB","GBR","GEO","GGY","GHA","GIN","GLP","GMB","GNB","GNQ","GRC","GRD","GRL","GTM","GUF","GUY","HKG","HND","HRV","HTI","HUN","IDN","IND","IRL","IRN","IRQ","ISL","ISR","ITA","JAM","JOR","JPN","KAZ","KEN","KGZ","KHM","KIR","KNA","KOR","KSV","KWT","LAO","LBN","LBR","LBY","LKA","LSO","LTU","LUX","LVA","MAC","MAF","MAR","MCO","MDA","MDG","MDV","MEX","MHL","MKD","MLI","MLT","MMR","MNE","MNG","MNP","MOZ","MRT","MTQ","MUS","MWI","MYS","MYT","NAM","NCL","NER","NFK","NGA","NIC","NLD","NOR","NPL","NRU","NZL","OMN","PAK","PAN","PCN","PER","PHL","PLW","PNG","POL","PRI","PRK","PRT","PRY","PSE","PYF","QAT","REU","ROU","RUS","RWA","SAU","SDN","SEN","SGP","SHN","SJM","SLB","SLE","SLV","SOM","SPM","SRB","SSD","SUR","SVK","SVN","SWE","SWZ","SYC","SYR","TCA","TCD","TGO","THA","TJK","TKM","TLS","TON","TUN","TUR","TUV","TWN","TZA","UGA","UKR","UMI","URY","USA","UZB","VAT","VCT","VEN","VGB","VIR","VNM","VUT","WLF","YEM","ZAF","ZMB","ZWE"];
var selectPays="";

$(function() {
    //Chargement des données
    $.get("config/"+configDict.Map +".json", function(data) {
        configDict = data;
        initMap("monde");
    }).fail(function() {
        alert("Le pays demandé n'a pas de configuration"); // or whatever
    }); 
    
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

$("#denoised-data").change(function(e) {
    //On fait la mise à jour de la carte
    var selectedDate = $("#dateRange").val();
    initiateColors(false);
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

function initMap(mapName){
    $("#denoised-data").prop( "checked", false );
    $("#display-phase").prop( "checked", false );
    $("#pandemic-dynamic").hide();
    $("body").addClass("loading");


    $("#cadre-carte").load('cartes/'+mapName+'.svg', function(response,status) {
        console.log( "Load was performed." );
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
        alert("Full loaded");
        initSettings();
    } else {
        var tmpSerie = configDict.Series[loaded];
        $.get("data/"+configDict.Nom.toLowerCase()+"/"+ tmpSerie.Fichier, function(tmpData) { //On charge RStandard
            //transformation en tableau, 
            tmpData = $.csv.toArrays(tmpData); //transformation en tableau
            daysPast = tmpData[0].length - 2; //initialisation à la date actuelle

            for (let index = 0; index < tmpSerie.Shift; index++) {
                tmpData.shift();
                console.log("shift",loaded);
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

function initSettings(){
    $("#slider").append('<label id="selectedDate" for="dateRange"></label><input type="range" id="dateRange" name="dateRange" step="1" min="0" max="' + daysPast + '" value="' + daysPast + '">  ');
    initiateSvg(); //On fait les quelques modifications désirées sur le SVG
    changeSliderDateLabel(returnDateFormatted(daysPast)); //On met à jour le label du slider de date
    majData($("#dateRange").val()); //On met à jour les données
    majCouleurs($("#dateRange").val()); //On met à jour les colorations des pays
    initiateStatsLabels();
    loadCountries();
    $("body").removeClass("loading");
}

function changeSliderDateLabel(val) {
    $("#selectedDate").text(val);
    $("#textDate").text(val);
}

function initiateStatsLabels() {
    for (let index = 0; index <= daysPast; index++) {
        daysLabelStats.push(returnDateFormatted(index));
    }
};

function loadCountries(){
    $.get("data/"+configDict.Nom.toLowerCase()+"/"+ configDict.Correspondance, function(data) { //On charge AggMorts
        data = $.csv.toArrays(data,{'separator':';'});
        data.shift();
        data.forEach(element => {
            corresPays[element[0]] = element[1];
        });
    });
};

// TODO => GESTION PAR SERIE
function majData(offset) {
    //On traite les tootlitps un par un
    $("g[id$=-TT]").each(function(index) {
        //Si on trouve le pays en question dans les données RStandard et que la coloriation est définie sur standard
        if (this.id.substring(0, 3) in dataFull && $("#coloration").val() == 'Standard') {
            //Si les données du jours sont vides on indique leur absence
            if (dataFull[this.id.substring(0, 3)][offset] == -1) {
                $(this).find("text:nth-child(2)").text("RSlow: Pas de données");
                //Si les données du jours sont présentes on fait la mise à jour
            } else {
                $(this).find("text:nth-child(2)").text("RSlow: " + dataFull[this.id.substring(0, 3)][offset]);
            }
            //Si on trouve le pays en question dans les données RFast
        } else if (this.id.substring(0, 3) in dataFast) {
            //Si les données du jours sont vides on indique leur absence
            if (dataFast[this.id.substring(0, 3)][offset] == -1) {
                $(this).find("text:nth-child(2)").text("RFast: Pas de données");
                //Si les données du jours sont présentes on fait la mise à jour
            } else {
                $(this).find("text:nth-child(2)").text("RFast: " + dataFast[this.id.substring(0, 3)][offset]);
            }
            //Sinon on indique que l'on a aucune donnée
        } else {
            $(this).find("text:nth-child(2)").text("RFast: Pas de données");
        }

        //Si on trouve le pays en question dans les données dataNew on fait la mise à jour
        if (this.id.substring(0, 3) in dataNew) {
            $(this).find("text:nth-child(3)").text("Nouveaux cas: " + dataNew[this.id.substring(0, 3)][offset]);
            //Si les données du jours sont vides on indique leur absence
        } else {
            $(this).find("text:nth-child(3)").text("Nouveaux cas: Pas de données");
        }

        //Si on trouve le pays en question dans les données dataMorts on fait la mise à jour
        if (this.id.substring(0, 3) in dataMorts) {
            $(this).find("text:nth-child(5)").text("Nouveaux décès / million: " + dataMorts[this.id.substring(0, 3)][offset]);
            //Si les données du jours sont vides on indique leur absence
        } else {
            $(this).find("text:nth-child(5)").text("Nouveaux décès / million: Pas de données");
        }

        //Si on trouve le pays en question dans les données dataConfirmed on fait la mise à jour
        if (this.id.substring(0, 3) in dataConfirmed) {
            $(this).find("text:nth-child(4)").text("Nouveaux cas / 10000 : " + dataConfirmed[this.id.substring(0, 3)][offset]);
            //Si les données du jours sont vides on indique leur absence
        } else {
            $(this).find("text:nth-child(4)").text("Nouveaux cas / 10000: Pas de données");
        }



    });
    majFixed();
};
// TODO => GESTION PAR SERIE
function majCouleurs(offset) {
    //Pour chaque tooltip
    $("g[id$=-TT]").each(function(index) {
        //Selon la coloration choisie par l'utilisateur, 
        switch ($("#coloration").val()) {
            case 'Standard':
                if (this.id.substring(0, 3) in dataFull) {
                    //on récupère la valeur du jour pour le pays
                    var valeurDuJour = dataFull[this.id.substring(0, 3)][offset];
                } else {
                    //on récupère la valeur du jour pour le pays
                    var valeurDuJour = "NA";
                }
                break;
            case 'Fast':
                if (this.id.substring(0, 3) in dataFast) {
                    //on récupère la valeur du jour pour le pays
                    var valeurDuJour = dataFast[this.id.substring(0, 3)][offset];
                } else {
                    //on récupère la valeur du jour pour le pays
                    var valeurDuJour = "NA";
                }
                break;
            case 'Confirmed':
                if (this.id.substring(0, 3) in dataConfirmed && $("#denoised-data").prop( "checked") == false) {
                    //on récupère la valeur du jour pour le pays
                    var valeurDuJour = dataConfirmed[this.id.substring(0, 3)][offset];
                }else if (this.id.substring(0, 3) in dataCasDenoised && $("#denoised-data").prop( "checked") == true) {
                    var valeurDuJour = dataCasDenoised[this.id.substring(0, 3)][offset]
                } else {
                    //on récupère la valeur du jour pour le pays
                    var valeurDuJour = "NA";
                }
                break;
            case 'Death':
                if (this.id.substring(0, 3) in dataMorts && $("#denoised-data").prop( "checked") == false) {
                    //on récupère la valeur du jour pour le pays
                    var valeurDuJour = dataMorts[this.id.substring(0, 3)][offset];
                }else if (this.id.substring(0, 3) in dataMortsDenoised && $("#denoised-data").prop( "checked") == true) {
                    var valeurDuJour = dataMortsDenoised[this.id.substring(0, 3)][offset]
                } else {
                    //on récupère la valeur du jour pour le pays
                    var valeurDuJour = "NA";
                }
                break;
        }
        //On effectue ensuite les traitements en fonction de valeurDuJour
        if (valeurDuJour != "NA") {
            if (valeurDuJour >= 0) {
                (valeurDuJour > dataMax ? valeurDuJour = dataMax - (dataMax / (nbCaissons * 2)) : valeurDuJour); //Si la valeur du jour est supérieure au max de la légende, on ramène la valeur du jour pour qu'elle corresponde à notre caisson le plus élevé
                var couleurDuJour = processColor(valeurDuJour);
                var chaineCouleur = couleurDuJour;
                //On remplit le pays avec la couleur
                $('path[id^=' + this.id.substring(0, 3) + '-]').attr('fill', chaineCouleur);
            } else { //Si la valeur == 0 
                if ($("#coloration").val() == "Standard" || $("#coloration").val() == "Fast" || typeof valeurDuJour === 'undefined') { //Si on est en coloration standard ou que la valeurDuJour n'est pas définie
                    var chaineCouleur = 'rgb(211,211,211)';
                    //On colore le pays en gris
                    $('path[id^=' + this.id.substring(0, 3) + '-]').attr('fill', chaineCouleur);
                } else { //Si la valeur est anormale
                    //On colore le pays en gris
                    var chaineCouleur = 'rgb(142,68,173)';
                    $('path[id^=' + this.id.substring(0, 3) + '-]').attr('fill', chaineCouleur);
                }

            }
        } else { //Si valeurDuJour == "NA"
            var chaineCouleur = 'rgb(211,211,211)';
            //On colore le pays en gris
            $('path[id^=' + this.id.substring(0, 3) + '-]').attr('fill', chaineCouleur);
        }

    });
};

// TODO => GESTION POUR UN AUTRE SVG
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
            console.log($(this));
            return;
            document.getElementById(this.id).appendChild(txtElem);
        }
    });
}


// TODO: Init les options de l'utilisateur










//CHECK
function lockCountry(countryCode) {

    //Si on a deja un pays verouillé, on repasse ses frontières en noir
    if (lockedCountry != "") {
        $('path[id^=' + lockedCountry + '-]').attr("stroke", "rgb(0,0,0)");
        $('path[id^=' + lockedCountry + '-]').attr("stroke-width", "0.1");
    }

    //Si on a un nouveau code pays a vérouiller et qu'il est différent de l'ancien pays vérouillé, on met à jour le pays vérouillé et on change la couleur de ses frontières
    if (countryCode != "" && countryCode != lockedCountry) {
        lockedCountry = countryCode;
        $('path[id^=' + countryCode + '-]').attr("stroke", "rgb(25,184,254)");
        $('path[id^=' + countryCode + '-]').attr("stroke-width", "0.5");
    } else {
        lockedCountry = "";
    }
    majFixed();
};




//CHECK
function showTT(tooltip) {
    selectedCountry = tooltip; //Maj du pays selectionné
    majFixed(); //Maj des infos dans le tooltip fixe
    // document.getElementById(tooltip).setAttribute('visibility','visible'); //Avant, on affichait le tooltip du pays
};

//CHECK
function hideTT(tooltip) {
    selectedCountry = ""; //Suppression du pays selectionné
    majFixed(); //Maj des infos dans le tooltip fixe
    // document.getElementById(tooltip).setAttribute('visibility','hidden');//Avant, on cachait le tooltip du pays
};

//CHECK
function majFixed() {
    //Si on a un pays vérouillé, on utilise son tooltip
    if (lockedCountry != "") {
        $('#stats-pays option[value="'+lockedCountry+'"]').prop('selected', true);
        tooltip = lockedCountry + "-TT";
        //Sinon, si on a un pays survolé, on utilise son tooltip
    } else if (selectedCountry != "") {
        tooltip = selectedCountry;
    } else {
        tooltip = "";
    }

    //Si on a pas de pays survolé ou vérouillé, on remet à zero les valeurs du tooltip
    if (tooltip == "") {
        $("#Pays-fixed").text("");
        $("#Habs-fixed").text("");
        $("#RValue-fixed").text("");
        $("#Ncas-fixed").text("");
        $("#Morts-fixed").text("");
        $("#Confirmed-fixed").text("");
        //Si on a un de pays survolé ou vérouillé, on maj les valeurs du tooltip avec celle du pays en question
    } else {
        $("#Pays-fixed").text($("#" + tooltip).find("text:nth-child(1)").text().split(":")[0]);
        $("#Habs-fixed").text($("#" + tooltip).find("text:nth-child(1)").text().split(":")[1]);
        $("#RValue-fixed").text($("#" + tooltip).find("text:nth-child(2)").text());
        $("#Ncas-fixed").text($("#" + tooltip).find("text:nth-child(3)").text());
        $("#Morts-fixed").text($("#" + tooltip).find("text:nth-child(4)").text());
        $("#Confirmed-fixed").text($("#" + tooltip).find("text:nth-child(5)").text());
    }
};

//CHECK
function returnDateFormatted(offset) {
    offset = parseInt(offset);
    var today = new Date(firstDay);
    today.setDate(today.getDate() + offset);
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    today = dd + '/' + mm + '/' + yyyy;
    return today;
}

//CHECK
function returnDateFormattedEnglish(offset){
    offset = parseInt(offset);
    var today = new Date(firstDay);
    today.setDate(today.getDate() + offset);
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    return today;
}

//CHECK
function initiateColors(custom) {
    nbCaissons =  $(".legBox").length;
    //changement du texte de titre
    if ($("#coloration").val() == "Standard") {
        $("#txt-titre2").text("Taux de reproduction, estimation moins réactive");
    } else if ($("#coloration").val() == "Fast") {
        $("#txt-titre2").text("Taux de reproduction, estimation réactive");
    } else if ($("#coloration").val() == "Confirmed") {
        $("#txt-titre2").text("Nombre de cas confirmés pour 10000 habitants");
    } else if ($("#coloration").val() == "Death") {
        $("#txt-titre2").text("Nombre de décès pour 1 million d'habitants");
    }

    //modification du max de la légende
    if (custom) {
        dataMax = $("#customMax").val();
    } else {
        if ($("#coloration").val() == "Standard") {
            dataMax = 2;
        } else if ($("#coloration").val() == "Fast") {
            dataMax = 2;
        } else if ($("#coloration").val() == "Confirmed") {
            dataMax = 6;
        } else if ($("#coloration").val() == "Death") {
            dataMax = 10;
        }
    }

    var iLegText = 0;
    //récupération des couleurs de la légende
    $(".legText").each(function(index) {
        console.log(dataMax , iLegText , nbCaissons);
        iLegText++;
        $(this).text(String(dataMax * iLegText / nbCaissons).substring(0, 4));
        console.log($(this).text());
    });

    //initialisation du tableau de couleurs
    var iLegBox = 0;
    $(".legBox").each(function(index) {
        console.log($(this));
        iLegBox++;
        colors[iLegBox] = $(this).attr('fill');
    });

    //modification des textes de titre de la légende, du max de la légende et du champ de configuration
    $("#legTitle").text($("#coloration option:selected").text());
    $("#legMax").text(String(dataMax));
    $("#customMax").val(dataMax);
}

//CHECK
function processColor(valeurDuJour) {
    var couleurJour = parseInt((valeurDuJour / dataMax) * nbCaissons) + 1;
    return (colors[couleurJour]);
}



