
var canvas = document.getElementById("renderCanvas");
var ARbtn=document.getElementById("ARbtn");


var startRenderLoop = function (engine, canvas) {
    engine.runRenderLoop(function () {
        if (sceneToRender && sceneToRender.activeCamera) {
            sceneToRender.render();
        }
    });
}

var engine = null;
var scene = null;
var sceneToRender = null;
var isplaced=true;
var createDefaultEngine = function() { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true,  disableWebGL2Support: false}); };
/**
 * WebXR ar demo using hit-test, anchors, and plane detection.
 *
 * Every press on the screen will add a figure in the requested position (if the ring is displayed). Those meshes will be kept in place by the AR system you are using.
 *
 * Working (at the moment) on android devices and the latest chrome.
 *
 * Created by Raanan Weber (@RaananW)
 */

var createScene = async function () {
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);

    // This creates and positions a free camera (non-mesh)
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 1, -5), scene);

    // This targets the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;

    var dirLight = new BABYLON.DirectionalLight('light', new BABYLON.Vector3(0, -1, -0.5), scene);
    dirLight.position = new BABYLON.Vector3(0, 5, -5);

    var shadowGenerator = new BABYLON.ShadowGenerator(1024, dirLight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;

    //adding plane in place of model

    var planeOpts = {
    height:2.1,
    width:1.1,
    sideOrientation: BABYLON.Mesh.DOUBLESIDE
};
var ANote0Video = BABYLON.MeshBuilder.CreatePlane("plane", planeOpts, scene);
ANote0Video.setPivotPoint(new BABYLON.Vector3(0, -0.9, 0));
//var vidPos = (new BABYLON.Vector3(0,0,0.1));
//ANote0Video.position = vidPos;
var ANote0VideoMat = new BABYLON.StandardMaterial("m", scene);
var ANote0VideoVidTex = new BABYLON.VideoTexture("vidtex","https://anandp803.github.io/VideoURL/AR%20Rahman%20alpha_Vp8_vorbis.webm", scene,false);
ANote0VideoMat.diffuseTexture = ANote0VideoVidTex;
ANote0VideoVidTex.hasAlpha=true;
ANote0VideoVidTex.video.muted=true;
ANote0VideoVidTex.video.autoplay=false;

ANote0VideoMat.roughness = 1;
ANote0VideoMat.emissiveColor = new BABYLON.Color3.White();
ANote0Video.material = ANote0VideoMat;

//  // GUI
 var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
var isPlayingvideo=false;
 var AbtnInsideAR = BABYLON.GUI.Button.CreateSimpleButton("but1", "Play");
 AbtnInsideAR.width = "250px"
 AbtnInsideAR.height = "100px";
 AbtnInsideAR.left = "0px";
 AbtnInsideAR.top = "800px"; 
 AbtnInsideAR.color = "white";
 AbtnInsideAR.children[0].color = "black";
 AbtnInsideAR.children[0].fontSize = 50;
 AbtnInsideAR.color = "#FF7979";
 AbtnInsideAR.background = "white";
 AbtnInsideAR.isVisible=false;

AbtnInsideAR.onPointerClickObservable.add(() => {
    if(isplaced==false)
    {
        if (ANote0VideoVidTex.video.paused) {
        ANote0VideoVidTex.video.play();
        AbtnInsideAR.textBlock.text = "Play";
        ANote0VideoVidTex.video.muted = false; // Unmute on play
        }else{
            ANote0VideoVidTex.video.pause();
        AbtnInsideAR.textBlock.text = "Pause";
        ANote0VideoVidTex.video.muted = true;
        }
    }
  });

 advancedTexture.addControl(AbtnInsideAR);

 ARbtn.addEventListener("click" ,function(){
    var AR=document.querySelector(".babylonVRicon");
    AR.click();    
});


    //const model = await BABYLON.SceneLoader.ImportMeshAsync("", "./scenes/", "dummy3.babylon", scene);

    const supported = await navigator.xr.isSessionSupported('immersive-ar');
        if (supported) {
        // 'immersive-vr' sessions may be supported.
        // Page should advertise support to the user.
            console.log("WebXR is supported");
        } else {
        // 'immersive-vr' sessions are not supported.
        console.log("WebXR is not supported");            
        }   

    var xr = await scene.createDefaultXRExperienceAsync({
        uiOptions: {
            sessionMode: "immersive-ar",
            //referenceSpaceType: "local-floor"
        },
        optionalFeatures: ["hit-test", "anchors"]
    });

    const fm = xr.baseExperience.featuresManager;

    const xrTest = fm.enableFeature(BABYLON.WebXRHitTest.Name, "latest");
    //const xrPlanes = fm.enableFeature(BABYLON.WebXRPlaneDetector.Name, "latest");
    const anchors = fm.enableFeature(BABYLON.WebXRAnchorSystem.Name, 'latest');    
   

    const xrBackgroundRemover = fm.enableFeature(BABYLON.WebXRBackgroundRemover.Name);
    
    let b = ANote0Video;
    b.rotationQuaternion = new BABYLON.Quaternion();


    b.isVisible = false;
    shadowGenerator.addShadowCaster(b, true);

    const marker = BABYLON.MeshBuilder.CreateTorus('marker', { diameter: 0.15, thickness: 0.005 });
    marker.isVisible = false;
    marker.rotationQuaternion = new BABYLON.Quaternion();
   

    let hitTest;

    b.isVisible = false;

    xrTest.onHitTestResultObservable.add((results) => {
        if (results.length) {
            if(isplaced){
            marker.isVisible = true;
            }
            hitTest = results[0];            
            hitTest.transformationMatrix.decompose(undefined, b.rotationQuaternion, b.position);
            hitTest.transformationMatrix.decompose(undefined, marker.rotationQuaternion, marker.position);
        } else {
            marker.isVisible = false;
            hitTest = undefined;
        }
    });

    anchors.onAnchorAddedObservable.add((anchor) => {
        // ... do what you want with the anchor after it was added

      });

    const mat1 = new BABYLON.StandardMaterial('1', scene);
    mat1.diffuseColor = BABYLON.Color3.Red();
    const mat2 = new BABYLON.StandardMaterial('1', scene);
    mat2.diffuseColor = BABYLON.Color3.Blue();

    if (anchors) {
        console.log('anchors attached');
        anchors.onAnchorAddedObservable.add(anchor => {
            console.log('attaching', anchor);
            b.isVisible = true;
            anchor.attachedNode = b.clone("mensch");           
            shadowGenerator.addShadowCaster(anchor.attachedNode, true);           
            b.isVisible = false;
        })

        anchors.onAnchorRemovedObservable.add(anchor => {
            console.log('disposing', anchor);
            if (anchor) {
                anchor.attachedNode.isVisible = false;
                anchor.attachedNode.dispose();
                AbtnInsideAR.isVisible=false;
            }
        });
    }

    scene.onPointerDown = (evt, pickInfo) => {
        if (hitTest && isplaced && anchors && xr.baseExperience.state === BABYLON.WebXRState.IN_XR) {
            isplaced=false;
            marker.isVisible = false;
            anchors.addAnchorPointUsingHitTestResultAsync(hitTest);
        }
    }

    // xr.baseExperience.onStateChangedObservable.add((state) => {
    //     switch (state) {
    //         case BABYLON.WebXRState.IN_XR:
    //             // XR is initialized and already submitted one frame
    //             console.log("INXR");
    //         case BABYLON.WebXRState.ENTERING_XR:
    //             // xr is being initialized, enter XR request was made
    //             console.log("ENTERING_XR");
    //         case BABYLON.WebXRState.EXITING_XR:
    //             // xr exit request was made. not yet done.
    //             AbtnInsideAR.isVisible=false;
    //             console.log("EXITING_XR");

    //         case BABYLON.WebXRState.NOT_IN_XR:
    //             // self explanatory - either out or not yet in XR
    //             console.log("NOT_IN_XR");

    //     }
    // })

    //const planes = [];

    // xrPlanes.onPlaneAddedObservable.add(plane => {
    //     plane.polygonDefinition.push(plane.polygonDefinition[0]);
    //     var polygon_triangulation = new BABYLON.PolygonMeshBuilder("name", plane.polygonDefinition.map((p) => new BABYLON.Vector2(p.x, p.z)), scene);
    //     var polygon = polygon_triangulation.build(false, 0.01);
    //     plane.mesh = polygon; //BABYLON.TubeBuilder.CreateTube("tube", { path: plane.polygonDefinition, radius: 0.02, sideOrientation: BABYLON.Mesh.FRONTSIDE, updatable: true }, scene);
    //     //}
    //     planes[plane.id] = (plane.mesh);
    //     const mat = new BABYLON.StandardMaterial("mat", scene);
    //     mat.alpha = 0.1;
    //     mat.diffuseColor = BABYLON.Color3.Random();
    //     polygon.createNormals();
    //     polygon.receiveShadows = true;
    //     plane.mesh.material = mat;

    //     plane.mesh.rotationQuaternion = new BABYLON.Quaternion();
    //     plane.transformationMatrix.decompose(plane.mesh.scaling, plane.mesh.rotationQuaternion, plane.mesh.position);
    // });

    // xrPlanes.onPlaneUpdatedObservable.add(plane => {
    //     let mat;
    //     if (plane.mesh) {
    //         mat = plane.mesh.material;
    //         plane.mesh.dispose(false, false);
    //     }
    //     const some = plane.polygonDefinition.some(p => !p);
    //     if (some) {
    //         return;
    //     }
    //     plane.polygonDefinition.push(plane.polygonDefinition[0]);
    //     var polygon_triangulation = new BABYLON.PolygonMeshBuilder("name", plane.polygonDefinition.map((p) => new BABYLON.Vector2(p.x, p.z)), scene);
    //     var polygon = polygon_triangulation.build(false, 0.01);
    //     polygon.createNormals();
    //     plane.mesh = polygon;// BABYLON.TubeBuilder.CreateTube("tube", { path: plane.polygonDefinition, radius: 0.02, sideOrientation: BABYLON.Mesh.FRONTSIDE, updatable: true }, scene);
    //     //}
    //     planes[plane.id] = (plane.mesh);
    //     plane.mesh.material = mat;
    //     plane.mesh.rotationQuaternion = new BABYLON.Quaternion();
    //     plane.transformationMatrix.decompose(plane.mesh.scaling, plane.mesh.rotationQuaternion, plane.mesh.position);
    //     plane.mesh.receiveShadows = true;
    // })

    // xrPlanes.onPlaneRemovedObservable.add(plane => {
    //     if (plane && planes[plane.id]) {
    //         planes[plane.id].dispose();
    //         console.log("onPlaneRemovedObservable")

    //     }
    // })

    xr.baseExperience.sessionManager.onXRSessionInit.add(() => {
        // planes.forEach(plane => plane.dispose());
        // while (planes.pop()) { };
        AbtnInsideAR.isVisible=true;      
        marker.isVisible = true;
        console.log("xr.baseExperience.sessionManager.onXRSessionInit.add(()")
    });

    xr.baseExperience.sessionManager.onXRSessionEnded.add(() => {
        console.log("exit");
        AbtnInsideAR.isVisible=false;
        ANote0VideoVidTex.video.pause();
        AbtnInsideAR.textBlock.text = "Pause";
        ANote0VideoVidTex.video.muted = true;
        isplaced=true;
        AbtnInsideAR.textBlock.text = "Play";
    })

    return scene;

};
        window.initFunction = async function() {



            var asyncEngineCreation = async function() {
                try {
                return createDefaultEngine();
                } catch(e) {
                console.log("the available createEngine function failed. Creating the default engine instead");
                return createDefaultEngine();
                }
            }

            window.engine = await asyncEngineCreation();
if (!engine) throw 'engine should not be null.';
startRenderLoop(engine, canvas);
window.scene = createScene();};
initFunction().then(() => {scene.then(returnedScene => { sceneToRender = returnedScene; });

});

// Resize
window.addEventListener("resize", function () {
    engine.resize();
});

// Add an event listener for the browser back event
window.addEventListener("popstate", function(event) {
    // Reload the previous scene
    scene.dispose();
    console.log("Back button pressed!");
    AbtnInsideAR.isVisible=false;
  });

  window.onpopstate = function(event) {
    // User likely used the browser back button (or similar navigation)
    console.log("Back button pressed!");
    AbtnInsideAR.isVisible=false;
    // Your custom back navigation logic here
};
