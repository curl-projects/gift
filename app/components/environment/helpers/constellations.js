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
              console.log("RESIZING CONSTELLATIOn")
                renderer.setSize(canvasZone.offsetWidth, canvasZone.offsetHeight);
                resizePlane();
                resizeHTMLContent();
            });
            return renderer;
        };

        function resizePlane() {
            plane.scaling.x = document.documentElement.clientWidth / 4;
            plane.scaling.y = document.documentElement.clientHeight / 4;
            refreshPosition();
        }

        function resizeHTMLContent() {
            if (CSSobject && CSSobject.element) {
                CSSobject.element.style.width = `${document.documentElement.clientWidth}px`;
                CSSobject.element.style.height = `${document.documentElement.clientHeight}px`;
            }
        }

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
            div.style.pointerEvents = 'auto'; // Ensure it can receive mouse events
            CSSobject = new CSS3DObject(div, scene);

            refreshPosition();

            var childDiv = document.getElementById('constellation-canvas');
            console.log("CHILD DIV:", childDiv);
            if (childDiv) {
                childDiv.style.position = 'absolute';
                childDiv.style.left = '0';
                childDiv.style.top = '0';
                childDiv.style.width = `${width}px`;
                childDiv.style.height = `${height}px`;
                childDiv.style.pointerEvents = 'auto'; // Ensure childDiv can receive mouse events
                div.appendChild(childDiv);

                refreshPosition();
            }

            // Use ResizeObserver for the div
            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    const { width, height } = entry.contentRect;
                    div.style.width = `${width}px`;
                    div.style.height = `${height}px`;
                    if (childDiv) {
                        childDiv.style.width = `${width}px`;
                        childDiv.style.height = `${height}px`;
                    }
                }
            });

            resizeObserver.observe(div);

            // Clean up observer on unmount
            window.addEventListener('unload', () => {
                resizeObserver.disconnect();
            });
        };

        function createMaskingScreen(maskMesh, scene) {
            let depthMask = maskMesh.material;
            depthMask.backFaceCulling = false;

            maskMesh.material = depthMask;
            maskMesh.onBeforeRenderObservable.add(() => engine.setColorWrite(false));
            maskMesh.onAfterRenderObservable.add(() => engine.setColorWrite(true));

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

        scene.clearColor = new BABYLON.Color4(32 / 255, 40 / 255, 56 / 255, 0);

        const planeWidth = document.documentElement.clientWidth;
        const planeHeight = document.documentElement.clientHeight;

        plane = BABYLON.MeshBuilder.CreatePlane("constellationCanvas", {
            width: planeWidth,
            height: planeHeight,
        }, scene);

        plane.material = // this should be an error but for some insane reason it's required for it to work.
        plane.scaling.x = document.documentElement.clientWidth / 4;
        plane.scaling.y = document.documentElement.clientHeight / 4;

        plane.renderingGroupId = RenderingGroups.embeddedElements;
        const matPlane = new BABYLON.StandardMaterial("plane", scene);

        // matPlane.alpha = 0.0;
        plane.material = matPlane;
        plane.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(-Math.PI / 2, Math.PI, 0);
        plane.rotation = new BABYLON.Vector3(-Math.PI / 2, Math.PI, 0);
        plane.position = new BABYLON.Vector3(camera.position.x, camera.position.y + 250, camera.position.z);

        plane.alwaysSelectAsActiveMesh = true;
        plane.checkCollisions = true;
        plane.rotationQuaternion = null;

        let existingRenderer = document.getElementById("css-container");
        if (existingRenderer) existingRenderer.remove();
        let renderer = setupRenderer();
        createCSSobject(plane, scene, 'qgKbpe4qvno', renderer);
        createMaskingScreen(plane, scene, renderer);

        var listener = function(evt) {
            let pick = scene.pick(Math.round(evt.offsetX), Math.round(evt.offsetY));
            if (pick.hit) {
                if (pick.pickedMesh.name === "constellationCanvas") {
                    if (!elementFocused) {
                        elementFocused = true;
                        console.log("YOUTUBE");
                        document.getElementsByTagName('body')[0].style.pointerEvents = 'none';
                    }
                }
            }
        }

        // window.addEventListener('pointermove', listener);
        // window.addEventListener('pointerdown', listener);
        // window.addEventListener('pointerup', listener);

    } catch (error) {
        console.error("Constellation Canvas Error:", error);
    }
}