function motion_onShakeHandler() {
	alert('shake');
}


function motion_onShake() {
	api.motion.onShake(motion_onShakeHandler);
}


function motion_offShake() {
	api.motion.offShake(motion_onShakeHandler);
}

