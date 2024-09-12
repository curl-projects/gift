import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";

var elementFocused = false;
var CSSobject = null;
var plane = null;

export function addConstellationCanvas(scene, canvasZoneRef, RenderingGroups) {
    try {
      const engine = scene.getEngine();
      const camera = scene.cameras.find(cam => cam.name === 'babylon-camera');

      var setupRenderer = function () {
        let container = document.createElement('div');
        container.id = 'css-container';
        container.style.position = 'absolute';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.zIndex = '-1';

        let canvasZone = canvasZoneRef.current;
        canvasZone.insertBefore(container, canvasZone.firstChild);

        let renderer = new CSS3DRenderer();
        container.appendChild(renderer.domElement);
        renderer.setSize(canvasZone.offsetWidth, canvasZone.offsetHeight);

        window.addEventListener('resize', e => {
          renderer.setSize(canvasZone.offsetWidth, canvasZone.offsetHeight);
        });
        return renderer;
      };

      function refreshPosition() {
        CSSobject.position.copyFrom(plane.getAbsolutePosition());
        CSSobject.scaling.copyFrom(plane.scaling);
        refreshRotation();
      }

      function refreshRotation() {
        CSSobject.rotation.y = -plane.rotation.y;
        CSSobject.rotation.x = -plane.rotation.x;
        CSSobject.rotation.z = plane.rotation.z;
      }

      var createCSSobject = function (mesh, scene, videoID, renderer) {
        let width = document.documentElement.clientWidth;
        let height = document.documentElement.clientHeight;
        scene.onBeforeRenderObservable.add(() => {
          renderer.render(scene, camera);
        });

        var div = document.createElement('div');
        div.style.width = `${width}px`;
        div.style.height = `${height}px`;
        div.style.zIndex = '1';
        CSSobject = new CSS3DObject(div, scene);
        
        refreshPosition();

        // var iframe = document.createElement( 'iframe' )
        // iframe.id = 'video-' + videoID
        // iframe.style.width = width + 'px'
        // iframe.style.height = height + 'px'
        // iframe.style.border = '0px'
        // iframe.allow = 'autoplay'
        // iframe.src = [ 'https://www.youtube.com/embed/', videoID, '?rel=0&enablejsapi=1&disablekb=1&autoplay=1&controls=0&fs=0&modestbranding=1' ].join( '' )
        // div.appendChild(iframe)   

        // refreshPosition();

        var childDiv = document.getElementById('constellation-canvas');
        console.log("CHILD DIV:", childDiv)
        if (childDiv) {
          childDiv.style.position = 'absolute';
          childDiv.style.left = '0';
          childDiv.style.top = '0';

          childDiv.style.width = `${width}px`;
          childDiv.style.height = `${height}px`;
          childDiv.style.pointerEvents = 'auto'; // Ensure childDiv can receive mouse events
          div.appendChild(childDiv);

          refreshPosition();

        //   div.addEventListener('mouseout', () => {
        //     elementFocused = false;
        //     console.log("CANVAS");
        //     document.body.style.pointerEvents = 'auto';
        //     document.body.style.overflow = 'unset';
        //   });
        }
      };

      function createMaskingScreen(maskMesh, scene) {
        let depthMask = maskMesh.material; // new BABYLON.StandardMaterial('matDepthMask', scene);
        depthMask.backFaceCulling = false;
        // depthMask.disableColorWrite = true;
        // depthMask.disableLighting = true;
        // depthMask.freeze();

        maskMesh.material = depthMask;
        maskMesh.onBeforeRenderObservable.add(() => engine.setColorWrite(false));
        maskMesh.onAfterRenderObservable.add(() => engine.setColorWrite(true));
      
        // maskMesh.renderingGroupId = 1;
        var mask_index = scene.meshes.indexOf(maskMesh);
        scene.meshes[mask_index] = scene.meshes[0];
        scene.meshes[0] = maskMesh;
      }

      class CSS3DObject extends BABYLON.Mesh {
        constructor(element, scene) {
          super();
          this.element = element;
          this.element.style.position = 'absolute';
          this.element.style.pointerEvents = 'auto';
        }
      }

      class CSS3DRenderer {
        constructor() {
          var matrix = new BABYLON.Matrix();

          this.cache = {
            camera: { fov: 0, style: '' },
            objects: new WeakMap()
          };

          var domElement = document.createElement('div');
          domElement.style.overflow = 'hidden';

          this.domElement = domElement;
          this.cameraElement = document.createElement('div');
          this.isIE = (!!document['documentMode'] || /Edge/.test(navigator.userAgent) || /Edg/.test(navigator.userAgent));

          if (!this.isIE) {
            this.cameraElement.style.webkitTransformStyle = 'preserve-3d';
            this.cameraElement.style.transformStyle = 'preserve-3d';
          }
          this.cameraElement.style.pointerEvents = 'none';

          domElement.appendChild(this.cameraElement);
        }

        getSize() {
          return {
            width: this.width,
            height: this.height
          };
        }

        setSize(width, height) {
          this.width = width;
          this.height = height;
          this.widthHalf = this.width / 2;
          this.heightHalf = this.height / 2;

          this.domElement.style.width = width + 'px';
          this.domElement.style.height = height + 'px';

          this.cameraElement.style.width = width + 'px';
          this.cameraElement.style.height = height + 'px';
        }

        epsilon(value) {
          return Math.abs(value) < 1e-10 ? 0 : value;
        }

        getCameraCSSMatrix(matrix) {
          var elements = matrix.m;

          return 'matrix3d(' +
            this.epsilon(elements[0]) + ',' +
            this.epsilon(- elements[1]) + ',' +
            this.epsilon(elements[2]) + ',' +
            this.epsilon(elements[3]) + ',' +
            this.epsilon(elements[4]) + ',' +
            this.epsilon(- elements[5]) + ',' +
            this.epsilon(elements[6]) + ',' +
            this.epsilon(elements[7]) + ',' +
            this.epsilon(elements[8]) + ',' +
            this.epsilon(- elements[9]) + ',' +
            this.epsilon(elements[10]) + ',' +
            this.epsilon(elements[11]) + ',' +
            this.epsilon(elements[12]) + ',' +
            this.epsilon(- elements[13]) + ',' +
            this.epsilon(elements[14]) + ',' +
            this.epsilon(elements[15]) +
            ')';
        }

        getObjectCSSMatrix(matrix, cameraCSSMatrix) {
          var elements = matrix.m;
          var matrix3d = 'matrix3d(' +
            this.epsilon(elements[0]) + ',' +
            this.epsilon(elements[1]) + ',' +
            this.epsilon(elements[2]) + ',' +
            this.epsilon(elements[3]) + ',' +
            this.epsilon(- elements[4]) + ',' +
            this.epsilon(- elements[5]) + ',' +
            this.epsilon(- elements[6]) + ',' +
            this.epsilon(- elements[7]) + ',' +
            this.epsilon(elements[8]) + ',' +
            this.epsilon(elements[9]) + ',' +
            this.epsilon(elements[10]) + ',' +
            this.epsilon(elements[11]) + ',' +
            this.epsilon(elements[12]) + ',' +
            this.epsilon(elements[13]) + ',' +
            this.epsilon(elements[14]) + ',' +
            this.epsilon(elements[15]) +
            ')';

          if (this.isIE) {
            return 'translate(-50%,-50%)' +
              'translate(' + this.widthHalf + 'px,' + this.heightHalf + 'px)' +
              cameraCSSMatrix +
              matrix3d;
          }
          return 'translate(-50%,-50%)' + matrix3d;
        }

        renderObject(object, scene, camera, cameraCSSMatrix) {
          if (object instanceof CSS3DObject) {
            var style;
            var objectMatrixWorld = object.getWorldMatrix().clone();
            var camMatrix = camera.getWorldMatrix();
            var innerMatrix = objectMatrixWorld.m;

            const constellationCanvasWidth = document.documentElement.clientWidth / 100;
            const constellationCanvasHeight = document.documentElement.clientHeight / 100;

            // const constellationCanvasWidth = document.documentElement.clientWidth;
            // const constellationCanvasHeight = document.documentElement.clientHeight;

            innerMatrix[0] *= 0.01 / constellationCanvasWidth;
            innerMatrix[2] *= 0.01 / constellationCanvasWidth;
            innerMatrix[5] *= 0.01 / constellationCanvasHeight;
            innerMatrix[1] *= 0.01 / constellationCanvasWidth;
            innerMatrix[6] *= 0.01 / constellationCanvasHeight;
            innerMatrix[4] *= 0.01 / constellationCanvasHeight;

            innerMatrix[12] = -camMatrix.m[12] + object.position.x;
            innerMatrix[13] = -camMatrix.m[13] + object.position.y;
            innerMatrix[14] = camMatrix.m[14] - object.position.z;
            innerMatrix[15] = camMatrix.m[15] * 0.00001;

            objectMatrixWorld = BABYLON.Matrix.FromArray(innerMatrix);
            objectMatrixWorld = objectMatrixWorld.scale(100);
            style = this.getObjectCSSMatrix(objectMatrixWorld, cameraCSSMatrix);
            var element = object.element;
            var cachedObject = this.cache.objects.get(object);

            if (cachedObject === undefined || cachedObject.style !== style) {
              element.style.webkitTransform = style;
              element.style.transform = style;

              var objectData = { style: style };

              this.cache.objects.set(object, objectData);
            }
            if (element.parentNode !== this.cameraElement) {
              this.cameraElement.appendChild(element);
            }
          } else if (object instanceof BABYLON.Scene) {
            for (var i = 0, l = object.meshes.length; i < l; i++) {
              this.renderObject(object.meshes[i], scene, camera, cameraCSSMatrix);
            }
          }
        }

        render(scene, camera) {
          var projectionMatrix = camera.getProjectionMatrix();
          var fov = projectionMatrix.m[5] * this.heightHalf;

          if (this.cache.camera.fov !== fov) {
            if (camera.mode == BABYLON.Camera.PERSPECTIVE_CAMERA) {
              this.domElement.style.webkitPerspective = fov + 'px';
              this.domElement.style.perspective = fov + 'px';
            } else {
              this.domElement.style.webkitPerspective = '';
              this.domElement.style.perspective = '';
            }
            this.cache.camera.fov = fov;
          }

          if (camera.parent === null) camera.computeWorldMatrix();

          var matrixWorld = camera.getWorldMatrix().clone();
          var rotation = matrixWorld.clone().getRotationMatrix().transpose();
          var innerMatrix = matrixWorld.m;

          innerMatrix[1] = rotation.m[1];
          innerMatrix[2] = -rotation.m[2];
          innerMatrix[4] = -rotation.m[4];
          innerMatrix[6] = -rotation.m[6];
          innerMatrix[8] = -rotation.m[8];
          innerMatrix[9] = -rotation.m[9];

          matrixWorld = BABYLON.Matrix.FromArray(innerMatrix);

          var cameraCSSMatrix = 'translateZ(' + fov + 'px)' + this.getCameraCSSMatrix(matrixWorld);

          var style = cameraCSSMatrix + 'translate(' + this.widthHalf + 'px,' + this.heightHalf + 'px)';

          if (this.cache.camera.style !== style && !this.isIE) {
            this.cameraElement.style.webkitTransform = style;
            this.cameraElement.style.transform = style;
            this.cache.camera.style = style;
          }

          this.renderObject(scene, scene, camera, cameraCSSMatrix);
        }
      }

      scene.clearColor = new BABYLON.Color4(32 / 255, 40 / 255, 56 / 255, 0); // equivalent to rgb(49, 73, 91)

      plane = BABYLON.MeshBuilder.CreatePlane("constellationCanvas", { width: 1, height: 1 }, scene);
      plane.material = // this should be an error but for some insane reason it's required for it to work.
      plane.scaling.x = document.documentElement.clientWidth / 4
      plane.scaling.y = document.documentElement.clientHeight / 4

      plane.renderingGroupId = RenderingGroups.embeddedElements;
      const matPlane = new BABYLON.StandardMaterial("plane", scene);


      plane.material = matPlane;
    //   plane.material = new BABYLON.StandardMaterial("redMaterial", scene);
    //   plane.material.diffuseColor = new BABYLON.Color3(1, 0, 0); // RGB for red
    //  plane.position = new BABYLON.Vector3(0, 8, 0); // Position above the camera
    //  plane.rotation = new BABYLON.Vector3(0, Math.PI, 0);
      
      plane.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(-Math.PI / 2, Math.PI, 0); // Rotate to face upwards

      plane.rotation = new BABYLON.Vector3(-Math.PI / 2, Math.PI, 0); // Rotate to face upwards
      
      plane.position = new BABYLON.Vector3(camera.position.x, camera.position.y + 250, camera.position.z); // Position above the camera

      // disable frustrum culling to prevent blinking   
      plane.alwaysSelectAsActiveMesh = true
      // plane.rotationQuaternion = null;
      plane.checkCollisions = true;
      plane.rotationQuaternion = null;

     // Setup the CSS renderer and Youtube object
     let existingRenderer = document.getElementById("css-container");
     if (existingRenderer) existingRenderer.remove();
     let renderer = setupRenderer();
     createCSSobject(plane, scene, 'qgKbpe4qvno', renderer);
     createMaskingScreen(plane, scene, renderer)
 
     // New bit that toggles on/off pointer events to body
     var listener = function(evt) {
         let pick = scene.pick(Math.round(evt.offsetX), Math.round(evt.offsetY));
         if (pick.hit) {
             if (pick.pickedMesh.name === "constellationCanvas") {
                 if (!elementFocused) {
                     elementFocused = true
                     console.log("YOUTUBE")
                     document.getElementsByTagName('body')[0].style.pointerEvents = 'none'
                 }
             }
         }
     }
 
    //  window.addEventListener('pointermove', listener);
    //  window.addEventListener('pointerdown', listener);
    //  window.addEventListener('pointerup', listener);

  
    } catch (error) {
      console.error("Constellation Canvas Error:", error)
    }
}