var scene,
camera,
renderer,
element,
container,
effect,
controls,
clock,

// Particles
particles = new THREE.Object3D(),
totalParticles = 200,
maxParticleSize = 200,
particleRotationSpeed = 0,
particleRotationDeg = 0,
lastColorRange = [0, 0.3],
currentColorRange = [0, 0.3];

init();

function init() {
  setScene();

  setControls();

  setLights();
  setFloor();
  setParticles();

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

// ASCII file
var loader = new THREE.STLLoader();
loader.load( 'models/debb.stl', function ( geometry ) {
  var material = new THREE.MeshPhongMaterial( { color: 0xff5533, specular: 0x111111, shininess: 200 } );
  var mesh = new THREE.Mesh( geometry, material );
  mesh.position.set( 25, - 0.25,10);
  mesh.rotation.set( 0, - Math.PI, 0 );
  mesh.scale.set( 1, 1, 1);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add( mesh );
} );

function setParticles() {
  var particleTexture = THREE.ImageUtils.loadTexture('textures/particle.png'),
  spriteMaterial = new THREE.SpriteMaterial({
    map: particleTexture,
    color: 0xffffff
  });

  for (var i = 0; i < totalParticles; i++) {
    var sprite = new THREE.Sprite(spriteMaterial);

    sprite.scale.set(64, 64, 1.0);
    sprite.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.75);
    sprite.position.setLength(maxParticleSize * Math.random());

    sprite.material.blending = THREE.AdditiveBlending;

    particles.add(sprite);
  }
  particles.position.y = 70;
  scene.add(particles);
}

function animate() {
  var elapsedSeconds = clock.getElapsedTime(),
  particleRotationDirection = particleRotationDeg <= 180 ? -1 : 1;

  particles.rotation.y = elapsedSeconds * particleRotationSpeed * particleRotationDirection;

  // We check if the color range has changed, if so, we'll change the colours
  if (lastColorRange[0] != currentColorRange[0] && lastColorRange[1] != currentColorRange[1]) {

    for (var i = 0; i < totalParticles; i++) {
      particles.children[i].material.color.setHSL(currentColorRange[0], currentColorRange[1], (Math.random() * (0.7 - 0.2) + 0.2));
    }

    lastColorRange = currentColorRange;
  }

  requestAnimationFrame(animate);

  update(clock.getDelta());
  render(clock.getDelta());
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
      if (xmlhttp.status == 200){
        callback(JSON.parse(xmlhttp.responseText));
      }
      else {
        console.log('We had an error, status code: ', xmlhttp.status);
      }
    }
  }

  xmlhttp.open('GET', url, true);
  xmlhttp.send();
}
