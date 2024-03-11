
var canvas = document.getElementById("renderCanvas");

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
    height: 4.5, 
    width: 2.2, 
    sideOrientation: BABYLON.Mesh.DOUBLESIDE
};
var ANote0Video = BABYLON.MeshBuilder.CreatePlane("plane", planeOpts, scene);        
var vidPos = (new BABYLON.Vector3(0,0,0.1));
ANote0Video.position = vidPos;
var ANote0VideoMat = new BABYLON.StandardMaterial("m", scene);
var ANote0VideoVidTex = new BABYLON.VideoTexture("vidtex","https://anandp803.github.io/VideoURL/AR%20Rahman%20alpha_Vp8_vorbis.webm", scene);
ANote0VideoMat.diffuseTexture = ANote0VideoVidTex;
ANote0VideoVidTex.hasAlpha=true;
ANote0VideoVidTex.video.muted=false;        
ANote0VideoMat.roughness = 1;	
ANote0VideoMat.emissiveColor = new BABYLON.Color3.White();
ANote0Video.material = ANote0VideoMat;
scene.onPointerDown = function () {
    videoTexture.video.play();
    scene.onPointerDown = null;
};
scene.onPointerObservable.add(function(evt){
        if(evt.pickInfo.pickedMesh === ANote0Video){
            console.log("picked");
                if(ANote0VideoVidTex.video.paused)
                    ANote0VideoVidTex.video.play();
                else
                    ANote0VideoVidTex.video.pause();
                console.log(ANote0VideoVidTex.video.paused?"paused":"playing");
        }
}, BABYLON.PointerEventTypes.POINTERPICK);
//console.log(ANote0Video);

//srtting Audio

// var context = new AudioContext;
// console.log(context)

// var gainNode = context.createGain();
// console.log(gainNode)

// var v1_src = context.createMediaElementSource(ANote0VideoVidTex.video)
// console.log(v1_src.mediaElement)

// gainNode.connect(context.destination);



// let lowPassFilterNode = context.createBiquadFilter();
// lowPassFilterNode.type = "lowpass";
// lowPassFilterNode.frequency.value = 1200;
// lowPassFilterNode.gain.value = 1;

// v1_src.connect(lowPassFilterNode);
// lowPassFilterNode.connect(gainNode);

//end here

    //const model = await BABYLON.SceneLoader.ImportMeshAsync("", "./scenes/", "dummy3.babylon", scene);

    var xr = await scene.createDefaultXRExperienceAsync({
        uiOptions: {
            sessionMode: "immersive-ar",
            referenceSpaceType: "local-floor"
        },
        optionalFeatures: true
    });

    const fm = xr.baseExperience.featuresManager;

    const xrTest = fm.enableFeature(BABYLON.WebXRHitTest.Name, "latest");
    const xrPlanes = fm.enableFeature(BABYLON.WebXRPlaneDetector.Name, "latest");
    const anchors = fm.enableFeature(BABYLON.WebXRAnchorSystem.Name, 'latest');

    const xrBackgroundRemover = fm.enableFeature(BABYLON.WebXRBackgroundRemover.Name);

    //let b = model.meshes[0];//BABYLON.CylinderBuilder.CreateCylinder('cylinder', { diameterBottom: 0.2, diameterTop: 0.4, height: 0.5 });
    let b = ANote0Video;
    b.rotationQuaternion = new BABYLON.Quaternion();            
    // b.isVisible = false;
    shadowGenerator.addShadowCaster(b, true);

    const marker = BABYLON.MeshBuilder.CreateTorus('marker', { diameter: 0.15, thickness: 0.05 });
    marker.isVisible = false;
    marker.rotationQuaternion = new BABYLON.Quaternion();

   // var skeleton = model.skeletons[0];

    // ROBOT
    // skeleton.animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
    // skeleton.animationPropertiesOverride.enableBlending = true;
    // skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
    // skeleton.animationPropertiesOverride.loopMode = 1;

    // var idleRange = skeleton.getAnimationRange("YBot_Idle");
    // var walkRange = skeleton.getAnimationRange("YBot_Walk");
    // var runRange = skeleton.getAnimationRange("YBot_Run");
    // var leftRange = skeleton.getAnimationRange("YBot_LeftStrafeWalk");
    // var rightRange = skeleton.getAnimationRange("YBot_RightStrafeWalk");
    // scene.beginAnimation(skeleton, idleRange.from, idleRange.to, true);

    let hitTest;

    b.isVisible = false;

    xrTest.onHitTestResultObservable.add((results) => {
        if (results.length) {
            marker.isVisible = true;
            hitTest = results[0];                    
            hitTest.transformationMatrix.decompose(undefined, b.rotationQuaternion, b.position);
            hitTest.transformationMatrix.decompose(undefined, marker.rotationQuaternion, marker.position);
        } else {
            marker.isVisible = false;
            hitTest = undefined;
        }
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
            //anchor.attachedNode.skeleton = skeleton.clone('skelet');
            shadowGenerator.addShadowCaster(anchor.attachedNode, true);
            //scene.beginAnimation(anchor.attachedNode.skeleton, idleRange.from, idleRange.to, true);
            b.isVisible = false;
        })

        anchors.onAnchorRemovedObservable.add(anchor => {
            console.log('disposing', anchor);
            if (anchor) {
                anchor.attachedNode.isVisible = false;
                anchor.attachedNode.dispose();
            }
        });
    }

    scene.onPointerDown = (evt, pickInfo) => {
        if (hitTest && isplaced && anchors && xr.baseExperience.state === BABYLON.WebXRState.IN_XR) {
            isplaced=false;
            anchors.addAnchorPointUsingHitTestResultAsync(hitTest);
        }
    }

    const planes = [];

    xrPlanes.onPlaneAddedObservable.add(plane => {
        plane.polygonDefinition.push(plane.polygonDefinition[0]);
        var polygon_triangulation = new BABYLON.PolygonMeshBuilder("name", plane.polygonDefinition.map((p) => new BABYLON.Vector2(p.x, p.z)), scene);
        var polygon = polygon_triangulation.build(false, 0.01);
        plane.mesh = polygon; //BABYLON.TubeBuilder.CreateTube("tube", { path: plane.polygonDefinition, radius: 0.02, sideOrientation: BABYLON.Mesh.FRONTSIDE, updatable: true }, scene);
        //}
        planes[plane.id] = (plane.mesh);
        const mat = new BABYLON.StandardMaterial("mat", scene);
        mat.alpha = 0.1;
        mat.diffuseColor = BABYLON.Color3.Random();
        polygon.createNormals();
        polygon.receiveShadows = true;
        plane.mesh.material = mat;

        plane.mesh.rotationQuaternion = new BABYLON.Quaternion();
        plane.transformationMatrix.decompose(plane.mesh.scaling, plane.mesh.rotationQuaternion, plane.mesh.position);
    });

    xrPlanes.onPlaneUpdatedObservable.add(plane => {
        let mat;
        if (plane.mesh) {
            mat = plane.mesh.material;
            plane.mesh.dispose(false, false);
        }
        const some = plane.polygonDefinition.some(p => !p);
        if (some) {
            return;
        }
        plane.polygonDefinition.push(plane.polygonDefinition[0]);
        var polygon_triangulation = new BABYLON.PolygonMeshBuilder("name", plane.polygonDefinition.map((p) => new BABYLON.Vector2(p.x, p.z)), scene);
        var polygon = polygon_triangulation.build(false, 0.01);
        polygon.createNormals();
        plane.mesh = polygon;// BABYLON.TubeBuilder.CreateTube("tube", { path: plane.polygonDefinition, radius: 0.02, sideOrientation: BABYLON.Mesh.FRONTSIDE, updatable: true }, scene);
        //}
        planes[plane.id] = (plane.mesh);
        plane.mesh.material = mat;
        plane.mesh.rotationQuaternion = new BABYLON.Quaternion();
        plane.transformationMatrix.decompose(plane.mesh.scaling, plane.mesh.rotationQuaternion, plane.mesh.position);
        plane.mesh.receiveShadows = true;
    })

    xrPlanes.onPlaneRemovedObservable.add(plane => {
        if (plane && planes[plane.id]) {
            planes[plane.id].dispose()
        }
    })

    xr.baseExperience.sessionManager.onXRSessionInit.add(() => {
        planes.forEach(plane => plane.dispose());
        while (planes.pop()) { };
    });



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
