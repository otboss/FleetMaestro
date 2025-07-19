import * as fs from "fs"
import { Task } from "src/models/Task"
import { TelegramConfig } from "src/models/TelegramConfig"
import { Vehicle } from "src/models/Vehicle"
import { observe } from "./observe"

const databasePath: string = `${process.cwd()}/src/database/database.json`

const database: {
    tasks: Record<string, Task>,
    telegramConfig: TelegramConfig,
    vehicle: Vehicle
    vehicleMileageDiscrepancies: Array<number>
} = observe(JSON.parse(fs.readFileSync(databasePath, 'utf8')), () => fs.writeFile(databasePath, JSON.stringify(database), {}, () => {}))

export namespace Database {
    export const getTasks = (): {
        tasks: Array<Task>, 
        /**
         * Sort tasks by due
         * @param mileage 
         * @returns 
         */
        sort: (mileage: number) => Array<Task>
    } => {
        const tasks: Record<string, Task> = database.tasks
        const tasksValues = Object.values(tasks)
        return {
            tasks: tasksValues,
            sort: (mileage: number) => {
                tasksValues.sort((a, b) => {
                    return mileage - (b.lastCompleted + b.interval)
                })
                return tasksValues
            }
        } 
    }
    export const addTask = (task: Task) => {
        task.name = task.name.toUpperCase()
        database.tasks[task.name] = task
    }
    export const deleteTask = (taskName: string) => {
        delete database.tasks[taskName.toUpperCase()]
    }


    export const getVehicleMileageDiscrepancies = (): Array<number> => database.vehicleMileageDiscrepancies
    export const resetVehicleMileageDiscrepancies = () => {
        database.vehicleMileageDiscrepancies = []
    }

    export const getVehicle = () => database.vehicle
    export const saveVehicle = (vehicle: Vehicle) => {
        database.vehicle = vehicle
    }

    export const getTelegramConfig = () => database.telegramConfig
    export const saveTelegramConfig = (telegramConfig: TelegramConfig) => {
        database.telegramConfig = telegramConfig
    }
}