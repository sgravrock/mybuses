// navigator.geolocation satisfies this.
interface LocationService {
	getCurrentPosition(successCallback: PositionCallback, errorCallback?: PositionErrorCallback, options?: PositionOptions): void;
}

export function init(root: HTMLElement, locationService: LocationService) {
	const srcLatField = root.querySelector("[name=srclat]") as HTMLInputElement;
	const srcLonField = root.querySelector("[name=srclon]") as HTMLInputElement;
	const useCurrentBtn = root.querySelector(".use-current") as HTMLInputElement;

	function enableInputs() {
		[srcLatField, srcLonField, useCurrentBtn].forEach(b => b.disabled = false);
	};

	function disableInputs() {
		[srcLatField, srcLonField, useCurrentBtn].forEach(b => b.disabled = true);
	};

	useCurrentBtn.addEventListener("click", function() {
		disableInputs();

		locationService.getCurrentPosition(function(result) {
			srcLatField.value = result.coords.latitude.toString();
			srcLonField.value = result.coords.longitude.toString();
			enableInputs();
		}, function(error) {
			enableInputs();
			console.error(error);
	
			if (error.code === 1) {
				// User denied permission
				return;
			}
	
			const indicator = document.createElement("p");
			indicator.className = "error";
			indicator.textContent = "Could not find your location";
			root.insertBefore(indicator, root.firstChild);
		});
	});
}
