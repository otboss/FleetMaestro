import * as fs from "fs"
import * as rfs from "rotating-file-stream"

export const logger = (type: "LOG" | "INFO" | "ERROR", message: string) => {
    switch(type){
        case "ERROR":
            message = `${(new Date()).toISOString()} - [ ERROR ] - ${message}`
            break
        case "INFO":
            message = `${(new Date()).toISOString()} - [ INFO ] - ${message}`
            break
        default:
            message = `${(new Date()).toISOString()} - [ LOG ] - ${message}`
            break
    }

    appLogStream.write(message + "\n")
    console.log(message)
}

const logDirectory = `${process.cwd()}/logs`
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

const appLogStream = rfs.createStream('stdout.log', {
  path: logDirectory,
  maxFiles: 3,
  maxSize: '100M'
})