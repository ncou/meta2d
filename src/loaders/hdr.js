const radiancePattern = "#\\?RADIANCE"
const commentPattern = "#.*"
const gammaPattern = "GAMMA="
const exposurePattern = "EXPOSURE=\\s*([0-9]*[.][0-9]*)"
const formatPattern = "FORMAT=32-bit_rle_rgbe"
const widthHeightPattern = "-Y ([0-9]+) \\+X ([0-9]+)"

function ldexp(mantissa, exponent)
{
	return (exponent > 1023)
		? mantissa * Math.pow(2, 1023) * Math.pow(2, exponent - 1023)
		: exponent < -1074
		? mantissa * Math.pow(2, -1074) * Math.pow(2, exponent + 1074)
		: mantissa * Math.pow(2, exponent)
}

function readPixelsRawRLE(buffer, data, offset, fileOffset, scanlineWidth, numScanlines)
{
	const rgbe = new Array(4)
	var buf = new Array(2)
	var bufferLength = buffer.length

	function readBuf(readBuffer)
	{
		let bytesRead = 0
		do {
			readBuffer[bytesRead++] = buffer[fileOffset]
			fileOffset++
		} while(fileOffset < bufferLength && bytesRead < readBuffer.length)

		return bytesRead
	}

	function readBufOffset(readBuffer, offset, length)
	{
		let bytesRead = 0
		do {
			readBuffer[offset + bytesRead++] = buffer[fileOffset]
			fileOffset++
		} while(fileOffset < bufferLength && bytesRead < length)

		return bytesRead
	}

	function readPixelsRaw(buffer, data, offset, numpixels)
	{
		const numExpected = 4 * numpixels
		const numRead = readBufOffset(data, offset, numExpected)
		if(numRead < numExpected) {
			console.error(`HDR: Error reading raw pixels: got ${numRead} bytes, expected ${numExpected}`)
			return false
		}

		return true
	}

	let scanlineBuffer = null
	let ptrEnd
	let count

	while(numScanlines > 0)
	{
		if(readBuf(rgbe) < rgbe.length) {
			console.error("HDR: Error reading bytes: expected " + rgbe.length)
			return false
		}

		// File is not run length encoded?
		if((rgbe[0] !== 2) || (rgbe[1] !== 2) || ((rgbe[2] & 0x80) !== 0))
		{
			data[offset++] = rgbe[0]
			data[offset++] = rgbe[1]
			data[offset++] = rgbe[2]
			data[offset++] = rgbe[3]
			if(!readPixelsRaw(buffer, data, offset, (scanlineWidth * numScanlines) - 1)) {
				return false
			}
			return true
		}

		const currScanlineWidth = (((rgbe[2] & 0xFF)<<8) | (rgbe[3] & 0xFF))
		if(currScanlineWidth !== scanlineWidth) {
			console.error(`HDR: Wrong scanline width ${currScanlineWidth}, expected ${scanlineWidth}`)
			return false
		}

		if(scanlineBuffer === null) {
			scanlineBuffer = new Array(4 * scanlineWidth)
		}

	  	let ptr = 0

		// Read each of the four channels for the scanline into the buffer.
		for(let n = 0; n < 4; n++)
		{
			ptrEnd = (n + 1) * scanlineWidth
			while(ptr < ptrEnd)
			{
				if(readBuf(buf) < buf.length) {
					console.error("HDR: Error reading 2-byte buffer")
					return false
				}

				if((buf[0] & 0xFF) > 128)
				{
					// A run of the same value
					count = (buf[0] & 0xFF) - 128
					if((count === 0) || (count > ptrEnd - ptr)) {
						console.error("HDR: Bad scanline data")
						return false
					}

					while(count-- > 0) {
						scanlineBuffer[ptr++] = buf[1]
					}
				}
				else
				{
					// A non-run
					count = buf[0] & 0xFF
					if((count === 0) || (count > ptrEnd - ptr)) {
						console.error("HDR: Bad scanline data")
						return false
					}

					scanlineBuffer[ptr++] = buf[1]
					count--

					if(count > 0) 
					{
						if(readBufOffset(scanlineBuffer, ptr, count) < count) {
							console.error("HDR: Error reading non-run data")
							return false
						}
						ptr += count
					}
				}
			}
		}

		// Copy byte data to output
		for(let n = 0; n < scanlineWidth; n++)
		{
			data[offset + 0] = scanlineBuffer[n]
			data[offset + 1] = scanlineBuffer[n + scanlineWidth]
			data[offset + 2] = scanlineBuffer[n + 2 * scanlineWidth]
			data[offset + 3] = scanlineBuffer[n + 3 * scanlineWidth]
			offset += 4
		}

		numScanlines--
	}

	return true
}

export default function parseHDR(buffer)
{
	if(buffer instanceof ArrayBuffer) {
		buffer = new Uint8Array(buffer)
	}

	let fileOffset = 0;
	const bufferLength = buffer.length
	const NEW_LINE = 10

	function readLine()
	{
		let result = ""
		do
		{
			const b = buffer[fileOffset]
			if(b == NEW_LINE) {
				fileOffset++
				break
			}

			result += String.fromCharCode(b)
			fileOffset++
		} while(fileOffset < bufferLength)

		return result
	}

	let width = 0
	let height = 0
	let exposure = 1
	let gamma = 1
	let rle = false

	for(let n = 0; n < 20; n++)
	{
		const line = readLine()

		let match
		if(match = line.match(radiancePattern)) {}
		else if(match = line.match(formatPattern)) {
			rle = true
		}
		else if(match = line.match(exposurePattern)) {
			exposure = Number(match[1])
		}
		else if (match = line.match(commentPattern)) {}
		else if (match = line.match(widthHeightPattern)) {
			height = Number(match[1])
			width = Number(match[2])
			break
		}
	}

	if(!rle) {
		console.error("HDR: File is not run length encoded!")
		return null
	}

	const data = new Uint8Array(width * height * 4)

	if(!readPixelsRawRLE(buffer, data, 0, fileOffset, width, height)) {
		return null
	}

	const floatData = new Float32Array(width * height * 4)
	for(let offset = 0; offset < data.length; offset += 4)
	{
		const e = data[offset + 3]
		const f = Math.pow(2.0, e - 128.0)

		// RGBA
		floatData[offset + 0] = (data[offset + 0] / 255) * f
		floatData[offset + 1] = (data[offset + 1] / 255) * f
		floatData[offset + 2] = (data[offset + 2] / 255) * f
		floatData[offset + 3] = 1.0
	}

	return {
		width,
		height,
		exposure,
		gamma,
		data: floatData
	}
}
