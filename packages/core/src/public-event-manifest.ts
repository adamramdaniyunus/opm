export * as PublicEventManifest from "./public-event-manifest"

import { Event } from "@opm/schema/event"
import { EventManifest } from "@opm/schema/event-manifest"

export const Definitions = EventManifest.ServerDefinitions
export const Latest = Event.latest(Definitions)
