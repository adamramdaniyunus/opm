import { AgentV2 } from "@opm/core/agent"
import { AISDK } from "@opm/core/aisdk"
import { Catalog } from "@opm/core/catalog"
import { CommandV2 } from "@opm/core/command"
import { Credential } from "@opm/core/credential"
import { AppNodeBuilder } from "@opm/core/effect/app-node-builder"
import { LayerNodePlatform } from "@opm/core/effect/app-node-platform"
import { LayerNode } from "@opm/core/effect/layer-node"
import { EventV2 } from "@opm/core/event"
import { FileSystem } from "@opm/core/filesystem"
import { FSUtil } from "@opm/core/fs-util"
import { Integration } from "@opm/core/integration"
import { Location } from "@opm/core/location"
import { Npm } from "@opm/core/npm"
import { PluginV2 } from "@opm/core/plugin"
import { Reference } from "@opm/core/reference"
import { SkillV2 } from "@opm/core/skill"
import { Effect, Layer } from "effect"
import { tempLocationLayer } from "../fixture/location"

const npmLayer = Layer.succeed(
  Npm.Service,
  Npm.Service.of({
    add: () => Effect.succeed({ directory: "", entrypoint: undefined }),
    install: () => Effect.void,
    which: () => Effect.succeed(undefined),
  }),
)

export const PluginTestLayer = AppNodeBuilder.build(
  LayerNode.group([
    FileSystem.node,
    FSUtil.node,
    Location.node,
    Npm.node,
    Credential.node,
    EventV2.node,
    LayerNodePlatform.httpClient,
    PluginV2.node,
    AgentV2.node,
    AISDK.node,
    Catalog.node,
    CommandV2.node,
    Integration.node,
    Reference.node,
    SkillV2.node,
  ]),
  [
    [Location.node, tempLocationLayer],
    [Npm.node, npmLayer],
  ],
)
