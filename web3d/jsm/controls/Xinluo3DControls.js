/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 */

import {
	Euler,
	EventDispatcher,
	Vector3,
	// Add
	Matrix4,
	Plane,
	Raycaster,
	Vector2,
} from "../../../build/three.module.js";

var Xinluo3DControls = function (camera, domElement, _objects, scene) {

	if (domElement === undefined) {

		console.warn('THREE.Xinluo3DControls: The second parameter "domElement" is now mandatory.');
		domElement = document.body;

	}

	this.domElement = domElement;
	this.isLocked = true;

	//
	// internals
	//

	var scope = this;

	var changeEvent = { type: 'change' };
	var lockEvent = { type: 'lock' };
	var unlockEvent = { type: 'unlock' };

	var euler = new Euler(0, 0, 0, 'YXZ');
	var robot_euler = new Euler(0, 0, 0, 'YXZ');

	var PI_2 = Math.PI / 2;

	var vec = new Vector3();

	//Mouse Style
	var onDown = 1;

	// Add _ 变量

	var _plane = new Plane();
	var _raycaster = new Raycaster();

	var _mouse = new Vector2();
	var _offset = new Vector3();
	var _intersection = new Vector3();
	var _worldPosition = new Vector3();
	var _inverseMatrix = new Matrix4();
	var _intersections = [];

	var _selected = null, _hovered = null;

	var _camera = camera;
	var _domElement = domElement;


	var dray_obj


	var helper; // 辅助触控点
	// helper = new Mesh( new ConeBufferGeometry( 1, 3, 3 ), new MeshNormalMaterial() );
	// scene.add(helper)

	let demos = window.controls.demos


	function onMouseDown(event) {
		onDown = event.button;

		event.preventDefault();

		_intersections.length = 0;

		_raycaster.setFromCamera(_mouse, camera);
		_raycaster.intersectObjects(_objects, true, _intersections);


		_selected = (scope.transformGroup === true) ? _objects[0] : _intersections[0].object;


		if (_intersections.length > 0 && _intersections[0].object.type === 'LineSegments') {
			if (_intersections[0].object.parent.position.x === 0.2) {
				_intersections[0].object.parent.position.x = 0;
				_intersections[0].object.parent.material.color.set(0xffffff);
			} else {
				_intersections[0].object.parent.position.x = 0.2;
				_intersections[0].object.parent.material.color.set(0x46A3FF);
			}
		}
		if (_intersections.length > 0 && _intersections[0].object.name.substring(0, 4) === 'ball') {

			for (var b in window.controls.balls) {
				if (b !== _intersections[0].object.name) {
					window.controls.balls[b] = false;
				}
			}
			window.controls.balls[_intersections[0].object.name] =
				window.controls.balls[_intersections[0].object.name] ? false : true;
			window.controls.ballctr={isgo:true,name:_intersections[0].object.name};
		}
		if (_intersections.length > 0 && (_selected.name === 'demo_left' || _selected.name === 'demo_right')) {
			if (!demos.isgo) {
				demos.start = []
				let denum;
				for (let de in demos.demos) {
					denum = _selected.name === 'demo_left' ?
						(de >= 4 ? 0 : parseInt(de) + 1) :
						(de == 0 ? demos.demos.length - 1 : parseInt(de) - 1);
					demos.start[de] = {
						x: (demos.demos[denum].geometry.boundingSphere.center.x + demos.demos[denum].position.x -
							demos.demos[de].geometry.boundingSphere.center.x - demos.demos[de].position.x) / 10,

						y: (demos.demos[denum].geometry.boundingSphere.center.y + demos.demos[denum].position.y -
							demos.demos[de].geometry.boundingSphere.center.y - demos.demos[de].position.y) / 10,

						z: (demos.demos[denum].geometry.boundingSphere.center.z + demos.demos[denum].position.z -
							demos.demos[de].geometry.boundingSphere.center.z - demos.demos[de].position.z) / 10
					}
				}
				demos.isgo = true;
			}
		}
		if (_intersections.length > 0 && _intersections[0].object.name === 'Texture_026') {
			dray_obj = true;

			if (_raycaster.ray.intersectPlane(_plane, _intersection)) {

				_inverseMatrix.getInverse(_selected.parent.matrixWorld);
				_offset.copy(_intersection).sub(_worldPosition.setFromMatrixPosition(_selected.matrixWorld));
				console.log(_offset)

			}

			_domElement.style.cursor = 'move';

			scope.dispatchEvent({ type: 'dragstart', object: _selected });

		}
	}
	function onMouseUp(event) {
		dray_obj = false;
		onDown = 1;
		event.preventDefault();

		if (_selected) {

			scope.dispatchEvent({ type: 'dragend', object: _selected });

			_selected = null;

		}
		_domElement.style.cursor = _hovered ? 'pointer' : 'auto';
	}
	function onDocumentMouseCancel(event) {
		onDown = 1;
		dray_obj = false;

		event.preventDefault();

		if (_selected) {

			scope.dispatchEvent({ type: 'dragend', object: _selected });

			_selected = null;

		}

		_domElement.style.cursor = _hovered ? 'pointer' : 'auto';

	}

	function onMouseMove(event) {
		var rect = _domElement.getBoundingClientRect();


		// console.log('比较1')
		// console.log(rect.height)
		// console.log('比较2')
		// console.log(window.innerHeight)

		// _mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
		// _mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;
		_mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		_mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
		_raycaster.setFromCamera(_mouse, camera);

		// 

		if (onDown !== 0) return;
		if (dray_obj) {
			// _raycaster.set(Vector3(camera.position.x, camera.position.y, camera.position.z), camera.getWorldDirection(Vector3(0, 0, 0)).multiply(Vector3(1, 0, 1)));

			if (_selected && scope.enabled) {

				if (_raycaster.ray.intersectPlane(_plane, _intersection)) {

					// _selected.position.copy(_intersection.sub(_offset).applyMatrix4(_inverseMatrix));

					// _selected.position.z=100 
				}
				if (_selected.name === 'Texture_026') {
					if (_selected.position.x >= -4 && _selected.position.x <= 0) {

						_selected.position.x -= event.movementX * 0.003

						if (_selected.position.x > 0) _selected.position.x = 0
						if (_selected.position.x < -4) _selected.position.x = -4
						_selected.material.map.offset.set(-_selected.position.x * 0.19, 1)
						// if(_selected.position.x<-2.5)_selected.material.color.set( 0x33CCFF  );
						// else if(_selected.position.x<-1.8)_selected.material.color.set( 0xFF7744 );
						// else if(_selected.position.x<-0.8)_selected.material.color.set( 0x99FF33 );
						// else if(_selected.position.x<0.2)_selected.material.color.set( 0xFFFFFF );
						// else if(_selected.position.x<1)_selected.material.color.set( 0x7744FF );
						// console.log(_selected.position.x)


					}
				}

				scope.dispatchEvent({ type: 'drag', object: _selected });

				return;

			}

			_intersections.length = 0;

			_raycaster.setFromCamera(_mouse, _camera);
			_raycaster.intersectObjects(_objects, true, _intersections);

			if (_intersections.length > 0) {



			}
		}
		if (scope.isLocked === false) return;
		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		euler.setFromQuaternion(camera.quaternion);

		euler.y -= movementX * 0.002;
		euler.x -= movementY * 0.002;

		euler.x = Math.max(- PI_2, Math.min(PI_2, euler.x));

		camera.quaternion.setFromEuler(euler);

	//----机器人
		robot_euler.setFromQuaternion(window.controls.user.quaternion);
		robot_euler.y -= movementX * 0.002;
		robot_euler.x = Math.max(- PI_2, Math.min(PI_2, 0));

		window.controls.user.quaternion.setFromEuler(robot_euler);

		// window.controls.user.rotation.y = camera.rotation.y*1.5

		scope.dispatchEvent(changeEvent);

	}

	function onPointerlockChange() {

		if (document.pointerLockElement === scope.domElement) {

			scope.dispatchEvent(lockEvent);

			scope.isLocked = false;

		} else {

			scope.dispatchEvent(unlockEvent);

			scope.isLocked = false;

		}

	}

	function onPointerlockError() {

		console.error('THREE.Xinluo3DControls: Unable to use Pointer Lock API');

	}
	// Add 
	// function getObjects() {

	// 	return _objects;

	// }
	this.enabled = true;
	this.transformGroup = false;

	// this.activate = activate;
	// this.deactivate = deactivate;
	// this.dispose = dispose;
	// this.getObjects = getObjects;
	// --- 
	this.connect = function () {

		document.addEventListener('mousemove', onMouseMove, false);
		document.addEventListener('pointerlockchange', onPointerlockChange, false);
		document.addEventListener('pointerlockerror', onPointerlockError, false);

		//Add
		document.addEventListener('mousedown', onMouseDown, false);
		document.addEventListener('mouseup', onMouseUp, false);
		document.addEventListener('mouseleave', onDocumentMouseCancel, false);

	};

	this.disconnect = function () {

		document.removeEventListener('mousemove', onMouseMove, false);
		document.removeEventListener('pointerlockchange', onPointerlockChange, false);
		document.removeEventListener('pointerlockerror', onPointerlockError, false);

		//Add
		document.addEventListener('mousedown', onMouseDown, false);
		document.addEventListener('mouseup', onMouseUp, false);
		document.removeEventListener('mouseleave', onDocumentMouseCancel, false);

	};

	this.dispose = function () {

		this.disconnect();

	};

	this.getObject = function () { // retaining this method for backward compatibility

		return camera;

	};

	this.getDirection = function () {

		var direction = new Vector3(0, 0, - 1);

		return function (v) {

			return v.copy(direction).applyQuaternion(camera.quaternion);

		};

	}();

	this.moveForward = function (distance) {

		// move forward parallel to the xz-plane
		// assumes camera.up is y-up

		vec.setFromMatrixColumn(camera.matrix, 0);

		vec.crossVectors(camera.up, vec);

		camera.position.addScaledVector(vec, distance);

	};

	this.moveRight = function (distance) {

		vec.setFromMatrixColumn(camera.matrix, 0);

		camera.position.addScaledVector(vec, distance);

	};

	this.lock = function () {

		this.domElement.requestPointerLock();

	};

	this.unlock = function () {

		document.exitPointerLock();

	};

	this.connect();

};

Xinluo3DControls.prototype = Object.create(EventDispatcher.prototype);
Xinluo3DControls.prototype.constructor = Xinluo3DControls;

export { Xinluo3DControls };
