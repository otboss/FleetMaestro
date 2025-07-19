import * as fs from "fs"
import { logDirectory } from "./src/constants/logDirectory"
import { Position } from "./src/models/Position"
import { TelegramMessage } from "././src/models/TelegramMessage"
import { TelegramService } from "././src/services/telegram.service"
import { Database } from "./src/utils/Database"
import { logger } from "./src/utils/logger"
import { parseNmeaBlock } from "./src/utils/parseNmeaBlock"


fs.existsSync(`${process.cwd()}/src/database/database.json`) || fs.cpSync(`${process.cwd()}/src/database/database.json.template`, `${process.cwd()}/src/database/database.json`)
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)
const gpsFilePath: string = `${logDirectory}/gps_data.log`
const telegramService = new TelegramService()

const sendVehicleStartedAlert = async (message: string) => {
    const telegramConfig = Database.getTelegramConfig()
    await telegramService.sendMessage(telegramConfig.vehicleStartedbotToken, {
        chat_id: telegramConfig.vehicleStartedChannelChatId,
        text: message
    })
}

const tracker = async () => {
    while(true){
        try{
            const gpsDataRaw: string = fs.readFileSync(gpsFilePath, 'utf8')
            const gpsData = parseNmeaBlock(gpsDataRaw.slice(gpsDataRaw.lastIndexOf("GPRMC")).split("\n").filter((x) => x.length > 0))

            if(gpsData !== null){
                const position: Position = new Position(
                    gpsData.coordinates!.lat,
                    gpsData.coordinates!.lon,
                    gpsData.altitudeMeters!,
                    gpsData.accuracy!,
                    gpsData.speedKmh!,
                )
                const message = TelegramMessage.GeneratePositionMessage(Database.getVehicle(), position)
                await telegramService.sendMessage(Database.getTelegramConfig().botToken, message)
            }
        }
        catch(err){
            logger("ERROR", String(err))
        }
        await new Promise((resolve) => setTimeout(resolve, 10000))     
    }
}

new Promise<void>(async (resolve) => {
    while(true){
        try{
            await sendVehicleStartedAlert("Vehicle Started")
            await new Promise((resolve) => setTimeout(resolve, 8000))
            await sendVehicleStartedAlert("Vehicle Started")
            await new Promise((resolve) => setTimeout(resolve, 8000))
            await sendVehicleStartedAlert("A custom alarm tone can be enabled in the notification settings of this chat to make the vehicle start alarm more audible.\nA great sample alarm tone can be found here: https://t.me/vhcle")
            break
        }
        catch(err){
            logger("ERROR", String(err))
            await new Promise((resolve) => setTimeout(resolve, 8000))
        }
    }
    resolve()
}).then(() => {
    tracker()
}).catch(err => {
    logger("ERROR", String(err))
    process.exit(1)
})