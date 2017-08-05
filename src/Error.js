import Device from "./Device"

if(Device.mobile)
{
	window.onerror = function(message, file, lineNumber) {
		alert(file + ": " + lineNumber + " " + message);
	};
}
