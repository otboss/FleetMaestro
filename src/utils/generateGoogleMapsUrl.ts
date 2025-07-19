import { Position } from "../models/Position";

export const generateGoogleMapsUrl = (position: Position): string => {
    return `http://maps.google.com/maps?&z=10&q=${position.latitude},+${position.longitude}`
}