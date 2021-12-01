var dataFull = {};
var dataConfirmed = {};
var firstDay = "03/19/2020";
var daysPast;
var dataMax = 2;
var dataMin = 0;
var corresPays = {};
var couleurDepart=[138, 197, 0];
var couleurFin= [255, 0, 0];
var pythaDep = 0;
var pythaFin = 0;
var tim;
var nbCaissons = $(".legBox").length;
var colors = {};
$(function() {
    //Chargement des noms de pays
    $.get("data/France", function (data) {
        //transformation en tableau, suppression du header et création du dictionnaire de correspondance entre nom complet / 3 lettres  (corresPays)
        data = $.csv.toArrays(data);
        daysPast = data[0].length - 2;
        data.forEach(element => dataFull[element.shift()] = element.map(function(v) {return parseFloat(v, 10);}));

        initiateColors(false);

        $.get("data/Infections", function (data) {
            data = $.csv.toArrays(data);
            daysPast = data[0].length - 2;
            data.forEach(element => dataConfirmed[element.shift()] = element.map(function(v) {return parseFloat(v, 10);}));
            
            $("#slider").append('<input type="range" id="dateRange" name="dateRange" step="1" min="0" max="'+daysPast+'" value="'+daysPast+'" style="width:20%;">  <label id="selectedDate" for="dateRange"></label>');
            
            initiateSvg();
            changeSliderDateLabel(returnDateFormatted(daysPast));
            majData($("#dateRange").val());
            majCouleurs($("#dateRange").val());               
        });
        
    });


});


$("#first").click( function(e) {
    $("#dateRange").val(1);
    var selectedDate = $("#dateRange").val();
    changeSliderDateLabel(returnDateFormatted(selectedDate));
    majData(selectedDate);
    majCouleurs(selectedDate);
});

$("#downDate").click( function(e) {
    $("#dateRange").val($("#dateRange").val() - $("#pas").val());
    var selectedDate = $("#dateRange").val();
    changeSliderDateLabel(returnDateFormatted(selectedDate));
    majData(selectedDate);
    majCouleurs(selectedDate);
});

$("#pause").click( function(e) {
    $("#first").prop( "disabled", false );
    $("#downDate").prop( "disabled", false );
    $("#pause").prop( "disabled", true );
    $("#play").prop( "disabled", false );
    $("#upDate").prop( "disabled", false );
    $("#last").prop( "disabled", false );
    $("#pas").prop( "disabled", false );
    clearInterval(tim);
});

$("#play").click( function(e) {
    $("#first").prop( "disabled", true );
    $("#downDate").prop( "disabled", true );
    $("#pause").prop( "disabled", false );
    $("#play").prop( "disabled", true );
    $("#upDate").prop( "disabled", true );
    $("#last").prop( "disabled", true );
    $("#pas").prop( "disabled", true );

    tim = setInterval(function(e) {
        $("#dateRange").val(parseInt($("#dateRange").val()) + parseInt($("#pas").val()));
        var selectedDate = $("#dateRange").val();
        changeSliderDateLabel(returnDateFormatted(selectedDate));
        majData(selectedDate);
        majCouleurs(selectedDate);
    },$("#vitesse").val());
});

$("#upDate").click( function(e) {
    $("#dateRange").val(parseInt($("#dateRange").val()) + parseInt($("#pas").val()));
    var selectedDate = $("#dateRange").val();
    changeSliderDateLabel(returnDateFormatted(selectedDate));
    majData(selectedDate);
    majCouleurs(selectedDate);
});

$("#last").click( function(e) {
    $("#dateRange").val(daysPast);
    var selectedDate = $("#dateRange").val();
    changeSliderDateLabel(returnDateFormatted(selectedDate));
    majData(selectedDate);
    majCouleurs(selectedDate);
});

$("#coloration").change( function(e) {
    var selectedDate = $("#dateRange").val();
    initiateColors(false);
    majData(selectedDate);
    majCouleurs(selectedDate);
});

$("#customMax").change( function(e) {
    var selectedDate = $("#dateRange").val();
    initiateColors(true);
    majData(selectedDate);
    majCouleurs(selectedDate);
});

$("#slider").change( function(e) {
    var selectedDate = $("#dateRange").val();
    changeSliderDateLabel(returnDateFormatted(selectedDate));
    majData(selectedDate);
    majCouleurs(selectedDate);
});

function changeSliderDateLabel(val){
    $("#selectedDate").text(val);
    $("#textDate").text(val);
}

function returnDateFormatted(offset) {
    offset = parseInt(offset); 
    var today = new Date(firstDay);
    // console.log(today);
    today.setDate(today.getDate() + offset);
    // console.log(today);
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();

    today = dd + '/' + mm + '/' + yyyy;
    // console.log(today);
    return today;
}

function initiateColors(custom){
    if ($("#coloration").val() == "Standard") {
            $("#txt-titre2").text("Taux de reproduction estimé R(T)");
        }else if($("#coloration").val() == "Fast"){
            $("#txt-titre2").text("Taux de reproduction, estimation réactive");
        }else if ($("#coloration").val() == "Confirmed"){
            $("#txt-titre2").text("Nombre de cas confirmés pour 10000 habitants");
        }else if ($("#coloration").val() == "Death"){
            $("#txt-titre2").text("Nombre de décès pour 1 million d'habitants");
    }
    
    if (custom) {
        dataMax = $("#customMax").val();
    }else{
        if ($("#coloration").val() == "Standard") {
            dataMax = 2;
        }else if($("#coloration").val() == "Fast"){
            dataMax = 2;
        }else if ($("#coloration").val() == "Confirmed"){
            dataMax = 200;
        }else if ($("#coloration").val() == "Death"){
            dataMax = 10;
        }
    }
    var iLegText = 0;
    
    $( ".legText" ).each(function( index ) {
        iLegText++;
        $( this ).text(String(dataMax*iLegText/nbCaissons).substring(0,4));
    });

    var iLegBox = 0;
    $( ".legBox" ).each(function( index ) {
        iLegBox++;
        colors[iLegBox]=$(this).attr('fill');
    });

    $("#legTitle").text($("#coloration option:selected").text());
    $("#legMax").text(String(dataMax));
    $("#customMax").val(dataMax);
}

function initiateSvg(){
    //Faire des choses sur le SVG
    $("g[id$=-TT]").each(function( index ) {
    //     // console.log(dataFull[this.id.substring(0,3)]);
        var txtElem = document.createElementNS("http://www.w3.org/2000/svg", "text");
        txtElem.setAttributeNS(null,"x",$(this).find("text:nth-child(2)").prop("x").animVal[0].valueAsString);
        txtElem.setAttributeNS(null,"y",parseFloat($(this).find("text:nth-child(2)").prop("y").animVal[0].valueAsString) + 50);
        txtElem.setAttributeNS(null,"style","font-size:50px; font-family:Helvetica");
        txtElem.setAttributeNS(null,"text","TMPTEXT");
        document.getElementById(this.id).appendChild(txtElem);
        
    //     // var SVGRect = document.getElementById(this.id).getBBox();
    //     // var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    //     // rect.setAttribute("x", SVGRect.x - 1);
    //     // rect.setAttribute("y", SVGRect.y - 1 );
    //     // rect.setAttribute("width", SVGRect.width + 2);
    //     // rect.setAttribute("height", SVGRect.height + 6);
    //     // rect.setAttribute("fill", "white");
    //     // document.getElementById(this.id).appendChild(rect);

    });        
}

function majData(offset){
    // offset = parseInt(offset) - 1;
    // console.log(offset);
    $("g[id$=-TT]").each(function( index ) {
        if (this.id.substring(1,3) in dataFull) {
            // console.log(dataFull[this.id.substring(0,3)]);
            if (dataFull[this.id.substring(1,3)][offset]==-1){
                $(this).find("text:nth-child(2)").text("No data");
            }else{
                $(this).find("text:nth-child(2)").text("R : " + dataFull[this.id.substring(1,3)][offset]);    
            }
        }else{
            $(this).find("text:nth-child(2)").text("No data");
        }
        
        if (this.id.substring(1,3) in dataConfirmed) {
            $(this).find("text:nth-child(3)").text("Nouveaux cas: " + dataConfirmed[this.id.substring(1,3)][offset]);    
        }else{
            $(this).find("text:nth-child(3)").text("Nouveaux cas: Pas de données");
        }
    });
};

function majCouleurs(offset){
    // offset = parseInt(offset) - 1;
    $("g[id$=-TT]").each(function( index ) {
        console.log($("#coloration").val());
        switch ($("#coloration").val()) {
            case 'Standard':
                if (this.id.substring(1,3) in dataFull) {
                    var valeurDuJour = dataFull[this.id.substring(1,3)][offset];
                }else{
                    var valeurDuJour = "NA";
                }
                break;
            case 'Confirmed':
                if (this.id.substring(1,3) in dataConfirmed) {
                    var valeurDuJour = dataConfirmed[this.id.substring(1,3)][offset];
                }else{
                    var valeurDuJour = "NA";
                }                    
                break;
        }
        console.log(valeurDuJour);
        if (valeurDuJour != "NA") {
            if (valeurDuJour >= 0) {
                (valeurDuJour>dataMax?valeurDuJour=dataMax-(dataMax/(nbCaissons*2)):valeurDuJour);
                var couleurDuJour = processColor(valeurDuJour);
                var chaineCouleur = couleurDuJour;
                $('path[id=D'+this.id.substring(1,3)+']').attr('fill',chaineCouleur );    
            }else{
                if ($("#coloration").val() == "Standard" || $("#coloration").val() == "Fast" || typeof valeurDuJour === 'undefined' ) {
                    var chaineCouleur = 'rgb(211,211,211)';
                    $('path[id=D'+this.id.substring(1,3)+']').attr('fill',chaineCouleur );
                }else{
                    var chaineCouleur = 'rgb(142,68,173)';
                    $('path[id=D'+this.id.substring(1,3)+']').attr('fill',chaineCouleur );
                    // $('path[id^='+this.id.substring(0,3)+'-]').css({ fill: chaineCouleur }); 
                }
                
            }
        }else{
            // console.log("Nope:" + this.id.substring(0,3));
            var chaineCouleur = 'rgb(211,211,211)';
            $('path[id^='+this.id.substring(0,3)+'-]').attr('fill',chaineCouleur );
            // $('path[id^='+this.id.substring(0,3)+'-]').css({ fill: chaineCouleur });
        }
        
    });
};

function processColor(valeurDuJour){
    var couleurJour =  parseInt((valeurDuJour / dataMax)*nbCaissons) + 1;
    return(colors[couleurJour]); 
    // var lambda = (valeurDuJour-dataMin)/(dataMax-dataMin);
    // // console.log(lambda);
    // var couleurInterm = [];
    // var pythaLocal = 0;

    // for (let i = 0; i < couleurDepart.length; i++) {
    //     couleurInterm[i] = (lambda * (couleurFin[i]) + (1 - lambda) * couleurDepart[i]);
    //     pythaLocal += couleurInterm[i] * couleurInterm[i]; 
    // }

    // var pythaInterpole = (lambda * pythaFin) + (1 - lambda) * pythaDep;
    // var coeffCouleur = Math.sqrt(pythaInterpole / pythaLocal)
    
    // for (let i = 0; i < couleurDepart.length; i++) {
    //     couleurInterm[i] = (lambda * (couleurFin[i] * coeffCouleur) + (1 - lambda) * couleurDepart[i]);
    // }
    // return(colors[couleurJour]);    
}
