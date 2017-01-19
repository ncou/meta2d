
export default function fetchContent(src, onDoneFunc, responseType)
{
	const xhr = new XMLHttpRequest();
	xhr.responseType = responseType || "";
	xhr.onreadystatechange = () => {
		fetchContentFunc(xhr, onDoneFunc);
	}
	xhr.open("get", src);
	xhr.send();	
}

function fetchContentFunc(xhr, onDoneFunc, onErrorFunc)
{
	if(xhr.readyState === 4)
	{
		if(xhr.status === 200)
		{
			if(onDoneFunc) 
			{
				switch(xhr.responseType) 
				{
					case "arraybuffer":
						onDoneFunc(xhr.response);
						break;

					default:
						onDoneFunc(xhr.responseText); 
						break;
				}
			}
		}
		else 
		{
			if(onErrorFunc) {
				onErrorFunc(xhr.statusText); 
			}
		}
	}
}
