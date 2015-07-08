/// For each model, the path to its X3D file, an image for the gallery and its Sevianno ID needs to be provided
/// We suggest using "getNewId.php". It is in the same folder as this file. Just open "getNewId.php" in your browser. 
///
/// Alternative:
/// The Sevianno ID can be derived via a REST client (Google Chrome for example provides an extension called "Advanced Rest Client"
/// In Firofox, the RESTClient add-on can be used.
/// Use the REST client to send a POST request to http://eiche.informatik.rwth-aachen.de:7075/annotations/objects with the following JSON payload: {"collection": "Objects3D"}
/// The "Content-Type" has to be set to "application/json".
/// This POST request creates a Sevianno object for the model and returns the objects ID (in a JSON object)
/// Insert the Sevianno ID as last entry in your model array.
///
/// PLEASE NOTE: Push your changes to "https://github.com/dost25/3Drepository"
var models = new Array( new Array("brainstem/Complete/Composite.x3d", "brainstem/preview.jpg", "12890"),
                        new Array("claw/2015-claw.x3d", "claw/preview.png", "12891"),
                        new Array("foot/Reduced_Textured/Reduced_Textured.x3d", "foot/preview.png", "12892"),
                        new Array("hand/HandMerge_poisson_10_9_reduced_uv_textured.x3d", "hand/preview.png", "12893"),
                        new Array("skull/Skull_Composite.x3d", "skull/preview.png", "12894"),
                        new Array("heart/heart.x3d", "heart/preview.png", "12895"),
                        new Array("pelvicbone/pelvicbone.x3d", "pelvicbone/preview.png", "12896"),
                        new Array("cologne/cologne.x3d", "cologne/preview.png", "12897"),
                        new Array("machine/machine.x3d", "machine/preview.png", "12898")
                      );					  
/// The currently selected row in annotationTable
var selectedRow;
/// The index of the currently selected annotation
var selectedAnnotationIndex;
/// All annotations currently loaded
var annotations;
// Whether FPS info (and others are currently shown or not
var isInfoShown = false;
/// The Sevianno object id of currently selected model
var seviannoId;

var ANNOTATIONS_COLLECTION = "TextTypeAnnotations";

var BASE_SERVICE_URL = 'http://eiche.informatik.rwth-aachen.de:7075/';
var ANNOTATION_SERVICE_URL = BASE_SERVICE_URL + 'annotations/annotations/';
var OBJECT_SERVICE_URL = BASE_SERVICE_URL + 'annotations/objects/';

// The show/hide info button
function showInfo() {
  document.getElementById("x3dViewer").runtime.statistics(!isInfoShown);
  var btn = document.getElementById("btnInfo");
  isInfoShown = !isInfoShown;
  if (isInfoShown === true) {
    btn.value = "Meshinfo off";
    btn.firstChild.data = "Meshinfo off";
  }
  else {
    btn.value = "Meshinfo on";
    btn.firstChild.data = "Meshinfo on";
  }
}

/**
 * Sends an ajax request to a RESTful service. JSON encoded payload can be sent.
 * @param {String} method GET, POST, PUT or DELETE
 * @param {String} url Target URL of request
 * @param {String} json_payload JSON encoded object
 * @param {int} retries The request will be sent again this often, if fails
 * @param {function} func Callback function upon success
 * @returns {undefined}
 */
function sendRequest(method, url, json_payload, retries, func) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open(method, url, true);
  xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xmlhttp.onreadystatechange = function() {
    if(xmlhttp.readyState === 4) {
      if (xmlhttp.status !== 200) {
        if (retries > 0) {
          sendRequest(method, url, json_payload, retries-1, func);
        }
      }
      else {
        func(xmlhttp.responseText);
        document.getElementById("ajax_loader").style.display = "none";
      }
    }
  };
  document.getElementById("ajax_loader").style.display = "inline";
  document.getElementById("debug_div").innerHTML = document.getElementById("debug_div").innerHTML + "<br>" + method + " " + url + " " + json_payload;
  xmlhttp.send(json_payload);
}

/**
 * Wraps all urls in a given text by an a-tag
 * @param {String} text Any input text
 * @returns {String} The same input text with all urls replaced
 */
function textLinksToHtml(text) {
  // Taken from http://stackoverflow.com/a/7705530
  var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  var output = text.replace(exp,"<a href=\"$1\">$1</a>"); 
  return output;
}

/**
 * Removes all a-tags from a given text.
 * @param {String} textWithHtml
 * @returns {String} The text without tags
 */
function htmlLinksToText(textWithHtml) {
  // Taken from http://stackoverflow.com/a/1499916
  var regex = /(<([^>]+)>)/ig;
  var output = textWithHtml.replace(regex, "");
  return output;
}

/**
 * Creates a callback which resets the previously selected row and select the new one
 * @param {int} index Index of row
 * @returns {Function} The callback
 */
function createRowSelectCallback(index){
  return function() {
    unselect();
    // Update the stored index. index - 1 because of the header row
    selectedAnnotationIndex = index - 1;
    // Add highlighting for new selected row
    selectedRow = document.getElementById("annotationTable").rows[index];
    selectedRow.style.background = "yellow";
    // Fill text field with selected rows text
    var textWithoutHtmlTags = htmlLinksToText(selectedRow.cells[1].innerHTML);
    document.getElementById("textEditAnnotation").value = textWithoutHtmlTags;
    enterSelectState();
  };
}

function unselect() {
    if (selectedAnnotationIndex !== undefined) {
      // Get the previously selected row. There is a header row in the table, so it is the annotation index + 1
      var selectedRow = document.getElementById("annotationTable").rows[selectedAnnotationIndex+1];
      // Remove old highlighting
      if (selectedRow !== undefined) {
        selectedRow.style.background = "white";
      }
      selectedAnnotationIndex = undefined;
    }
}

function enterSelectState() {
  if (document.getElementById("divAdd").className.indexOf("hide") === -1) {
    document.getElementById("divAdd").className += " hide";
  }
  var divEdit = document.getElementById("divEdit");
  divEdit.className = divEdit.className.replace( /(?:^|\s) hide(?!\S)/g , '' );
}

function enterAddState() {
  if (document.getElementById("divEdit").className.indexOf("hide") === -1) {
    document.getElementById("divEdit").className += " hide";
  }
  document.getElementById("divAdd").className =
    document.getElementById("divAdd").className.replace( /(?:^|\s) hide(?!\S)/g , '' );
  unselect();
}

/**
 * Creates images for all models in the gallery. Adds click event listeners to open model and read Sevianno annotations.
 * @returns {undefined}
 */
function createGallery() {
  var table = document.getElementById("gallery");
  // Display a gallery image for each model in "models"
  for (var i = 0; i < models.length; i++) {
    var galleryCell=table.rows[0].insertCell(i);
    galleryCell.file = models[i][0];
    galleryCell.innerHTML = "<img src=\"" + models[i][1] + "\" width=\"512\" height=\"512\" />";
    galleryCell.seviannoId = models[i][2];
  }
  
  //Every time the user clicks on a catalogue entry
  $(".gallery td").on("click", function() {
    var file = this.file;
    
    //Replace the x3d file in the context (if not already loaded)
    if(file !== $('#inlineBox').attr('url')) {
      loadFile(file, this.seviannoId);
    }
  });
}

function loadFile(file, id) {
  $('#inlineBox').attr('url', file);
  seviannoId = id;
  readAnnotations(seviannoId);
}

function addAnnotation() {
  createAnnotation();
}

/**
 * Creates a new Sevianno annotation for current Sevianno object ID (seviannoId)
 * @returns {undefined}
 */
function createAnnotation() {
  if (seviannoId !== undefined) {
    var data = new Object();
    data.collection = ANNOTATIONS_COLLECTION;
    data.text = textLinksToHtml(document.getElementById('textNewAnnotation').value);
    data.objectId = seviannoId;
    data.timestamp = Date.now();
    data.toolId = "Anatomy";
    var json_payload = JSON.stringify(data);

    sendRequest("POST", ANNOTATION_SERVICE_URL, json_payload, 2, function(answer) {
      readAnnotations(data.objectId);
      document.getElementById("debug_div").innerHTML = document.getElementById("debug_div").innerHTML + "<br>" + "RETURN " + answer;
    });
  }
}


/**
 * Changes  a Sevianno annotation to the text value specified in textEditAnnotation
 * @returns {undefined}
 */
function editAnnotation() {
  if (selectedAnnotationIndex !== undefined) {
    var data = new Object();
    data.text = textLinksToHtml(document.getElementById('textEditAnnotation').value);
    data.timestamp = Date.now();
    // The id of the annotation where changes should be stored
    var annotationId = annotations[selectedAnnotationIndex].annotation.id;
    var json_payload = JSON.stringify(data);
    
    sendRequest("PUT", OBJECT_SERVICE_URL + annotationId, json_payload, 2, function(answer) {
      readAnnotations(seviannoId);
      document.getElementById("debug_div").innerHTML = document.getElementById("debug_div").innerHTML + "<br>" + "RETURN " + answer;
    });
  }
}

/**
 * Reads all Sevianno annotations for given Sevianno object ID
 * @param {String} objectId The ID of the Sevianno object, whose annotations are to be read
 * @returns {undefined}
 */
function readAnnotations(objectId) { 
  sendRequest("GET", OBJECT_SERVICE_URL + objectId + '/annotations', null, 2, function(answer) {
    var answerParsed = JSON.parse(answer);
    var table = document.getElementById("annotationTable");
    annotations = answerParsed.annotations;
    // Clear displayed annotations
    // Keep the first (header) row
    for(var i = document.getElementById("annotationTable").rows.length; i > 1;i--) {
      document.getElementById("annotationTable").deleteRow(i -1);
    }
    // Display time and text of all annotations
    for (var i = 0; i < annotations.length; i++) {
      var annotation = annotations[i].annotation;
      var timeFromDB = annotation.annotationData.timestamp;
      var timestamp = new Date(timeFromDB);
      var text = annotation.text;
      var rowCount=table.rows.length;
      var row=table.insertRow(rowCount);
      var timeCell=row.insertCell(0);
      var textCell=row.insertCell(1);
      textCell.innerHTML = text;
      timeCell.innerHTML = timestamp.toLocaleString();
      //timeCell.className += " time_column";
    }
    // Add select handler for each row
    for (var i = 1; i < table.rows.length; i++) {
      table.rows[i].addEventListener("click", createRowSelectCallback(i));
    }
    document.getElementById("debug_div").innerHTML = document.getElementById("debug_div").innerHTML + "<br>" + "RETURN " + answer;
  });
  document.getElementById("textNewAnnotation").value = "";
  document.getElementById("textEditAnnotation").value = "";
  enterAddState();
}

/**
 * Delete the currently selected Sevianno annotation
 * @returns {undefined}
 */
function deleteAnnotation() {
  if (selectedAnnotationIndex !== undefined) {
    // The id of the annotation which should be deleted
    var annotationId = annotations[selectedAnnotationIndex].annotation.id;
    
    sendRequest("DELETE", OBJECT_SERVICE_URL + annotationId, null, 2, function(answer) {
      readAnnotations(seviannoId);
      document.getElementById("debug_div").innerHTML = document.getElementById("debug_div").innerHTML + "<br>" + "RETURN " + answer;
    });
    
    selectedAnnotationIndex = undefined;
  }
}

// Add all event listeners
document.getElementById("btnAddAnnotation").onclick = addAnnotation;
document.getElementById("btnEditAnnotation").onclick = editAnnotation;
document.getElementById("btnDeleteAnnotation").onclick = deleteAnnotation;
document.getElementById("btnCancelEdit").onclick = enterAddState;
document.getElementById("btnInfo").onclick = showInfo;
document.addEventListener('DOMContentLoaded', createGallery(), false);
document.addEventListener('DOMContentLoaded', loadFile(models[0][0], models[0][2]), false);

// Make the full model visible when it is loaded
document.getElementById("inlineBox").onload = function() {
  var runtime = document.getElementById("x3dViewer").runtime;
  runtime.showAll();
};

