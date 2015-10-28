# 3Drepository

### What is the purpose of 3Drepository?
3Drepository is a website where one can view all models we scanned for the [Anatomy2.0 website](http://dbis.rwth-aachen.de/3dnrt). One can also add annotations to each of the models. This way, we can store information about our models at a dedicated place and we can keep track on what has to be improved about our model scans.

### What concrete features does 3Drepository provide?`
- Showing a gallery of all available models
- Selecting a model loads its 3D representation in a viewer and displays all of its annotations
- The 3D representation of a model can be navigated
- Annotaions for models can be created, updated and deleted

### How is 3Drepository implemented?
3Drepository uses [x3dom](http://www.x3dom.org/) as a viewer for our 3D models. A service called Sevianno is used to store annotations. Sevianno can be found on [github](https://github.com/learning-layers/sevianno) and is documented at [Sevianno documentation TODO](). Sevianno has a RESTful API to create, read, update and delete annotations.

### I scanned a new model! How to add it to 3Drepository?
3Drepository does not provide a sophisticated model management. Therefore, adding a model requires the following steps:
- Create a folder for your model at `sftp://3dnrt@eiche.informatik.rwth-aachen.de` in the `3Drepository` folder
- Open [getNewId](http://dbis.rwth-aachen.de/3dnrt/3Drepository/getNewId.php) and click at the [Click Me!] button. Copy the ID you receive.
- Open `annotations.js` in a code editor and add a new line to the `models` array
```
var models = new Array(
                        ...
                        new Array("<path to x3d file>", "<path to preview image>", "<the ID you copied>")
                      );					  
```
- Example
```
var models = new Array(
                        ...
                        new Array("machine/machine.x3d", "machine/preview.png", "12898")
                      );					  
```
- Push your changes to this github repository
- Deploy the new version of `annotation.js` at [3Drepository](http://dbis.rwth-aachen.de/3dnrt/3Drepository/)

### How does the 3Drepository use Sevianno (in more detail)?
3Drepository uses the REST API of Sevianno to create, read, update and delete annotations. This is implemented in the methods `createAnnotation()`, `editAnnotation()`, `readAnnotations(objectId)` and `deleteAnnotation()`. There is a helper function `sendRequest(method, url, json_payload, retries, func)`to send JSON encoded data to the Sevianno service. `sendRequest()` allows registering a callback function. The callback will typically read response JSON data and update the frontend accordingly. The URLs for the different Sevianno features (like create annotation) are all stored in global variables like `BASE_SERVICE_URL`. For detailed information on which service request type (GET, POST, PUT, ..) and which JSON payload has to be send to which URL, please refer to the [Sevianno documentation TODO]().