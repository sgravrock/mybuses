// navigator.geolocation satisfies this.
interface LocationService {
	getCurrentPosition(successCallback: PositionCallback, errorCallback?: PositionErrorCallback, options?: PositionOptions): void;
}

export function init(root: HTMLElement, locationService: LocationService) {
	const srcLatField = root.querySelector("[name=srclat]") as HTMLInputElement;
	const srcLonField = root.querySelector("[name=srclon]") as HTMLInputElement;

	locationService.getCurrentPosition(function(result) {
		srcLatField.value = result.coords.latitude.toString();
		srcLonField.value = result.coords.longitude.toString();
	}, function(error) {
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
}
