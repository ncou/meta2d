import Timer from "./Timer"

class Time
{
	constructor()
	{
		this.delta = 0
		this.deltaF = 0.0
		this.maxDelta = 250.0
		this.scale = 1.0
		this.fps = 0
		this.current = Date.now()
		this.prev = Date.now()
		this.accumulator = 0.0
		this.frameIndex = 0
		this.updateFreq = 1000 / 10

		this.timers = []
		this.timersRemove = []
		this.paused = false
		this.updating = false

		this._fpsCurrent = Date.now()
		this._fps = 0
	}

	start()
	{
		this.frameIndex++
		this.current = Date.now()

		// Calculate deltas:
		if(this.paused) {
			this.delta = 0
			this.deltaF = 0
		}
		else
		{
			this.delta = this.current - this.prev
			if(this.delta > this.maxDelta) {
				this.delta = this.maxDelta
			}

			this.delta *= this.scale
			this.deltaF = this.delta / 1000

			this.accumulator += this.delta
		}

		// Update FPS:
		if(this.current - this._fpsCurrent >= 1000) {
			this._fpsCurrent = this.current
			this.fps = this._fps
			this._fps = 0
		}

		this.updating = true

		for(let n = 0; n < this.timers.length; n++) {
			this.timers[n].update(this.delta)
		}

		this.updating = false

		if(this.timersRemove.length > 0)
		{
			for(let n = 0; n < this.timersRemove.length; n++)
			{
				const timerA = this.timersRemove[n]
				const timerB = this.timers[this.timers.length - 1]
				timerB.__index = timerA.__index
				timerA.__index = -1
				this.timers[timerB.__index] = timerB
				this.timers.pop()
			}

			this.timersRemove.length = 0
		}
	}

	end()
	{
		this._fps++
		this.prev = this.current
	}

	timer(func, tDelta, numTimes)
	{
		if(!func || !tDelta) {
			console.warn("(Timer.create) Invalid params passed")
			return null
		}

		const timer = new Timer(this, func, tDelta, numTimes)
		timer.play()

		return timer
	}
}

const instance = new Time()

export default instance