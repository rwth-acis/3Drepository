<!DOCTYPE html>
<html>
<head></head>
<body>
	<button id="btn" type="button">Click Me!</button> 
	<span id="output")> Id </span>
	<script>
		document.getElementById("btn").onclick=newId;
		function newId() {
			sendRequest('POST', 'http://eiche.informatik.rwth-aachen.de:7075/annotations/objects', '{"collection": "Objects3D", "toolId": "Anatomy"}', 1, output);
		}
		function output(text) {
			document.getElementById("output").innerHTML = text;
		}
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
			  }
			}
		  };
		  xmlhttp.send(json_payload);
		}
	</script>
</body>
</html>
