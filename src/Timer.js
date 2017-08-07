
let timerId = 0

class Timer
{
	constructor(time, func, tDelta, numTimes)
	{
		this.time = time
		this.id = timerId++
		this.func = func
		this.tDelta = tDelta
		this.numTimes = (numTimes !== undefined) ? numTimes : -1
		this.initNumTimes = this.numTimes
		this.onDone = null

		this.tAccumulator = 0.0
		this.tStart = Date.now()
		this.paused = false

		this.__index = -1
	}

	play()
	{
		if(this.__index !== -1) { return }

		this.__index = this.time.timers.push(this) - 1
	}

	_stop()
	{
		if(this.__index === -1) { return }
		if(this.updating) {
			this.time.timersRemove.push(this)
		}
		else
		{
			const timers = this.time.timers
			const timer = timers[timers.length - 1]
			timer.__index = this.__index
			timers[this.__index] = timer
			timers.pop()
		}

		this.__index = -1
	}

	stop()
	{
		this._stop()
		this.paused = false
		this.numTimes = 0

		if(this.onDone) {
			this.onDone(this)
		}
	}

	pause()
	{
		this._stop()
		this.paused = true
	}

	resume()
	{
		if(!this.paused) { return }

		this.paused = false
		this.tStart = Date.now()
	}

	reset()
	{
		this.tAccumulator = 0
		this.numTimes = this.initNumTimes
		this.paused = false
		this.play()
	}

	update(tDelta)
	{
		this.tAccumulator += tDelta

		while(this.tAccumulator >= this.tDelta)
		{
			this.tAccumulator -= this.tDelta

			if(this.numTimes !== 0) {
				this.func(this)
			}

			this.tStart += this.tDelta

			if(this.numTimes !== -1)
			{
				this.numTimes--
				if(this.numTimes <= 0) {
					this.stop()
				}
			}
		}
	}
}

export default Timer
