var scene,
   camera,
   renderer,
   element,
   container,
   effect,
   controls;

var debb = [];

init();

function init() {
   setScene();

   setControls();

   setLights();
   setFloor();

   setdeBB();

   clock = new THREE.Clock();
   animate();
}

function setScene() {
   scene = new THREE.Scene();
   camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.001, 700);
   camera.position.set(0, 15, 0);
   scene.add(camera);

   renderer = new THREE.WebGLRenderer();
   element = renderer.domElement;
   container = document.getElementById('webglviewer');
   container.appendChild(element);

   effect = new THREE.StereoEffect(renderer);
}

function setLights() {
   // Lighting
   var light = new THREE.PointLight(0x999999, 2, 100);
   light.position.set(50, 50, 50);
   scene.add(light);

   var lightScene = new THREE.PointLight(0x999999, 2, 100);
   lightScene.position.set(0, 5, 0);
   scene.add(lightScene);
}

function setFloor() {
   var floorTexture = THREE.ImageUtils.loadTexture('textures/grass.png');
   floorTexture.wrapS = THREE.RepeatWrapping;
   floorTexture.wrapT = THREE.RepeatWrapping;
   floorTexture.repeat = new THREE.Vector2(50, 50);
   floorTexture.anisotropy = renderer.getMaxAnisotropy();

   var floorMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      specular: 0xffffff,
      shininess: 20,
      shading: THREE.FlatShading,
      map: floorTexture
   });

   var geometry = new THREE.PlaneBufferGeometry(1000, 1000);

   var floor = new THREE.Mesh(geometry, floorMaterial);
   floor.rotation.x = -Math.PI / 2;
   scene.add(floor);
}



function setdeBB() {
   // ASCII file
   var loader = new THREE.STLLoader();
   loader.load('models/debb.stl', function(geometry) {
      var material = new THREE.MeshPhongMaterial({
         color: 0xff5533,
         specular: 0x111111,
         shininess: 200
      });

      for (var i = 0; i < 10; i++) {
         var mesh = new THREE.Mesh(geometry, material);
         mesh.position.set(Math.cos(i/10*2*Math.PI)*50, 75, Math.sin(i/10*2*Math.PI)*100-50);
         mesh.rotation.set(0, Math.PI/2 + Math.atan((camera.position.x-mesh.position.x)/(camera.position.z-mesh.position.z)), 0);
         mesh.scale.set(1, 1, 1);
         mesh.castShadow = true;
         mesh.receiveShadow = true;
         debb[i] = mesh;
         scene.add(mesh);
      }
   });
}


function animate() {
   
   animatedeBB();

   requestAnimationFrame(animate);

   update();
   render();
}

function animatedeBB() {
   for (var i = 0, il = debb.length; i < il; i++) {
      debb[i].position.y -= 1;
      if(debb[i].position.y < -15) debb[i].position.y = 75;
   }
}

function setControls() {
   // Our initial control fallback with mouse/touch events in case DeviceOrientation is not enabled
   controls = new THREE.OrbitControls(camera, element);
   controls.target.set(
      camera.position.x + 0.15,
      camera.position.y,
      camera.position.z
   );
   controls.noPan = true;
   controls.noZoom = true;

   // Our preferred controls via DeviceOrientation
   function setOrientationControls(e) {
      if (!e.alpha) {
         return;
      }

      controls = new THREE.DeviceOrientationControls(camera, true);
      controls.connect();
      controls.update();

      element.addEventListener('click', fullscreen, false);

      window.removeEventListener('deviceorientation', setOrientationControls, true);
   }
   window.addEventListener('deviceorientation', setOrientationControls, true);
}

function resize() {
   var width = container.offsetWidth;
   var height = container.offsetHeight;

   camera.aspect = width / height;
   camera.updateProjectionMatrix();

   renderer.setSize(width, height);
   effect.setSize(width, height);
}

function update(dt) {
   resize();

   camera.updateProjectionMatrix();

   controls.update(dt);
}

function render(dt) {
   effect.render(scene, camera);
}

function fullscreen() {
   if (container.requestFullscreen) {
      container.requestFullscreen();
   } else if (container.msRequestFullscreen) {
      container.msRequestFullscreen();
   } else if (container.mozRequestFullScreen) {
      container.mozRequestFullScreen();
   } else if (container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen();
   }
}

function getURL(url, callback) {
   var xmlhttp = new XMLHttpRequest();

   xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4) {
         if (xmlhttp.status == 200) {
            callback(JSON.parse(xmlhttp.responseText));
         } else {
            console.log('We had an error, status code: ', xmlhttp.status);
         }
      }
   }

   xmlhttp.open('GET', url, true);
   xmlhttp.send();
}