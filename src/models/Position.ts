export class Position {
	timestamp: number = Date.now()
	constructor(
		public latitude: number,
		public longitude: number,
		public altitude: number,
		public accuracy: number,
		public speed: number
	){}

	/**
	 * Calculate distance using Haversine formula
	 * @param position 
	 * @returns 
	 * */
	calculateDistance(position: Position): number{
		 const lat2 = position.latitude 
		 const lon2 = position.longitude 
		 const lat1 = this.latitude 
		 const lon1 = this.longitude 
		 
		 const R = 6371 // km 
		 const x1 = lat2-lat1
		 const dLat = this.toRad(x1)  
		 const x2 = lon2-lon1
		 const dLon = this.toRad(x2)  
		 const a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
						 Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
						 Math.sin(dLon/2) * Math.sin(dLon/2)  
		 const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) 
		 const d = R * c
		 return d
	}

	private toRad(value: number){
		return value * Math.PI / 180
	}
}