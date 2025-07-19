import { Database } from "../utils/Database"
import { generateGoogleMapsUrl } from "../utils/generateGoogleMapsUrl"
import { Position } from "./Position"
import { Vehicle } from "./Vehicle"
import { Task } from "./Task"

export class TelegramMessage {
	constructor(
		public chat_id: number,
		public text: string,
	){}


	static GeneratePositionMessage(vehicle: Vehicle, position: Position): TelegramMessage {
		return new TelegramMessage(
			Database.getTelegramConfig().channelChatId,
`[ ${vehicle.plateNumber} ]
${vehicle.year} ${vehicle.make} ${vehicle.model}

Current Location:
${generateGoogleMapsUrl(position)}

Accuracy - ${position.accuracy.toFixed(1)} m

Odometer - ${vehicle.mileage.toFixed(1)} km

Speed - ${position.speed.toFixed(0)} km/h


${TelegramMessage.generateDueTasksMessage(vehicle)}`

		)
	}

	static generateDueTasksMessage(vehicle: Vehicle): string {
		let dueTasksMessage: string = ""
		const tasks: Array<Task> = Database.getTasks().tasks	

		for(const task of tasks){
			if(vehicle.mileage >= (task.interval + task.lastCompleted)){
				if(dueTasksMessage.length === 0){
					dueTasksMessage = "❗❗❗ ATTENTION ❗❗❗\n\nThe following vehicle maintenance tasks are due 🛠️\n\n"
				}
				dueTasksMessage += `    ${task.name} - ${(task.lastCompleted + task.interval).toFixed(1)} km\n`
			}
		}

		return dueTasksMessage
	}
}